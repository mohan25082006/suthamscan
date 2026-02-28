import { Router } from 'express';
import { login } from '../controllers/authController';
import { validateScan, generateQR } from '../controllers/qrController';
import { authenticate } from '../middleware/auth';
import { query } from '../config/db';

const router = Router();

// Worker Auth
router.post('/login', login);

// Scanning
router.post('/validate-scan', authenticate, validateScan);

// Utility (For creating test QR payloads)
router.post('/admin/generate-qr', generateQR);

// Admin Dashboard Data
router.get('/admin/scans', async (req, res) => {
    try {
        const result = await query(`
      SELECT s.*, w.name as worker_name, q.lat as target_lat, q.long as target_long
      FROM scan_event s
      JOIN worker w ON s.worker_id = w.id
      JOIN qr_location q ON s.qr_id = q.id
      ORDER BY s.timestamp DESC
      LIMIT 100
    `);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'DB Error' });
    }
});

router.get('/admin/stats', async (req, res) => {
    try {
        const totalScans = await query(`SELECT COUNT(*) FROM scan_event`);
        const flaggedScans = await query(`SELECT COUNT(*) FROM scan_event WHERE fraud_score > 50`);
        const activeWorkers = await query(`SELECT COUNT(DISTINCT worker_id) FROM scan_event WHERE timestamp >= CURRENT_DATE`);

        res.json({
            success: true,
            data: {
                totalScans: totalScans.rows[0].count,
                flaggedScans: flaggedScans.rows[0].count,
                activeWorkers: activeWorkers.rows[0].count
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'DB Error' });
    }
});

export default router;
