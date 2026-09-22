export type MachineId = 'knol' | 'rondo' | 'kromster';
export type MachineStatus = 'running' | 'stopped' | 'maintenance';
export type RangeKey = 'today' | 'week' | 'month';

export interface Machine {
  id: MachineId;
  name: string;
  color: string;
}

export interface Metrics {
  outputPerHour: number;
  outputPerWorker: number;
  wastePer100: number;
  utilization: number;
}

export interface MachineCardData extends Machine {
  productName: string;
  status: MachineStatus;
  updatedAt: string | null;
  workMinutes: number;
  workersCount: number;
  producedQty: number;
  wasteKg: number;
  metrics: Metrics;
}

export interface TrendPoint {
  date: string;
  knol: number;
  rondo: number;
  kromster: number;
}

export interface DashboardData {
  range: RangeKey;
  from: string;
  to: string;
  totals: {
    producedQty: number;
    wasteKg: number;
    workMinutes: number;
    workersCount: number;
  };
  machines: MachineCardData[];
  trend: TrendPoint[];
}

export interface ProductionLogInput {
  machineId: MachineId;
  shiftDate: string;
  productName: string;
  workMinutes: number;
  workersCount: number;
  producedQty: number;
  wasteKg: number;
  status: MachineStatus;
}

export const STATUS_LABELS: Record<MachineStatus, string> = {
  running: 'פעילה',
  stopped: 'בעצירה',
  maintenance: 'בתחזוקה',
};
