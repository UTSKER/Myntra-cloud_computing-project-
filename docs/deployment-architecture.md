# Proposed Deployment Architecture — MyntraFlash (Google Cloud Platform)

## Cloud Computing — Group 33 | Week 2 Deliverable

---

## 1. Overview

This document describes the proposed cloud architecture for the **MyntraFlash** application — a scaled-down e-commerce simulation inspired by Myntra, designed to demonstrate cloud scalability concepts for the Week 3 practical exercise.

Following an evaluation of cloud student offerings, the practical implementation utilizes **Google Cloud Platform (GCP)**. GCP provides a **$300 USD free trial credit for 90 days** accessible to any standard developer account without requiring institutional email domain whitelisting, backed by a strict **zero auto-charge guarantee**.

The architecture is designed to be:

- **Faithful to enterprise scaling principles**: Recreates the identical horizontal elasticity, load balancing, health probing, and metric-based autoscaling patterns used by Myntra.
- **Cost-effective and accessible**: 100% covered under GCP's $300 free trial tier with zero out-of-pocket financial risk.
- **Observable and reproducible**: Generates quantifiable telemetry for response latency (p50, p95, p99), error rates, scaling behaviour, and cost.

---

## 2. Technology Stack

| Component | Technology | Justification & Architectural Role |
|-----------|------------|-----------------------------------|
| **Cloud Provider** | Google Cloud Platform (GCP) | $300 free trial credits (90 days); strict zero auto-charge guarantee; no college email domain hurdles |
| **GCP Region** | `asia-south1` (Mumbai, India) | Ultra-low latency for testing from India; full availability of compute and load balancing zones |
| **Compute Infrastructure** | GCE Managed Instance Groups (MIG) | Regional/Zonal managed pool of identical compute instances; direct equivalent to Azure VMSS |
| **Compute Machine Sizing** | `e2-medium` (2 vCPU, 4 GB RAM) | Balanced, cost-effective general-purpose compute suitable for containerized Node.js workloads |
| **Backend Framework** | Node.js + Express | Lightweight, event-driven, suitable for stateless HTTP microservices |
| **Frontend Interface** | HTML, CSS, JavaScript | Single-page responsive store interface; zero client build tooling needed |
| **Containerization** | Docker Engine (Ubuntu 22.04 LTS) | Guarantees runtime parity between local testing and cloud instances |
| **Traffic Management** | Google Cloud Load Balancing | Layer 7 / Layer 4 External Load Balancer with HTTP health checks and backend service routing |
| **Autoscaling Engine** | Compute Engine MIG Autoscaler | Reactive metric scaling: Scale-out at CPU > 70%, Scale-in at CPU < 30%, 300s cool-down |
| **Cloud Observability** | Google Cloud Monitoring & Logging | Native time-series telemetry tracking CPU, instance counts, request rates, and latencies |
| **Synthetic Load Generator**| Grafana k6 (Go-based) | High-performance load generator executing staged flash-sale virtual user (VU) scenarios |
| **Source Control** | GitHub | Version control repository (`myntra-cloud-scaling-project`) |
| **Container Registry** | GitHub Container Registry (`ghcr.io`) | Public/private OCI image registry integrated with GitHub Actions CI/CD |

---

## 3. Application Design

### 3.1 Endpoints

The MyntraFlash microservice exposes six HTTP endpoints:

| Endpoint | Method | Description | Purpose in Scaling Experiments |
|----------|--------|-------------|--------------------------------|
| `/` | GET | Storefront landing page | Visual verification of store functionality |
| `/products` | GET | Product catalogue (JSON) | Simulates product service browsing queries |
| `/flash-sale` | GET | Flash-sale catalog with countdown | Simulates EORS/BFF high-velocity traffic endpoint |
| `/api/discount` | GET | Discount computation API | Simulates pricing rule evaluation (CPU-intensive workload) |
| `/api/recommend` | GET | Personalized recommendations API | Simulates feature retrieval and scoring latency |
| `/health` | GET | Health vitality check (`HTTP 200 OK`) | Target for GCP Load Balancer health check probes |
| `/instance-id` | GET | Hostname, IP, and instance metadata | Proves round-robin load distribution across distinct VMs |

### 3.2 Stateless Architecture for Horizontal Elasticity

The application is engineered to be **strictly stateless**:

