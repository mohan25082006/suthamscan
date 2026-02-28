import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api';
import { runShiftCompletion } from './services/shiftEngine';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'OK', uptime: process.uptime() });
});

app.listen(PORT, () => {
    console.log(`[Server] SuthamScan Backend running on port ${PORT}`);

    // Schedule Shift Completion (simulated for every 1 minute for demo purposes, would be a cron job at EOD)
    setInterval(() => {
        runShiftCompletion();
    }, 60 * 1000);
});
