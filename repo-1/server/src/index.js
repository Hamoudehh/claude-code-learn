import cors from 'cors';
import express from 'express';
import { dashboardRouter } from './routes/dashboard.js';
import { logsRouter } from './routes/logs.js';
import { machinesRouter } from './routes/machines.js';
import { storeName } from './store/index.js';

const app = express();
const PORT = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/machines', machinesRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/logs', logsRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ errors: ['שגיאת שרת פנימית'] });
});

app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT} (data: ${storeName})`));
