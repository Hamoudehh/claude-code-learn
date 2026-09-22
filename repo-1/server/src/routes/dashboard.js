import { Router } from 'express';
import { db } from '../db/index.js';
import { deriveMetrics } from '../lib/calc.js';
import { listDates, resolveRange } from '../lib/dates.js';

export const dashboardRouter = Router();

const machinesStmt = db.prepare('SELECT id, name, color FROM machines ORDER BY sort');

const totalsStmt = db.prepare(
  `SELECT COALESCE(SUM(work_minutes), 0) AS workMinutes,
          COALESCE(SUM(produced_qty), 0) AS producedQty,
          COALESCE(SUM(waste_kg), 0)     AS wasteKg
     FROM production_logs
    WHERE machine_id = ? AND shift_date BETWEEN ? AND ?`
);

// הרשומה האחרונה קובעת את המוצר, איוש העובדים והסטטוס המוצגים בכרטיס
const latestStmt = db.prepare(
  `SELECT product_name AS productName, workers_count AS workersCount,
          status, shift_date AS shiftDate, updated_at AS updatedAt
     FROM production_logs
    WHERE machine_id = ? AND shift_date BETWEEN ? AND ?
    ORDER BY shift_date DESC, updated_at DESC, id DESC
    LIMIT 1`
);

const trendStmt = db.prepare(
  `SELECT machine_id AS machineId, shift_date AS shiftDate,
          COALESCE(SUM(produced_qty), 0) AS producedQty,
          COALESCE(SUM(waste_kg), 0)     AS wasteKg
     FROM production_logs
    WHERE shift_date BETWEEN ? AND ?
    GROUP BY machine_id, shift_date`
);

dashboardRouter.get('/', (req, res) => {
  const { range, days, from, to } = resolveRange(req.query.range);
  const machines = machinesStmt.all();

  const cards = machines.map((machine) => {
    const totals = totalsStmt.get(machine.id, from, to);
    const latest = latestStmt.get(machine.id, from, to);
    const workersCount = latest?.workersCount ?? 0;

    return {
      ...machine,
      productName: latest?.productName ?? '—',
      status: latest?.status ?? 'stopped',
      updatedAt: latest?.updatedAt ?? null,
      workMinutes: totals.workMinutes,
      workersCount,
      producedQty: totals.producedQty,
      wasteKg: totals.wasteKg,
      metrics: deriveMetrics({ ...totals, workersCount, days }),
    };
  });

  const trendRows = trendStmt.all(from, to);
  const trend = listDates(from, to).map((date) => {
    const point = { date };
    machines.forEach((machine) => {
      const row = trendRows.find((item) => item.machineId === machine.id && item.shiftDate === date);
      point[machine.id] = row ? row.producedQty : 0;
    });
    return point;
  });

  res.json({
    range,
    from,
    to,
    totals: {
      producedQty: cards.reduce((sum, card) => sum + card.producedQty, 0),
      wasteKg: Math.round(cards.reduce((sum, card) => sum + card.wasteKg, 0) * 100) / 100,
      workMinutes: cards.reduce((sum, card) => sum + card.workMinutes, 0),
      workersCount: cards
        .filter((card) => card.status === 'running')
        .reduce((sum, card) => sum + card.workersCount, 0),
    },
    machines: cards,
    trend,
  });
});
