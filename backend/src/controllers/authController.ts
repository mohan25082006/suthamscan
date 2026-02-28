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
            res.status(404).json({ success: false, message: 'Worker not found or unauthorized device' });
            return;
        }

        const worker = result.rows[0];

        const token = jwt.sign(
            { id: worker.id, device_id: worker.device_id },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: (process.env.JWT_EXPIRES_IN || '12h') as any }
        );

        res.json({
            success: true,
            token,
            worker: {
                id: worker.id,
                name: worker.name,
                assigned_route: worker.assigned_route
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
