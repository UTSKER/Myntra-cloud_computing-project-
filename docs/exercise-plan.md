# Exercise and Experimental Plan — Week 3 (Google Cloud Platform)

## Cloud Computing — Group 33 | Week 2 Deliverable

---

## 1. Exercise Objective

**MyntraFlash — Cloud-Based Scalable E-Commerce Simulation on Google Cloud Platform**

Build and deploy a containerized web application inspired by Myntra's e-commerce architecture. Deploy the application onto **Google Cloud Platform (GCP)** within the `asia-south1` (Mumbai) region to measure, benchmark, and compare cloud scalability under simulated flash-sale traffic conditions.

Following an audit of student billing mechanisms, the exercise is executed on GCP, taking advantage of **$300 USD in free trial credits over 90 days** with a strict **zero auto-charge guarantee**, bypassing institutional college email verification barriers while retaining 100% of the required architectural features.

The experimental design directly addresses the course requirements for measuring:
1. **Response Latency** (average, p50, p95, p99 percentiles).
2. **Horizontal Scaling Behaviour** (throughput, instance count, CPU utilization).
3. **Resilience & Fault Tolerance** (automated health probe detection and traffic rerouting).
4. **Economic Cloud Cost** (comparative billing between fixed and elastic provisioning).

---

## 2. Deployment Procedure

### Step 1: Application Development & Container Packaging
1. Implement the stateless Node.js + Express microservice with all six functional endpoints.
2. Author an optimized multi-stage `Dockerfile` (Node.js 18/20 Alpine base).
3. Test container execution locally using `docker run -p 3000:3000 myntraflash:latest`.
4. Tag and push the container image to GitHub Container Registry (`ghcr.io/utsker/myntraflash:latest`).

### Step 2: Google Cloud Platform Infrastructure Setup
1. Create a dedicated GCP Project: `myntraflash-cloud-exercise`.
2. Provision a custom VPC Network (`vpc-myntraflash`) and Subnet in `asia-south1` (Mumbai).
3. Configure GCP Firewall Rules to permit external HTTP traffic (port 80) and Google Health Check IP ranges (`130.211.0.0/22`, `35.191.0.0/16`).
4. Author an Instance Template (`template-myntraflash-v1`) utilizing `e2-medium` instances running Ubuntu 22.04 LTS with an automated Docker bootstrap startup script.
5. Create a Compute Engine Managed Instance Group (MIG) with an initial baseline capacity of 1 instance.
6. Configure an HTTP Health Check querying `/health` on port 80 at 15-second intervals.
7. Deploy a Google Cloud External Application Load Balancer with a Backend Service linked to the MIG.
8. Configure the MIG Autoscaler with a target CPU utilization of 70%, cool-down period of 300 seconds, and capacity bounds of 1 to 3 instances.
9. Verify global reachability by querying the Load Balancer Public IPv4 address.

### Step 3: Synthetic Load Testing Setup
1. Install Grafana k6 on the dedicated client workstation (or an adjacent test VM).
2. Author modular k6 scenario scripts for each of the five planned experiments.
3. Validate endpoint reachability and latency metric recording with a 10-VU sanity test.

---

## 3. Experimental Methodology

### 3.1 Experiment 1 — Baseline Performance

**Objective:** Establish empirical baseline performance metrics for a single-instance deployment (`e2-medium`) under non-scaling, fixed-capacity conditions.

**Infrastructure Configuration:**
- GCE MIG Target Size: **1 Instance (Fixed)** (MIG autoscaling disabled).
- Compute Specification: `e2-medium` (2 vCPU, 4 GB RAM, 30 GB standard persistent disk).
- Runtime: Docker container running MyntraFlash.
- Region: GCP `asia-south1` (Mumbai).

**Load Profile:**
- Concurrency: 50 Virtual Users (VUs) sustained for 5 minutes.
- Request Distribution: 40% `/products`, 25% `/flash-sale`, 20% `/api/discount`, 15% `/api/recommend`.

**Metrics Recorded:**

