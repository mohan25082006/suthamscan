import { Request, Response } from 'express';
import { query } from '../config/db';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const login = async (req: Request, res: Response): Promise<void> => {
    const { device_id } = req.body;

    if (!device_id) {
        res.status(400).json({ success: false, message: 'device_id is required' });
        return;
    }

    try {
        const result = await query('SELECT * FROM worker WHERE device_id = $1', [device_id]);

        if (result.rows.length === 0) {
            res.status(401).json({ success: false, message: 'Device not registered' });
            return;
        }

        const worker = result.rows[0];
        const token = jwt.sign(
            { id: worker.id, device_id: worker.device_id },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '12h' }
        );

        res.json({
            success: true,
            token,
            worker: { id: worker.id, name: worker.name, assigned_route: worker.assigned_route }
        });
    } catch (error) {
        console.error('Worker login error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const adminLogin = async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).json({ success: false, message: 'Username and password are required' });
        return;
    }

    try {
        // Mock admin check
        if (username === 'admin' && password === 'admin123') {
            const token = jwt.sign(
                { id: 'admin-001', role: 'admin' },
                process.env.JWT_SECRET || 'secret',
                { expiresIn: '24h' }
            );

            res.json({
                success: true,
                token,
                user: { id: 'admin-001', name: 'System Admin', role: 'admin' }
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
