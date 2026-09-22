import type { Machine } from './types';

/** רשימת המכונות. בגרסת השרת היא מגיעה מ-/api/machines, בגרסה הסטטית מכאן. */
export const MACHINES: Machine[] = [
  { id: 'knol', name: 'מכונת כנול', color: '#0066FF' },
  { id: 'rondo', name: 'מכונת רונדו', color: '#00BFA5' },
  { id: 'kromster', name: 'מכונת קרומסטר', color: '#6200EA' },
];
