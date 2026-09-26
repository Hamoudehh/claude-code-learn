import { Router } from 'express';
import { MACHINES } from '../lib/machines.js';

export const machinesRouter = Router();

machinesRouter.get('/', (req, res) => {
  res.json(MACHINES.map(({ id, name, color }) => ({ id, name, color })));
});
