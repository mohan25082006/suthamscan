import { Request, Response } from 'express';
import { query } from '../config/db';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/auth';
import { validateScanAndCalculateFraud } from '../services/fraudEngine';

interface QRPayload {
    qr_id: string; // The UUID from qr_location table
    route_id: string;
    lat: number;
    long: number;
    service_frequency: string;
}

// Generates a mock signed QR code for an address
export const generateQR = async (req: Request, res: Response): Promise<void> => {
    const { address_id } = req.body; // Actually the qr_location.id

    try {
        const result = await query('SELECT * FROM qr_location WHERE id = $1', [address_id]);

        if (result.rows.length === 0) {
            res.status(404).json({ success: false, message: 'QR Location not found' });
            return;
        }

        const loc = result.rows[0];
        const payload: QRPayload = {
            qr_id: loc.id,
            route_id: loc.route_id,
            lat: loc.lat,
            long: loc.long,
            service_frequency: loc.service_frequency
        };

        // Sign the QR to prevent tampering or manual creation
        const qrToken = jwt.sign(payload, process.env.JWT_SECRET || 'secret');

        res.json({ success: true, qr: qrToken, data: payload });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const validateScan = async (req: AuthRequest, res: Response): Promise<void> => {
    const { qrToken, lat, long, timestamp } = req.body;
    const worker = req.worker;

    if (!worker || !qrToken || lat === undefined || long === undefined || !timestamp) {
        res.status(400).json({ success: false, message: 'Missing required fields' });
        return;
    }

    try {
        // 1. Verify QR signature validity
        let qrPayload: QRPayload;
        try {
            qrPayload = jwt.verify(qrToken, process.env.JWT_SECRET || 'secret') as QRPayload;
        } catch (e) {
            res.status(400).json({ success: false, rejection_reason: 'Invalid or forged QR signature', fraud_score: 100 });
            return;
        }

        // 2. Verify worker is assigned to that route
        const workerRes = await query('SELECT assigned_route FROM worker WHERE id = $1', [worker.id]);
        if (workerRes.rows.length === 0 || workerRes.rows[0].assigned_route !== qrPayload.route_id) {
            res.status(403).json({ success: false, rejection_reason: 'Worker is not assigned to this route', fraud_score: 50 });
            return;
        }

        // 3. Fraud Engine Validation
        const validationResult = await validateScanAndCalculateFraud({
            workerId: worker.id,
            qrId: qrPayload.qr_id,
            lat: parseFloat(lat),
            long: parseFloat(long),
            qrLat: qrPayload.lat,
            qrLong: qrPayload.long,
            timestamp: timestamp
        });

        // 4. Log the scan event to DB
        await query(
            `INSERT INTO scan_event (worker_id, qr_id, timestamp, lat, long, distance_from_target, fraud_score, validation_status, rejection_reason) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
                worker.id,
                qrPayload.qr_id,
                timestamp,
                lat,
                long,
                validationResult.distanceFromTarget,
                validationResult.fraudScore,
                validationResult.validationStatus,
                validationResult.rejectionReason
            ]
        );

        res.json({
            success: validationResult.validationStatus === 'VALID' || validationResult.validationStatus === 'FRAUD_FLAGGED', // FRAUD marks it in DB, but may conditionally allow/warn. In a strict system, maybe fail.
            rejection_reason: validationResult.rejectionReason,
            fraud_score: validationResult.fraudScore,
            validation_status: validationResult.validationStatus
        });

    } catch (error) {
        console.error('Validation error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