- **Zero In-Memory Sessions**: User authentication and cart state are client-tokenized or mock-stored; no server-side sticky session state exists.
- **Zero Local Disk State**: No instance-specific persistent files are written to VM disk storage.
- **Interchangeable Processing**: Any request can be fulfilled by any healthy instance in the group.

**Significance for Cloud Scaling:**

| Architectural Property | Operational Advantage |
|------------------------|-----------------------|
| No Session Stickiness Required | GCP Load Balancer employs pure round-robin hash distribution |
| Instant Instance Utility | Newly spawned MIG instances immediately absorb traffic once `/health` signals 200 OK |
| Safe Scale-In Terminations | Terminating instances under decreasing traffic causes zero data loss or session disruption |
| Fault Isolation | Failed instances are transparently pruned by health checks without cascading failures |

### 3.3 Synthetic Workload Calibration

To generate realistic, measurable CPU utilization that exercises GCP's autoscaling engine, two endpoints incorporate controlled algorithmic work:

- `/api/discount`: Performs iterative mathematical rule evaluation over simulated product price matrices.
- `/api/recommend`: Executes synthetic scoring computations simulating ML inference delays.

This ensures that under a 150-to-500 virtual user load generated by Grafana k6, fleet CPU utilization reliably exceeds the 70% threshold, triggering automated scale-out events.

---

## 4. Google Cloud Platform Infrastructure Specification

### 4.1 Resource Hierarchy

All resources are deployed within a dedicated GCP project:

```text
GCP Project ID: myntraflash-cloud-exercise
GCP Region:     asia-south1 (Mumbai)
GCP Zones:      asia-south1-a, asia-south1-b
```

### 4.2 Compute Engine Managed Instance Group (MIG)

| Parameter | Specification | Engineering Justification |
|-----------|---------------|---------------------------|
| **Instance Template** | `template-myntraflash-v1` | Golden blueprint specifying VM machine type, disk, and startup script |
| **Machine Type** | `e2-medium` (2 vCPU, 4 GB RAM) | Matches standard cloud testing specifications; cost-effective |
| **Base Image** | Ubuntu 22.04 LTS Minimal | Fast initial boot times; stable Docker support |
| **Boot Disk** | 30 GB Standard Persistent Disk (`pd-standard`) | Standard storage tier covered under free credits |
| **Target Size** | 1 (min) to 3 (max) instances | Bounds cloud compute spend while providing 3× elasticity |
| **Autohealing Policy** | Based on HTTP Health Check | Automatically restarts or replaces unresponsive VMs |
| **Update Policy** | Proactive / Rolling Action | Zero-downtime rolling updates when updating container tags |

### 4.3 Containerized Bootstrapping via Startup Script

Each GCE instance automatically bootstraps Docker and pulls the container on initial boot using GCP Instance Template metadata:

```bash
#!/bin/bash
# ==============================================================================
# GCE Startup Script: Dockerized Node.js Microservice Bootstrap
# ==============================================================================
set -e
export DEBIAN_FRONTEND=noninteractive

# 1. Update and install Docker Engine
apt-get update -y
apt-get install -y ca-certificates curl gnupg lsb-release
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io

# 2. Pull and execute MyntraFlash container
systemctl enable --now docker
docker pull ghcr.io/utsker/myntraflash:latest || docker pull nginx:alpine

# Run container mapping host port 80 to container port 3000
docker run -d \
  --name myntraflash-app \
  --restart unless-stopped \
  -p 80:3000 \
  -e PORT=3000 \
  -e NODE_ENV=production \
  ghcr.io/utsker/myntraflash:latest
```

### 4.4 Google Cloud Load Balancing

| Parameter | Value | Details |
|-----------|-------|---------|
| **Load Balancer Type** | External Application Load Balancer | Global or Regional HTTP(S) Layer 7 Load Balancer |
| **Frontend IP** | Ephemeral or Reserved Static Public IPv4 | Public entry point receiving synthetic k6 traffic |
| **Forwarding Rule** | TCP Port 80 (HTTP) | Routes external port 80 to the backend service |
| **Backend Service** | `backend-service-myntraflash` | Links the load balancer to the Compute Engine MIG |
| **Balancing Mode** | Utilization (Target: 80%) | Balances traffic evenly across healthy instances in the MIG |
| **Session Affinity** | None | Pure round-robin distribution across instances |

### 4.5 Health Check Probe Configuration

