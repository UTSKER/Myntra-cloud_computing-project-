# MyntraFlash Microservice — Week 3 Implementation

MyntraFlash is a high-scale, stateless e-commerce simulation microservice designed for the **Cloud Computing Course Project (Group 33)**. It simulates the high-velocity traffic patterns of Myntra's **End of Reason Sale (EORS)** on Google Cloud Platform (`asia-south1` Mumbai).

---

## 1. Architecture Highlights

- **Frontend Tier**: Responsive single-page interface with Myntra EORS branding, live countdown timer, catalog grid with live inventory meters, flash checkout, and an **interactive Cloud Cluster Telemetry Bar** that identifies which VM instance processed each request.
- **Backend Tier**: Express.js stateless microservice exposing health probes, catalog retrieval, and synthetic cryptographic CPU load generation.
- **Packaging**: Containerized via Alpine Linux (`node:20-alpine`, <120 MB), ideal for high-speed VM startup in GCE Managed Instance Groups (MIG).
- **Target Load**: Ready for Grafana k6 synthetic flash-sale traffic curves (20 to 500 Virtual Users) driving CPU > 70% to trigger reactive autoscaling.

---

## 2. API Endpoints

| Endpoint | Method | Response Payload | Description & Testing Role |
| :--- | :--- | :--- | :--- |
| `/` | `GET` | HTML/CSS/JS | Myntra EORS Single-Page Application interface. |
| `/health` | `GET` | JSON (`{ status: "UP", ... }`) | **GCP Load Balancer health check**. Responds in <5ms without blocking on application load. |
| `/api/products` | `GET` | JSON (`products[]`) | Flash-sale catalog with pricing, discounts, and real-time stock. |
| `/api/checkout` | `POST` | JSON (`{ orderId, telemetry, ... }`) | **Scaling Trigger**: Flash order transaction executing controlled synthetic CPU computation. |
| `/api/server-info` | `GET` | JSON (`{ hostname, uptime, memory, ... }`) | Telemetry probe displaying VM hostname and platform specs (proves LB distribution). |
| `/api/discount` | `GET` | JSON (`{ promo, discountFactor, ... }`) | Simulates dynamic pricing and discount rule evaluations. |
| `/api/recommend` | `GET` | JSON (`{ recommendations[] }`) | Simulates personalized recommendation scoring algorithms. |
| `/api/admin/reset` | `POST` | JSON (`{ message }`) | Resets catalog inventory back to initial baseline for repeated testing. |

---

## 3. Local Execution (Node.js)

### Step 1: Install Dependencies
```bash
cd app
npm install
```

### Step 2: Start the Server
```bash
# Production mode
npm start

# Development mode (auto-reload)
npm run dev
```
The application will be live at: **`http://localhost:3000`**

---

## 4. Docker Container Packaging

### Build Docker Image
```bash
cd app
docker build -t myntraflash:latest .
```

### Run Locally via Docker
```bash
docker run -d \
  --name myntraflash-app \
  -p 3000:3000 \
  -e PORT=3000 \
  -e NODE_ENV=production \
  myntraflash:latest
```

### Verify Container Health Check
```bash
docker inspect --format='{{json .State.Health.Status}}' myntraflash-app
```
*Expected output: `"healthy"`*

---

## 5. Environment Variables

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `3000` | Port on which the HTTP server listens. |
| `NODE_ENV` | `production` | Node runtime environment mode. |
| `GCP_REGION` | `asia-south1 (Mumbai)` | Region identifier surfaced in telemetry headers. |
| `CPU_ITERATIONS`| `12000` | Base iterations for SHA-256 cryptographic order verification in `/api/checkout`. |

