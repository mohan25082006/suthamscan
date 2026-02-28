import { query } from '../config/db';

export const runShiftCompletion = async () => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    try {
        // 1. Get all assigned routes and their QR locations
        const allLocationsRes = await query(`SELECT route_id, COUNT(*) as expected_scans FROM qr_location GROUP BY route_id`);

        // 2. Get today's scans per route
        const todayScansRes = await query(
            `SELECT q.route_id, COUNT(DISTINCT s.qr_id) as actual_scans 
       FROM scan_event s 
       JOIN qr_location q ON s.qr_id = q.id 
       WHERE s.timestamp >= $1 AND s.timestamp <= $2
       GROUP BY q.route_id`,
            [startOfDay.toISOString(), endOfDay.toISOString()]
        );

        const actualScansMap = new Map();
        todayScansRes.rows.forEach((row: any) => actualScansMap.set(row.route_id, parseInt(row.actual_scans)));

        // 3. Mark unscanned as missed and calculate coverage
        for (const loc of allLocationsRes.rows) {
            const expected = parseInt(loc.expected_scans);
            const actual = actualScansMap.get(loc.route_id) || 0;
            const coverage = expected > 0 ? (actual / expected) * 100 : 100;

            console.log(`[Shift Completion] Route ${loc.route_id} Coverage: ${coverage.toFixed(2)}% (${actual}/${expected})`);

            if (coverage < 95) {
                console.warn(`[ALERT] Route ${loc.route_id} missed coverage target (<95%)! Current coverage: ${coverage.toFixed(2)}%`);
            }
        }
    } catch (error) {
        console.error('Error running shift completion:', error);
    }
};