| Parameter | Value | Behavior |
|-----------|-------|----------|
| **Protocol** | HTTP | Validates application-level responsiveness (Node.js event loop) |
| **Request Path** | `/health` | Expects HTTP `200 OK` response payload |
| **Port** | 80 | Host port mapped to container port 3000 |
| **Check Interval** | 15 seconds | Frequency of synthetic probe packets sent to each VM |
| **Timeout** | 5 seconds | Maximum duration allowed for response before marking a failure |
| **Unhealthy Threshold**| 2 consecutive failures | VM is dropped from traffic rotation within 30 seconds |
| **Healthy Threshold** | 2 consecutive successes | VM re-enters rotation once fully recovered |

### 4.6 Compute Engine Autoscaler Configuration

| Parameter | Configuration | Engineering Rationale |
|-----------|---------------|-----------------------|
| **Metric Target** | Target CPU Utilization: **70%** | Scale-out triggers when fleet average CPU exceeds 70% |
| **Minimum Capacity** | 1 Instance | Guarantees baseline availability |
| **Maximum Capacity** | 3 Instances | Strict upper ceiling preventing unbounded compute consumption |
| **Cool-Down Period** | 300 seconds (5 minutes) | Prevents metric flapping while new instances boot and warm |
| **Scale-In Control** | Max reduction: 1 VM per 5 minutes | Prevents abrupt capacity drops during transient traffic dips |

---

## 5. In-Depth System Architecture Diagram

Below is the comprehensive architectural blueprint of the proposed **MyntraFlash** implementation on Google Cloud Platform, illustrating the end-to-end request lifecycle, zero-cost budget guardrails, compute auto-healing, and the internal microservice container architecture.

![MyntraFlash Deep Cloud Architecture](diagrams/detailed-proposed-architecture.png)

*Figure 2: In-Depth Google Cloud Platform Deployment & Microservice Container Architecture for MyntraFlash ([Vector SVG](diagrams/detailed-proposed-architecture.svg) | [Mermaid Source](diagrams/detailed-proposed-architecture.mmd)).*

---

## 6. Deep Architectural Layers & Zero-Cost Financial Engineering

### 6.1 Layer 1: Synthetic Load Generation & Performance Testing Tier
- **Tooling**: Grafana k6 (Go-based, highly efficient event-loop architecture).
- **Placement**: Executed from a dedicated external testing workstation to prevent client-side CPU saturation from polluting network latency measurements.
- **Traffic Profile (Multi-Stage Flash Simulation)**:
  1. *Stage 1 (Warmup)*: 20 Virtual Users (VUs) for 1 minute (validates baseline latency).
  2. *Stage 2 (Traffic Surge)*: Ramps from 20 to 150 VUs in 30 seconds (simulates the opening moments of Myntra EORS).
  3. *Stage 3 (Sustained Peak)*: 150 VUs sustained for 5 minutes (saturates baseline capacity).
  4. *Stage 4 (Flash Spike)*: Explosive burst to 500 VUs in 2 minutes (forces fleet CPU > 70% to trigger reactive autoscaling).
  5. *Stage 5 (Cooldown & Recovery)*: Drops back to 20 VUs for 5 minutes (validates scale-in stabilization and anti-thrashing).
- **Telemetry Extraction**: Live capture of Request Throughput (RPS), Latency Percentiles (P50, P90, P95, P99), and HTTP Error Rates (`http_req_failed` < 0.01%).

### 6.2 Layer 2: Zero-Cost & Free-Tier Budget Guardrails ($0.00 Out-of-Pocket)
The entire practical implementation is architected to guarantee **strictly zero financial cost ($0.00)** through five deliberate architectural decisions:
1. **GCP $300 Free Trial Credit (90 Days)**: Every standard Google account receives $300 in credits without requiring university email domain approval. Crucially, GCP enforces a strict **Zero Auto-Charge Guarantee**—the platform stops serving rather than billing your credit card when credits expire unless manually upgraded.
2. **Ephemeral Testing Windows**: GCE compute instances are spun up only during active 15–30 minute testing windows. A complete 5-stage k6 load test across 3 `e2-medium` instances consumes less than **$0.15 USD** of trial credit, leaving over $298.00 untouched.
3. **Always-Free Tier Compatibility**: The design supports running on `e2-micro` instances (100% free under GCP Always-Free Tier), 30 GB standard persistent disks, and 50 GB/month of free Cloud Logging and Monitoring ingestion.
4. **Stateless In-Memory Storage (Eliminating Managed DB Costs)**: Commercial managed databases (e.g., Cloud SQL or Cloud Spanner) cost $30–$300+/month. By maintaining pure statelessness with an in-memory catalog and simulated Redis cache, database licensing and hosting fees are **reduced to exactly $0.00**.
5. **Free Public Container Registry**: Container images are hosted on GitHub Container Registry (`ghcr.io`), which provides unlimited free storage and bandwidth for public open-source project repositories.

