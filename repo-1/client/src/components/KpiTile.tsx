interface KpiTileProps {
  icon: string;
  label: string;
  value: string;
  unit?: string;
  color: string;
}

export default function KpiTile({ icon, label, value, unit, color }: KpiTileProps) {
  return (
    <div className="card border-t-8 p-4 sm:p-5" style={{ borderTopColor: color }}>
      <div className="flex items-center gap-2 text-base font-bold text-muted">
        <span aria-hidden="true">{icon}</span>
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="metric-value" style={{ color }}>
          {value}
        </span>
        {unit && <span className="text-lg font-bold text-muted">{unit}</span>}
      </div>
    </div>
  );
}
