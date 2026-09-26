import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler.js';
import { deriveMetrics } from '../lib/calc.js';
import { listDates, resolveRange } from '../lib/dates.js';
import { MACHINES } from '../lib/machines.js';
import { store } from '../store/index.js';

export const dashboardRouter = Router();

const sum = (items, key) => items.reduce((total, item) => total + item[key], 0);

// הרשומה האחרונה קובעת את המוצר, איוש העובדים והסטטוס המוצגים בכרטיס
const isNewer = (a, b) =>
  a.shiftDate !== b.shiftDate ? a.shiftDate > b.shiftDate : String(a.updatedAt) > String(b.updatedAt);

dashboardRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { range, days, from, to } = resolveRange(req.query.range);
    const logs = await store.listLogs({ from, to, limit: 5000 });

    const cards = MACHINES.map(({ id, name, color }) => {
      const own = logs.filter((log) => log.machineId === id);
      const latest = own.reduce((best, log) => (!best || isNewer(log, best) ? log : best), null);
      const totals = {
        workMinutes: sum(own, 'workMinutes'),
        producedQty: sum(own, 'producedQty'),
        wasteKg: sum(own, 'wasteKg'),
      };
      const workersCount = latest?.workersCount ?? 0;

      return {
        id,
        name,
        color,
        productName: latest?.productName || '—',
        status: latest?.status ?? 'stopped',
        updatedAt: latest?.updatedAt ?? null,
        ...totals,
        workersCount,
        metrics: deriveMetrics({ ...totals, workersCount, days }),
      };
    });

    const trend = listDates(from, to).map((date) => {
      const point = { date };
      MACHINES.forEach(({ id }) => {
        point[id] = sum(
          logs.filter((log) => log.machineId === id && log.shiftDate === date),
          'producedQty'
        );
      });
      return point;
    });

    res.json({
      range,
      from,
      to,
      totals: {
        producedQty: sum(cards, 'producedQty'),
        wasteKg: Math.round(sum(cards, 'wasteKg') * 100) / 100,
        workMinutes: sum(cards, 'workMinutes'),
        workersCount: sum(
          cards.filter((card) => card.status === 'running'),
          'workersCount'
        ),
      },
      machines: cards,
      trend,
    });
  })
);
