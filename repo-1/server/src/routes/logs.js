import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler.js';
import { toDateString } from '../lib/dates.js';
import { MACHINES } from '../lib/machines.js';
import { store } from '../store/index.js';

export const logsRouter = Router();

const STATUSES = ['running', 'stopped', 'maintenance'];

function validate(body) {
  const errors = [];
  if (!MACHINES.some((machine) => machine.id === body.machineId)) errors.push('מזהה מכונה לא קיים');

  const productName = String(body.productName ?? '').trim();
  if (!productName) errors.push('שם מוצר הוא שדה חובה');

  const numbers = {
    workMinutes: Number(body.workMinutes),
    workersCount: Number(body.workersCount),
    producedQty: Number(body.producedQty),
    wasteKg: Number(body.wasteKg),
  };
  Object.entries(numbers).forEach(([key, value]) => {
    if (!Number.isFinite(value) || value < 0) errors.push(`הערך בשדה ${key} חייב להיות מספר אי-שלילי`);
  });

  const status = STATUSES.includes(body.status) ? body.status : null;
  if (!status) errors.push('סטטוס לא חוקי');

  const shiftDate = body.shiftDate ? String(body.shiftDate) : toDateString(new Date());
  if (!/^\d{4}-\d{2}-\d{2}$/.test(shiftDate)) errors.push('תאריך משמרת חייב להיות בפורמט YYYY-MM-DD');

  return {
    errors,
    value: {
      machineId: body.machineId,
      shiftDate,
      productName,
      status,
      workMinutes: Math.round(numbers.workMinutes),
      workersCount: Math.round(numbers.workersCount),
      producedQty: numbers.producedQty,
      wasteKg: numbers.wasteKg,
    },
  };
}

logsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { machineId, from, to } = req.query;
    res.json(await store.listLogs({ machineId, from, to, limit: 500 }));
  })
);

logsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const { errors, value } = validate(req.body ?? {});
    if (errors.length) return res.status(400).json({ errors });
    res.status(201).json(await store.createLog(value));
  })
);

logsRouter.put(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!(await store.getLog(req.params.id))) return res.status(404).json({ errors: ['הרשומה לא נמצאה'] });

    const { errors, value } = validate(req.body ?? {});
    if (errors.length) return res.status(400).json({ errors });
    res.json(await store.updateLog(req.params.id, value));
  })
);