| Evaluation Metric | Description | Primary Measurement Tool |
|:---|:---|:---|
| **Average Response Time** | Arithmetic mean of HTTP request durations | Grafana k6 (`http_req_duration`) |
| **p50 Latency (Median)** | 50th percentile response time | Grafana k6 |
| **p95 Tail Latency** | 95th percentile response time | Grafana k6 |
| **p99 Worst-Case Latency** | 99th percentile response time | Grafana k6 |
| **Throughput (RPS)** | Total completed requests per second | Grafana k6 (`http_reqs`) |
| **Error Percentage** | Rate of non-2xx HTTP responses or timeouts | Grafana k6 (`http_req_failed`) |
| **CPU Utilization** | Mean percentage CPU load across the VM | Google Cloud Monitoring |
| **Memory Utilization** | RAM consumption during peak load | Google Cloud Monitoring |

**Expected Outcome Template:**

| Metric | 1 GCE VM (`e2-medium`) Baseline |
|:---|:---:|
| Average Response Time (ms) | _to be measured in Week 3_ |
| p50 Latency (ms) | _to be measured in Week 3_ |
| p95 Latency (ms) | _to be measured in Week 3_ |
| p99 Latency (ms) | _to be measured in Week 3_ |
| Throughput (req/sec) | _to be measured in Week 3_ |
| HTTP Error Rate (%) | _to be measured in Week 3_ |
| Average CPU Utilization (%) | _to be measured in Week 3_ |

---

### 3.2 Experiment 2 — Horizontal Scaling Comparison (1 vs. 2 vs. 3 VMs)

**Objective:** Quantify horizontal scaling linearity and latency mitigation by evaluating identical synthetic traffic against static clusters of 1, 2, and 3 GCE instances.

**Infrastructure Configuration:**
- Three discrete test executions with MIG capacity manually set to **1 VM**, **2 VMs**, and **3 VMs** (Autoscaler disabled).
- All runs share the identical instance template, container image tag, VPC subnet, and load balancer frontend.

**Controlled Variables:**

| Variable | Controlled Value | Scientific Justification |
|:---|:---|:---|
| Compute Sizing | `e2-medium` (2 vCPU, 4 GB RAM) | Ensures uniform per-node compute power |
| Container Image | `ghcr.io/utsker/myntraflash:latest` | Eliminates software version discrepancies |
| Cloud Region | GCP `asia-south1` (Mumbai) | Eliminates geographic routing variations |
| Test Duration | 5 minutes sustained per run | Provides statistically stable measurement intervals |
| Client Load | 100 Virtual Users (VUs) | Sufficient to saturate 1 node while distributing across 3 |
| Endpoint Mix | 40/25/20/15% ratio | Represents typical e-commerce browsing behavior |
| Test Runner | Dedicated client machine | Eliminates test harness network divergence |

**Comparative Evaluation Matrix:**

| Performance Metric | 1 GCE Instance | 2 GCE Instances | 3 GCE Instances |
|:---|:---:|:---:|:---:|
| Average Response Time (ms) | _measured_ | _measured_ | _measured_ |
| p50 Latency (ms) | _measured_ | _measured_ | _measured_ |
| p95 Latency (ms) | _measured_ | _measured_ | _measured_ |
| p99 Latency (ms) | _measured_ | _measured_ | _measured_ |
| Throughput (req/sec) | _measured_ | _measured_ | _measured_ |
| Error Rate (%) | _measured_ | _measured_ | _measured_ |
| Fleet Average CPU (%) | _measured_ | _measured_ | _measured_ |

**Hypothesis:** As instance capacity triples from 1 to 3 VMs, tail latency (p95/p99) will drop significantly as CPU saturation on individual nodes is alleviated, and aggregate system throughput will scale near-linearly.

---

### 3.3 Experiment 3 — Autoscaling Dynamics & Hysteresis

**Objective:** Observe, record, and evaluate autonomous horizontal elasticity triggered by Compute Engine CPU thresholds, measuring provisioning lag, scale-out responsiveness, and cool-down stabilization.

**Autoscaler Configuration:**
- Target Metric: **Average CPU Utilization = 70%**.
- Minimum Replicas: **1 Instance**.
- Maximum Replicas: **3 Instances**.
- Cool-Down Period: **300 seconds (5 minutes)**.
- Scale-In Control: Maximum reduction of 1 VM per 5 minutes to prevent termination flapping.

**Dynamic Flash-Sale Load Profile (34-Minute Execution Window):**

