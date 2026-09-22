import { useState } from 'react';
import KpiTile from '../components/KpiTile';
import MachineCard from '../components/MachineCard';
import RangeSwitch from '../components/RangeSwitch';
import StateMessage from '../components/StateMessage';
import { useDashboard } from '../hooks/useDashboard';
import { IS_STATIC } from '../lib/data';
import { formatDuration, formatNumber } from '../lib/format';
import type { RangeKey } from '../lib/types';

export default function Dashboard() {
  const [range, setRange] = useState<RangeKey>('today');
  const { data, isPending, isError, error } = useDashboard(range);

  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-3 text-xl font-black text-muted">טווח זמן</h2>
        <RangeSwitch value={range} onChange={setRange} />
      </section>

      {IS_STATIC && (
        <p className="rounded-2xl border-4 border-warn/30 bg-warn/10 p-4 text-base font-bold">
          גרסת הדגמה: הנתונים נשמרים בדפדפן של המכשיר הזה בלבד, ואינם משותפים עם מכשירים אחרים.
        </p>
      )}

      {isPending && <StateMessage>טוען נתונים…</StateMessage>}
      {isError && <StateMessage tone="error">{(error as Error).message}</StateMessage>}

      {data && (
        <>
          <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <KpiTile
              icon="📦"
              label="סה״כ יוצר"
              value={formatNumber(data.totals.producedQty)}
              unit="יח׳"
              color="#0066FF"
            />
            <KpiTile
              icon="♻️"
              label="סה״כ פחת"
              value={formatNumber(data.totals.wasteKg)}
              unit={'ק"ג'}
              color="#FF9100"
            />
            <KpiTile
              icon="⏱️"
              label="שעות עבודה"
              value={formatDuration(data.totals.workMinutes)}
              unit="שעות"
              color="#00C853"
            />
            <KpiTile
              icon="👷"
              label="עובדים פעילים"
              value={formatNumber(data.totals.workersCount)}
              color="#6200EA"
            />
          </section>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.machines.map((machine) => (
              <MachineCard key={machine.id} machine={machine} />
            ))}
          </section>
        </>
      )}
    </div>
  );
}
