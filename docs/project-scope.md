# Project Scope

## Cloud Computing — Group 33

---

## Project Title

**Myntra — Cloud Scaling for Flash Sales and Personalization**

## Course

Cloud Computing

## Team

| Member | Roll No. | Primary Role |
|--------|----------|--------------|
| Utsker Dhameliya | 202301083 | Research, Production Architecture & Case Study Lead |
| Ritul Patel | 202301086 | Application Development, API Design & Docker Packaging |
| Divyesh Vagh | 202301444 | Cloud Infrastructure, GCE MIG, Autoscaling & Load Testing |

---

## Case Study

Myntra is one of India's largest fashion e-commerce platforms. This project studies how Myntra's technology evolved from a monolithic architecture to a distributed, cloud-based platform on Microsoft Azure to handle:

1. **Flash-sale traffic spikes** of 15–20× normal levels during events like EORS and BFF.
2. **Real-time personalization** through low-latency feature stores and ML-driven recommendations.

For the university laboratory simulation (**MyntraFlash**), the group implements cloud elasticity using **Google Cloud Platform (GCP)** within the `asia-south1` (Mumbai) region. GCP was chosen following an evaluation of student billing and access models, taking advantage of **$300 USD in free trial credits over 90 days** with a strict zero auto-charge guarantee, eliminating college email domain verification barriers while delivering identical enterprise scaling patterns (Managed Instance Groups, Cloud Load Balancing, and metric-based autoscaling).

---

## Project Scope

### In Scope

- Comprehensive analysis of Myntra's documented cloud architecture and engineering systems.
- Study of flash-sale scaling challenges, performance bottlenecks, and caching solutions.
- Study of data and personalization architecture (Sourcerer CDC, Kafka, Bifrost Delta Lake lakehouse, Quicksilver Spark streaming, Aerospike feature store).
- Design and deployment of a scaled-down practical simulation (MyntraFlash) on Google Cloud Platform.
- Experimental measurement of latency (p50, p95, p99), scaling behaviour, and cost.
- Direct empirical comparison of fixed-capacity vs. elastic infrastructure provisioning.

### Out of Scope

- Production-scale replication of thousands of microservices.
- Full-scale multi-petabyte data lakehouse deployment.
- Production payment gateways or live user banking transactions.
- Active multi-region disaster recovery deployment (simulated single-region high availability).
- Long-term infrastructure hosting beyond course duration.

---

## Deliverables Roadmap

| Week | Deliverable Focus | Status / Target |
|:---:|:---|:---:|
| **Week 1** | Source survey, primary data extraction, and preliminary findings summary | ✅ Complete (`week1/week1.pdf`) |
| **Week 2** | Comprehensive 10-page case analysis report, architecture diagrams, exercise plan, and team roles | ✅ Complete (`reports/`, `docs/`) |
| **Week 3** | MyntraFlash application, GCP infrastructure provisioning, load testing, and empirical results | 🔄 Ready for execution |
| **Week 4** | Final consolidated project report incorporating measured results | 📅 Planned |
| **Week 5** | Project viva and technical defense | 📅 Planned |

---

## Laboratory Exercise Technology Stack (MyntraFlash)

| Component | Technology | Rationale & Architectural Purpose |
|:---|:---|:---|
| **Cloud Provider** | Google Cloud Platform (GCP) | $300 free trial (90 days); zero auto-charge guarantee; no college email restriction |
| **Cloud Region** | `asia-south1` (Mumbai, India) | Local Indian region minimizing network latency during client load testing |
| **Compute Infrastructure** | GCE Managed Instance Groups (MIG) | Pool of identical compute nodes supporting dynamic horizontal expansion |
| **Machine Type** | `e2-medium` (2 vCPU, 4 GB RAM) | Balanced compute and memory capacity for containerized Node.js workloads |
| **Backend Service** | Node.js + Express | Lightweight, event-driven, stateless HTTP microservice |
| **Frontend Interface** | HTML, CSS, JavaScript | Single-page responsive store interface |
| **Containerization** | Docker Engine (Ubuntu 22.04 LTS) | Consistent deployment across instances via automated startup scripts |
| **Traffic Management** | Google Cloud Load Balancing | External Application Load Balancer with HTTP health checks (`/health`) |
| **Autoscaling Engine** | Compute Engine MIG Autoscaler | CPU-based scaling rules (Scale-out > 70%, Scale-in < 30%, 300s cool-down) |
| **Cloud Telemetry** | Google Cloud Monitoring & Logging | Native platform metrics capturing CPU utilization, request count, and latency |
| **Synthetic Load Testing** | Grafana k6 | Scriptable, open-source load testing tool generating staged flash-sale traffic curves |
| **Source Control** | GitHub | Version control repository (`myntra-cloud-scaling-project`) |
| **Container Registry** | GitHub Container Registry (`ghcr.io`) | OCI-compliant container image registry |
