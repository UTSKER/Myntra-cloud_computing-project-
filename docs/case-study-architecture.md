# Myntra Production Architecture — Case Study

## Cloud Computing — Group 33 | Week 2 Deliverable

---

> **Label:** Conceptual reconstruction of publicly documented Myntra architecture.
>
> This diagram and description represent a **conceptual reconstruction** based on publicly available engineering blog posts, partner case studies and conference presentations. It is **not** an official or complete Myntra infrastructure diagram.

---

## 1. Architecture Overview

Myntra's production architecture, as documented across multiple engineering publications, consists of several interconnected layers:

1. **Traffic Management & Application Layer** — Customer-facing services.
2. **Pricing & Discount Layer** — Low-latency discount fulfilment.
3. **Event Ingestion Layer** — Real-time capture of user and system events.
4. **Data Processing Layer** — Near-real-time and batch processing.
5. **Data Lakehouse Layer** — Unified analytical data platform.
6. **Personalization & ML Layer** — Feature stores and recommendation models.
7. **Disaster Recovery** — Multi-region resilience.

---

## 2. Application & Business Services

Myntra operates a **service-oriented architecture** where business capabilities are decomposed into independent services. Documented services include:

- **Product Service**: Manages the product catalogue, inventory and product metadata.
- **Cart & Order Service**: Handles shopping cart operations and order processing (capacity: 20,000 orders/min during EORS 2020) [P3].
- **Search Service**: Product search and filtering.
- **User Service**: Customer account management and session handling.
- **API Gateway**: Routes requests to appropriate backend services and handles cross-cutting concerns.

These services are deployed on **Microsoft Azure** [V1] and can scale independently based on demand.

---

## 3. Pricing and Discount Architecture

The pricing architecture is one of the most thoroughly documented subsystems [P2].

### Components

| Component | Role |
|-----------|------|
| **Discount Fulfilment Service** | Computes and serves discount/pricing data for products |
| **Redis Cluster** | Primary cache with read-balancing across replicas |
| **MongoDB** | Persistent store and fallback for discount data |

### Data Flow

1. Discount data is written to MongoDB as the source of truth.
2. Data is cached in Redis for low-latency reads.
3. The Discount Fulfilment Service reads from Redis (primary path) with MongoDB fallback.
4. Read load is balanced across Redis replicas to prevent hotspots.

### Performance

- **Before optimization**: ~150 ms average latency.
- **After optimization**: ~30 ms average latency.
- **Technique**: Redis read balancing distributes read queries across multiple replicas rather than directing all reads to a single primary node.

---

## 4. Event Ingestion — Sourcerer

Sourcerer is Myntra's data ingestion platform, documented in their engineering blog [P4].

### Components

| Component | Role |
|-----------|------|
| **Debezium** | Change Data Capture (CDC) — captures database changes as events |
| **Sourcerer** | Ingestion orchestrator — manages Debezium connectors and routes events |
| **Apache Kafka** | Distributed event streaming platform — message bus |

### How It Works

1. **Debezium** monitors database transaction logs (e.g., MySQL binlogs) and captures INSERT, UPDATE and DELETE operations as structured events.
2. **Sourcerer** manages the lifecycle of Debezium connectors, handles schema evolution and routes captured events to appropriate Kafka topics.
3. **Kafka** serves as the central event bus, handling approximately **4 million events per minute** [P4].

### Significance

- Enables real-time data integration without polling databases — replacing legacy batch ETL (Pentaho) that suffered from high latency and brittle `last_modified_timestamp` dependencies.
- Uses **dedicated analytical read-slaves** — MySQL read replicas spun up exclusively for binlog extraction, ensuring zero resource contention on production write masters.
- Events are serialized in **Apache Avro** format with a central **Schema Registry** enforcing compatibility.
- Decouples data producers from consumers.
- Supports at-least-once delivery semantics.
- Scales horizontally by adding Kafka partitions during peak events.
- At peak EORS events, the ingestion pipeline scales to handle up to **42 million events per minute** [P7].

---

## 5. Data Processing — Quicksilver and Janus

### 5.1 Quicksilver

Quicksilver is Myntra's **near-real-time (NRT) processing** platform, documented by Aditya S. in "Quicksilver: Near Real-Time Platform at Myntra" (November 2022) [P5]. It consumes events from Kafka and performs:

- **Stateful stream processing** using Apache Spark Streaming, supporting windows spanning days to months across multiple business domains (users, products, logistics).
- In-session hyper-personalization — computing behavioral features within seconds of customer interactions to adjust search rankings, homepages and recommendations dynamically.
- Real-time aggregation for dashboards and monitoring.

**Scale:** Quicksilver processes **tens of billions of events daily** (tens of millions per minute) with end-to-end data freshness latencies on the order of a few seconds [P5].

Quicksilver is orchestrated by Janus and integrates with internal aggregation services and low-latency feature stores (Redis/Aerospike).

### 5.2 Janus

Janus is Myntra's **data processing framework**, documented by Kedar Gupte in "Janus: Data processing framework at Myntra" (November 2022) [P6]. Based on this publication, Janus provides:

- **Low-code configuration generation** and single-pane CI/CD deployment across multi-engine targets (Spark batch and streaming).
- **Directed Acyclic Graph (DAG) dependency management** across dataset depth and breadth, preventing cascade failures and eliminating costly data backfills.
- **Code packaging and dependency management** for data scientists and data engineers.
- Extension from standard batch processing to support **near-real-time streaming jobs** in Quicksilver.

---

## 6. Data Lakehouse — Bifrost

