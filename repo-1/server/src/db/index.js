import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', '..', 'factory.db');

export const MACHINES = [
  { id: 'knol', name: 'מכונת כנול', color: '#0066FF', sort: 1 },
  { id: 'rondo', name: 'מכונת רונדו', color: '#00BFA5', sort: 2 },
  { id: 'kromster', name: 'מכונת קרומסטר', color: '#6200EA', sort: 3 },
];

// node:sqlite — מנוע SQLite המובנה ב-Node 22.5 ומעלה, ללא תלות native חיצונית
export const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');
db.exec(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));

/** מריץ פעולות כתיבה בתוך טרנזקציה אחת */
export function runInTransaction(action) {
  db.exec('BEGIN');
  try {
    const result = action();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

const upsertMachine = db.prepare(
  `INSERT INTO machines (id, name, color, sort) VALUES (@id, @name, @color, @sort)
   ON CONFLICT(id) DO UPDATE SET name = excluded.name, color = excluded.color, sort = excluded.sort`
);
runInTransaction(() => MACHINES.forEach((machine) => upsertMachine.run(machine)));
