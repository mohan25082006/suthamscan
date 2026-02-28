import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

// --- Type Definitions ---
export interface Worker {
    id: string;
    name: string;
    device_id: string;
    assigned_route: string;
}

export interface QRLocation {
    id: string;
    route_id: string;
    lat: number;
    long: number;
    address_text: string;
    service_frequency: string;
}

export interface ScanEvent {
    id: string;
    worker_id: string;
    qr_id: string;
    timestamp: string;
    lat: number;
    long: number;
    distance_from_target: number;
    fraud_score: number;
    validation_status: string;
    rejection_reason: string | null;
    created_at: string;
}

interface MockData {
    workers: Worker[];
    qr_locations: QRLocation[];
    scan_events: ScanEvent[];
}

// --- Mock Data Storage (Memory) ---
const mockData: MockData = {
    workers: [
        { id: '1', name: 'Rajesh K.', device_id: 'device-A1', assigned_route: 'route-Madurai-Center' },
        { id: '2', name: 'Meena S.', device_id: 'device-B2', assigned_route: 'route-Anna-Nagar' },
        { id: '3', name: 'Arul Vel', device_id: 'device-C3', assigned_route: 'route-Madurai-East' },
        { id: '4', name: 'Priya M.', device_id: 'device-D4', assigned_route: 'route-Sellur' },
        { id: '5', name: 'Kumar R.', device_id: 'device-E5', assigned_route: 'route-Thiruparankundram' },
        { id: '6', name: 'Selvi T.', device_id: 'device-F6', assigned_route: 'route-Mattuthavani' },
        { id: '7', name: 'Karthik P.', device_id: 'device-G7', assigned_route: 'route-Simmakkal' },
        { id: '8', name: 'Lakshmi N.', device_id: 'device-H8', assigned_route: 'route-KPudur' },
        { id: '9', name: 'Suresh V.', device_id: 'device-I9', assigned_route: 'route-Alagar-Kovil' },
        { id: '10', name: 'Kavitha J.', device_id: 'device-J10', assigned_route: 'route-Periyar' }
    ],
    qr_locations: [
        { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', route_id: 'route-Madurai-Center', lat: 9.9195, long: 78.1193, address_text: 'Meenakshi Temple South Tower', service_frequency: 'daily' },
        { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', route_id: 'route-Madurai-Center', lat: 9.9167, long: 78.1000, address_text: 'Ellis Nagar Market', service_frequency: 'daily' },
        { id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', route_id: 'route-Madurai-East', lat: 9.9231, long: 78.1406, address_text: 'Anna Nagar Main Road', service_frequency: 'daily' },
        { id: 'dddddddd-dddd-dddd-dddd-dddddddddddd', route_id: 'route-Madurai-East', lat: 9.9322, long: 78.1472, address_text: 'K.K. Nagar Arch', service_frequency: 'daily' }
    ],
    scan_events: [
        {
            id: uuidv4(),
            worker_id: '11111111-1111-1111-1111-111111111111',
            qr_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            lat: 9.9194,
            long: 78.1192,
            distance_from_target: 1.5,
            fraud_score: 0,
            validation_status: 'VALID',
            rejection_reason: null,
            created_at: new Date().toISOString()
        }
    ]
};

/**
 * Mock Query Executor
 * Hardened to handle various SQL formatting (case, spacing, semicolons).
 */
export const query = async (text: string, params: any[] = []): Promise<{ rows: any[] }> => {
    // Universal normalization: Upper case, no semicolons, single spaces, trimmed
    const sql = text.trim()
        .replace(/;/g, '')
        .replace(/\s+/g, ' ')
        .toUpperCase();

    console.log(`[Query] ${sql}`, params);

    // Helper to check if string contains all keywords (regardless of order/extra words)
    const matches = (...keywords: string[]) => keywords.every(kw => sql.includes(kw.toUpperCase()));

    // 1. Worker Login
    if (matches('SELECT * FROM WORKER', 'WHERE DEVICE_ID =')) {
        const deviceId = params[0];
        const rows = mockData.workers.filter(w => w.device_id === deviceId);
        return { rows };
    }

    // 2. Fetch Assigned Route
    if (matches('SELECT ASSIGNED_ROUTE FROM WORKER', 'WHERE ID =')) {
        const id = params[0];
        const rows = mockData.workers.filter(w => w.id === id).map(w => ({ assigned_route: w.assigned_route }));
        return { rows };
    }

    // 3. QR Location Lookup
    if (matches('SELECT * FROM QR_LOCATION', 'WHERE ID =')) {
        const id = params[0];
        const rows = mockData.qr_locations.filter(q => q.id === id);
        return { rows };
    }

    // 4. Duplicate Check
    if (matches('SELECT ID FROM SCAN_EVENT', 'WHERE QR_ID =', 'TIMESTAMP >=', 'TIMESTAMP <=')) {
        const [qrId, start, end] = params;
        const rows = mockData.scan_events.filter(s =>
            s.qr_id === qrId &&
            new Date(s.timestamp) >= new Date(start) &&
            new Date(s.timestamp) <= new Date(end)
        ).map(s => ({ id: s.id }));
        return { rows };
    }

    // 5. Last Scan for Worker
    if (matches('SELECT LAT, LONG, TIMESTAMP FROM SCAN_EVENT', 'WHERE WORKER_ID =', 'ORDER BY TIMESTAMP DESC LIMIT 1')) {
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

    // 6. Insert Scan Event
    if (sql.startsWith('INSERT INTO SCAN_EVENT')) {
        const [worker_id, qr_id, timestamp, lat, long, dist, fraud, status, reason] = params;
        const newEvent: ScanEvent = {
            id: uuidv4(),
            worker_id,
            qr_id,
            timestamp,
            lat,
            long,
            distance_from_target: dist,
            fraud_score: fraud,
            validation_status: status,
            rejection_reason: reason,
            created_at: new Date().toISOString()
        };
        mockData.scan_events.push(newEvent);
        return { rows: [newEvent] };
    }

    // 7. Admin Scans (Recent)
    if (matches('SELECT S.*, W.NAME AS WORKER_NAME')) {
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

    // 8. Admin Stats - Counts
    if (matches('SELECT COUNT')) {
        if (matches('FRAUD_SCORE > 50')) {
            const count = mockData.scan_events.filter(s => s.fraud_score > 50).length;
            return { rows: [{ count: count.toString() }] };
        }
        if (matches('TIMESTAMP >= CURRENT_DATE') || matches('DISTINCT WORKER_ID')) {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const workers = new Set(mockData.scan_events.filter(s => new Date(s.timestamp) >= todayStart).map(s => s.worker_id));
            return { rows: [{ count: workers.size.toString() }] };
        }
        if (matches('FROM SCAN_EVENT')) {
            return { rows: [{ count: mockData.scan_events.length.toString() }] };
        }
    }

    // 9. Shift Engine - Aggregate Counts
    if (matches('SELECT ROUTE_ID', 'COUNT(*)', 'FROM QR_LOCATION', 'GROUP BY ROUTE_ID')) {
        const counts: Record<string, number> = {};
        mockData.qr_locations.forEach(q => counts[q.route_id] = (counts[q.route_id] || 0) + 1);
        const rows = Object.entries(counts).map(([route_id, count]) => ({ route_id, expected_scans: count.toString() }));
        return { rows };
    }

    if (matches('SELECT Q.ROUTE_ID', 'COUNT(DISTINCT S.QR_ID)', 'JOIN QR_LOCATION', 'GROUP BY Q.ROUTE_ID')) {
        const [start, end] = params;
        const counts: Record<string, Set<string>> = {};
        mockData.scan_events.forEach(s => {
            if (new Date(s.timestamp) >= new Date(start) && new Date(s.timestamp) <= new Date(end)) {
                const qr = mockData.qr_locations.find(q => q.id === s.qr_id);
                if (qr) {
                    if (!counts[qr.route_id]) counts[qr.route_id] = new Set();
                    counts[qr.route_id].add(s.qr_id);
                }
            }
        });
        const rows = Object.entries(counts).map(([route_id, set]) => ({ route_id, actual_scans: set.size.toString() }));
        return { rows };
    }

    console.warn('Unhandled Mock Query [NORMALIZED]:', sql, params);
    return { rows: [] };
};

/**
 * Real-time Data Simulator
 * Periodically injects a scan event into the mock database
 */
export const simulateRandomScan = () => {
    const worker = mockData.workers[Math.floor(Math.random() * mockData.workers.length)];
    const qr = mockData.qr_locations[Math.floor(Math.random() * mockData.qr_locations.length)];

    // 80% chance of valid scan, 20% chance of fraud (out of bounds)
    const isFraud = Math.random() < 0.2;
    const lat = isFraud ? qr.lat + 0.005 : qr.lat + (Math.random() * 0.00004 - 0.00002);
    const long = isFraud ? qr.long + 0.005 : qr.long + (Math.random() * 0.00004 - 0.00002);

    const newEvent: ScanEvent = {
        id: uuidv4(),
        worker_id: worker.id,
        qr_id: qr.id,
        timestamp: new Date().toISOString(),
        lat,
        long,
        distance_from_target: isFraud ? 500 : 2.0,
        fraud_score: isFraud ? 100 : 0,
        validation_status: isFraud ? 'INVALID_DISTANCE' : 'VALID',
        rejection_reason: isFraud ? 'Scan too far from target.' : null,
        created_at: new Date().toISOString()
    };

    mockData.scan_events.push(newEvent);

    // Keep memory clean, only last 200 scans
    if (mockData.scan_events.length > 200) {
        mockData.scan_events.shift();
    }

    console.log(`[Simulator] Generated ${newEvent.validation_status} scan for ${worker.name} at ${qr.address_text}`);
};
