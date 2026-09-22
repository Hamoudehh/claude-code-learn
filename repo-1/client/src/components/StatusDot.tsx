import { STATUS_LABELS, type MachineStatus } from '../lib/types';

const STATUS_STYLES: Record<MachineStatus, { dot: string; chip: string }> = {
  running: { dot: 'bg-ok', chip: 'bg-ok/10 text-ok' },
  stopped: { dot: 'bg-danger', chip: 'bg-danger/10 text-danger' },
  maintenance: { dot: 'bg-warn', chip: 'bg-warn/15 text-warn' },
};

export default function StatusDot({ status }: { status: MachineStatus }) {
  const style = STATUS_STYLES[status];

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-base font-bold ${style.chip}`}>
      <span className={`h-3 w-3 rounded-full ${style.dot}`} aria-hidden="true" />
      {STATUS_LABELS[status]}
    </span>
  );
}
