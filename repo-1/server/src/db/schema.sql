CREATE TABLE IF NOT EXISTS machines (
  id    TEXT PRIMARY KEY,
  name  TEXT NOT NULL,
  color TEXT NOT NULL,
  sort  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS production_logs (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  machine_id    TEXT NOT NULL REFERENCES machines(id),
  shift_date    DATE NOT NULL,
  product_name  TEXT NOT NULL,
  work_minutes  INTEGER NOT NULL CHECK (work_minutes >= 0),
  workers_count INTEGER NOT NULL CHECK (workers_count >= 0),
  produced_qty  REAL NOT NULL CHECK (produced_qty >= 0),
  waste_kg      REAL NOT NULL CHECK (waste_kg >= 0),
  status        TEXT NOT NULL CHECK (status IN ('running', 'stopped', 'maintenance')),
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_logs_machine_date
  ON production_logs (machine_id, shift_date);
