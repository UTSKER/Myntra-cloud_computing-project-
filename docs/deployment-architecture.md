# Proposed Deployment Architecture — MyntraFlash

## Cloud Computing — Group 33 | Week 2 Deliverable

---

## 1. Overview

This document describes the proposed cloud architecture for the **MyntraFlash** application — a scaled-down e-commerce simulation inspired by Myntra, designed to demonstrate cloud scalability concepts for the Week 3 practical exercise.

The architecture is designed to be:

- **Simple enough** to deploy and test within the exercise timeframe.
- **Comprehensive enough** to demonstrate horizontal scaling, load balancing, autoscaling and fault tolerance.
- **Cost-effective** for a student project.

---

## 2. Technology Stack

| Component | Technology | Justification |
|-----------|------------|---------------|
| Cloud Provider | Microsoft Azure | Aligns with Myntra's documented cloud platform [V1] |
| Backend | Node.js + Express | Lightweight, fast to develop, suitable for stateless HTTP services |
| Frontend | HTML, CSS, JavaScript | Simple static frontend, no build tools required |
| Containerization | Docker | Ensures consistent deployment across all VM instances |
| Infrastructure | Azure VM Scale Set (VMSS) | Managed set of identical VMs with autoscaling support |
| Load Balancing | Azure Standard Load Balancer | Layer-4 load balancing with health probes |
| Autoscaling | Azure Monitor Autoscale | CPU-based autoscaling rules |
| Load Testing | Grafana k6 | Open-source, scriptable load testing tool |
| Source Control | GitHub | Existing project repository |
| Container Registry | GitHub Container Registry (ghcr.io) | Free for public repos, integrated with GitHub Actions |

---

## 3. Application Design

### 3.1 Endpoints

The MyntraFlash application exposes the following HTTP endpoints:

| Endpoint | Method | Description | Purpose |
|----------|--------|-------------|---------|
| `/` | GET | Landing page with product grid | Frontend demonstration |
| `/products` | GET | Product catalogue (JSON) | Simulates product service |
| `/flash-sale` | GET | Flash-sale items with countdown | Simulates EORS/BFF sale page |
| `/api/discount` | GET | Discount calculations (JSON) | Simulates pricing/discount service |
| `/api/recommend` | GET | Personalized recommendations (JSON) | Simulates recommendation engine |
| `/health` | GET | Health check (HTTP 200 if healthy) | Load balancer health probe target |
| `/instance-id` | GET | Returns hostname and instance metadata | Demonstrates load balancer distribution |

### 3.2 Stateless Design

The application is designed to be **completely stateless**:

- No server-side sessions.
- No local file-based state.
- No shared mutable state between requests.
- Product data is embedded in the application (in-memory array).
- Each request is independently processable by any instance.

**Why statelessness matters for horizontal scaling:**

| Property | Benefit |
|----------|---------|
| No session affinity required | Load balancer can use round-robin distribution |
| Any instance can serve any request | New instances are immediately useful after startup |
| No data synchronization needed | Eliminates consistency overhead between instances |
| Instances are disposable | Failed instances can be replaced without data loss |
| Scale-in is safe | Removing instances does not lose user state |

This mirrors the principle behind Myntra's service-oriented architecture, where individual services scale independently based on their load profiles.

### 3.3 Simulated Workloads

To create realistic CPU utilization for scaling experiments, certain endpoints include configurable computational work:

- `/api/discount`: Simulates discount calculation with iterative computation.
- `/api/recommend`: Simulates ML inference delay with computation.

This ensures that load testing generates measurable CPU utilization, triggering autoscaling rules.

---

## 4. Azure Infrastructure

### 4.1 Resource Group

All Azure resources are deployed within a single resource group for easy management and cleanup:

```
Resource Group: rg-myntraflash-exercise
Region: Central India (or nearest available)
```

### 4.2 Virtual Machine Scale Set (VMSS)

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| VM Size | Standard_B2s (2 vCPU, 4 GB RAM) | Cost-effective for student exercise |
| OS | Ubuntu 22.04 LTS | Stable, well-supported for Docker |
| Min instances | 1 | Baseline for scaling experiments |
| Max instances | 3 | Sufficient to demonstrate scaling; controls cost |
| Upgrade policy | Automatic | New instances use latest configuration |
| Overprovisioning | Disabled | Ensures exact instance count for experiments |

### 4.3 Docker Deployment

Each VM instance runs the MyntraFlash application as a Docker container:

1. **Cloud-init** or **Custom Script Extension** installs Docker on first boot.
2. The startup script pulls the latest image from `ghcr.io`.
3. The container runs on port 3000, mapped to the host.
4. The container restarts automatically on failure (`--restart=unless-stopped`).

```bash
# Example cloud-init snippet
#!/bin/bash
apt-get update
apt-get install -y docker.io
systemctl enable docker
docker pull ghcr.io/<org>/myntraflash:latest
docker run -d --restart=unless-stopped -p 3000:3000 ghcr.io/<org>/myntraflash:latest
```