| Phase | Duration | Virtual Users (VUs) | Workload Objective |
|:---|:---:|:---:|:---|
| **Phase 1: Baseline** | 3 min | 20 VUs | Establish steady-state off-peak baseline (CPU ~20%) |
| **Phase 2: Pre-Sale Ramp** | 3 min | 20 → 150 VUs | Simulate initial traffic surge as sale opens |
| **Phase 3: Sustained Peak** | 10 min | 150 VUs | Force CPU > 70% to trigger first scale-out (1 → 2 VMs) |
| **Phase 4: Flash Spike** | 5 min | 500 VUs | Simulate extreme peak flash demand; trigger second scale-out (2 → 3 VMs) |
| **Phase 5: Post-Sale Decay**| 3 min | 500 → 20 VUs | Traffic drops abruptly as sale inventory exhausts |
| **Phase 6: Cooldown & Decay**| 10 min | 20 VUs | Maintain low load (CPU < 30%) to evaluate cool-down and scale-in |

**Time-Series Telemetry Table:**

| Timestamp (min) | Target VUs | Active Instance Count | Fleet CPU (%) | Mean Latency (ms) | Throughput (RPS) | Error Count |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 0 | 20 | 1 | _measured_ | _measured_ | _measured_ | _measured_ |
| 3 | 50 | 1 | _measured_ | _measured_ | _measured_ | _measured_ |
| 6 | 150 | 1 | _measured_ | _measured_ | _measured_ | _measured_ |
| 11 | 150 | _observed_ | _measured_ | _measured_ | _measured_ | _measured_ |
| 16 | 500 | _observed_ | _measured_ | _measured_ | _measured_ | _measured_ |
| 21 | 150 | _observed_ | _measured_ | _measured_ | _measured_ | _measured_ |
| 26 | 20 | _observed_ | _measured_ | _measured_ | _measured_ | _measured_ |
| 34 | 20 | _observed_ | _measured_ | _measured_ | _measured_ | _measured_ |

**Autoscale Event Log Template:**

| Event Timestamp | Action Type | Previous Size | New Target Size | Triggering Metric Condition | Provisioning Latency |
|:---|:---:|:---:|:---:|:---|:---:|
| _logged_ | Scale-Out | 1 | 2 | Fleet CPU > 70% sustained 5m | _measured (s)_ |
| _logged_ | Scale-Out | 2 | 3 | Fleet CPU > 70% sustained 5m | _measured (s)_ |
| _logged_ | Scale-In | 3 | 2 | Fleet CPU < 30% sustained 5m | _measured (s)_ |

---

### 3.4 Experiment 4 — Fault Tolerance & Health Probe Rerouting

**Objective:** Verify that Google Cloud Load Balancing detects unhealthy or crashing microservice instances and transparently reroutes traffic to healthy instances without dropping client sessions.

**Infrastructure Configuration:**
- GCE MIG Target Size: **2 Instances (Fixed)**.
- Both nodes active, healthy, and receiving traffic via round-robin.
- Continuous background synthetic load: 50 VUs sustained.

**Procedure:**
1. **Phase 1 (Verification, 2 min):** Confirm both instances actively serve traffic by querying `/instance-id`.
2. **Phase 2 (Fault Injection):** SSH into GCE Instance 1 and forcefully kill the Docker container:
   ```bash
   docker stop myntraflash-app
   ```
3. **Phase 3 (Detection & Failover, 2 min):** Observe:
   - Time elapsed until GCP Health Check fails (15s interval × 2 failures = ~30s).
   - Load balancer marks Instance 1 as `UNHEALTHY` and removes it from backend rotation.
   - 100% of incoming requests are routed to healthy Instance 2.
4. **Phase 4 (Recovery):** Restart the container on Instance 1:
   ```bash
   docker start myntraflash-app
   ```
5. **Phase 5 (Re-Entry, 2 min):** Verify that within 2 successful health checks, Instance 1 is restored to healthy rotation and traffic is re-balanced.

---

### 3.5 Experiment 5 — Economic Cloud Cost Analysis (Fixed vs. Elastic)

**Objective:** Quantify the financial return on investment (ROI) of autoscaling by modeling a 24-hour diurnal flash-sale traffic pattern comparing static peak capacity against dynamic elasticity on Google Cloud Platform.

**Workload Model (24-Hour Cycle):**
- **Off-Peak Baseline (20 hours):** Normal browsing demand satisfied by 1 VM (`e2-medium`).
- **Pre-Sale & Ramp (2 hours):** Moderate surge requiring 2 VMs.
- **Peak Flash Sale (2 hours):** Maximum concurrency requiring 3 VMs.

