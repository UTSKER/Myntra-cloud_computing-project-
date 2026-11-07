# References

## Cloud Computing — Group 33 | Week 2 Deliverable

---

## Primary Sources — Myntra Engineering

| ID | Citation | URL | Date |
|----|----------|-----|------|
| [P1] | Sri Nandhini, "How Myntra's Data Platform drives a seamless shopping experience for customers during its marquee events," Myntra Engineering on Medium (Bifrost data serving at BFF 2022: 2.5 PB/day, 65,000+ queries/day, 18.8B day-1 events) | https://medium.com/myntra-engineering | May 25, 2023 |
| [P1b] | Abhinav Dangi, "Bifrost: Data Serving Layer at Myntra," Myntra Engineering on Medium (Bifrost architecture: Trino + Delta Lake, decoupled compute/storage) | https://medium.com/myntra-engineering | Jan 17, 2024 |
| [P2] | Nikhil Anand, Suraj Rajan, Arnav, "Optimizing Myntra's Pricing System for Serving Millions of Traffic with 30ms Latency," Myntra Engineering on Medium (Discount-service latency 150 ms → ≤30 ms, Redis read balancing, in-memory rule evaluation) | https://medium.com/myntra-engineering | Feb 6, 2023 |
| [P2b] | Akshat Pandey, "The Next Chapter of Coupon's Scaling," Myntra Engineering on Medium (Multi-product listing batch optimization, parallel discount evaluation) | https://medium.com/myntra-engineering | 2023 |
| [P3] | Sanjeev Kumar Dangi, "Myntra's BCP/DR Journey," Myntra Engineering on Medium (EORS traffic spikes 15–20×, dual-region DR, 200+ SCM microservices migrated, Active-Active Airbus messaging) | https://medium.com/myntra-engineering | Sep 1, 2021 |
| [P4] | Abhinav Dangi, "Sourcerer: Data Ingestion at Myntra" and "Sourcerer: MySQL Ingestion at Scale," Myntra Engineering on Medium (Debezium CDC, Kafka Connect, dedicated analytical read-slaves, Schema Registry) | https://medium.com/myntra-engineering | Sep 2021, Mar 2022 |
| [P5] | Aditya S., "Quicksilver: Near Real-Time Platform at Myntra," Myntra Engineering on Medium (Tens of billions of events/day, second-level latency, Spark Streaming + Kafka) | https://medium.com/myntra-engineering | Nov 10, 2022 |
| [P6] | Kedar Gupte, "Janus: Data processing framework at Myntra," Myntra Engineering on Medium (Multi-engine CI/CD, DAG dependency management, batch + streaming support) | https://medium.com/myntra-engineering | Nov 18, 2022 |
| [P7] | Karshit Jaiswal, "Realtime Big Data Ingestion with Meterial," Myntra Engineering on Medium (~4M events/min baseline, up to 42M events/min at peak EORS, Golang event collectors, MemSQL/SingleStore) | https://medium.com/myntra-engineering | 2020 |
| [P8] | Parul Agnihotri, "Cart migration from Cassandra to Mongo for an enhanced shopping experience," Myntra Engineering on Medium (Cart read latency >250 ms → <25 ms, 40% infrastructure reduction) | https://medium.com/myntra-engineering | 2021 |

---

## Vendor and Partner Sources

| ID | Citation | URL | Date |
|----|----------|-----|------|
| [V1] | Microsoft, "Myntra partners with Microsoft to accelerate its digital transformation" (news release) and "India's leading fashion e-tailer Myntra scales new heights with Azure and GenAI" (customer story). Azure migration announced February 2020; 50% higher EORS orders reported. | https://customers.microsoft.com/en-us/story/myntra-retailers-azure | Feb 20, 2020 |
| [V2] | Aerospike, "Myntra Customer Case Study" (Feature-store lookup latency 8.5 ms → 0.8 ms; up to 500,000 operations/sec) | https://aerospike.com/customers/myntra/ | 2022–2023 |
| [V3] | Databricks, "Myntra Case Study / Data + AI Summit 2024" (35% lower data infrastructure costs; 25% faster real-time pipelines; >35% lower ingestion operating costs) | https://www.databricks.com/customers/myntra | 2023–2024 |

---

## Azure Technical Documentation

| ID | Citation | URL |
|----|----------|-----|
| [A1] | Microsoft Learn, "Azure Virtual Machine Scale Sets Overview" | https://learn.microsoft.com/en-us/azure/virtual-machine-scale-sets/overview |
| [A2] | Microsoft Learn, "Azure Monitor Autoscale Overview" | https://learn.microsoft.com/en-us/azure/azure-monitor/autoscale/autoscale-overview |
| [A3] | Microsoft Learn, "Azure Standard Load Balancer Overview" | https://learn.microsoft.com/en-us/azure/load-balancer/load-balancer-overview |
| [A4] | Microsoft Learn, "Azure VM Scale Sets — Automatic Instance Repairs" | https://learn.microsoft.com/en-us/azure/virtual-machine-scale-sets/virtual-machine-scale-sets-automatic-instance-repairs |
| [A5] | Microsoft Learn, "Azure Load Balancer Health Probes" | https://learn.microsoft.com/en-us/azure/load-balancer/load-balancer-custom-probe-overview |
| [A6] | Microsoft Azure, "Pricing Calculator" | https://azure.microsoft.com/en-us/pricing/calculator/ |
| [A7] | Microsoft Learn, "Azure Load Balancer Distribution Mode" | https://learn.microsoft.com/en-us/azure/load-balancer/load-balancer-distribution-mode-how-to |

---

## Load Testing

| ID | Citation | URL |
|----|----------|-----|
| [L1] | Grafana k6, "Documentation — Using k6 / Metrics" | https://k6.io/docs/using-k6/metrics/ |
| [L2] | Grafana k6, "Documentation — Using k6 / Scenarios / Stages" | https://k6.io/docs/using-k6/scenarios/ |

---

## Academic and Industry References

| ID | Citation | URL |
|----|----------|-----|
| [R1] | Patel, P., et al., "Ananta: Cloud Scale Software Load Balancing," ACM SIGCOMM Computer Communication Review, 2013 | ACM Digital Library |
| [R2] | Cloud Native Computing Foundation (CNCF), "Best Practices for Cloud Native Autoscaling," 2023 | https://www.cncf.io/ |

---

## Notes on Source Reliability

1. **Myntra Engineering blog posts** [P1]–[P4] are first-party technical publications by Myntra's engineering teams. They describe internal systems and are considered primary sources.

2. **Vendor case studies** [V1]–[V3] are published by Myntra's technology partners (Microsoft, Aerospike, Databricks). While generally reliable, they serve a marketing purpose and may emphasize favourable outcomes.

3. **Azure documentation** [A1]–[A7] is official Microsoft technical documentation for the Azure services used in our proposed architecture.

4. All metrics cited in this project are attributed to their original source with publication dates. Metrics from different years and workloads are **not** combined or presented as simultaneous measurements.

5. Where a specific claim could not be independently verified, it is qualified with the source attribution and context in which it was reported.
