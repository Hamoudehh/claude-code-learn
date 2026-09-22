export const toDateString = (date) => {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

export const shiftDays = (dateString, delta) => {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + delta);
  return toDateString(date);
};

const RANGE_DAYS = { today: 1, week: 7, month: 30 };

export function resolveRange(range = 'today') {
  const days = RANGE_DAYS[range] ?? RANGE_DAYS.today;
  const to = toDateString(new Date());
  return { range: RANGE_DAYS[range] ? range : 'today', days, from: shiftDays(to, -(days - 1)), to };
}

export function listDates(from, to) {
  const dates = [];
  for (let cursor = from; cursor <= to; cursor = shiftDays(cursor, 1)) dates.push(cursor);
  return dates;
}
