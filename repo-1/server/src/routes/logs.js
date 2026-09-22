import { Router } from 'express';
import { db } from '../db/index.js';
import { toDateString } from '../lib/dates.js';

export const logsRouter = Router();

const STATUSES = ['running', 'stopped', 'maintenance'];

const SELECT_COLUMNS = `id, machine_id AS machineId, shift_date AS shiftDate,
       product_name AS productName, work_minutes AS workMinutes,
       workers_count AS workersCount, produced_qty AS producedQty,
       waste_kg AS wasteKg, status, updated_at AS updatedAt`;

function validate(body) {
  const errors = [];
  const machine = db.prepare('SELECT id FROM machines WHERE id = ?').get(body.machineId);
  if (!machine) errors.push('מזהה מכונה לא קיים');

  const productName = String(body.productName ?? '').trim();
  if (!productName) errors.push('שם מוצר הוא שדה חובה');

  const numbers = {
    workMinutes: Number(body.workMinutes),
    workersCount: Number(body.workersCount),
    producedQty: Number(body.producedQty),
    wasteKg: Number(body.wasteKg),
  };
  Object.entries(numbers).forEach(([key, value]) => {
    if (!Number.isFinite(value) || value < 0) errors.push(`הערך בשדה ${key} חייב להיות מספר אי-שלילי`);
  });

  const status = STATUSES.includes(body.status) ? body.status : null;
  if (!status) errors.push('סטטוס לא חוקי');

  const shiftDate = body.shiftDate ? String(body.shiftDate) : toDateString(new Date());
  if (!/^\d{4}-\d{2}-\d{2}$/.test(shiftDate)) errors.push('תאריך משמרת חייב להיות בפורמט YYYY-MM-DD');

  return {
    errors,
    value: {
      machineId: body.machineId,
      shiftDate,
      productName,
      status,
      workMinutes: Math.round(numbers.workMinutes),
      workersCount: Math.round(numbers.workersCount),
      producedQty: numbers.producedQty,
      wasteKg: numbers.wasteKg,
    },
  };
}

logsRouter.get('/', (req, res) => {
  const { machineId, from, to } = req.query;
  const where = [];
  const params = [];
  if (machineId) {
    where.push('machine_id = ?');
    params.push(machineId);
  }
  if (from) {
    where.push('shift_date >= ?');
    params.push(from);
  }
  if (to) {
    where.push('shift_date <= ?');
    params.push(to);
  }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  res.json(
    db
      .prepare(
        `SELECT ${SELECT_COLUMNS} FROM production_logs ${clause}
          ORDER BY shift_date DESC, id DESC LIMIT 500`
      )
      .all(...params)
  );
});

logsRouter.post('/', (req, res) => {
  const { errors, value } = validate(req.body ?? {});
  if (errors.length) return res.status(400).json({ errors });

  const info = db
    .prepare(
      `INSERT INTO production_logs
         (machine_id, shift_date, product_name, work_minutes, workers_count, produced_qty, waste_kg, status, updated_at)
       VALUES
         (@machineId, @shiftDate, @productName, @workMinutes, @workersCount, @producedQty, @wasteKg, @status, CURRENT_TIMESTAMP)`
    )
    .run(value);

  res
    .status(201)
    .json(db.prepare(`SELECT ${SELECT_COLUMNS} FROM production_logs WHERE id = ?`).get(Number(info.lastInsertRowid)));
});

logsRouter.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT id FROM production_logs WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ errors: ['הרשומה לא נמצאה'] });

  const { errors, value } = validate(req.body ?? {});
  if (errors.length) return res.status(400).json({ errors });

  db.prepare(
    `UPDATE production_logs
        SET machine_id = @machineId, shift_date = @shiftDate, product_name = @productName,
            work_minutes = @workMinutes, workers_count = @workersCount, produced_qty = @producedQty,
            waste_kg = @wasteKg, status = @status, updated_at = CURRENT_TIMESTAMP
      WHERE id = @id`
  ).run({ ...value, id: Number(req.params.id) });

  res.json(db.prepare(`SELECT ${SELECT_COLUMNS} FROM production_logs WHERE id = ?`).get(req.params.id));
});