### 6.3 Layer 3: Traffic Management & Perimeter Security Layer
- **Virtual Private Cloud (VPC)**: Isolated custom VPC (`vpc-myntraflash`: `10.0.1.0/24`) in region `asia-south1` (Mumbai).
- **Firewall Rules**:
  - `allow-http-80`: Allows inbound TCP traffic on port 80 from `0.0.0.0/0`.
  - `allow-health-checks`: Explicitly permits GCP health check probes from Google IP ranges `35.191.0.0/16` and `130.211.0.0/22`.
- **Google Cloud External Application Load Balancer**:
  - Global / Regional External HTTP(S) Load Balancer acting as the single public entry point (Port 80).
  - Forwarding Rule maps incoming requests to a Target HTTP Proxy and URL Map.
  - Backend Service (`backend-myntraflash`) routes traffic using `UTILIZATION` balancing mode (Max: 80%).
  - **Session Affinity**: Explicitly set to `None` to enforce pure round-robin hash distribution across all healthy instances.
- **HTTP Health Checking Engine (`hc-myntraflash-http`)**:
  - Periodically issues synthetic `GET /health` probes every 15 seconds.
  - Marks an instance unhealthy after 2 consecutive failures (30s detection window), isolating failing VMs before cascading failure can propagate.

### 6.4 Layer 4: Compute Engine Managed Instance Group (MIG)
- **Instance Template (`template-myntraflash-v1`)**: Golden declarative blueprint specifying `e2-medium` (2 vCPU, 4 GB RAM) or `e2-micro` compute, Ubuntu 22.04 LTS Minimal OS, and 30 GB standard boot disk.
- **Automated Bootstrapping**: A declarative bash startup script executes at VM creation: installs Docker Engine, pulls `ghcr.io/utsker/myntraflash:latest`, and runs the container with port mapping `80:3000`.
- **Zonal Distribution**: Instances are distributed across `asia-south1-a` and `asia-south1-b` for intra-regional fault tolerance.
- **Autoscaling Policy**:
  - Target Metric: Fleet Average CPU Utilization exceeding **70%**.
  - Minimum Capacity: 1 VM (baseline cost control).
  - Maximum Capacity: 3 VMs (strict upper cost boundary).
  - Scale-In Stabilization Window: **300 seconds (5 minutes)** to prevent metric flapping and thrashing during intermittent traffic dips.
- **Auto-Healing Policy**: If an instance fails consecutive `/health` probes, the MIG automatically restarts or recreates the VM instance.

### 6.5 Layer 5: Deep Internal Microservice Architecture (Inside Container)
Each Docker container runs a lightweight, production-grade Node.js/Express service partitioned into four internal tiers:
1. **Storefront Presentation Layer**:
   - Express static file server delivering the single-page application (`index.html`, `style.css`, `app.js`).
   - UI features a real-time **Serving VM Hostname & IP Badge** (dynamically proves round-robin load distribution during live refreshes), an active Flash Sale Countdown Timer, and a live client-side latency counter.
2. **Middleware & Security Layer**:
   - `helmet`: Enforces secure HTTP headers.
   - `cors`: Cross-Origin Resource Sharing enablement for synthetic clients.
   - `express.json()`: Body parsing.
   - Request Logger & Sequence Counter: Tracks cumulative requests served per VM process.
3. **Core REST API Controllers**:
   - `GET /` & `GET /products`: Product catalogue browsing (JSON).
   - `GET /flash-sale`: Time-critical deals catalog simulating high-demand flash items.
   - `GET /api/discount`: Algorithmic discount engine that performs iterative cryptographic hash checks simulating CPU-bound pricing rules, safely exercising the GCP autoscaler.
   - `GET /api/recommend`: Personalization mock simulating Aerospike feature-store retrieval delays.
   - `GET /health`: Dedicated vitality check returning `HTTP 200 OK` (`{"status":"healthy"}`) in <5ms, completely isolated from business computation.
   - `GET /instance-id`: Diagnostic endpoint returning OS hostname (`os.hostname()`), internal IP, uptime, and request count.
