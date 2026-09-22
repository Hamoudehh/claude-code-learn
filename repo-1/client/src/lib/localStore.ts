/**
 * שכבת נתונים לגרסה הסטטית (GitHub Pages) — ללא שרת.
 * הרשומות נשמרות ב-localStorage של הדפדפן, ולכן כל מכשיר מחזיק נתונים משלו.
 * החישובים כאן זהים לאלה של השרת ב-server/src/routes/dashboard.js.
 */
import { MACHINES } from './machines';
import type {
  DashboardData,
  Machine,
  MachineCardData,
  MachineStatus,
  Metrics,
  ProductionLogInput,
  RangeKey,
  TrendPoint,
} from './types';

const STORAGE_KEY = 'factory-dashboard-logs-v1';
const SHIFT_MINUTES = 480;
const RANGE_DAYS: Record<RangeKey, number> = { today: 1, week: 7, month: 30 };

interface StoredLog extends ProductionLogInput {
  id: number;
}

const toDateString = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

const shiftDays = (dateString: string, delta: number) => {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + delta);
  return toDateString(date);
};

const listDates = (from: string, to: string) => {
  const dates: string[] = [];
  for (let cursor = from; cursor <= to; cursor = shiftDays(cursor, 1)) dates.push(cursor);
  return dates;
};

const round = (value: number, digits = 1) => {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

function deriveMetrics(totals: {
  workMinutes: number;
  workersCount: number;
  producedQty: number;
  wasteKg: number;
  days: number;
}): Metrics {
  const { workMinutes, workersCount, producedQty, wasteKg, days } = totals;
  return {
    outputPerHour: workMinutes > 0 ? round(producedQty / (workMinutes / 60)) : 0,
    outputPerWorker: workersCount > 0 ? round(producedQty / workersCount) : 0,
    wastePer100: producedQty > 0 ? round((wasteKg / producedQty) * 100, 2) : 0,
    utilization: round(workMinutes / (SHIFT_MINUTES * Math.max(days, 1)), 3),
  };
}

const PROFILES: Record<string, { products: string[]; qty: number; workers: number; waste: number }> = {
  knol: { products: ['בצק לחמניות', 'בצק פיתות'], qty: 1800, workers: 3, waste: 22 },
  rondo: { products: ['בורקס גבינה', 'בורקס תפוחי אדמה'], qty: 1200, workers: 2, waste: 14 },
  kromster: { products: ['קרואסון חמאה', 'רוגלך שוקולד'], qty: 900, workers: 4, waste: 18 },
};

/** נתוני דמו ל-30 הימים האחרונים, זהים לאלה של server/seed.js */
function generateDemoLogs(): StoredLog[] {
  let seed = 42;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  const today = toDateString(new Date());
  const logs: StoredLog[] = [];
  let id = 1;

  for (let offset = 29; offset >= 0; offset -= 1) {
    const shiftDate = shiftDays(today, -offset);
    if ([5, 6].includes(new Date(`${shiftDate}T00:00:00`).getDay())) continue;

    MACHINES.forEach((machine) => {
      const profile = PROFILES[machine.id];
      const factor = 0.75 + random() * 0.5;
      const status: MachineStatus = offset === 0 && random() < 0.25 ? 'maintenance' : 'running';

      logs.push({
        id: id++,
        machineId: machine.id,
        shiftDate,
        productName: profile.products[random() < 0.7 ? 0 : 1],
        workMinutes: Math.min(
          SHIFT_MINUTES,
          status === 'maintenance' ? Math.round(180 * factor) : Math.round(380 * factor)
        ),
        workersCount: profile.workers + (random() < 0.3 ? 1 : 0),
        producedQty: Math.round(profile.qty * factor),
        wasteKg: Math.round(profile.waste * factor * 10) / 10,
        status,
      });
    });
  }

  return logs;
}

function writeLogs(logs: StoredLog[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch {
    // דפדפן בלי אחסון (גלישה פרטית) — הדאשבורד עדיין יעבוד, רק לא ישמור
  }
}

function readLogs(): StoredLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as StoredLog[];
    }
  } catch {
    // נתונים פגומים — נתחיל מנתוני הדמו
  }

  const demo = generateDemoLogs();
  writeLogs(demo);
  return demo;
}

export async function fetchMachines(): Promise<Machine[]> {
  return MACHINES;
}

export async function fetchDashboard(range: RangeKey): Promise<DashboardData> {
  const days = RANGE_DAYS[range] ?? RANGE_DAYS.today;
  const to = toDateString(new Date());
  const from = shiftDays(to, -(days - 1));
  const logs = readLogs().filter((log) => log.shiftDate >= from && log.shiftDate <= to);

  const machines: MachineCardData[] = MACHINES.map((machine) => {
    const own = logs.filter((log) => log.machineId === machine.id);
    const latest = [...own].sort((a, b) =>
      a.shiftDate === b.shiftDate ? b.id - a.id : a.shiftDate < b.shiftDate ? 1 : -1
    )[0];

    const totals = own.reduce(
      (sum, log) => ({
        workMinutes: sum.workMinutes + log.workMinutes,
        producedQty: sum.producedQty + log.producedQty,
        wasteKg: sum.wasteKg + log.wasteKg,
      }),
      { workMinutes: 0, producedQty: 0, wasteKg: 0 }
    );

    const workersCount = latest?.workersCount ?? 0;

    return {
      ...machine,
      productName: latest?.productName ?? '—',
      status: latest?.status ?? 'stopped',
      updatedAt: null,
      workMinutes: totals.workMinutes,
      workersCount,
      producedQty: totals.producedQty,
      wasteKg: round(totals.wasteKg, 2),
      metrics: deriveMetrics({ ...totals, workersCount, days }),
    };
  });

  const trend: TrendPoint[] = listDates(from, to).map((date) => {
    const point = { date } as TrendPoint;
    MACHINES.forEach((machine) => {
      point[machine.id] = logs
        .filter((log) => log.machineId === machine.id && log.shiftDate === date)
        .reduce((sum, log) => sum + log.producedQty, 0);
    });
    return point;
  });

  return {
    range,
    from,
    to,
    totals: {
      producedQty: machines.reduce((sum, machine) => sum + machine.producedQty, 0),
      wasteKg: round(
        machines.reduce((sum, machine) => sum + machine.wasteKg, 0),
        2
      ),
      workMinutes: machines.reduce((sum, machine) => sum + machine.workMinutes, 0),
      workersCount: machines
        .filter((machine) => machine.status === 'running')
        .reduce((sum, machine) => sum + machine.workersCount, 0),
    },
    machines,
    trend,
  };
}

export async function createLog(input: ProductionLogInput): Promise<{ id: number }> {
  const logs = readLogs();
  const id = logs.reduce((max, log) => Math.max(max, log.id), 0) + 1;
  logs.push({ ...input, id });
  writeLogs(logs);
  return { id };
}
