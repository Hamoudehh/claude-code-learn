import type { RangeKey } from '../lib/types';

const RANGES: { key: RangeKey; label: string }[] = [
  { key: 'today', label: 'היום' },
  { key: 'week', label: 'השבוע' },
  { key: 'month', label: 'החודש' },
];

interface RangeSwitchProps {
  value: RangeKey;
  onChange: (range: RangeKey) => void;
}

export default function RangeSwitch({ value, onChange }: RangeSwitchProps) {
  return (
    <div className="grid grid-cols-3 gap-3" role="group" aria-label="טווח זמן">
      {RANGES.map((range) => (
        <button
          key={range.key}
          type="button"
          onClick={() => onChange(range.key)}
          aria-pressed={value === range.key}
          className={value === range.key ? 'btn btn-active w-full' : 'btn btn-ghost w-full'}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}
