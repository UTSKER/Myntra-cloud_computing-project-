# Team Roles and Responsibilities

## Cloud Computing — Group 33 | Week 2 Deliverable

---

## 1. Team Members

| Member | Roll No. | Primary Role |
|--------|----------|--------------|
| Utsker Dhameliya | 202301083 | Research and Architecture |
| Ritul Patel | 202301086 | Application Development |
| Divyesh Vagh | 202301444 | Cloud Infrastructure |

---

## 2. Individual Responsibilities

### Member 1 — Utsker Dhameliya (Research and Architecture)

| Week | Responsibility |
|------|---------------|
| Week 2 | Myntra case-study research and source verification |
| Week 2 | Production architecture documentation and diagram |
| Week 2 | Week 2 report coordination and writing |
| Week 3 | Research validation against experimental results |
| Week 3 | Architecture comparison (Myntra vs. exercise) |
| Week 4 | Final report compilation and review |

**Deliverables owned:**
- `docs/case-study-analysis.md`
- `docs/case-study-architecture.md`
- `docs/references.md`
- Production architecture diagram

---

### Member 2 — Ritul Patel (Application Development)

| Week | Responsibility |
|------|---------------|
| Week 2 | Application requirements and API design |
| Week 2 | Node.js backend architecture planning |
| Week 2 | Frontend design |
| Week 3 | Node.js + Express implementation |
| Week 3 | HTML/CSS/JS frontend implementation |
| Week 3 | Dockerfile creation and container testing |
| Week 3 | Push container image to GitHub Container Registry |
| Week 4 | Application documentation |

**Deliverables owned:**
- `app/` directory (all application code)
- `Dockerfile`
- Application endpoint documentation

---

### Member 3 — Divyesh Vagh (Cloud Infrastructure)

| Week | Responsibility |
|------|---------------|
| Week 2 | Azure architecture design |
| Week 2 | Deployment architecture diagram |
| Week 2 | Exercise and experimental plan |
| Week 3 | Azure resource provisioning (Resource Group, VNet, VMSS, LB) |
| Week 3 | Autoscaling configuration |
| Week 3 | Load testing (k6 scripts and execution) |
| Week 3 | Metrics collection and monitoring |
| Week 4 | Cost analysis and infrastructure documentation |

**Deliverables owned:**
- `docs/deployment-architecture.md`
- `docs/exercise-plan.md`
- `infra/` directory (deployment scripts, cloud-init)
- `load-test/` directory (k6 scripts)
- `results/` directory (experimental data)
- Proposed architecture diagram

---

## 3. Shared Responsibilities

All three members share responsibility for the following activities:

| Activity | Participants | Timing |
|----------|-------------|--------|
| Integration testing | All members | Week 3 |
| Performance analysis | All members | Week 3 |
| Results interpretation | All members | Week 3 |
| Final report review | All members | Week 4 |
| Viva preparation | All members | Week 5 |
| Code review | All members | Week 3 |
| Git repository maintenance | All members | Ongoing |

---

## 4. Work Breakdown by Week

### Week 2 (Current) — Case Analysis

| Task | Owner | Status |
|------|-------|--------|
| Complete Myntra case-study research | Utsker | ✅ Complete |
| Document production architecture | Utsker | ✅ Complete |
| Design proposed deployment architecture | Divyesh | ✅ Complete |
| Define application requirements and endpoints | Ritul | ✅ Complete |
| Write experimental plan | Divyesh | ✅ Complete |
| Create architecture diagrams | Utsker + Divyesh | ✅ Complete |
| Compile Week 2 report | All | ✅ Complete |
| Assign team responsibilities | All | ✅ Complete |

### Week 3 (Planned) — Implementation and Experiments

| Task | Owner | Dependencies |
|------|-------|-------------|
| Implement Node.js application | Ritul | Application requirements (Week 2) |
| Create Dockerfile and test locally | Ritul | Application code |
| Push image to GHCR | Ritul | Dockerfile |
| Provision Azure infrastructure | Divyesh | Deployment architecture (Week 2) |
| Configure VMSS and autoscaling | Divyesh | Azure infrastructure |
| Deploy application to VMSS | Divyesh + Ritul | Container image + infrastructure |
| Write k6 test scripts | Divyesh | Exercise plan (Week 2) |
| Run Experiment 1 (Baseline) | Divyesh | Deployed application |
| Run Experiment 2 (Horizontal scaling) | Divyesh | Baseline results |
| Run Experiment 3 (Autoscaling) | Divyesh | Scaling infrastructure |
| Run Experiment 4 (Fault tolerance) | Divyesh + Ritul | Multi-instance deployment |
| Run Experiment 5 (Cost analysis) | Divyesh | All experiments |
| Analyse results | All | Experimental data |
| Document findings | Utsker | Analysis |

### Week 4 (Planned) — Final Report

| Task | Owner | Dependencies |
|------|-------|-------------|
| Compile experimental results | Divyesh | Week 3 data |
| Write results analysis section | Utsker | Compiled results |
| Create visualizations (charts, tables) | All | Results analysis |
| Write final report | Utsker | All sections |
| Review and edit report | All | Draft report |
| Prepare submission | All | Final report |

### Week 5 (Planned) — Viva

| Task | Owner |
|------|-------|
| Prepare individual sections for presentation | Each member |
| Practice viva Q&A | All |
| Prepare demonstration (if required) | Divyesh + Ritul |

---

## 5. Dependency Diagram

```
Week 2 Research ──► Week 2 Report ──► Week 3 App Development
         │                                     │
         │                                     ▼
         └──────► Week 3 Infrastructure ──► Deployment
                                               │
                                               ▼
                                       Load Testing
                                               │
                                               ▼
                                       Experiments 1–5
                                               │
                                               ▼
                                       Results Analysis
                                               │
                                               ▼
                                       Week 4 Report
                                               │
                                               ▼
                                       Week 5 Viva
```

---

## 6. Communication and Coordination

| Channel | Purpose |
|---------|---------|
| GitHub Issues | Task tracking and bug reports |
| GitHub Pull Requests | Code and document review |
| WhatsApp / Team Chat | Daily coordination |
| Weekly sync meeting | Progress review and blockers |

---

## 7. Risk Matrix

| Risk | Probability | Impact | Owner | Mitigation |
|------|-------------|--------|-------|------------|
| Azure subscription limits | Medium | High | Divyesh | Use student subscription; monitor spending daily |
| Application bugs during testing | Medium | Medium | Ritul | Test locally before Azure deployment |
| Autoscaling fails to trigger | Low | High | Divyesh | Lower CPU threshold; increase load intensity |
| Team member unavailability | Low | Medium | All | Cross-training; documented procedures |
| k6 unable to generate sufficient load | Low | Medium | Divyesh | Run k6 from Azure VM in same region |
| Time constraints in Week 3 | Medium | High | All | Prioritize Experiments 1–3; defer 4–5 if needed |
| GitHub Container Registry access issues | Low | Low | Ritul | Use public image; fallback to Docker Hub |

---

## References

See [references.md](references.md) for full citations.