### 4.4 Azure Standard Load Balancer

| Parameter | Value |
|-----------|-------|
| SKU | Standard |
| Type | Public |
| Frontend IP | Dynamic public IP |
| Backend pool | VMSS instances |
| Health probe | HTTP GET /health on port 3000, interval 15s, threshold 2 |
| Load balancing rule | TCP port 80 → backend port 3000 |
| Session persistence | None (stateless app) |

**Health probe behaviour:**

- The load balancer sends HTTP GET requests to `/health` every 15 seconds.
- If an instance fails to respond with HTTP 200 for 2 consecutive probes, it is marked unhealthy.
- Unhealthy instances are removed from the load balancer rotation.
- Traffic is distributed only to healthy instances.

### 4.5 Autoscale Configuration

| Parameter | Value |
|-----------|-------|
| Metric | Average CPU utilization across VMSS |
| Scale-out threshold | CPU > 70% for 5 minutes |
| Scale-out action | Add 1 instance |
| Scale-in threshold | CPU < 30% for 5 minutes |
| Scale-in action | Remove 1 instance |
| Cooldown period | 5 minutes |
| Minimum instances | 1 |
| Maximum instances | 3 |

**Cooldown period rationale:** After a scaling action, Azure waits 5 minutes before evaluating again. This prevents:
- Rapid oscillation between instance counts.
- Scaling decisions based on transient metric spikes.
- Unnecessary resource churn.

### 4.6 Azure Monitor

Azure Monitor collects the following metrics:

- **CPU utilization** (percentage, per instance and average).
- **Memory utilization** (percentage).
- **Network bytes in/out**.
- **Disk operations** (if applicable).
- **Custom metrics** via the Application Insights SDK (optional).

These metrics feed into the autoscale engine and provide observability for the experiments.

---

## 5. Network Architecture

```
Internet
    │
    ▼
Azure Public IP
    │
    ▼
Azure Standard Load Balancer (port 80)
    │
    ├──► VM Instance 1 (port 3000) ── Docker: MyntraFlash
    ├──► VM Instance 2 (port 3000) ── Docker: MyntraFlash
    └──► VM Instance 3 (port 3000) ── Docker: MyntraFlash
                                        (autoscaled)
```

All VMs are in a single **Virtual Network (VNet)** with a dedicated subnet. The load balancer's health probe ensures traffic only reaches healthy instances.

---

## 6. Load Testing Architecture

### 6.1 Grafana k6

k6 runs from a separate machine (local developer machine or a dedicated Azure VM) and generates HTTP traffic against the load balancer's public IP.

### 6.2 Test Configuration

```javascript
// Example k6 test structure
export const options = {
    stages: [
        { duration: '2m', target: 50 },   // Ramp up
        { duration: '5m', target: 100 },   // Sustained load
        { duration: '2m', target: 500 },   // Flash-sale spike
        { duration: '3m', target: 100 },   // Return to normal
        { duration: '2m', target: 0 },     // Ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'],  // 95% of requests under 500ms
        http_req_failed: ['rate<0.05'],    // Error rate under 5%
    },
};
```

### 6.3 Metrics Collected

| Metric | Description | Unit |
|--------|-------------|------|
| `http_req_duration` | Total request time | ms |
| `http_req_duration{p(50)}` | Median latency | ms |
| `http_req_duration{p(95)}` | 95th percentile latency | ms |
| `http_req_duration{p(99)}` | 99th percentile latency | ms |
| `http_reqs` | Total requests per second | req/s |
| `http_req_failed` | Percentage of failed requests | % |

---

## 7. Architecture Diagram

The Mermaid source for the proposed architecture diagram is located at:

📄 [`week2/diagrams/proposed-architecture.mmd`](../week2/diagrams/proposed-architecture.mmd)

---

## 8. Comparison with Myntra's Architecture

| Aspect | Myntra (Production) | MyntraFlash (Exercise) |
|--------|-------------------|----------------------|
| Scale | Millions of users, thousands of services | Single app, 1–3 VMs |
| Cloud | Azure (full suite) | Azure VMSS + LB |
| Data | Kafka, Bifrost, Aerospike | In-memory mock data |
| ML | Real-time feature store + models | Simulated recommendation API |
| Caching | Redis cluster, MongoDB | None (stateless) |
| DR | Multi-region | Single region |
| Load testing | Internal tools | Grafana k6 |

**What the exercise demonstrates:**
- The same fundamental scaling principles (horizontal scaling, load balancing, autoscaling).
- Measurable performance differences between fixed and elastic provisioning.
- The value of health checks and fault tolerance.

**What the exercise does not attempt:**
- Production-scale data architecture.
- Real machine-learning inference.
- Multi-region disaster recovery.
- Real payment or order processing.

---

## References

See [references.md](references.md) for full citations.

