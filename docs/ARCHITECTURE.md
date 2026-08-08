# RouteMind Architectural Blueprint 📐

## System Context & Design Principles

RouteMind is engineered as a modular, decoupled microservice architecture tailored for Last-Mile Logistics in emerging markets (specifically Indian urban supply chains).

### Architectural Guardrails:
1. **Optimization Separation**: Routine vehicle routing optimization and path calculation are performed deterministically by **Google OR-Tools VRP Solver**, NOT by non-deterministic LLMs.
2. **AI Telemetry Scope**: AI LLMs are scoped strictly to natural language synthesis of supervisor explanations during dynamic exception events and financial API cost tracking.
3. **Operational Hard Constraints**: Real-world Indian parameters (COD cash limits, commercial zone bans, driver shift limits, delivery time windows) are modeled directly into the distance-time dimension graph.
4. **Human-in-the-Loop Pipeline**: No mid-route re-plan is dispatched directly to drivers without staged SQLite persistence and supervisor sign-off.

---

## Service Layer Breakdown

```
+-----------------------------------------------------------------------+
|                           React 18 Frontend                           |
|       (Dashboard, Leaflet Map, Constraint Panel, Approval Modal)      |
+-----------------------------------------------------------------------+
                                   | (REST API via Axios)
                                   v
+-----------------------------------------------------------------------+
|                         FastAPI Router (app/api)                      |
+-----------------------------------------------------------------------+
        |                  |                  |                  |
        v                  v                  v                  v
+---------------+  +---------------+  +---------------+  +---------------+
| DatasetLoader |  | ORToolsSolver |  | ConstraintEng |  | AIExplainer   |
| (Amazon JSON) |  | (VRP Engine)  |  | (Indian Rules)|  | (Cost Tracker)|
+---------------+  +---------------+  +---------------+  +---------------+
        |                  |                  |                  |
        +------------------+------------------+------------------+
                                   |
                                   v
                      +--------------------------+
                      | SQLite Database Layer    |
                      | (routemind.db ORM)       |
                      +--------------------------+
```

### 1. Dataset Loader Service (`dataset_loader.py`)
- Ingests raw Amazon Last Mile Routing Research Challenge JSON structures.
- Normalizes stop records, GPS coordinates, customer time windows, service durations, package counts, COD cash amounts, and zone IDs.
- Calculates baseline route metrics (Total COD cash, Total packages, depot metadata).

### 2. Google OR-Tools VRP Optimizer (`optimizer.py`)
- Instantiates `pywrapcp.RoutingIndexManager` and `pywrapcp.RoutingModel`.
- Calculates pairwise distance and transit duration matrices via Haversine distance adjusted for urban road circuity (1.3x multiplier) and urban speeds (22 km/h average).
- Applies `PATH_CHEAPEST_ARC` first solution strategy and `GUIDED_LOCAL_SEARCH` metaheuristics with strict time bounds (<3 seconds).
- Builds optimized stop sequence, arrival/departure ETAs, and cumulative cash collection progression.

### 3. Indian Logistics Constraint Engine (`constraint_engine.py`)
- Enforces 4 operational constraints:
  - **Time Windows**: Validates arrival times against `[tw_start, tw_end]`.
  - **Zone Entry Restrictions**: Detects vehicle entry into commercial zones during peak ban hours.
  - **COD Cash Limit**: Tracks cumulative cash on vehicle against ₹50,000 threshold.
  - **Legal Driving Hours**: Enforces 8h shift limit and 30m rest breaks after 4h.

### 4. Dynamic Replanning Engine (`replanner.py`)
- Handles mid-route exceptions (Traffic Congestion, Failed Deliveries, Express Pickups).
- Re-optimizes only remaining unvisited stops.
- Generates route delta metrics (`stops_reordered`, `distance_saved_km`, `time_saved_min`).

### 5. AI Explainer & Cost Tracker (`ai_explainer.py` & `cost_tracker.py`)
- Synthesizes domain-expert natural language justifications for supervisors.
- Logs prompt/completion tokens and tracks API financial telemetry ($0.0015 / call).

### 6. SQLite Approval Database Layer (`database.py`)
- Persists proposed re-plan requests in `route_approval_requests` table.
- Manages state transitions: `pending` -> `approved` or `rejected`.
