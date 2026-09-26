// Airtable כשמוגדרים AIRTABLE_TOKEN ו-AIRTABLE_BASE_ID, אחרת SQLite מקומי
const useAirtable = Boolean(process.env.AIRTABLE_TOKEN && process.env.AIRTABLE_BASE_ID);

export const storeName = useAirtable ? 'airtable' : 'sqlite';
export const store = await (useAirtable ? import('./airtable.js') : import('./sqlite.js'));
