# Project Scope

## Cloud Computing — Group 33

---

## Project Title

**Myntra — Cloud Scaling for Flash Sales and Personalization**

## Course

Cloud Computing

## Team

| Member | Roll No. |
|--------|----------|
| Utsker Dhameliya | 202301083 |
| Ritul Patel | 202301086 |
| Divyesh Vagh | 202301444 |

---

## Case Study

Myntra is one of India's largest fashion e-commerce platforms. This project studies how Myntra's technology evolved from a monolithic architecture to a distributed, cloud-based platform on Microsoft Azure to handle:

1. **Flash-sale traffic spikes** of 15–20× normal levels during events like EORS and BFF.
2. **Real-time personalization** through low-latency feature stores and ML-driven recommendations.

---

## Project Scope

### In Scope

- Analysis of Myntra's documented cloud architecture and engineering systems.
- Study of flash-sale scaling challenges and solutions.
- Study of data and personalization architecture (Sourcerer, Kafka, Bifrost, Quicksilver, Aerospike).
- Design and implementation of a scaled-down exercise (MyntraFlash) on Azure.
- Experimental measurement of latency, scaling behaviour and cost.
- Comparison of fixed vs. elastic infrastructure provisioning.

### Out of Scope

- Replication of Myntra's production architecture at scale.
- Implementation of real data pipelines (Kafka, Bifrost, etc.).
- Real machine-learning model training or deployment.
- Multi-region disaster recovery implementation.
- Real payment processing or user authentication.
- Production deployment or ongoing infrastructure maintenance.

---

## Deliverables

| Week | Deliverable |
|------|-------------|
| 1 | Source survey and key findings summary |
| 2 | 10-page case analysis report, architecture diagrams, exercise plan, team roles |
| 3 | MyntraFlash application, Azure deployment, experimental results |
| 4 | Final consolidated report |
| 5 | Project viva |

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| Cloud Provider | Microsoft Azure |
| Backend | Node.js + Express |
| Frontend | HTML, CSS, JavaScript |
| Containerization | Docker |
| Infrastructure | Azure VM Scale Set |
| Load Balancing | Azure Standard Load Balancer |
| Autoscaling | Azure Monitor Autoscale |
| Load Testing | Grafana k6 |
| Source Control | GitHub |
| Container Registry | GitHub Container Registry |

