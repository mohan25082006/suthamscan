import { query } from '../config/db';
import { getDistance } from 'geolib';

interface ScanData {
    workerId: string;
    qrId: string;
    lat: number;
    long: number;
    qrLat: number;
    qrLong: number;
    timestamp: string;
}

export const validateScanAndCalculateFraud = async (data: ScanData) => {
    let fraudScore = 0;
    let validationStatus = 'VALID';
    let rejectionReason = null;

    const currentScanTime = new Date(data.timestamp);

    // 1. Distance Validation (Haversine)
    const distanceFromTarget = getDistance(
        { latitude: data.lat, longitude: data.long },
        { latitude: data.qrLat, longitude: data.qrLong }
    );

    // Hard rejection if > 5 meters
    if (distanceFromTarget > 5) {
        validationStatus = 'INVALID_DISTANCE';
        rejectionReason = `Scan too far from target. Scanned at ${distanceFromTarget}m, threshold is 5m.`;
        fraudScore += 100;
        return { validationStatus, rejectionReason, fraudScore, distanceFromTarget };
    }

    // Suspiciously exact boundary scan repeatedly (e.g. spoofed 4.9m)
    if (distanceFromTarget >= 4.8 && distanceFromTarget <= 5.0) {
        fraudScore += 20; // Slightly suspicious
    }

    // 2. Duplicate Scan Validation (Already scanned today?)
    const startOfDay = new Date(currentScanTime);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(currentScanTime);
    endOfDay.setHours(23, 59, 59, 999);

    const duplicateCheck = await query(
        `SELECT id FROM scan_event 
     WHERE qr_id = $1 AND timestamp >= $2 AND timestamp <= $3`,
        [data.qrId, startOfDay.toISOString(), endOfDay.toISOString()]
    );

    if (duplicateCheck.rows.length > 0) {
        validationStatus = 'DUPLICATE';
        rejectionReason = 'This QR has already been scanned today.';
        fraudScore += 100;
        return { validationStatus, rejectionReason, fraudScore, distanceFromTarget };
    }

    // 3. Shift Time Validation (Simplistic 6AM - 6PM example)
    const hour = currentScanTime.getHours();
    if (hour < 6 || hour > 18) {
        validationStatus = 'INVALID_TIME';
        rejectionReason = 'Scan occurred outside of valid shift hours (6 AM - 6 PM).';
        fraudScore += 80;
        return { validationStatus, rejectionReason, fraudScore, distanceFromTarget };
    }

    // 4. Unrealistic Speed / Geographic Jumps Validation
    // Get the worker's LAST scan for the day
    const lastScanResult = await query(
        `SELECT lat, long, timestamp FROM scan_event 
     WHERE worker_id = $1 AND timestamp >= $2 AND timestamp <= $3 
     ORDER BY timestamp DESC LIMIT 1`,
        [data.workerId, startOfDay.toISOString(), endOfDay.toISOString()]
    );

    if (lastScanResult.rows.length > 0) {
        const lastScan = lastScanResult.rows[0];
        const previousTime = new Date(lastScan.timestamp);
        const timeDiffMs = currentScanTime.getTime() - previousTime.getTime();
        const timeDiffHours = timeDiffMs / (1000 * 60 * 60);

        const distanceBetweenScans = getDistance(
            { latitude: data.lat, longitude: data.long },
            { latitude: lastScan.lat, longitude: lastScan.long }
        );

        // Speed in meters per hour (getDistance returns meters, timeDiffHours in hours)
        const speedMetersPerHour = distanceBetweenScans / (timeDiffHours || 0.0001); // avoid /0
        const speedKmh = speedMetersPerHour / 1000;

        // If speed is > 100 km/h (unlikely for sanitation)
        if (speedKmh > 100) {
            fraudScore += 50;
            validationStatus = 'FRAUD_FLAGGED';
            rejectionReason = `Unrealistic speed detected: ${speedKmh.toFixed(2)} km/h between stops.`;
        }
    }

    // Normalize fraud score
    fraudScore = Math.min(fraudScore, 100);

    return { validationStatus, rejectionReason, fraudScore, distanceFromTarget };
};
