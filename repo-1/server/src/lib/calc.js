// אורך משמרת בדקות — בסיס לחישוב ניצולת הזמן
export const SHIFT_MINUTES = Number(process.env.SHIFT_MINUTES || 480);

const round = (value, digits = 1) => {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

/**
 * מדדים נגזרים. אין לנו משקל ליחידה, ולכן אחוז הפחת מחושב
 * כק"ג פחת לכל 100 יחידות מיוצרות (כמפורט ב-spec.md).
 */
export function deriveMetrics({ workMinutes, workersCount, producedQty, wasteKg, days = 1 }) {
  return {
    outputPerHour: workMinutes > 0 ? round(producedQty / (workMinutes / 60)) : 0,
    outputPerWorker: workersCount > 0 ? round(producedQty / workersCount) : 0,
    wastePer100: producedQty > 0 ? round((wasteKg / producedQty) * 100, 2) : 0,
    utilization: round(workMinutes / (SHIFT_MINUTES * Math.max(days, 1)), 3),
  };
}
