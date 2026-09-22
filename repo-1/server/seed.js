import { db, MACHINES, runInTransaction } from './src/db/index.js';
import { shiftDays, toDateString } from './src/lib/dates.js';

const PROFILES = {
  knol: { products: ['בצק לחמניות', 'בצק פיתות'], qty: 1800, workers: 3, waste: 22 },
  rondo: { products: ['בורקס גבינה', 'בורקס תפוחי אדמה'], qty: 1200, workers: 2, waste: 14 },
  kromster: { products: ['קרואסון חמאה', 'רוגלך שוקולד'], qty: 900, workers: 4, waste: 18 },
};

const DAYS = 30;
const MAX_SHIFT_MINUTES = 480;

// מחולל פסאודו-אקראי דטרמיניסטי, כדי שהנתונים לדוגמה יהיו יציבים בין הרצות
let seed = 42;
const random = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

const today = toDateString(new Date());

db.exec('DELETE FROM production_logs');

const insert = db.prepare(
  `INSERT INTO production_logs
     (machine_id, shift_date, product_name, work_minutes, workers_count, produced_qty, waste_kg, status, updated_at)
   VALUES
     (@machineId, @shiftDate, @productName, @workMinutes, @workersCount, @producedQty, @wasteKg, @status, CURRENT_TIMESTAMP)`
);

const rows = [];
for (let offset = DAYS - 1; offset >= 0; offset -= 1) {
  const shiftDate = shiftDays(today, -offset);
  const isWeekend = [5, 6].includes(new Date(`${shiftDate}T00:00:00`).getDay());
  if (isWeekend) continue;

  MACHINES.forEach((machine) => {
    const profile = PROFILES[machine.id];
    const factor = 0.75 + random() * 0.5;
    const status = offset === 0 && random() < 0.25 ? 'maintenance' : 'running';
    const workMinutes = Math.min(
      MAX_SHIFT_MINUTES,
      status === 'maintenance' ? Math.round(180 * factor) : Math.round(380 * factor)
    );

    rows.push({
      machineId: machine.id,
      shiftDate,
      productName: profile.products[random() < 0.7 ? 0 : 1],
      workMinutes,
      workersCount: profile.workers + (random() < 0.3 ? 1 : 0),
      producedQty: Math.round(profile.qty * factor),
      wasteKg: Math.round(profile.waste * factor * 10) / 10,
      status,
    });
  });
}

runInTransaction(() => rows.forEach((row) => insert.run(row)));
console.log(`נטענו ${rows.length} רשומות ייצור לדוגמה (${DAYS} ימים אחרונים).`);