4. **Stateless In-Memory Data Tier**:
   - In-memory JavaScript data structures pre-seeded with catalog items.
   - **Zero Disk Writes & Zero Server-Side Sessions**: Allows any instance to be terminated or spawned without data corruption.

### 6.6 Layer 6: Cloud Observability & Telemetry Tier
- **Google Cloud Monitoring**: Continuously aggregates time-series metrics:
  - `compute.googleapis.com/instance/cpu/utilization`
  - `loadbalancing.googleapis.com/https/request_count`
  - `loadbalancing.googleapis.com/https/total_latencies`
- **Google Cloud Logging**: Collects structured container stdout/stderr and HTTP access logs.

### 6.7 Layer 7: Academic Data Science & SLA Verification Tier
- **Analytics Pipeline (`analyze_results.py`)**: Automated Python script consuming raw k6 JSON/CSV logs and Cloud Monitoring exports.
- **Visualization Artifacts**:
  - *Figure 1*: Virtual Users (VUs) vs Active Instance Count over Time (demonstrating dynamic elasticity).
  - *Figure 2*: Response Latency Percentiles (P50, P90, P95, P99) vs Request Throughput.
  - *Figure 3*: Throughput (RPS) vs HTTP Error Rate (proving 0% 5xx errors during scale-out).
- **Academic SLA Verification Table**: Quantifies compliance against latency (<100ms P95), error (<0.01%), and elasticity targets.

---

## 7. Network & Request Flow Architecture

```text
                  Grafana k6 (Synthetic Client Load)
                                 │
                                 ▼
                     GCP Static Public IPv4
                                 │
                                 ▼
           Google Cloud External Application Load Balancer (Port 80)
                                 │
       ┌─────────────────────────┼─────────────────────────┐
       │ (Round-Robin)           │ (Round-Robin)           │ (Autoscaled)
       ▼                         ▼                         ▼
┌──────────────┐          ┌──────────────┐          ┌──────────────┐
│  GCE VM 1    │          │  GCE VM 2    │          │  GCE VM 3    │
│ (e2-medium)  │          │ (e2-medium)  │          │ (e2-medium)  │
│              │          │              │          │              │
│ Docker: App  │          │ Docker: App  │          │ Docker: App  │
│ Port: 80:3000│          │ Port: 80:3000│          │ Port: 80:3000│
└──────┬───────┘          └──────┬───────┘          └──────┬───────┘
       │                         │                         │
       └─────────────────────────┼─────────────────────────┘
                                 │
               Google Cloud Monitoring & Health Check
                   (Polling /health every 15s)
                                 │
                                 ▼
               Compute Engine MIG Autoscaling Engine
             (Target: Fleet Average CPU Utilization 70%)
```

---

## 8. Infrastructure Provisioning Script (`gcloud` CLI)

The entire infrastructure can be deterministically provisioned using the official Google Cloud SDK (`gcloud`):

