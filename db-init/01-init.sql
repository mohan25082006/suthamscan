-- Ensure PostGIS is enabled
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Worker Table
CREATE TABLE IF NOT EXISTS worker (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    device_id VARCHAR(255) UNIQUE NOT NULL,
    assigned_route VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. QR_Location Table (Pre-assigned locations that must be scanned)
CREATE TABLE IF NOT EXISTS qr_location (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id VARCHAR(255) NOT NULL,
    address_text TEXT, -- Optional, kept internal, not in QR
    lat DOUBLE PRECISION NOT NULL,
    long DOUBLE PRECISION NOT NULL,
    service_frequency VARCHAR(50) DEFAULT 'daily',
    geom GEOMETRY(Point, 4326), -- PostGIS Point geometry with SRID 4326 (WGS 84)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to automatically update the geom column when lat/long are updated
CREATE OR REPLACE FUNCTION update_qr_geom()
RETURNS TRIGGER AS $$
BEGIN
  NEW.geom = ST_SetSRID(ST_MakePoint(NEW.long, NEW.lat), 4326);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_qr_geom
BEFORE INSERT OR UPDATE ON qr_location
FOR EACH ROW EXECUTE FUNCTION update_qr_geom();


-- 3. Scan_Event Table (Records from the Android App)
CREATE TABLE IF NOT EXISTS scan_event (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id UUID REFERENCES worker(id) ON DELETE CASCADE,
    qr_id UUID REFERENCES qr_location(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    long DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326),
    distance_from_target DOUBLE PRECISION, -- Distance in meters
    fraud_score INTEGER CHECK (fraud_score >= 0 AND fraud_score <= 100),
    validation_status VARCHAR(50) NOT NULL CHECK (validation_status IN ('VALID', 'INVALID_DISTANCE', 'INVALID_TIME', 'DUPLICATE', 'FRAUD_FLAGGED')),
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trigger_update_scan_geom
BEFORE INSERT OR UPDATE ON scan_event
FOR EACH ROW EXECUTE FUNCTION update_qr_geom();

-- Indexes for spatial queries and performance
CREATE INDEX idx_qr_geom ON qr_location USING GIST(geom);
CREATE INDEX idx_scan_geom ON scan_event USING GIST(geom);
CREATE INDEX idx_scan_worker ON scan_event(worker_id);
CREATE INDEX idx_scan_qr ON scan_event(qr_id);
CREATE INDEX idx_scan_timestamp ON scan_event(timestamp);

-- Seed some test data for development

-- Worker 1
INSERT INTO worker (id, name, device_id, assigned_route) VALUES ('11111111-1111-1111-1111-111111111111', 'John Doe', 'device-A1', 'route-A');
-- Worker 2
INSERT INTO worker (id, name, device_id, assigned_route) VALUES ('22222222-2222-2222-2222-222222222222', 'Jane Smith', 'device-B2', 'route-B');

-- QR Locations (Say, close to City Hall or standard coordinates)
INSERT INTO qr_location (id, route_id, lat, long, address_text) VALUES 
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'route-A', 40.7128, -74.0060, '123 Main St'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'route-A', 40.7130, -74.0062, '125 Main St'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'route-B', 40.7135, -74.0070, '200 Broad St');
