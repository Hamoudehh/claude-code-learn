const numberFormat = new Intl.NumberFormat('he-IL', { maximumFractionDigits: 1 });

export const formatNumber = (value: number) => numberFormat.format(value ?? 0);

/** דקות → "7:40 ש'" */
export const formatDuration = (minutes: number) => {
  const total = Math.max(Math.round(minutes ?? 0), 0);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
};

export const formatPercent = (ratio: number) => `${Math.round((ratio ?? 0) * 100)}%`;

/** "2026-09-22" → "22/09" */
export const formatDayMonth = (date: string) => {
  const [, month, day] = date.split('-');
  return `${day}/${month}`;
};

export const todayString = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};
