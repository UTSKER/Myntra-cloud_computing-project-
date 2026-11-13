# MyntraFlash Synthetic Load Testing Suite (Week 3)

This directory contains the synthetic load generation scripts for **MyntraFlash**, modeling the high-velocity traffic curves of Myntra's **End of Reason Sale (EORS)**.

---

## 1. Tooling & Installation

### Option 1: Grafana k6 (Recommended for Official Benchmarks)
k6 is an open-source, Go-based load generator designed for high performance and low resource overhead.

**Windows Installation:**
```powershell
# Using Windows Package Manager (winget)
winget install k6 --source winget

# Or using Chocolatey
choco install k6
```

**macOS / Linux Installation:**
```bash
# macOS
brew install k6

# Debian / Ubuntu
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

### Option 2: Zero-Dependency Node.js Simulator (Immediate Local Testing)
If k6 is not installed on your current workstation, you can run the built-in native load tester with zero external dependencies:
```powershell
# Usage: node simulate-load.js [TARGET_URL] [CONCURRENCY] [TOTAL_REQUESTS]
node simulate-load.js http://localhost:3000 20 200
```

---

## 2. Test Scripts Overview

| Script | Purpose | Experiments Covered |
| :--- | :--- | :--- |
| **`config.js`** | Shared configuration, target URLs, and SLA threshold definitions. | All |
| **`baseline-test.js`** | Sustained 50-VU steady-state test measuring baseline latency ($p50, p95, p99$). | **Exp 1 & 2** (Fixed 1, 2, 3 VMs) |
| **`flash-sale-spike.js`** | Multi-phase staged surge (20 $\to$ 150 $\to$ 500 VUs) triggering CPU autoscaling. | **Exp 3** (Autoscaler Hysteresis) |
| **`fault-tolerance-test.js`**| Continuous polling probe measuring failover routing during VM outage. | **Exp 4** (Resilience & Auto-healing) |
| **`simulate-load.js`** | Standalone Node.js load generator calculating latency percentiles and node balance. | Quick sanity & viva live demos |

---

## 3. Running the Experiments

### Testing Locally First
```bash
# Terminal 1: Start the application
cd app
npm start

# Terminal 2: Run baseline test locally
k6 run -e TARGET_URL=http://localhost:3000 baseline-test.js
```

### Running Against GCP Cloud Load Balancer
Replace `34.x.x.x` with the external IP address of your Google Cloud Load Balancer:

#### Experiment 1: Baseline Performance (1 VM)
```bash
k6 run -e TARGET_URL=http://34.x.x.x baseline-test.js --out json=results/exp1-baseline.json
```

#### Experiment 2: Horizontal Scaling Linearity (1 vs 2 vs 3 VMs)
Run the identical command on static clusters of 1, 2, and 3 VMs:
```bash
# On 1-VM cluster:
k6 run -e TARGET_URL=http://34.x.x.x baseline-test.js --out json=results/exp2-1vm.json

# On 2-VM cluster:
k6 run -e TARGET_URL=http://34.x.x.x baseline-test.js --out json=results/exp2-2vm.json

# On 3-VM cluster:
k6 run -e TARGET_URL=http://34.x.x.x baseline-test.js --out json=results/exp2-3vm.json
```

#### Experiment 3: Dynamic Flash Surge & Autoscaler Hysteresis
```bash
k6 run -e TARGET_URL=http://34.x.x.x flash-sale-spike.js --out json=results/exp3-autoscale.json
```

#### Experiment 4: Fault Tolerance & Failover
```bash
k6 run -e TARGET_URL=http://34.x.x.x fault-tolerance-test.js
```
*While running, simulate failure by SSHing into VM 1 and running: `docker stop myntraflash-app`.*

---

## 4. Output Telemetry & Deliverables
The tests automatically output:
- **`http_req_duration`**: $avg, min, med (p50), p90, p95, p99$ response latencies.
- **`http_reqs`**: Total throughput (requests per second).
- **`http_req_failed`**: HTTP error rate (non-2xx responses).
- **`node_distribution`**: Proof of round-robin request distribution across MIG instances.

These values directly populate the **Response Time vs. Instance Count** plot required by the course manual.

