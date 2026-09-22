import { Router } from 'express';
import { db } from '../db/index.js';

export const machinesRouter = Router();

machinesRouter.get('/', (req, res) => {
  res.json(db.prepare('SELECT id, name, color FROM machines ORDER BY sort').all());
});
