# Myntra Cloud Case Study: Flash-Sale Scaling and Personalization

Cloud Computing course project, Group 33

## Case

Myntra, one of India's largest fashion e-commerce platforms. The study looks at how its technology moved from a fixed-capacity PHP + MySQL monolith, which failed under sale traffic, to a service-oriented, cloud-based platform with real-time data and personalization on Microsoft Azure.

For the practical laboratory simulation (**MyntraFlash**), the group deploys onto **Google Cloud Platform (GCP)** in `asia-south1` (Mumbai). GCP was chosen based on an audit of student billing models, leveraging **$300 USD in free trial credits over 90 days** with a strict zero auto-charge guarantee, eliminating college email domain verification barriers while delivering 100% architectural equivalence to enterprise cloud scaling patterns.

## Team

| Name | Roll No. | Role |
|---|---|---|
| Utsker Dhameliya | 202301083 | Research, Production Architecture & Case Study Lead |
| Ritul Patel | 202301086 | Application Development, API Design & Docker Packaging |
| Divyesh Vagh | 202301444 | Cloud Infrastructure, GCE MIG, Autoscaling & Load Testing |

## Repository structure

```text
.
├── README.md
├── week1/                 Sources found and case summary
│   └── week1.pdf
├── week2/                 Case analysis report and architecture diagrams
│   ├── week2-report.md    Week 2 report (Markdown source)
│   └── diagrams/
│       ├── production-architecture.mmd    Myntra production architecture (Mermaid)
│       ├── production-architecture.svg    Production architecture (Vector)
│       ├── production-architecture.png    Production architecture (250-DPI PNG)
│       ├── proposed-architecture.mmd      MyntraFlash GCP architecture (Mermaid)
│       ├── proposed-architecture.svg      Proposed GCP architecture (Vector)
│       └── proposed-architecture.png      Proposed GCP architecture (250-DPI PNG)
├── reports/               Compiled submissions
│   ├── week2-report.docx  Full formatted report with embedded diagrams
│   └── week2-report.pdf   16-page academic report submission
├── docs/                  Detailed technical documentation
│   ├── project-scope.md
│   ├── case-study-analysis.md
│   ├── case-study-architecture.md
│   ├── deployment-architecture.md
│   ├── exercise-plan.md
│   ├── team-roles.md
│   ├── references.md
│   └── diagrams/          Mirrored vector and raster diagrams
├── app/                   (Week 3) MyntraFlash application code
├── infra/                 (Week 3) GCP deployment scripts (gcloud CLI)
├── load-test/             (Week 3) Grafana k6 load testing scripts
├── results/               (Week 3) Experimental telemetry and results
├── week3/                 Exercise: app, load tests, results
└── week4/                 Final report
```

## Project plan

| Week | Focus | Deliverable | Status |
|---|---|---|---|
| 1 | Find primary sources, extract architecture, cost and outcome data | One-page summary of sources and salient points | ✅ Complete |
| 2 | Case analysis: architecture, problem, solution | 10-page report, exercise plan, team roles | ✅ Complete |
| 3 | Build the exercise, run experiments, collect measurements | Results added to the report | 🔄 In Progress |
| 4 | Report preparation | Final report submission | 📅 Planned |
| 5 | Project viva | Viva defense & demonstration | 📅 Planned |

## Week 1 summary

Sources are listed in the Week 1 report (`week1/week1.pdf`).

Key findings:
- EORS traffic spikes of 15–20× normal levels
- Enterprise cloud migration announced February 2020
- Order capacity grew from 12K/min (2019) to 20K/min (2020)
- Discount-service latency reduced from 150 ms to ~30 ms (5× speedup)
- Feature-store lookup latency reduced from 8.5 ms to 0.8 ms (10× speedup via Aerospike)
- Data platform served 2.5 PB/day and 65,000+ queries/day during BFF 2022
- 35% reduction in data infrastructure costs (Databricks partnership)

## Week 2 deliverables

The Week 2 submission includes:

### Comprehensive Reports
- **`reports/week2-report.pdf`** — 16-page official academic report with embedded 250-DPI architecture diagrams
- **`reports/week2-report.docx`** — Editable Word document with styled tables and figures
- **`week2/week2-report.md`** — Canonical markdown source

### Architecture Diagrams
- **Production Architecture** (`week2/diagrams/production-architecture.*`) — Conceptual reconstruction of Myntra's documented enterprise architecture (Sourcerer, Kafka, Quicksilver, Janus, Bifrost, Aerospike, BCP/DR)
- **Proposed Simulation Architecture** (`week2/diagrams/proposed-architecture.*`) — MyntraFlash simulation on Google Cloud Platform (`asia-south1`) with Compute Engine MIG, Cloud Load Balancing, and MIG Autoscaler

### Modular Documentation
- **`docs/case-study-analysis.md`** — Detailed Myntra case analysis with audited metrics and citations
- **`docs/case-study-architecture.md`** — Production architecture documentation
- **`docs/deployment-architecture.md`** — Proposed MyntraFlash deployment architecture on GCP with full `gcloud` provisioning script
- **`docs/exercise-plan.md`** — Week 3 experimental methodology (5 controlled experiments with latency, scaling, and cost)
- **`docs/team-roles.md`** — Team responsibility matrix, weekly timeline, and risk management
- **`docs/references.md`** — Complete bibliographic catalog with verified URLs
- **`docs/project-scope.md`** — Scope definition and deliverable roadmap

## Week 3 exercise (planned)

**MyntraFlash — Cloud-Based Scalable E-Commerce Simulation on GCP**

Compare a fixed-capacity deployment with an autoscaled deployment of a small web app under simulated flash-sale load in Google Cloud Platform (`asia-south1` Mumbai). Measure latency (p50, p95, p99), error rate, scaling behaviour, and cost.

### Planned experiments
1. Baseline performance (1 GCE VM, `e2-medium`)
2. Horizontal scaling comparison (1, 2, 3 GCE VMs)
3. Autoscaling behaviour & hysteresis (CPU-triggered target: 70%, 300s cool-down)
4. Fault tolerance & health probe rerouting (simulated container failure)
5. Economic cost analysis (fixed vs. elastic provisioning on GCP, covered by $300 free trial)

### Technology stack
| Component | Technology | Rationale |
|---|---|---|
| Cloud Provider | Google Cloud Platform (GCP) | $300 free trial (90 days); zero auto-charge; accessible without college email whitelisting |
| Cloud Region | `asia-south1` (Mumbai, India) | Local low-latency Indian datacenter |
| Backend | Node.js + Express | Lightweight, stateless HTTP microservice |
| Frontend | HTML, CSS, JavaScript | Responsive single-page interface |
| Container | Docker Engine (Ubuntu 22.04 LTS) | Identical runtime parity across instances |
| Infrastructure | GCE Managed Instance Groups (MIG) | Dynamic pool of identical compute instances (`e2-medium`) |
| Load Balancer | Google Cloud Load Balancing | External Application Load Balancer with HTTP health checks (`/health`) |
| Autoscaling | Compute Engine MIG Autoscaler | Reactive metric scaling (Target CPU: 70%, cool-down: 300s) |
| Monitoring | Google Cloud Monitoring & Logging | Native telemetry for CPU, instance count, and request latency |
| Load Testing | Grafana k6 | Scriptable load generator running staged flash-sale virtual user curves |
| Container Registry | GitHub Container Registry (`ghcr.io`) | OCI container registry |

## References

Sources are listed in the Week 1 summary, the Week 2 report and `docs/references.md`.
