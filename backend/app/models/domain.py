import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum, JSON
from sqlalchemy.orm import relationship
from app.db.session import Base

class ApprovalStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class EventType(str, enum.Enum):
    NEW_PICKUP = "NEW_PICKUP"
    FAILED_DELIVERY = "FAILED_DELIVERY"
    TRAFFIC_DELAY = "TRAFFIC_DELAY"
    VEHICLE_BREAKDOWN = "VEHICLE_BREAKDOWN"
    SKIP_STOP = "SKIP_STOP"
    TRAFFIC_AT_STOP = "TRAFFIC_AT_STOP"
    URGENT_HUB_DELIVERY = "URGENT_HUB_DELIVERY"

class DatasetModel(Base):
    __tablename__ = "datasets"

    id = Column(String, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    route_count = Column(Integer, default=0)
    stop_count = Column(Integer, default=0)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    raw_json = Column(JSON, nullable=True)

class VehicleModel(Base):
    __tablename__ = "vehicles"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    capacity_packages = Column(Integer, default=150)
    max_volume_m3 = Column(Float, default=12.0)
    cod_cash_limit = Column(Float, default=50000.0)
    current_cash_on_hand = Column(Float, default=0.0)
    max_driving_hours = Column(Float, default=8.0)
    driver_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)

class RouteModel(Base):
    __tablename__ = "routes"

    id = Column(String, primary_key=True, index=True)
    route_name = Column(String, nullable=False)
    dataset_id = Column(String, ForeignKey("datasets.id"), nullable=True)
    vehicle_id = Column(String, ForeignKey("vehicles.id"), nullable=True)
    total_distance_km = Column(Float, default=0.0)
    total_travel_time_min = Column(Float, default=0.0)
    total_stops_count = Column(Integer, default=0)
    status = Column(String, default="OPTIMIZED") # OPTIMIZED, REPLANNED_PENDING, REPLANNED_APPROVED
    version = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    stops = relationship("StopModel", back_populates="route", cascade="all, delete-orphan")
    approvals = relationship("SupervisorApprovalModel", back_populates="route")

class StopModel(Base):
    __tablename__ = "stops"

    id = Column(String, primary_key=True, index=True)
    route_id = Column(String, ForeignKey("routes.id"), nullable=False)
    stop_sequence = Column(Integer, nullable=False)
    location_name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    package_id = Column(String, nullable=True)
    package_weight_kg = Column(Float, default=1.0)
    cod_amount_inr = Column(Float, default=0.0)
    time_window_start = Column(String, nullable=True) # e.g. "09:00"
    time_window_end = Column(String, nullable=True)   # e.g. "12:00"
    status = Column(String, default="PENDING")        # PENDING, DELIVERED, FAILED, SKIPPED, PICKUP
    eta = Column(String, nullable=True)
    is_no_entry_zone = Column(Boolean, default=False)
    no_entry_start = Column(String, nullable=True)    # e.g. "08:00"
    no_entry_end = Column(String, nullable=True)      # e.g. "11:00"

    route = relationship("RouteModel", back_populates="stops")

class ConstraintConfigModel(Base):
    __tablename__ = "constraint_configs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    time_windows_enabled = Column(Boolean, default=True)
    cod_limit_enabled = Column(Boolean, default=True)
    max_cod_limit_inr = Column(Float, default=50000.0)
    vehicle_capacity_enabled = Column(Boolean, default=True)
    no_entry_zones_enabled = Column(Boolean, default=True)
    legal_driving_hours_enabled = Column(Boolean, default=True)
    max_driving_hours = Column(Float, default=8.0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ReplanEventModel(Base):
    __tablename__ = "replan_events"

    id = Column(String, primary_key=True, index=True)
    route_id = Column(String, ForeignKey("routes.id"), nullable=False)
    event_type = Column(Enum(EventType), nullable=False)
    stop_id = Column(String, nullable=True)
    description = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    payload = Column(JSON, nullable=True)

class SupervisorApprovalModel(Base):
    __tablename__ = "supervisor_approvals"

    id = Column(String, primary_key=True, index=True)
    route_id = Column(String, ForeignKey("routes.id"), nullable=False)
    original_distance_km = Column(Float, nullable=False)
    new_distance_km = Column(Float, nullable=False)
    original_time_min = Column(Float, nullable=False)
    new_time_min = Column(Float, nullable=False)
    stops_changed_count = Column(Integer, default=0)
    ai_explanation = Column(Text, nullable=False)
    status = Column(Enum(ApprovalStatus), default=ApprovalStatus.PENDING)
    decision_reason = Column(Text, nullable=True)
    proposed_stops = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    decided_at = Column(DateTime, nullable=True)

    route = relationship("RouteModel", back_populates="approvals")

class BenchmarkMetricsModel(Base):
    __tablename__ = "benchmark_metrics"

    id = Column(String, primary_key=True, index=True)
    dataset_name = Column(String, nullable=False)
    solver_name = Column(String, nullable=False) # Naive Greedy, Google OR-Tools, RouteMind
    total_distance_km = Column(Float, nullable=False)
    total_travel_time_min = Column(Float, nullable=False)
    constraint_violations = Column(Integer, default=0)
    optimization_time_sec = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
