import { db } from '../db/index.js';

const SELECT_COLUMNS = `id, machine_id AS machineId, shift_date AS shiftDate,
       product_name AS productName, work_minutes AS workMinutes,
       workers_count AS workersCount, produced_qty AS producedQty,
       waste_kg AS wasteKg, status, updated_at AS updatedAt`;

export async function listLogs({ machineId, from, to, limit = 500 } = {}) {
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
  return db
    .prepare(
      `SELECT ${SELECT_COLUMNS} FROM production_logs ${clause}
        ORDER BY shift_date DESC, id DESC LIMIT ${Number(limit)}`
    )
    .all(...params);
}

export async function getLog(id) {
  return db.prepare(`SELECT ${SELECT_COLUMNS} FROM production_logs WHERE id = ?`).get(id) ?? null;
}

export async function createLog(value) {
  const info = db
    .prepare(
      `INSERT INTO production_logs
         (machine_id, shift_date, product_name, work_minutes, workers_count, produced_qty, waste_kg, status, updated_at)
       VALUES
         (@machineId, @shiftDate, @productName, @workMinutes, @workersCount, @producedQty, @wasteKg, @status, CURRENT_TIMESTAMP)`
    )
    .run(value);
  return getLog(Number(info.lastInsertRowid));
}

export async function updateLog(id, value) {
  db.prepare(
    `UPDATE production_logs
        SET machine_id = @machineId, shift_date = @shiftDate, product_name = @productName,
            work_minutes = @workMinutes, workers_count = @workersCount, produced_qty = @producedQty,
            waste_kg = @wasteKg, status = @status, updated_at = CURRENT_TIMESTAMP
      WHERE id = @id`
  ).run({ ...value, id: Number(id) });
  return getLog(Number(id));
}
