import { useState, type ReactElement } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import RangeSwitch from '../components/RangeSwitch';
import StateMessage from '../components/StateMessage';
import { useDashboard } from '../hooks/useDashboard';
import { formatDayMonth, formatNumber, formatPercent } from '../lib/format';
import type { MachineCardData, RangeKey } from '../lib/types';

const AXIS_STYLE = { fontSize: 14, fontWeight: 700, fill: '#5B6472' };
const TOOLTIP_STYLE = {
  direction: 'rtl' as const,
  borderRadius: 16,
  border: '3px solid #E2E8F0',
  fontWeight: 700,
};

function ChartCard({ title, children }: { title: string; children: ReactElement }) {
  return (
    <section className="card">
      <h3 className="mb-4 text-xl font-black sm:text-2xl">{title}</h3>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default function Compare() {
  const [range, setRange] = useState<RangeKey>('week');
  const { data, isPending, isError, error } = useDashboard(range);

  const bars = (data?.machines ?? []).map((machine: MachineCardData) => ({
    name: machine.name,
    color: machine.color,
    producedQty: machine.producedQty,
    wasteKg: machine.wasteKg,
  }));

  const trend = (data?.trend ?? []).map((point) => ({ ...point, label: formatDayMonth(point.date) }));

  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-3 text-xl font-black text-muted">טווח זמן</h2>
        <RangeSwitch value={range} onChange={setRange} />
      </section>

      {isPending && <StateMessage>טוען נתונים…</StateMessage>}
      {isError && <StateMessage tone="error">{(error as Error).message}</StateMessage>}

      {data && (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard title="כמות מיוצרת לפי מכונה (יח׳)">
              <BarChart data={bars} margin={{ top: 8, left: 8, right: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="name" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
                <YAxis orientation="right" tick={AXIS_STYLE} tickLine={false} axisLine={false} width={70} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number) => formatNumber(value)} />
                <Bar dataKey="producedQty" name="כמות מיוצרת" isAnimationActive={false} radius={[12, 12, 0, 0]} maxBarSize={90}>
                  {bars.map((bar) => (
                    <Cell key={bar.name} fill={bar.color} />
                  ))}
                </Bar>
              </BarChart>
            </ChartCard>

            <ChartCard title='פחת ייצור לפי מכונה (ק"ג)'>
              <BarChart data={bars} margin={{ top: 8, left: 8, right: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="name" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
                <YAxis orientation="right" tick={AXIS_STYLE} tickLine={false} axisLine={false} width={70} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number) => formatNumber(value)} />
                <Bar dataKey="wasteKg" name="פחת" isAnimationActive={false} fill="#FF9100" radius={[12, 12, 0, 0]} maxBarSize={90} />
              </BarChart>
            </ChartCard>
          </div>

          <ChartCard title="תפוקה לאורך זמן (יח׳ ליום)">
            <LineChart data={trend} margin={{ top: 8, left: 8, right: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="label" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
              <YAxis orientation="right" tick={AXIS_STYLE} tickLine={false} axisLine={false} width={70} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number) => formatNumber(value)} />
              <Legend wrapperStyle={{ fontWeight: 700, paddingTop: 8 }} />
              {data.machines.map((machine) => (
                <Line
                  key={machine.id}
                  type="monotone"
                  dataKey={machine.id}
                  name={machine.name}
                  stroke={machine.color}
                  strokeWidth={4}
                  dot={{ r: 4 }}
                  activeDot={{ r: 7 }}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ChartCard>

          <section className="card overflow-x-auto">
            <h3 className="mb-4 text-xl font-black sm:text-2xl">טבלת השוואה</h3>
            <table className="w-full min-w-[520px] border-collapse text-right">
              <thead>
                <tr className="border-b-4 border-slate-100 text-base text-muted">
                  <th className="p-3 font-bold">מכונה</th>
                  <th className="p-3 font-bold">תפוקה לשעה</th>
                  <th className="p-3 font-bold">תפוקה לעובד</th>
                  <th className="p-3 font-bold">פחת ל־100 יח׳ (ק״ג)</th>
                  <th className="p-3 font-bold">ניצולת זמן</th>
                </tr>
              </thead>
              <tbody>
                {data.machines.map((machine) => (
                  <tr key={machine.id} className="border-b-2 border-slate-100 text-lg font-bold tabular-nums">
                    <td className="p-3 font-black" style={{ color: machine.color }}>
                      {machine.name}
                    </td>
                    <td className="p-3">{formatNumber(machine.metrics.outputPerHour)}</td>
                    <td className="p-3">{formatNumber(machine.metrics.outputPerWorker)}</td>
                    <td className="p-3">{formatNumber(machine.metrics.wastePer100)}</td>
                    <td className="p-3">{formatPercent(machine.metrics.utilization)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  );
}
