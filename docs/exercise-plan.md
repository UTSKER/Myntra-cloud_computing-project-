# Exercise and Experimental Plan — Week 3

## Cloud Computing — Group 33 | Week 2 Deliverable

---

## 1. Exercise Objective

**MyntraFlash — Cloud-Based Scalable E-Commerce Simulation**

Build and deploy a small web application inspired by Myntra's e-commerce platform. Use the application to measure and compare cloud scalability under simulated flash-sale traffic conditions.

The exercise directly addresses the course requirements for measuring **latency**, **scaling behaviour** and **cost**.

---

## 2. Deployment Procedure

### Step 1: Application Development

1. Implement the Node.js + Express application with all six endpoints.
2. Write a Dockerfile for containerization.
3. Test locally with `docker build` and `docker run`.
4. Push the image to GitHub Container Registry (`ghcr.io`).

### Step 2: Azure Infrastructure Setup

1. Create resource group `rg-myntraflash-exercise` in Central India.
2. Create a Virtual Network and subnet.
3. Create a VM Scale Set with Standard_B2s VMs (min: 1, max: 3).
4. Configure Custom Script Extension to install Docker and pull the container image.
5. Create a Standard Load Balancer with health probes on `/health`.
6. Configure autoscale rules (CPU-based).
7. Verify the application is reachable via the load balancer public IP.

### Step 3: Load Testing Setup

1. Install Grafana k6 on the test machine.
2. Write k6 test scripts for each experiment.
3. Verify connectivity to the load balancer endpoint.
4. Run a short validation test (10 VUs, 30 seconds) to confirm metrics collection.

---

## 3. Experiments

### 3.1 Experiment 1 — Baseline Performance

**Objective:** Establish baseline performance metrics for a single-instance deployment.

**Setup:**
- VMSS instance count: **1** (fixed, autoscaling disabled).
- VM size: Standard_B2s (2 vCPU, 4 GB RAM).
- Docker container: MyntraFlash application.

**Load profile:**
- 50 virtual users (VUs) sustained for 5 minutes.
- Endpoint mix: 40% `/products`, 25% `/flash-sale`, 20% `/api/discount`, 15% `/api/recommend`.

**Metrics to record:**

| Metric | Description | Tool |
|--------|-------------|------|
| Average response time | Mean of all request durations | k6 |
| p50 latency | Median request duration | k6 |
| p95 latency | 95th percentile request duration | k6 |
| p99 latency | 99th percentile request duration | k6 |
| Requests per second | Throughput | k6 |
| Error rate | Percentage of non-2xx responses | k6 |
| CPU utilization | Average CPU % during test | Azure Monitor |
| Memory utilization | Average memory % during test | Azure Monitor |

**Expected results template:**

| Metric | 1 VM (Baseline) |
|--------|-----------------|
| Avg response time | _to be measured_ |
| p50 latency | _to be measured_ |
| p95 latency | _to be measured_ |
| p99 latency | _to be measured_ |
| Requests/sec | _to be measured_ |
| Error rate (%) | _to be measured_ |
| CPU utilization (%) | _to be measured_ |
| Memory utilization (%) | _to be measured_ |

---

### 3.2 Experiment 2 — Horizontal Scaling Comparison

**Objective:** Compare performance across 1, 2 and 3 VM instances under identical load.

**Setup:**
- Three separate test runs with VMSS manually set to 1, 2 and 3 instances (autoscaling disabled).
- Same VM size, Docker image, and Azure region for all runs.

**Load profile (identical for all three runs):**
- 100 VUs sustained for 5 minutes.
- Same endpoint mix as Experiment 1.

**Controlled variables:**

| Variable | Value | Reason |
|----------|-------|--------|
| VM size | Standard_B2s | Identical compute per instance |
| Docker image | Same tag | Identical application code |
| Region | Central India | Same network conditions |
| Test duration | 5 minutes | Consistent measurement window |
| VU count | 100 | Same total load |
| Endpoint mix | 40/25/20/15% | Same request profile |
| k6 test machine | Same machine | Consistent client-side behaviour |

**Comparison table:**

| Metric | 1 VM | 2 VMs | 3 VMs |
|--------|------|-------|-------|
| Avg response time | _measured_ | _measured_ | _measured_ |
| p50 latency | _measured_ | _measured_ | _measured_ |
| p95 latency | _measured_ | _measured_ | _measured_ |
| p99 latency | _measured_ | _measured_ | _measured_ |
| Requests/sec | _measured_ | _measured_ | _measured_ |
| Error rate (%) | _measured_ | _measured_ | _measured_ |
| CPU utilization (%) | _measured_ | _measured_ | _measured_ |

**Expected behaviour (hypothesis):**
- Latency should decrease as instances increase (load distributed across more VMs).
- Throughput (req/sec) should increase approximately linearly with instance count.
- CPU utilization per instance should decrease as load is shared.
- Error rate should decrease with more instances.

**How to ensure fairness:**
1. Wait at least 5 minutes between runs for metrics to stabilize.
2. Verify all instances are healthy before starting each run.
3. Use the same k6 script file for all runs.
4. Record Azure Monitor metrics with matching time windows.
5. Run tests at similar times of day to minimize network variability.