```bash
#!/bin/bash
set -e

# ==============================================================================
# MyntraFlash: Automated GCP Infrastructure Provisioning Script
# ==============================================================================
PROJECT_ID="myntraflash-cloud-exercise"
REGION="asia-south1"
ZONE="asia-south1-a"
VPC_NAME="vpc-myntraflash"
SUBNET_NAME="subnet-myntraflash"
INSTANCE_TEMPLATE="template-myntraflash-v1"
MIG_NAME="mig-myntraflash"
HEALTH_CHECK_NAME="hc-myntraflash-http"
BACKEND_SERVICE="backend-myntraflash"
URL_MAP="url-map-myntraflash"
HTTP_PROXY="http-proxy-myntraflash"
FORWARDING_RULE="fwd-rule-myntraflash"

# 1. Set default project and region
gcloud config set project $PROJECT_ID
gcloud config set compute/region $REGION
gcloud config set compute/zone $ZONE

# 2. Create custom VPC Network and Subnet
gcloud compute networks create $VPC_NAME --subnet-mode=custom
gcloud compute networks subnets create $SUBNET_NAME \
    --network=$VPC_NAME \
    --region=$REGION \
    --range=10.0.1.0/24

# 3. Create Firewall Rules (Allow HTTP 80 and Health Check Probes)
gcloud compute firewall-rules create allow-http-and-hc \
    --network=$VPC_NAME \
    --allow=tcp:80,tcp:3000 \
    --source-ranges=0.0.0.0/0,130.211.0.0/22,35.191.0.0/16 \
    --target-tags=myntraflash-node

# 4. Create HTTP Health Check
gcloud compute health-checks create http $HEALTH_CHECK_NAME \
    --port=80 \
    --request-path="/health" \
    --check-interval=15s \
    --timeout=5s \
    --unhealthy-threshold=2 \
    --healthy-threshold=2

# 5. Create Instance Template with Docker Startup Script
gcloud compute instance-templates create $INSTANCE_TEMPLATE \
    --machine-type=e2-medium \
    --network=$VPC_NAME \
    --subnet=$SUBNET_NAME \
    --tags=myntraflash-node \
    --image-family=ubuntu-2204-lts \
    --image-project=ubuntu-os-cloud \
    --boot-disk-size=30GB \
    --boot-disk-type=pd-standard \
    --metadata-from-file=startup-script=startup-script.sh

# 6. Create Managed Instance Group (MIG)
gcloud compute instance-groups managed create $MIG_NAME \
    --base-instance-name=myntraflash-vm \
    --template=$INSTANCE_TEMPLATE \
    --size=1 \
    --zone=$ZONE \
    --health-check=$HEALTH_CHECK_NAME \
    --initial-delay=300

# 7. Configure Named Port for Load Balancer
gcloud compute instance-groups managed set-named-ports $MIG_NAME \
    --named-ports=http:80 \
    --zone=$ZONE

# 8. Create Backend Service and Attach MIG
gcloud compute backend-services create $BACKEND_SERVICE \
    --protocol=HTTP \
    --port-name=http \
    --health-checks=$HEALTH_CHECK_NAME \
    --global

gcloud compute backend-services add-backend $BACKEND_SERVICE \
    --instance-group=$MIG_NAME \
    --instance-group-zone=$ZONE \
    --balancing-mode=UTILIZATION \
    --max-utilization=0.8 \
    --global

# 9. Create URL Map, HTTP Proxy, and Global Forwarding Rule
gcloud compute url-maps create $URL_MAP --default-service=$BACKEND_SERVICE
gcloud compute target-http-proxies create $HTTP_PROXY --url-map=$URL_MAP
gcloud compute forwarding-rules create $FORWARDING_RULE \
    --global \
    --target-http-proxy=$HTTP_PROXY \
    --ports=80

# 10. Configure CPU-Based Autoscaling Policy (Target CPU: 70%, Min: 1, Max: 3)
gcloud compute instance-groups managed set-autoscaling $MIG_NAME \
    --zone=$ZONE \
    --max-num-replicas=3 \
    --min-num-replicas=1 \
    --target-cpu-utilization=0.70 \
    --cool-down-period=300

echo "GCP Infrastructure Provisioning Complete. Public IP:"
gcloud compute forwarding-rules describe $FORWARDING_RULE --global --format="value(IPAddress)"
```

---

## 9. Comparison with Myntra Production Architecture

| Architectural Dimension | Myntra Production Platform | MyntraFlash Laboratory Model |
|:---|:---|:---|
| **Cloud Substrate** | Multi-Region Hyperscale Cloud | Google Cloud Platform (`asia-south1`) |
| **Compute Scale** | Thousands of microservices (AKS) | 1 to 3 GCE Instances (`e2-medium`) in a MIG |
| **Traffic Router** | Cloud CDN + Layer 7 API Gateway | GCP External Application Load Balancer |
| **Data Ingestion** | Sourcerer (Debezium + Kafka @ 42M events/min) | In-memory synthetic workload requests |
| **Personalization** | Aerospike HMA (0.8 ms lookup, 500K ops/s) | Simulated latency & recommendation delay endpoint |
| **Pricing Service** | In-Memory RES + Redis Read Balancing (30 ms) | Configurable matrix calculation discount endpoint |
| **Disaster Recovery** | Dual-Region Active-Active (200+ SCM services) | Zonal / Regional high availability & health self-healing |
| **Load Testing** | Distributed internal load generators | Open-source Grafana k6 running staged flash scenarios |

---

## 10. References

See [references.md](references.md) for full academic and cloud provider citations.