Bifrost is Myntra's **unified data lakehouse** platform, documented by Abhinav Dangi in "Bifrost: Data Serving Layer at Myntra" (January 2024) [P1b].

### Purpose

Bifrost evolved through multiple phases:

- **Phase 3 (Bifrost)**: Decoupled storage and compute using **Trino** (distributed SQL engine) over data lake storage, with **Apache Superset** providing dashboard visualization. Addressed transactional/mutable datasets (orders, customer facts) using Apache Hive ACID alongside immutable clickstreams.
- **Phase 4 (Bifrost II — Lakehouse Transition)**: Replaced Hive ACID with **Databricks Delta Lake** to overcome asynchronous file-locking failures, eliminate small-file problems and enable robust ACID semantics with multi-version concurrency control (MVCC). Uses a **Medallion architecture** (Bronze ingestion → Silver cleaned/joined → Gold aggregated feature tables).

### Scale

During BFF 2022, the data platform powered by Bifrost reported:

- **2.5 PB/day** of data serving [P1].
- **65,000+ analytical queries/day** [P1].

### Role in Architecture

Bifrost serves as the central analytical store, receiving processed data from Quicksilver and Janus, and providing data to:

- Analytics and reporting teams.
- Machine-learning model training pipelines.
- The offline feature store.

---

## 7. Personalization — Feature Store and Recommendations

### 7.1 Feature Store Architecture

Myntra uses a **dual-layer feature store** for machine-learning workloads:

| Layer | Technology | Purpose | Latency |
|-------|------------|---------|---------|
| **Online store** | Aerospike | Real-time feature serving for live recommendations | ~0.8 ms [V2] |
| **Offline store** | Data lakehouse (Bifrost) | Batch feature computation and model training | Batch |

### 7.2 Aerospike Performance

The Aerospike deployment, documented in the Aerospike customer case study [V2]:

- Reduced feature-lookup latency from **8.5 ms to 0.8 ms**.
- Supports up to **500,000 operations per second**.
- Provides the low-latency access needed for real-time ML inference during page loads.

### 7.3 Recommendation System

Myntra's recommendation engine:

1. Captures **clickstream and behavioral data** (browsing patterns, search queries, cart actions, purchase history).
2. Processes events through **Kafka → Quicksilver** for real-time feature updates.
3. Retrieves pre-computed features from the **Aerospike online feature store**.
4. Applies **ML models** to rank products, personalize homepage widgets and generate recommendations.
5. Serves personalized results with latency budgets suitable for real-time page rendering.

---

## 8. Disaster Recovery Architecture

Myntra's BCP/DR design, documented by Sanjeev Kumar Dangi in "Myntra's BCP/DR Journey" (September 2021) [P3]:

### Design Principles

- **Dual-region deployment**: Services run in two Azure regions — Region A (primary, handling 100% of live production traffic) and Region B (disaster recovery, also serving live workloads).
- **Active-Active messaging**: Myntra's internal messaging layer, **Airbus** (built on Kafka), operates in an Active-Active multi-region mode with automated topic replication between regions [P3].
- **Data replication**: Critical databases and caches are replicated across regions. Database schemas originally co-hosted on shared VMs were decoupled and isolated into dedicated database instances for granular cross-region replication.
- **Traffic management**: Azure Traffic Manager or equivalent directs traffic to the healthy region.
- **Regular DR drills**: The team validates failover procedures periodically.
- **SCM migration**: As Phase 1 of BCP/DR, Myntra migrated **over 200 SCM (Supply Chain Management) microservices** to run live production traffic from Region B, thoroughly testing cross-region deployment tooling and utilizing reserved DR capacity [P3].
- **Isolated regional telemetry**: Observability stacks (logging, error tracking) are deployed as disjoint, isolated stacks per region to avoid cross-region failure coupling [P3].

### Flash-Sale Resilience

During EORS and BFF events, the DR architecture provides:

- Protection against regional outages during revenue-critical windows.
- Capacity to absorb traffic if one region degrades.
- Confidence to scale aggressively knowing that failover is available.

---

## 9. Architecture Diagram

The Mermaid source for the production architecture diagram is located at:

📄 [`week2/diagrams/production-architecture.mmd`](../week2/diagrams/production-architecture.mmd)

### Diagram Key

| Color | Layer |
|-------|-------|
| Red tones | Customer / User layer |
| Blue tones | Application services (Azure) |
| Orange tones | Pricing, caching (Redis, MongoDB) |
| Green tones | Event ingestion (Kafka, Debezium, Sourcerer) |
| Purple tones | ML / Personalization (Feature Store, Aerospike) |
| Grey tones | Disaster recovery |

---

## 10. Component Publication Timeline

Understanding when each component was documented helps avoid treating different architectural versions as simultaneous:

| Component | Primary Source | Approximate Date |
|-----------|---------------|-------------------|
| Azure migration | Microsoft announcement [V1] | February 2020 |
| BCP/DR, EORS scaling | Myntra Engineering [P3] | 2020–2021 |
| Sourcerer / Debezium | Myntra Engineering [P4] | 2019–2020 |
| Pricing optimization | Myntra Engineering [P2] | 2020–2021 |
| Bifrost, Quicksilver | Myntra Engineering [P1] | 2022–2023 |
| Aerospike feature store | Aerospike case study [V2] | 2022–2023 |
| Data cost optimization | Databricks case study [V3] | 2023–2024 |

> **Important:** These components were documented at different times and may represent different evolutionary stages of Myntra's architecture. They should not all be assumed to be part of a single, simultaneous deployment.

---

## References

See [references.md](references.md) for full citations.
