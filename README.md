# SuthamScan
A production-ready civic-tech system designed to verify sanitation service completion at the individual address level using geo-validated QR scans. This system actively prevents route falsification and automatically detects missed streets using a robust fraud detection engine, a secure Android worker application, and an administrative real-time dashboard.

## System Architecture
* **Database**: PostgreSQL with PostGIS extension for spatial queries.
* **Backend**: Node.js / Express written in TypeScript.
* **Frontend Dashboard**: React.js / Vite using Mapbox/Leaflet for real-time monitoring.
* **Worker App**: Android Jetpack Compose application with strict hardware-binding, mock-location detection, and QR code signature verification.

---

## 🚀 Deployment Instructions (AWS/GCP)

To scale to 1M addresses and ensure 99.9% uptime with < 1 second validation responses:

### 1. Infrastructure (Kubernetes/ECS)
- Deploy the Backend via Docker. Use a load balancer (AWS ALB or GCP HTTP(S) LB).
- Minimum requirements: 3-node cluster for the backend API instances to handle horizontal scaling.

### 2. Database (AWS RDS / GCP Cloud SQL)
- Deploy PostgreSQL 15+ with PostGIS enabled.
- Scale to a db.r6g.2xlarge (or equivalent) for millions of row inserts (scans) and strict spatial querying (`GIST` indexes used).
- Enable Read Replicas for Admin Dashboard analytics to prevent read locks during high volume morning scanning bursts.

### 3. Running Locally via Docker Compose
For sandbox testing, you can spin up the system using the bundled Docker compose:
```bash
docker-compose up -d
# This will start the PostGIS database and run initialization scripts in /db-init
cd backend && npm run dev
cd frontend && npm run dev
```

---

## 📡 API Documentation

All routes expect `Content-Type: application/json`.

### `POST /api/login`
Authenticates a worker via strict device binding.
* **Request:** `{ "device_id": "string" }`
* **Response:** `{ "success": true, "token": "JWT_STRING", "worker": { id, name } }`

### `POST /api/validate-scan` (Requires Bearer Token)
Validates a physical worker scan.
* **Request:** `{ "qrToken": "string", "lat": 40.71, "long": -74.00, "timestamp": "ISO8601" }`
* **Response:** 
```json
{
  "success": true,
  "rejection_reason": null,
  "fraud_score": 0,
  "validation_status": "VALID" // Or 'FRAUD_FLAGGED', 'INVALID_DISTANCE', 'DUPLICATE'
}
```

### `GET /api/admin/scans`
Retrieves the 100 most recent scan logs with geodata.
### `GET /api/admin/stats`
Retrieves aggregated metrics (Total Scans, Flagged Scans, Active Workers).

---

## 🛡️ Threat Model Summary

1. **Spoofed GPS Locations (Mocking)**
   * **Threat:** Workers use apps to mock GPS coordinates to simulate being at the QR location.
   * **Mitigation:** Android App explicitly calls `location.isMock` (which hooks into Android's low-level location FusedProvider) and verifies `ALLOW_MOCK_LOCATION` via System Settings. Scans are rejected.

2. **Replay Attacks & QR Code Copying**
   * **Threat:** Workers take photos of QR codes and scan them off-site from arbitrary devices.
   * **Mitigation:** QR payload is a Signed JWT verifying the physical address `route_id`. The server strictly enforces the Haversine distance formula (< 5m). Photography off-site will fail the physical GPS check.

3. **Multi-Worker Device Sharing**
   * **Threat:** One worker takes multiple phones or scans multiple routes rapidly.
   * **Mitigation:** The system tracks the physical speed between consecutive scans. If `Distance / Time > 100km/h`, the scan is flagged as `FRAUD_FLAGGED`. Device ID bindings prevent workers from swapping accounts on the same phone.

4. **Brute Force & API Abuse**
   * **Threat:** Malicious actor attempting to flood the `/validate-scan` endpoint.
   * **Mitigation:** Requires JWT authorization mapped to a physical device ID registered in the PostgreSQL `worker` table. Route is rate-limited in production environments.

---

## 🧪 Fraud Detection Test Cases

| Scenario | Input | Expected Output | Status |
|---|---|---|---|
| **Valid Scan** | Lat/Long within 3m of target, valid QR Token | `fraud_score: 0` | `VALID` |
| **Out of Bounds** | Lat/Long 15m away from target | `fraud_score: 100` | `INVALID_DISTANCE` |
| **Speeding (Superman)** | Scans Location A, then Location B (5km away) within 1 sec | `fraud_score: 50+` | `FRAUD_FLAGGED` |
| **Duplicate Scan** | Scanning the exact same QR code twice on same day | `fraud_score: 100` | `DUPLICATE` |
| **Borderline Precision** | Repeatedly scanning at exactly 4.95m | `fraud_score: 20` | `VALID` (Warning logged) |
| **After-hours Scan** | Scanning at 3:00 AM | `fraud_score: 80` | `INVALID_TIME` |
