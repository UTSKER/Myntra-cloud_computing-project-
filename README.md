# Myntra Cloud Case Study: Flash-Sale Scaling and Personalization

Cloud Computing course project, Group 33

## Case

Myntra, one of India's largest fashion e-commerce platforms. The study looks at how its technology moved from a fixed-capacity PHP + MySQL monolith, which failed under sale traffic, to a service-oriented, cloud-based platform with real-time data and personalization on Microsoft Azure.

## Team

| Name | Roll No. | Role |
|---|---|---|
| Utsker Dhameliya | 202301083 | Research and Architecture |
| Ritul Patel | 202301086 | Application Development |
| Divyesh Vagh | 202301444 | Cloud Infrastructure |

## Repository structure

```
.
├── README.md
├── week1/                 Sources found and case summary
│   └── week1.pdf
├── week2/                 Case analysis report and architecture diagrams
│   ├── week2-report.md    Week 2 report (Markdown source)
│   └── diagrams/
│       ├── production-architecture.mmd    Myntra production architecture (Mermaid)
│       └── proposed-architecture.mmd      MyntraFlash exercise architecture (Mermaid)
├── docs/                  Detailed documentation
│   ├── project-scope.md
│   ├── case-study-analysis.md
│   ├── case-study-architecture.md
│   ├── deployment-architecture.md
│   ├── exercise-plan.md
│   ├── team-roles.md
│   └── references.md
├── app/                   (Week 3) MyntraFlash application code
├── infra/                 (Week 3) Azure deployment scripts
├── load-test/             (Week 3) k6 load testing scripts
├── results/               (Week 3) Experimental results
├── week3/                 Exercise: app, load tests, results
└── week4/                 Final report
```

## Project plan

| Week | Focus | Deliverable |
|---|---|---|
| 1 | Find primary sources, extract architecture, cost and outcome data | One-page summary of sources and salient points |
| 2 | Case analysis: architecture, problem, solution | 10-page report, exercise plan, team roles |
| 3 | Build the exercise, run experiments, collect measurements | Results added to the report |
| 4 | Report preparation | Final report submission |
| 5 | Project viva | Viva |

## Week 1 summary

Sources are listed in the Week 1 report (`week1/week1.pdf`).

Key findings:
- EORS traffic spikes of 15–20× normal levels
- Azure migration announced February 2020
- Order capacity grew from 12K/min (2019) to 20K/min (2020)
- Discount-service latency reduced from 150 ms to ~30 ms
- Feature-store lookup latency reduced from 8.5 ms to 0.8 ms
- Data platform served 2.5 PB/day during BFF 2022
- 35% reduction in data infrastructure costs (Databricks partnership)

## Week 2 deliverables (NEW)

The Week 2 submission includes:

### Report
- **`week2/week2-report.md`** — 10-page case analysis report covering:
  - Introduction and project motivation
  - Problem statement (flash-sale traffic challenges)
  - Research findings with verified metrics and sources
  - Myntra's cloud architecture (Azure migration, multi-region DR)
  - Data and personalization architecture (Sourcerer, Kafka, Bifrost, Quicksilver, Janus, Aerospike)
  - Technical case analysis (scalability, caching, cost optimization)
  - Proposed MyntraFlash solution and architecture
  - Exercise and experimental plan (5 experiments)
  - Team roles and project execution plan
  - Expected outcomes and conclusion

### Architecture diagrams
- **Production architecture** (`week2/diagrams/production-architecture.mmd`) — Conceptual reconstruction of Myntra's documented architecture
- **Proposed architecture** (`week2/diagrams/proposed-architecture.mmd`) — MyntraFlash exercise deployment on Azure

### Documentation
- **`docs/case-study-analysis.md`** — Detailed Myntra case analysis with verified metrics
- **`docs/case-study-architecture.md`** — Production architecture documentation
- **`docs/deployment-architecture.md`** — Proposed MyntraFlash deployment architecture
- **`docs/exercise-plan.md`** — Week 3 experimental methodology (5 experiments)
- **`docs/team-roles.md`** — Team responsibilities and work breakdown
- **`docs/references.md`** — Complete reference list with sources and URLs
- **`docs/project-scope.md`** — Project scope definition

## Week 3 exercise (planned)

**MyntraFlash — Cloud-Based Scalable E-Commerce Simulation**

Compare a fixed-capacity deployment with an autoscaled deployment of a small web app under a simulated flash-sale load. Measure latency (p50, p95, p99), error rate, scaling behaviour, and cost.

### Planned experiments
1. Baseline performance (1 VM)
2. Horizontal scaling comparison (1, 2, 3 VMs)
3. Autoscaling behaviour (CPU-triggered)
4. Fault tolerance (health probe failover)
5. Cost analysis (fixed vs. elastic provisioning)

### Technology stack
| Component | Technology |
|---|---|
| Cloud | Microsoft Azure |
| Backend | Node.js + Express |
| Frontend | HTML, CSS, JavaScript |
| Container | Docker |
| Infrastructure | Azure VM Scale Set |
| Load balancer | Azure Standard Load Balancer |
| Autoscaling | Azure Monitor Autoscale |
| Load testing | Grafana k6 |

## References

Sources are listed in the Week 1 summary, the Week 2 report and `docs/references.md`.
