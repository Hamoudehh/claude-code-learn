import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StateMessage from '../components/StateMessage';
import { useDashboard } from '../hooks/useDashboard';
import { createLog } from '../lib/api';
import { todayString } from '../lib/format';
import { STATUS_LABELS, type MachineId, type MachineStatus, type ProductionLogInput } from '../lib/types';

const EMPTY_FORM = {
  shiftDate: todayString(),
  productName: '',
  workMinutes: '',
  workersCount: '',
  producedQty: '',
  wasteKg: '',
  status: 'running' as MachineStatus,
};

type FormState = typeof EMPTY_FORM;

export default function UpdateMachine() {
  const { machineId } = useParams<{ machineId: MachineId }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data } = useDashboard('today');
  const [form, setForm] = useState(EMPTY_FORM);

  const machine = data?.machines.find((item) => item.id === machineId);

  // ברירת המחדל של הטופס היא שם המוצר והסטטוס הנוכחיים של המכונה
  useEffect(() => {
    if (machine) {
      setForm((current) => ({ ...current, productName: machine.productName === '—' ? '' : machine.productName, status: machine.status }));
    }
  }, [machine]);

  const mutation = useMutation({
    mutationFn: (input: ProductionLogInput) => createLog(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      navigate('/');
    },
  });

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }) as FormState);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!machineId) return;

    mutation.mutate({
      machineId,
      shiftDate: form.shiftDate,
      productName: form.productName.trim(),
      workMinutes: Number(form.workMinutes),
      workersCount: Number(form.workersCount),
      producedQty: Number(form.producedQty),
      wasteKg: Number(form.wasteKg),
      status: form.status,
    });
  };

  if (!machineId) return <StateMessage tone="error">לא נבחרה מכונה</StateMessage>;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h2 className="text-3xl font-black" style={{ color: machine?.color ?? '#0066FF' }}>
        עדכון נתונים — {machine?.name ?? 'מכונה'}
      </h2>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="field-label" htmlFor="shiftDate">
            תאריך משמרת
          </label>
          <input
            id="shiftDate"
            type="date"
            required
            className="field-input"
            value={form.shiftDate}
            onChange={(event) => setField('shiftDate', event.target.value)}
          />
        </div>

        <div>
          <label className="field-label" htmlFor="productName">
            שם המוצר המיוצר
          </label>
          <input
            id="productName"
            type="text"
            required
            placeholder="לדוגמה: בצק לחמניות"
            className="field-input"
            value={form.productName}
            onChange={(event) => setField('productName', event.target.value)}
          />
        </div>

        <div>
          <label className="field-label" htmlFor="workMinutes">
            זמן עבודה (דקות)
          </label>
          <input
            id="workMinutes"
            type="number"
            min="0"
            inputMode="numeric"
            required
            className="field-input"
            value={form.workMinutes}
            onChange={(event) => setField('workMinutes', event.target.value)}
          />
        </div>

        <div>
          <label className="field-label" htmlFor="workersCount">
            מספר עובדים
          </label>
          <input
            id="workersCount"
            type="number"
            min="0"
            inputMode="numeric"
            required
            className="field-input"
            value={form.workersCount}
            onChange={(event) => setField('workersCount', event.target.value)}
          />
        </div>

        <div>
          <label className="field-label" htmlFor="producedQty">
            כמות מיוצרת (יחידות)
          </label>
          <input
            id="producedQty"
            type="number"
            min="0"
            inputMode="numeric"
            required
            className="field-input"
            value={form.producedQty}
            onChange={(event) => setField('producedQty', event.target.value)}
          />
        </div>

        <div>
          <label className="field-label" htmlFor="wasteKg">
            פחת ייצור (ק״ג)
          </label>
          <input
            id="wasteKg"
            type="number"
            min="0"
            step="0.1"
            inputMode="decimal"
            required
            className="field-input"
            value={form.wasteKg}
            onChange={(event) => setField('wasteKg', event.target.value)}
          />
        </div>

        <div>
          <span className="field-label">סטטוס המכונה</span>
          <div className="grid grid-cols-3 gap-3">
            {(Object.keys(STATUS_LABELS) as MachineStatus[]).map((status) => (
              <button
                key={status}
                type="button"
                aria-pressed={form.status === status}
                onClick={() => setField('status', status)}
                className={form.status === status ? 'btn btn-active w-full px-2 text-base' : 'btn btn-ghost w-full px-2 text-base'}
              >
                {STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </div>

        {mutation.isError && <StateMessage tone="error">{(mutation.error as Error).message}</StateMessage>}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button type="submit" disabled={mutation.isPending} className="btn btn-primary w-full disabled:opacity-60">
            {mutation.isPending ? 'שומר…' : '💾 שמירה'}
          </button>
          <button type="button" onClick={() => navigate('/')} className="btn btn-ghost w-full">
            ביטול
          </button>
        </div>
      </form>
    </div>
  );
}