**GCP Pricing Parameters (asia-south1 Mumbai Region, Pay-As-You-Go):**
- Compute Engine `e2-medium` (2 vCPU, 4 GB RAM): **$0.0335 per hour** (~₹2.80/hr).
- Standard Persistent Disk (30 GB `pd-standard`): **$0.040 per GB/month** (~$0.0016/hr per disk).
- External Application Load Balancer: **$0.025 per hour** (first 5 forwarding rules).
- Load Balancer Data Processed: **$0.008 per GB** (assuming 50 GB processed).
- Cloud Monitoring Platform Metrics: **$0.000** (Included in GCP Free Tier).
- **Free Trial Coverage:** All expenditures are charged against the **$300 USD credit**, resulting in **₹0 out-of-pocket cost**.

**Comparative 24-Hour Cost Analysis:**

| Cost Component | Architecture A: Fixed 3-VM Cluster | Architecture B: Elastic 1–3 VM MIG | Variance & Economic Savings |
|:---|:---|:---|:---|
| **Total VM-Hours** | 3 VMs × 24 hrs = **72.0 VM-hours** | (20×1) + (2×2) + (2×3) = **30.0 VM-hours** | **42.0 VM-hours eliminated (-58.3%)** |
| **GCE Compute Cost** | 72.0 hrs × $0.0335 = **$2.412** | 30.0 hrs × $0.0335 = **$1.005** | **$1.407 saved on compute** |
| **Persistent Boot Disk** | 3 disks × 24 hrs = **$0.118** | Dynamic disk allocation = **$0.049** | $0.069 saved on storage |
| **Cloud Load Balancer** | 24 hrs × $0.0250 = **$0.600** | 24 hrs × $0.0250 = **$0.600** | Baseline ingress routing charge |
| **Data Processing (50GB)**| 50 GB × $0.0080 = **$0.400** | 50 GB × $0.0080 = **$0.400** | Equivalent payload transfer charge |
| **Cloud Monitoring** | $0.000 (Included) | $0.000 (Included) | $0.000 |
| **Total 24-Hour Cost** | **$3.530 USD** (~ ₹295 INR) | **$2.054 USD** (~ ₹171 INR) | **41.8% Net Overall Cost Reduction** |
| **30-Day Monthly Projection**| **$105.90 USD** (~ ₹8,842 INR) | **$61.62 USD** (~ ₹5,145 INR) | **₹3,697 INR Monthly Operational Savings** |
| **Student Out-of-Pocket** | **₹0.00** (Deducted from $300 credit) | **₹0.00** (Deducted from $300 credit) | **Zero out-of-pocket cost** |

---

## 4. Telemetry Collection & Results Organization

All experimental runs will be archived in the repository under `results/`:

```text
results/
├── experiment-1-baseline/
│   ├── k6-summary.txt
│   ├── k6-raw-results.json
│   └── gcp-monitoring-cpu.png
├── experiment-2-horizontal/
│   ├── 1vm-summary.txt
│   ├── 2vm-summary.txt
│   ├── 3vm-summary.txt
│   └── scaling-comparison-chart.png
├── experiment-3-autoscaling/
│   ├── k6-staged-summary.txt
│   ├── mig-autoscale-events.json
│   └── gcp-autoscale-timeline.png
├── experiment-4-fault-tolerance/
│   ├── failover-k6-metrics.json
│   └── health-check-log.txt
└── experiment-5-cost/
    └── gcp-billing-export.md
```

---

## 5. Risk Management & Safeguards

| Identified Risk | Impact | Proactive Mitigation Strategy |
|:---|:---:|:---|
| **Accidental Billing Post-Trial** | High | GCP has a strict **zero auto-charge** policy. Furthermore, we set a $10 budget alert in GCP Cloud Billing. |
| **MIG Scale-Out Delayed** | Medium | Set initial-delay to 120s; test container images pre-cached on GHCR; aggressive 150 VU load ramp. |
| **Load Balancer Health Check Fails** | High | Firewall explicitly permits GCP health check probe CIDRs (`130.211.0.0/22`, `35.191.0.0/16`) to port 80. |
| **Client Test Runner Bottleneck** | Medium | Execute k6 from a dedicated local terminal with multi-threading enabled; monitor client CPU. |

---

## References

See [references.md](references.md) for full academic and cloud documentation citations.
