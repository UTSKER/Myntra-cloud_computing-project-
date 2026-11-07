# Myntra Case Study Analysis

## Cloud Computing — Group 33 | Week 2 Deliverable

---

## 1. Company Background

Myntra is one of India's largest fashion e-commerce platforms, founded in 2007 and acquired by Flipkart in 2014 (subsequently part of the Walmart group). The platform serves tens of millions of customers across India, offering apparel, footwear, accessories and lifestyle products from thousands of brands [1].

Myntra's engineering challenges are shaped by two dominant workloads:

1. **Sustained daily traffic** — continuous browsing, search and checkout activity.
2. **Flash-sale mega-events** — periodic large-scale sales that produce extreme, short-duration traffic spikes.

The two most significant recurring events are the **End of Reason Sale (EORS)**, typically held in June and December, and the **Big Fashion Festival (BFF)**, held around October. These events have driven Myntra's need for elastic, fault-tolerant cloud infrastructure.

---

## 2. Flash-Sale Scaling Challenge

### 2.1 Traffic Characteristics

Myntra's EORS events generate traffic spikes of **15–20× normal levels** [P3]. This is not a gradual ramp-up; traffic surges occur within minutes of the sale opening, creating sudden demand that can overwhelm traditionally provisioned infrastructure.

Key reported metrics:

| Metric | Value | Source | Year |
|--------|-------|--------|------|
| EORS traffic multiplier | 15–20× normal | Myntra Engineering (BCP/DR blog) [P3] | 2020–2021 |
| Order-handling target | 12,000 orders/min | Myntra Engineering [P3] | 2019 |
| Order-handling capacity | 20,000 orders/min | Myntra Engineering [P3] | 2020 |
| BFF visits | ~460 million | Myntra reports | 2023 |
| BFF visits | ~627 million | Myntra reports | 2024 |

> **Note:** The order-handling figures represent planned capacity targets for specific EORS events and should not be interpreted as simultaneous real-time measurements.

### 2.2 Infrastructure Challenges

Before cloud migration, Myntra operated a monolithic PHP + MySQL architecture [README context]. This architecture presented several critical challenges during flash sales:

- **Fixed capacity provisioning**: Hardware sized for peak demand remained underutilized for the majority of the year.
- **Vertical scaling limits**: Single-server architectures reach physical resource ceilings.
- **Single points of failure**: Monolithic deployments lack redundancy.
- **Long provisioning cycles**: Physical or dedicated infrastructure cannot be deployed in minutes.
- **Cost inefficiency**: Peak-capacity provisioning multiplies infrastructure costs by the traffic spike ratio.

### 2.3 Performance Bottlenecks

The engineering blog posts reveal specific bottlenecks that Myntra addressed:

1. **Discount service latency**: The pricing/discount service experienced latencies of approximately **150 ms** under load, which was reduced to approximately **30 ms** through Redis read balancing and MongoDB fallback optimization [P2].

2. **Feature store lookup latency**: Machine-learning feature lookups took **8.5 ms**, reduced to **0.8 ms** after adopting Aerospike as the online feature store [V2].

3. **Event ingestion throughput**: The data platform needed to handle approximately **4 million events per minute** through Kafka-based pipelines [P4].

4. **Data serving scale**: During BFF 2022, Myntra's data platform served **2.5 PB/day** and handled **65,000+ queries/day** [P1].

---

## 3. Cloud Migration Analysis

### 3.1 Migration to Microsoft Azure

Myntra announced its migration to Microsoft Azure in **February 2020** [V1]. The migration was motivated by:

- **Elastic infrastructure**: The ability to scale compute resources up and down in response to demand, particularly for flash-sale events.
- **Managed services**: Reducing operational overhead through cloud-managed databases, monitoring and networking services.
- **Disaster recovery**: Leveraging Azure's multi-region capabilities for business continuity.
- **Global availability**: Azure's extensive region network supports Myntra's growth.

Microsoft reported that Myntra's EORS 2020 saw a **50% increase in orders** compared to the previous event, coinciding with the Azure migration [V1]. However, this improvement reflects multiple factors (platform growth, marketing, pandemic-driven e-commerce adoption) and should not be attributed solely to infrastructure changes.

### 3.2 High Availability and Disaster Recovery

