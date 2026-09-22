import type { DashboardData, Machine, ProductionLogInput, RangeKey } from './types';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.errors?.join(', ') ?? 'הבקשה לשרת נכשלה');
  }

  return response.json() as Promise<T>;
}

export const fetchMachines = () => request<Machine[]>('/api/machines');

export const fetchDashboard = (range: RangeKey) =>
  request<DashboardData>(`/api/dashboard?range=${range}`);

export const createLog = (input: ProductionLogInput) =>
  request<{ id: number }>('/api/logs', { method: 'POST', body: JSON.stringify(input) });
