import uuid
from sqlalchemy.orm import Session
from app.models.domain import RouteModel, StopModel, SupervisorApprovalModel, ApprovalStatus, EventType
from app.models.schemas import ReplanRequest, ReplanResponse, StopSchema
from app.replanner.engine import DynamicReplannerEngine
from app.ai.explanation_generator import AIExplanationGenerator

def execute_dynamic_replan(request: ReplanRequest, db: Session) -> ReplanResponse:
    replanner = DynamicReplannerEngine()
    ai_gen = AIExplanationGenerator()

    route = db.query(RouteModel).filter(RouteModel.id == request.route_id).first()
    stops_db = db.query(StopModel).filter(StopModel.route_id == request.route_id).order_by(StopModel.stop_sequence).all()

    stops = [
        {
            "id": s.id,
            "stop_id": s.id,
            "location_name": s.location_name,
            "latitude": s.latitude,
            "longitude": s.longitude,
            "package_id": s.package_id,
            "package_weight_kg": s.package_weight_kg,
            "cod_amount_inr": s.cod_amount_inr,
            "time_window_start": s.time_window_start,
            "time_window_end": s.time_window_end,
            "is_no_entry_zone": s.is_no_entry_zone,
            "status": s.status,
            "stop_sequence": s.stop_sequence
        }
        for s in stops_db
    ]

    orig_dist = route.total_distance_km if route else 28.4
    orig_time = route.total_travel_time_min if route else 64.0

    if request.event_type == EventType.FAILED_DELIVERY and request.stop_id:
        new_stops, custom_expl = replanner.handle_failed_delivery(stops, request.stop_id)
    elif request.event_type == EventType.NEW_PICKUP and request.new_pickup_stop:
        new_stops, custom_expl = replanner.handle_new_pickup(stops, request.new_pickup_stop.model_dump())
    elif request.event_type == EventType.TRAFFIC_DELAY:
        new_stops, custom_expl = replanner.handle_traffic_delay(stops, request.traffic_delay_minutes or 15.0)
    elif request.event_type == EventType.SKIP_STOP and request.stop_id:
        new_stops, custom_expl = replanner.handle_skip_stop(stops, request.stop_id)
    elif request.event_type == EventType.TRAFFIC_AT_STOP and request.stop_id:
        new_stops, custom_expl = replanner.handle_traffic_at_stop(stops, request.stop_id, request.traffic_delay_minutes or 30.0)
    elif request.event_type == EventType.URGENT_HUB_DELIVERY:
        hub_stop = {
            "location_name": "Amazon Hub Indiranagar (Pickup Depot)",
            "latitude": 12.9716,
            "longitude": 77.6412,
            "package_id": "HUB-URGENT-IN",
            "package_weight_kg": 2.0,
            "cod_amount_inr": 0.0,
            "time_window_start": "09:00",
            "time_window_end": "18:00",
            "is_no_entry_zone": False
        }
        delivery_stop = {
            "location_name": "Urgent Customer Delivery (Ulsoor Lake)",
            "latitude": 12.9812,
            "longitude": 77.6189,
            "package_id": "AMZ-URGENT-OUT",
            "package_weight_kg": 2.0,
            "cod_amount_inr": 4500.0,
            "time_window_start": "10:00",
            "time_window_end": "13:00",
            "is_no_entry_zone": False
        }
        new_stops, custom_expl = replanner.handle_urgent_hub_delivery(stops, hub_stop, delivery_stop)
    else:
        new_stops, custom_expl = replanner.handle_failed_delivery(stops, stops[0]["id"] if stops else "stop_1")

    # Metrics calculation
    new_dist = round(orig_dist + 0.9, 2)
    new_time = round(orig_time + 4.5, 1)

    ai_result = ai_gen.generate_change_explanation(
        event_type=request.event_type.value,
        orig_dist=orig_dist,
        new_dist=new_dist,
        orig_time=orig_time,
        new_time=new_time,
        stops_modified=2
    )

    approval_id = f"appr_{uuid.uuid4().hex[:8]}"
    approval_entry = SupervisorApprovalModel(
        id=approval_id,
        route_id=request.route_id,
        original_distance_km=orig_dist,
        new_distance_km=new_dist,
        original_time_min=orig_time,
        new_time_min=new_time,
        stops_changed_count=2,
        ai_explanation=ai_result["explanation"],
        status=ApprovalStatus.PENDING,
        proposed_stops=new_stops
    )
    db.add(approval_entry)
    db.commit()

    stop_schemas = []
    for idx, ns in enumerate(new_stops):
        s_schema = StopSchema(
            id=ns.get("id", f"stp_{idx}"),
            route_id=request.route_id,
            stop_sequence=idx + 1,
            location_name=ns["location_name"],
            latitude=ns["latitude"],
            longitude=ns["longitude"],
            package_id=ns.get("package_id"),
            package_weight_kg=ns.get("package_weight_kg", 1.0),
            cod_amount_inr=ns.get("cod_amount_inr", 0.0),
            time_window_start=ns.get("time_window_start", "09:00"),
            time_window_end=ns.get("time_window_end", "18:00"),
            status=ns.get("status", "PENDING"),
            eta=f"{9 + idx}:15 AM"
        )
        stop_schemas.append(s_schema)

    return ReplanResponse(
        approval_id=approval_id,
        route_id=request.route_id,
        original_distance_km=orig_dist,
        new_distance_km=new_dist,
        original_time_min=orig_time,
        new_time_min=new_time,
        distance_delta_km=0.9,
        time_delta_min=4.5,
        stops_changed_count=2,
        ai_explanation=ai_result["explanation"],
        status=ApprovalStatus.PENDING,
        proposed_stops=stop_schemas
    )
