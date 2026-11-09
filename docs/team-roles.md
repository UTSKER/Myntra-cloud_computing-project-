# Team Roles and Responsibilities

## Cloud Computing — Group 33 | Week 2 Deliverable

---

## 1. Team Members

| Member | Roll No. | Primary Role |
|--------|----------|--------------|
| Utsker Dhameliya | 202301083 | Research, Production Architecture & Case Study Lead |
| Ritul Patel | 202301086 | Application Development, API Design & Docker Packaging |
| Divyesh Vagh | 202301444 | Cloud Infrastructure, GCE MIG, Autoscaling & Load Testing |

---

## 2. Individual Responsibilities

### Member 1 — Utsker Dhameliya (Research and Architecture)

| Week | Responsibility |
|------|---------------|
| Week 2 | Myntra case-study research and primary source verification |
| Week 2 | Production architecture documentation and Mermaid conceptual modeling |
| Week 2 | Week 2 report coordination, academic writing, and DOCX/PDF formatting |
| Week 3 | Research validation against experimental results |
| Week 3 | Architecture comparison (Myntra enterprise platform vs. laboratory model) |
| Week 4 | Final report compilation, results synthesis, and review |

**Deliverables owned:**
- `docs/case-study-analysis.md`
- `docs/case-study-architecture.md`
- `docs/references.md`
- Production architecture diagrams (`.mmd`, `.svg`, `.png`)

---

### Member 2 — Ritul Patel (Application Development)

| Week | Responsibility |
|------|---------------|
| Week 2 | Application requirements and REST API design |
| Week 2 | Node.js + Express backend architecture planning |
| Week 2 | Frontend interface design (HTML/CSS/JS) |
| Week 3 | Node.js + Express stateless service implementation |
| Week 3 | Frontend integration with simulated backend delays |
| Week 3 | Multi-stage Dockerfile creation and local container testing |
| Week 3 | Push container image to GitHub Container Registry (`ghcr.io`) |
| Week 4 | Application documentation and code review |

**Deliverables owned:**
- `app/` directory (all application microservice source code)
- `Dockerfile`
- Application endpoint documentation

---

### Member 3 — Divyesh Vagh (Cloud Infrastructure)

| Week | Responsibility |
|------|---------------|
| Week 2 | GCP cloud deployment architecture design |
| Week 2 | Proposed implementation architecture diagrams (`.mmd`, `.svg`, `.png`) |
| Week 2 | Week 3 exercise and experimental methodology plan |
| Week 3 | GCP project setup, VPC networking, firewall rules, and health checks |
| Week 3 | GCE Instance Template and Managed Instance Group (MIG) provisioning |
| Week 3 | Cloud Load Balancing (External Application LB) and MIG Autoscaler configuration |
| Week 3 | Load testing execution using Grafana k6 (5 experiments) |
| Week 3 | Telemetry collection via Google Cloud Monitoring and Cloud Logging |
| Week 4 | Empirical cost analysis, latency curves, and infrastructure documentation |

**Deliverables owned:**
- `docs/deployment-architecture.md`
- `docs/exercise-plan.md`
- `infra/` directory (GCP `gcloud` provisioning scripts, startup scripts)
- `load-test/` directory (Grafana k6 test scripts)
- `results/` directory (experimental JSON outputs and telemetry logs)
- Proposed architecture diagrams

---

## 3. Shared Responsibilities

All three members share responsibility for the following core milestones:

| Activity | Participants | Timing |
|----------|-------------|--------|
| Cloud integration and endpoint verification | All members | Week 3 |
| Experimental benchmarking and load testing | All members | Week 3 |
| Statistical latency and throughput interpretation | All members | Week 3 |
| Final report peer review and editorial polish | All members | Week 4 |
| Final viva presentation and technical defense | All members (Equal 33% contribution) | Week 5 |
| Code and pull request reviews | All members | Continuous |
| Git repository maintenance and branch management | All members | Continuous |

---

## 4. Work Breakdown by Week

### Week 2 (Current) — Case Analysis & Planning

| Task | Owner | Status |
|------|-------|--------|
| Complete Myntra case-study research and auditing | Utsker | ✅ Complete |
| Document production architecture (Sourcerer, Bifrost, Aerospike) | Utsker | ✅ Complete |
| Design proposed GCP deployment architecture (MIG, Cloud LB) | Divyesh | ✅ Complete |
| Define application requirements, endpoints, and stateless model | Ritul | ✅ Complete |
| Author Week 3 experimental methodology (5 experiments) | Divyesh | ✅ Complete |
| Render architecture diagrams (Mermaid, SVG, 250-DPI PNG) | Utsker + Divyesh | ✅ Complete |
| Compile comprehensive Week 2 report (Markdown, DOCX, PDF) | All | ✅ Complete |
| Assign team responsibilities and risk matrix | All | ✅ Complete |

