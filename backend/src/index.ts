import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api';
import { runShiftCompletion } from './services/shiftEngine';
import { simulateRandomScan } from './config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Simple Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

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

    // Real-time Data Simulator (Every 5 seconds)
    setInterval(() => {
        simulateRandomScan();
    }, 5000);
});
