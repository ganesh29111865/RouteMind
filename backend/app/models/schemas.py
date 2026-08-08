from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import datetime
from app.models.domain import ApprovalStatus, EventType

class StopBase(BaseModel):
    location_name: str
    latitude: float
    longitude: float
    package_id: Optional[str] = None
    package_weight_kg: float = 1.0
    cod_amount_inr: float = 0.0
    time_window_start: Optional[str] = "09:00"
    time_window_end: Optional[str] = "18:00"
    is_no_entry_zone: bool = False
    no_entry_start: Optional[str] = None
    no_entry_end: Optional[str] = None

class StopCreate(StopBase):
    stop_sequence: int

class StopSchema(StopBase):
    id: str
    route_id: str
    stop_sequence: int
    status: str = "PENDING"
    eta: Optional[str] = None

    class Config:
        from_attributes = True

class RouteBase(BaseModel):
    route_name: str
    dataset_id: Optional[str] = None
    vehicle_id: Optional[str] = None

class RouteSchema(RouteBase):
    id: str
    total_distance_km: float
    total_travel_time_min: float
    total_stops_count: int
    status: str
    version: int
    stops: List[StopSchema] = []
    created_at: datetime

    class Config:
        from_attributes = True

class OptimizeRequest(BaseModel):
    dataset_id: Optional[str] = None
    stops: Optional[List[StopBase]] = None
    use_or_tools: bool = True
    vehicle_capacity: int = 150
    max_cod_limit: float = 50000.0

class OptimizeResponse(BaseModel):
    route_id: str
    route_name: str
    total_distance_km: float
    total_travel_time_min: float
    stops: List[StopSchema]
    solver_used: str
    optimization_time_sec: float
    constraint_violations: List[str] = []

class ReplanRequest(BaseModel):
    route_id: str
    event_type: EventType
    stop_id: Optional[str] = None
    new_pickup_stop: Optional[StopBase] = None
    traffic_delay_minutes: Optional[float] = 0.0

class ReplanResponse(BaseModel):
    approval_id: str
    route_id: str
    original_distance_km: float
    new_distance_km: float
    original_time_min: float
    new_time_min: float
    distance_delta_km: float
    time_delta_min: float
    stops_changed_count: int
    ai_explanation: str
    status: ApprovalStatus
    proposed_stops: List[StopSchema]

class ApprovalActionRequest(BaseModel):
    approval_id: str
    reason: Optional[str] = None

class ExplanationRequest(BaseModel):
    approval_id: Optional[str] = None
    original_route_id: Optional[str] = None
    replanned_route_id: Optional[str] = None
    event_summary: Optional[str] = None

class ExplanationResponse(BaseModel):
    explanation: str
    summary_bullet_points: List[str]
    impact_level: str # LOW, MEDIUM, HIGH, CRITICAL

class BenchmarkItem(BaseModel):
    solver_name: str
    total_distance_km: float
    total_travel_time_min: float
    constraint_violations: int
    optimization_time_sec: float

class MetricsResponse(BaseModel):
    dataset_name: str
    total_routes_analyzed: int
    benchmarks: List[BenchmarkItem]