---

### 3.3 Experiment 3 — Autoscaling Behaviour

**Objective:** Observe and record autoscaling triggered by CPU utilization.

**Setup:**
- VMSS autoscaling **enabled**.
- Minimum instances: 1.
- Maximum instances: 3.
- Scale-out: CPU > 70% for 5 minutes → add 1 instance.
- Scale-in: CPU < 30% for 5 minutes → remove 1 instance.
- Cooldown: 5 minutes.

**Load profile:**

| Phase | Duration | VUs | Purpose |
|-------|----------|-----|---------|
| 1. Baseline | 3 min | 20 | Establish low CPU baseline |
| 2. Ramp-up | 3 min | 20 → 200 | Gradually increase load |
| 3. Sustained high | 10 min | 200 | Maintain high CPU to trigger scale-out |
| 4. Peak spike | 5 min | 500 | Simulate flash-sale spike |
| 5. Ramp-down | 3 min | 500 → 20 | Reduce load |
| 6. Low traffic | 10 min | 20 | Maintain low CPU to trigger scale-in |

**Total test duration:** ~34 minutes.

**Metrics to record (time-series):**

| Time (min) | VUs | Instance Count | Avg CPU (%) | Avg Latency (ms) | Req/sec | Errors |
|------------|-----|----------------|-------------|-------------------|---------|--------|
| 0 | 20 | 1 | _measured_ | _measured_ | _measured_ | _measured_ |
| 3 | 50 | 1 | _measured_ | _measured_ | _measured_ | _measured_ |
| 6 | 200 | 1 | _measured_ | _measured_ | _measured_ | _measured_ |
| 11 | 200 | _measured_ | _measured_ | _measured_ | _measured_ | _measured_ |
| 16 | 500 | _measured_ | _measured_ | _measured_ | _measured_ | _measured_ |
| 21 | 200 | _measured_ | _measured_ | _measured_ | _measured_ | _measured_ |
| 26 | 20 | _measured_ | _measured_ | _measured_ | _measured_ | _measured_ |
| 34 | 20 | _measured_ | _measured_ | _measured_ | _measured_ | _measured_ |

**Autoscaling event log:**

| Time | Event | Previous Count | New Count | Trigger |
|------|-------|----------------|-----------|---------|
| _observed_ | Scale-out | _n_ | _n+1_ | CPU > 70% for 5 min |
| _observed_ | Scale-out | _n_ | _n+1_ | CPU > 70% for 5 min |
| _observed_ | Scale-in | _n_ | _n-1_ | CPU < 30% for 5 min |

**Key observations to record:**
1. How long after CPU exceeds 70% does the first scale-out occur?
2. How long does a new instance take to become healthy and receive traffic?
3. Does latency improve after scale-out?
4. How long after load drops does scale-in begin?
5. Are there any errors during scaling transitions?

**Cooldown period explanation:**
The 5-minute cooldown prevents rapid oscillation. After adding an instance, the system waits 5 minutes before evaluating again. This ensures:
- The new instance has time to boot, pull the Docker image, and start serving traffic.
- CPU metrics stabilize to reflect the new capacity.
- Decisions are based on sustained trends, not transient spikes.

---

### 3.4 Experiment 4 — Fault Tolerance

**Objective:** Verify that the load balancer correctly routes traffic away from unhealthy instances.

**Setup:**
- VMSS instance count: 2 (fixed, autoscaling disabled).
- Both instances healthy and serving traffic.
- k6 running with 50 VUs sustained throughout.

**Procedure:**

1. **Phase 1 (2 min):** Verify both instances are receiving traffic. Use `/instance-id` endpoint to confirm requests are distributed.

2. **Phase 2 — Simulate failure:** SSH into one VM instance and stop the Docker container:
   ```bash
   docker stop myntraflash
   ```

3. **Phase 3 (2 min):** Continue the load test. Observe:
   - Does the load balancer detect the unhealthy instance?
   - How quickly is the unhealthy instance removed from rotation?
   - Do requests continue to succeed on the remaining healthy instance?

4. **Phase 4 — Recovery:** Restart the Docker container:
   ```bash
   docker start myntraflash
   ```

5. **Phase 5 (2 min):** Observe whether the recovered instance is added back to the load balancer rotation.

**Expected observations:**

| Phase | Expected Behaviour |
|-------|-------------------|
| Phase 1 | Traffic distributed across both instances |
| Phase 2 | Brief error spike (requests in-flight to failed instance) |
| Phase 3 | All traffic routed to healthy instance; higher latency possible |
| Phase 4 | Instance health probe succeeds after restart |
| Phase 5 | Traffic redistributed across both instances |

**Important distinction:**

| Mechanism | What it does | When it acts |
|-----------|-------------|-------------|
| **Health probe** | Detects unhealthy instances and removes them from LB rotation | Seconds (probe interval × threshold) |
| **VMSS automatic repair** | Replaces a failed VM entirely (new VM, new boot) | Minutes |