### Week 3 (Planned) — Implementation and Experiments

| Task | Owner | Dependencies |
|------|-------|-------------|
| Implement stateless Node.js microservice | Ritul | Application requirements (Week 2) |
| Create Dockerfile and test locally | Ritul | Microservice source code |
| Tag and push container image to `ghcr.io` | Ritul | Local Docker testing |
| Provision GCP infrastructure (VPC, Subnet, Firewall, Template) | Divyesh | Deployment architecture (Week 2) |
| Create MIG, Health Check, and External Application Load Balancer | Divyesh | GCP networking and template |
| Configure MIG Autoscaler (Target CPU 70%, Cool-down 300s) | Divyesh | Cloud Load Balancer and MIG |
| Deploy container to MIG instances via startup script | Divyesh + Ritul | GHCR image + MIG template |
| Author Grafana k6 load test scripts | Divyesh | Exercise plan (Week 2) |
| Execute Experiment 1: Baseline Performance (1 VM) | Divyesh | Deployed application |
| Execute Experiment 2: Horizontal Scaling (1 vs. 2 vs. 3 VMs) | Divyesh | Baseline metrics |
| Execute Experiment 3: Autoscaling Dynamics & Hysteresis | Divyesh | Active MIG autoscaler |
| Execute Experiment 4: Fault Tolerance & Health Probe Rerouting | Divyesh + Ritul | Multi-node MIG deployment |
| Execute Experiment 5: Economic Cloud Cost Comparison | Divyesh + Utsker | All experimental data + GCP billing |
| Aggregate and analyze empirical metrics | All | Experimental outputs |
| Author Week 3 findings summary | Utsker | Analysis |

### Week 4 (Planned) — Final Report

| Task | Owner | Dependencies |
|------|-------|-------------|
| Compile experimental data and telemetry graphs | Divyesh | Week 3 results |
| Write empirical results and statistical analysis section | Utsker | Compiled data |
| Generate publication-ready latency curves and charts | All | Results analysis |
| Author consolidated final report | Utsker | All project sections |
| Perform technical review and proofreading | All | Draft final report |
| Prepare submission package | All | Final report |

### Week 5 (Planned) — Viva & Demonstration

| Task | Owner |
|------|-------|
| Prepare individual sections for technical presentation | Each member |
| Conduct practice viva Q&A sessions | All |
| Prepare live demonstration of GCP autoscaling and k6 tests | Divyesh + Ritul |

---

## 5. Dependency Workflow

```text
Week 2 Research ──► Week 2 Report ──► Week 3 App Development (Node.js/Docker)
         │                                               │
         │                                               ▼
         └──────► Week 3 GCP Infrastructure ──────► Deployment on MIG
                                                         │
                                                         ▼
                                                 Load Testing (k6)
                                                         │
                                                         ▼
                                                 Experiments 1–5
                                                         │
                                                         ▼
                                                 Results Analysis
                                                         │
                                                         ▼
                                                 Week 4 Final Report
                                                         │
                                                         ▼
                                                 Week 5 Viva Defense
```

---

## 6. Risk Management Matrix

| Identified Risk | Probability | Severity | Owner | Proactive Mitigation Strategy |
|:---|:---:|:---:|:---:|:---|
| **Cloud Billing Incurrence Post-Trial** | Low | High | Divyesh | GCP provides a strict **zero auto-charge** guarantee; set a $10 Cloud Billing budget alert; terminate all resources immediately after testing. |
| **GCP Quota / Core Limits** | Low | Medium | Divyesh | `e2-medium` uses standard Compute Engine regional quotas (default: 24+ vCPUs in `asia-south1`), well within our 3-VM requirement (6 vCPUs). |
| **Autoscaling Fails to Trigger Under Load** | Medium | High | Divyesh | Calibrate algorithmic work in `/api/discount` to ensure 150 VUs drive single-node CPU > 70%; verify via Cloud Monitoring. |
| **Container Pull Stalls on Instance Boot** | Low | Medium | Ritul | Ensure GHCR container visibility is public; embed fallback health response in instance startup script. |
| **Client Test Runner Bandwidth Limits** | Low | Medium | Divyesh | Execute k6 from a dedicated local workstation or adjacent GCE micro-VM in the same region. |
| **Team Member Temporary Unavailability** | Low | Medium | All | Comprehensive cross-training; all infrastructure and deployment code committed to GitHub repository. |

---

## References

See [references.md](references.md) for full citations.
