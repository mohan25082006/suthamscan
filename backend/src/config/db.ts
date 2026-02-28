import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

// Mock Data Storage (Memory)
const mockData: any = {
    workers: [
        { id: '11111111-1111-1111-1111-111111111111', name: 'John Doe', device_id: 'device-A1', assigned_route: 'route-A' },
        { id: '22222222-2222-2222-2222-222222222222', name: 'Jane Smith', device_id: 'device-B2', assigned_route: 'route-B' }
    ],
    qr_locations: [
        { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', route_id: 'route-A', lat: 40.7128, long: -74.0060, address_text: '123 Main St', service_frequency: 'daily' },
        { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', route_id: 'route-A', lat: 40.7130, long: -74.0062, address_text: '125 Main St', service_frequency: 'daily' },
        { id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', route_id: 'route-B', lat: 40.7135, long: -74.0070, address_text: '200 Broad St', service_frequency: 'daily' }
    ],
    scan_events: [
        // Valid Scan
        {
            id: uuidv4(),
            worker_id: '11111111-1111-1111-1111-111111111111',
            qr_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            lat: 40.7128,
            long: -74.0060,
            distance_from_target: 0.5,
            fraud_score: 0,
            validation_status: 'VALID',
            rejection_reason: null,
            created_at: new Date().toISOString()
        },
        // Distance Violation
        {
            id: uuidv4(),
            worker_id: '11111111-1111-1111-1111-111111111111',
            qr_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
            timestamp: new Date(Date.now() - 1800000).toISOString(),
            lat: 40.7150,
            long: -74.0080,
            distance_from_target: 250.4,
            fraud_score: 100,
            validation_status: 'INVALID_DISTANCE',
            rejection_reason: 'Scan too far from target (250m).',
            created_at: new Date().toISOString()
        },
        // Speed/Fraud Flagged
        {
            id: uuidv4(),
            worker_id: '22222222-2222-2222-2222-222222222222',
            qr_id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
            timestamp: new Date().toISOString(),
            lat: 40.7135,
            long: -74.0070,
            distance_from_target: 1.2,
            fraud_score: 65,
            validation_status: 'FRAUD_FLAGGED',
            rejection_reason: 'Unrealistic speed detected: 145 km/h between stops.',
            created_at: new Date().toISOString()
        }
    ]
};

export const query = async (text: string, params: any[] = []) => {
    const sql = text.trim().replace(/\s+/g, ' ');

    // 1. Worker Login: SELECT * FROM worker WHERE device_id = $1
    if (sql.includes('SELECT * FROM worker WHERE device_id =')) {
        const deviceId = params[0];
        const rows = mockData.workers.filter(w => w.device_id === deviceId);
        return { rows };
    }

    // 2. Fetch Assigned Route: SELECT assigned_route FROM worker WHERE id = $1
    if (sql.includes('SELECT assigned_route FROM worker WHERE id =')) {
        const id = params[0];
        const rows = mockData.workers.filter(w => w.id === id).map(w => ({ assigned_route: w.assigned_route }));
        return { rows };
    }

    // 3. QR Location Lookup: SELECT * FROM qr_location WHERE id = $1
    if (sql.includes('SELECT * FROM qr_location WHERE id =')) {
        const id = params[0];
        const rows = mockData.qr_locations.filter(q => q.id === id);
        return { rows };
    }

    // 4. Duplicate Check: SELECT id FROM scan_event WHERE qr_id = $1 AND timestamp >= $2 AND timestamp <= $3
    if (sql.includes('SELECT id FROM scan_event WHERE qr_id =')) {
        const [qrId, start, end] = params;
        const rows = mockData.scan_events.filter(s =>
            s.qr_id === qrId &&
            new Date(s.timestamp) >= new Date(start) &&
            new Date(s.timestamp) <= new Date(end)
        ).map(s => ({ id: s.id }));
        return { rows };
    }

    // 5. Last Scan for Worker: SELECT lat, long, timestamp FROM scan_event WHERE worker_id = $1 ... ORDER BY timestamp DESC LIMIT 1
    if (sql.includes('SELECT lat, long, timestamp FROM scan_event WHERE worker_id =')) {
        const [workerId, start, end] = params;
        const filtered = mockData.scan_events
            .filter(s =>
                s.worker_id === workerId &&
                new Date(s.timestamp) >= new Date(start) &&
                new Date(s.timestamp) <= new Date(end)
            )
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        const rows = filtered.length > 0 ? [filtered[0]] : [];
        return { rows };
    }

    // 6. Insert Scan Event: INSERT INTO scan_event (worker_id, qr_id, timestamp, lat, long, distance_from_target, fraud_score, validation_status, rejection_reason) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    if (sql.startsWith('INSERT INTO scan_event')) {
        const [worker_id, qr_id, timestamp, lat, long, distance_from_target, fraud_score, validation_status, rejection_reason] = params;
        const newEvent = {
            id: uuidv4(),
            worker_id,
            qr_id,
            timestamp,
            lat,
            long,
            distance_from_target,
            fraud_score,
            validation_status,
            rejection_reason,
            created_at: new Date().toISOString()
        };
        mockData.scan_events.push(newEvent);
        return { rows: [newEvent] };
    }

    // 7. Admin Scans: SELECT s.*, w.name as worker_name, q.lat as target_lat, q.long as target_long FROM scan_event s ...
    if (sql.includes('SELECT s.*, w.name as worker_name')) {
        const rows = mockData.scan_events.map(s => {
            const worker = mockData.workers.find(w => w.id === s.worker_id);
            const qr = mockData.qr_locations.find(q => q.id === s.qr_id);
            return {
                ...s,
                worker_name: worker?.name || 'Unknown',
                target_lat: qr?.lat,
                target_long: qr?.long
            };
        }).reverse().slice(0, 100);
        return { rows };
    }

    // 8. Admin Stats - Total Scans: SELECT COUNT(*) FROM scan_event
    if (sql === 'SELECT COUNT(*) FROM scan_event') {
        return { rows: [{ count: mockData.scan_events.length.toString() }] };
    }

    // 9. Admin Stats - Flagged: SELECT COUNT(*) FROM scan_event WHERE fraud_score > 50
    if (sql === 'SELECT COUNT(*) FROM scan_event WHERE fraud_score > 50') {
        const count = mockData.scan_events.filter(s => s.fraud_score > 50).length;
        return { rows: [{ count: count.toString() }] };
    }

    // 10. Admin Stats - Active Workers: SELECT COUNT(DISTINCT worker_id) FROM scan_event WHERE timestamp >= CURRENT_DATE
    if (sql.includes('SELECT COUNT(DISTINCT worker_id) FROM scan_event WHERE timestamp >= CURRENT_DATE')) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const distinctWorkers = new Set(
            mockData.scan_events
                .filter(s => new Date(s.timestamp) >= today)
                .map(s => s.worker_id)
        );
        return { rows: [{ count: distinctWorkers.size.toString() }] };
    }

    // 11. Shift Engine - Expected Scans: SELECT route_id, COUNT(*) as expected_scans FROM qr_location GROUP BY route_id
    if (sql.includes('SELECT route_id, COUNT(*) as expected_scans FROM qr_location GROUP BY route_id')) {
        const counts: any = {};
        mockData.qr_locations.forEach(q => {
            counts[q.route_id] = (counts[q.route_id] || 0) + 1;
        });
        const rows = Object.keys(counts).map(route_id => ({ route_id, expected_scans: counts[route_id].toString() }));
        return { rows };
    }

    // 12. Shift Engine - Actual Scans: SELECT q.route_id, COUNT(DISTINCT s.qr_id) as actual_scans FROM scan_event s JOIN qr_location q ON s.qr_id = q.id WHERE s.timestamp >= $1 AND s.timestamp <= $2 GROUP BY q.route_id
    if (sql.includes('SELECT q.route_id, COUNT(DISTINCT s.qr_id) as actual_scans')) {
        const [start, end] = params;
        const counts: any = {};
        mockData.scan_events.forEach(s => {
            if (new Date(s.timestamp) >= new Date(start) && new Date(s.timestamp) <= new Date(end)) {
                const qr = mockData.qr_locations.find(q => q.id === s.qr_id);
                if (qr) {
                    if (!counts[qr.route_id]) counts[qr.route_id] = new Set();
                    counts[qr.route_id].add(s.qr_id);
                }
            }
        });
        const rows = Object.keys(counts).map(route_id => ({ route_id, actual_scans: counts[route_id].size.toString() }));
        return { rows };
    }

    console.warn('Unhandled Mock Query:', sql, params);
    return { rows: [] };
};
