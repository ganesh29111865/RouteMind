# RouteMind REST API Specification 📡

Base URL: `http://127.0.0.1:8000/api`

---

## 1. Dataset Endpoints

### `GET /api/dataset/routes`
Lists all available Amazon Last Mile dataset routes.

**Response**:
```json
[
  {
    "route_id": "ROUTE_AMZN_BOM_4001",
    "city": "Mumbai",
    "date": "2026-08-08",
    "total_stops": 14,
    "total_cod_amount": 171200.0,
    "total_packages": 40,
    "depot_address": "Amazon Last Mile Logistics Hub, Kurla West, Mumbai, MH 400070",
    "zones_count": 8
  }
]
```

### `GET /api/dataset/route/{route_id}`
Retrieves full details of a specific route dataset including stops and depot info.

---

## 2. Optimization Endpoints

### `POST /api/optimize/baseline`
Generates baseline unconstrained VRP solution using Google OR-Tools.

### `POST /api/optimize/constrained`
Generates optimized route under active Indian logistics constraints.

**Request Body** (Optional):
```json
{
  "max_cod_carry_limit": 50000.0,
  "max_legal_driving_hours": 8.0,
  "enforce_time_windows": true,
  "enforce_cod_limit": true,
  "enforce_zone_restrictions": true,
  "enforce_legal_hours": true
}
```

---

## 3. Dynamic Replanning & Exception Endpoints

### `POST /api/replan/simulate?route_id={route_id}`
Simulates mid-route exception events (traffic delay, failed delivery, new pickup) and re-plans affected route sequence using Google OR-Tools.

**Request Body**:
```json
{
  "event": {
    "event_id": "EVT_01",
    "event_type": "traffic_delay",
    "stop_id": "STP_BKC_01",
    "delay_minutes": 45,
    "reason": "BKC Peak Hour Jam"
  },
  "constraints": null
}
```

---

## 4. AI Explanation & Cost Endpoints

### `GET /api/ai/cost`
Returns cumulative AI LLM token usage and financial cost metrics.

**Response**:
```json
{
  "total_api_calls": 3,
  "total_prompt_tokens": 1080,
  "total_completion_tokens": 240,
  "total_tokens": 1320,
  "estimated_ai_cost_usd": 0.0045,
  "estimated_ai_cost_inr": 0.39,
  "cost_per_explanation": 0.0015
}
```

---

## 5. Supervisor Approval Endpoints

### `GET /api/approval/pending`
Lists all route re-plans queued in SQLite pending supervisor sign-off.

### `POST /api/approval/action`
Processes supervisor Approve or Reject action on a proposed route re-plan.

**Request Body**:
```json
{
  "request_id": "REQ_1786100374",
  "action": "approve",
  "supervisor_notes": "Confirmed traffic clearance with dispatch team."
}
```

---

## 6. Benchmarking Endpoints

### `GET /api/benchmark/run?route_id={route_id}`
Runs performance comparison across Naive Sequential (1..N), Unconstrained OR-Tools, and RouteMind Constrained Engine.
