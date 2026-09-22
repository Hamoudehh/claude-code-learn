import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', '..', 'factory.db');

export const MACHINES = [
  { id: 'knol', name: 'מכונת כנול', color: '#0066FF', sort: 1 },
  { id: 'rondo', name: 'מכונת רונדו', color: '#00BFA5', sort: 2 },
  { id: 'kromster', name: 'מכונת קרומסטר', color: '#6200EA', sort: 3 },
];

export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));

const upsertMachine = db.prepare(
  `INSERT INTO machines (id, name, color, sort) VALUES (@id, @name, @color, @sort)
   ON CONFLICT(id) DO UPDATE SET name = excluded.name, color = excluded.color, sort = excluded.sort`
);
db.transaction((rows) => rows.forEach((row) => upsertMachine.run(row)))(MACHINES);
