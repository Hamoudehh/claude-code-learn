// Express 4 לא תופס שגיאות של handlers אסינכרוניים בעצמו
export const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);