In this experiment, we are primarily testing **health probe behaviour** (fast detection and traffic rerouting), not full VM replacement.

---

### 3.5 Experiment 5 — Cost Analysis

**Objective:** Compare the cost of fixed provisioning versus elastic (autoscaled) provisioning.

**Assumptions:**
- Region: Central India.
- VM size: Standard_B2s.
- Duration: 24-hour analysis period.
- Traffic pattern: 20 hours of low traffic + 4 hours of high traffic (simulating a flash sale).

**Scenario A — Fixed provisioning (3 VMs, always running):**

| Resource | Unit | Quantity | Est. Unit Price | Est. 24h Cost |
|----------|------|----------|-----------------|---------------|
| Standard_B2s VM | per hour | 3 × 24 = 72 hrs | ~₹3.50/hr* | ~₹252 |
| Standard LB | per hour | 24 hrs | ~₹1.70/hr* | ~₹41 |
| LB rules | per rule/hr | 1 × 24 | Included | — |
| OS disk (128 GB) | per disk/month | 3 disks (prorated) | ~₹350/month* | ~₹34 |
| Data processed (LB) | per GB | ~5 GB | ~₹0.40/GB* | ~₹2 |
| **Total (est.)** | | | | **~₹329** |

**Scenario B — Elastic provisioning (1–3 VMs, autoscaled):**

| Resource | Unit | Quantity | Est. Unit Price | Est. 24h Cost |
|----------|------|----------|-----------------|---------------|
| Standard_B2s VM (low) | per hour | 1 × 20 = 20 hrs | ~₹3.50/hr* | ~₹70 |
| Standard_B2s VM (high) | per hour | 3 × 4 = 12 hrs | ~₹3.50/hr* | ~₹42 |
| Standard LB | per hour | 24 hrs | ~₹1.70/hr* | ~₹41 |
| OS disk (128 GB) | per disk/month | 1–3 disks (prorated) | ~₹350/month* | ~₹20 |
| Data processed (LB) | per GB | ~5 GB | ~₹0.40/GB* | ~₹2 |
| **Total (est.)** | | | | **~₹175** |

> **\*Pricing note:** These are approximate estimates based on Azure pricing documentation. Actual prices vary by region, subscription type and current rates. Students should verify using the [Azure Pricing Calculator](https://azure.microsoft.com/en-us/pricing/calculator/) at the time of the experiment.

**Estimated savings:**

| Metric | Fixed | Elastic | Difference |
|--------|-------|---------|------------|
| VM hours | 72 | 32 | 40 hours saved (56%) |
| Estimated cost | ~₹329 | ~₹175 | ~₹154 saved (~47%) |

**Key insight:** Even with this simple setup, elastic provisioning can reduce compute costs by approximately 47% for a workload with 4 hours of peak demand in a 24-hour period. This directly mirrors Myntra's motivation for cloud migration — avoiding fixed peak-capacity provisioning.

> **Disclaimer:** These are hypothetical cost estimates for planning purposes. Actual costs will be measured during the Week 3 exercise using real Azure billing data.

---

## 4. Data Collection Plan

### 4.1 k6 Output

All k6 test runs should be executed with JSON output:

```bash
k6 run --out json=results/experiment-N-result.json test-script.js
```

Additionally, k6 summary output should be captured:

```bash
k6 run test-script.js | tee results/experiment-N-summary.txt
```

### 4.2 Azure Monitor

For each experiment, record:
- CPU utilization time-series (1-minute granularity).
- Instance count changes (from Activity Log).
- Screenshot or export of Azure Monitor dashboards.

### 4.3 Results Organization

```
results/
├── experiment-1-baseline/
│   ├── k6-summary.txt
│   ├── k6-results.json
│   └── azure-metrics-screenshot.png
├── experiment-2-horizontal/
│   ├── 1vm/
│   ├── 2vm/
│   └── 3vm/
├── experiment-3-autoscaling/
│   ├── k6-summary.txt
│   ├── autoscale-events.txt
│   └── azure-metrics-screenshot.png
├── experiment-4-fault-tolerance/
│   └── ...
└── experiment-5-cost/
    └── cost-comparison.md
```

---

## 5. Success Criteria

| Experiment | Success Criterion |
|------------|-------------------|
| 1. Baseline | Metrics collected with < 5% error rate |
| 2. Horizontal | Clear latency improvement with more instances |
| 3. Autoscaling | At least one scale-out and one scale-in observed |
| 4. Fault tolerance | Traffic continues after instance failure |
| 5. Cost | Cost difference quantified with real Azure billing |

---

## 6. Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Azure free-tier limits | Use student subscription; monitor spending |
| Autoscaling takes too long to trigger | Lower the CPU threshold (e.g., 50%) or increase load |
| k6 machine bandwidth limits | Run k6 from an Azure VM in the same region |
| Docker pull failures | Pre-pull images; use specific version tags |
| Inconsistent test results | Run each experiment at least twice; report averages |
| Time constraints | Prioritize Experiments 1–3; Experiments 4–5 are secondary |

---

## References

See [references.md](references.md) for full citations.