Myntra's BCP/DR (Business Continuity Planning / Disaster Recovery) architecture, documented in their engineering blog [P3], employs:

- **Dual-region deployment**: Services are deployed across two Azure regions.
- **Data replication**: Critical databases and data stores are replicated between regions.
- **Failover mechanisms**: Traffic can be redirected to the secondary region during outages.
- **Regular DR drills**: The engineering team conducts periodic disaster-recovery exercises to validate failover procedures.

This multi-region approach ensures that even during a regional Azure outage, Myntra's platform can continue serving customers, which is critical during high-revenue flash-sale windows.

---

## 4. Scalability Mechanisms

Myntra employs several documented scalability mechanisms:

### 4.1 Horizontal Scaling

- **Service-oriented architecture**: Individual services (product, cart, search, recommendations) scale independently based on their specific load profiles.
- **Autoscaling**: Cloud resources scale automatically based on demand metrics (CPU, memory, request rate).
- **Kafka partition scaling**: Kafka cluster capacity is increased during EORS events to handle the surge in event volume, then scaled back afterward [P3].

### 4.2 Load Balancing and Traffic Management

- **Request distribution**: Load balancers distribute incoming traffic across multiple service instances.
- **Rate limiting**: Protects backend services from being overwhelmed during traffic spikes.
- **Circuit breakers**: Prevent cascading failures when downstream services become unresponsive.

### 4.3 Caching Strategy

The pricing architecture demonstrates Myntra's caching approach [P2]:

- **Redis cluster with read balancing**: Primary cache layer for discount data, distributing read load across replicas.
- **MongoDB as fallback**: Secondary data store providing persistence and serving as a fallback when Redis cannot serve the request.
- **Result**: Latency reduction from ~150 ms to ~30 ms for the discount service.

---

## 5. Cost Optimization

### 5.1 Elastic vs. Fixed Provisioning

The fundamental cost optimization is the shift from fixed-capacity provisioning to elastic scaling:

| Approach | Advantage | Disadvantage |
|----------|-----------|--------------|
| Fixed peak capacity | No scaling delay | High cost during normal periods |
| Elastic scaling | Pay for actual usage | Requires scaling automation; brief scaling delays |

### 5.2 Reported Cost Improvements

- **Data infrastructure**: Databricks reports **35% lower data infrastructure costs** for Myntra's data platform workloads [V3].
- **Real-time pipelines**: **25% faster real-time pipelines**, reducing compute time and associated costs [V3].
- **Ingestion costs**: Myntra's 2024 Data + AI Summit presentation reported **over 35% lower ingestion operating costs** [V3].

> **Important:** These figures apply to specific data-platform workloads and should not be extrapolated to Myntra's total cloud expenditure.

---

## 6. Key Findings Summary

| Domain | Key Finding | Source |
|--------|-------------|--------|
| Flash-sale traffic | 15–20× normal during EORS | [P3] |
| Cloud platform | Migrated to Microsoft Azure in 2020 | [V1] |
| Disaster recovery | Dual-region with data replication | [P3] |
| Discount latency | Reduced from 150 ms to ~30 ms | [P2] |
| Feature lookup | Reduced from 8.5 ms to 0.8 ms (Aerospike) | [V2] |
| Event throughput | ~4 million events/min via Kafka | [P4] |
| Data serving | 2.5 PB/day during BFF 2022 | [P1] |
| Cost savings | 35% lower data infrastructure costs | [V3] |
| Order capacity | 20,000 orders/min capacity (2020) | [P3] |

---

## References

References use the identifiers established in the Week 1 report. Full citations are provided in [references.md](references.md).

- **[P1]** Myntra Engineering — Data Platform blog post (Bifrost, Quicksilver, data serving metrics)
- **[P2]** Myntra Engineering — Pricing System blog post (discount-service optimization)
- **[P3]** Myntra Engineering — BCP/DR blog post (EORS traffic, disaster recovery, scaling)
- **[P4]** Myntra Engineering — Sourcerer blog post (Debezium, Kafka, event ingestion)
- **[V1]** Microsoft — Azure Migration announcement / case study (February 2020)
- **[V2]** Aerospike — Myntra customer case study (feature store performance)
- **[V3]** Databricks — Myntra case study / Data + AI Summit presentation (cost optimization)

