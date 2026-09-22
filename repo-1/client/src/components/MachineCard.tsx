import { Link } from 'react-router-dom';
import { formatDuration, formatNumber, formatPercent } from '../lib/format';
import type { MachineCardData } from '../lib/types';
import StatusDot from './StatusDot';

function Metric({ icon, label, value, unit }: { icon: string; label: string; value: string; unit?: string }) {
  return (
    <div className="rounded-2xl bg-canvas p-4">
      <div className="flex items-center gap-2 text-base font-bold text-muted">
        <span aria-hidden="true">{icon}</span>
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="text-3xl font-black tabular-nums">{value}</span>
        {unit && <span className="text-base font-bold text-muted">{unit}</span>}
      </div>
    </div>
  );
}

export default function MachineCard({ machine }: { machine: MachineCardData }) {
  return (
    <article className="card flex flex-col border-t-8" style={{ borderTopColor: machine.color }}>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-black sm:text-3xl" style={{ color: machine.color }}>
          {machine.name}
        </h2>
        <StatusDot status={machine.status} />
      </header>

      <p className="mt-3 text-lg font-bold text-muted">
        מוצר בייצור: <span className="text-ink">{machine.productName}</span>
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Metric icon="⏱️" label="זמן עבודה" value={formatDuration(machine.workMinutes)} unit="שעות" />
        <Metric icon="👷" label="עובדים" value={formatNumber(machine.workersCount)} />
        <Metric icon="📦" label="כמות מיוצרת" value={formatNumber(machine.producedQty)} unit="יח׳" />
        <Metric icon="♻️" label="פחת" value={formatNumber(machine.wasteKg)} unit={'ק"ג'} />
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-canvas p-3 text-center">
        <div>
          <dt className="text-sm font-bold text-muted">תפוקה לשעה</dt>
          <dd className="text-xl font-black tabular-nums">{formatNumber(machine.metrics.outputPerHour)}</dd>
        </div>
        <div>
          <dt className="text-sm font-bold text-muted">לעובד</dt>
          <dd className="text-xl font-black tabular-nums">{formatNumber(machine.metrics.outputPerWorker)}</dd>
        </div>
        <div>
          <dt className="text-sm font-bold text-muted">ניצולת זמן</dt>
          <dd className="text-xl font-black tabular-nums">{formatPercent(machine.metrics.utilization)}</dd>
        </div>
      </dl>

      <Link to={`/update/${machine.id}`} className="btn-primary mt-5 w-full">
        ✏️ עדכון נתונים
      </Link>
    </article>
  );
}
