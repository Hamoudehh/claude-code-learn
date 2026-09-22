/**
 * בוחר את מקור הנתונים לפי אופן הבנייה:
 * בגרסת השרת — קריאות ל-API; בגרסה הסטטית (GitHub Pages) — אחסון הדפדפן.
 */
import * as api from './api';
import * as localStore from './localStore';

export const IS_STATIC = import.meta.env.VITE_STATIC === 'true';

const source = IS_STATIC ? localStore : api;

export const fetchMachines = source.fetchMachines;
export const fetchDashboard = source.fetchDashboard;
export const createLog = source.createLog;
