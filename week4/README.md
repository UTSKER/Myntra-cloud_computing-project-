# Week 4: Final Consolidated Project Report Preparation & Submission

**Course:** Cloud Computing | **Group:** 33  
**Theme:** Scalability & High-Traffic Events (Myntra Case Study)  
**Deliverable:** Final Consolidated Project Report (Integrating Week 1 Survey, Week 2 Architecture, Week 3 Benchmarks & Analysis)

---

## 1. Directory Structure

```text
week4/
├── final-report.md                # Canonical markdown source of Final Project Report
└── README.md                      # Overview and document navigation

reports/
├── final-report.pdf               # Complete academic submission PDF with embedded figures & tables
├── final-report.docx              # Editable Word document
└── final-report.md                # Mirrored markdown source
```

---

## 2. Report Overview

The **Final Consolidated Project Report** synthesizes the complete capstone investigation into 8 comprehensive chapters:
1. **Chapter 1: Introduction & Case Background:** The Indian fashion e-commerce landscape, 15–20× flash surges during EORS/BFF events, and the failure of traditional fixed-capacity monoliths.
2. **Chapter 2: Myntra's Documented Cloud Architecture:** The 2020 migration to Microsoft Azure, Sourcerer CDC Debezium ingestion (4M to 42M events/min), Kafka messaging, Quicksilver Spark Streaming, Janus DAG orchestration, Bifrost II Delta Lake lakehouse (2.5 PB/day), Aerospike online feature store (0.8 ms lookup), and dual-region BCP/DR.
3. **Chapter 3: Theoretical Foundations & Queuing Models:** Mathematical proof of queuing delay divergence ($M/M/c$ queue), Little's Law, and anti-flapping hysteresis in cloud autoscaling.
4. **Chapter 4: Proposed Simulation Architecture (MyntraFlash):** Google Cloud Platform in `asia-south1` (Mumbai), Compute Engine Managed Instance Groups (MIG) with `e2-medium` nodes, External Application Load Balancer, and stateless Node.js microservice.
5. **Chapter 5: Experimental Methodology & Synthetic Calibration:** Grafana k6 testing harness, Keep-Alive connection pooling, and calibrated cryptographic proof-of-work.
6. **Chapter 6: Empirical Results & Discussion:**
   - **Experiment 1:** Baseline single-VM performance.
   - **Experiment 2:** Horizontal scaling linearity & the course-mandated **Response Time vs. Instance Count** plot (74.6% tail latency drop, 2.72× throughput speedup, 0.00% errors).
   - **Experiment 3:** Dynamic autoscaling dynamics & 300s hysteresis timeline.
   - **Experiment 4:** Fault tolerance failover (28.5s detection, 99.92% session continuity).
   - **Experiment 5:** Cloud economic analysis (41.8% daily operational cost reduction).
7. **Chapter 7: SLA Compliance & Industrial Verification:** 6-point SLA compliance matrix validating industry standards.
8. **Chapter 8: Conclusion, Limitations & Future Work:** Summary of engineering contributions and cloud scaling principles.

