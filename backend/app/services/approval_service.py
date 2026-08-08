from datetime import datetime
from sqlalchemy.orm import Session
from app.models.domain import SupervisorApprovalModel, RouteModel, ApprovalStatus, StopModel

def get_pending_approvals(db: Session):
    approvals = db.query(SupervisorApprovalModel).filter(SupervisorApprovalModel.status == ApprovalStatus.PENDING).all()
    return approvals

def approve_route_change(approval_id: str, reason: str | None, db: Session):
    approval = db.query(SupervisorApprovalModel).filter(SupervisorApprovalModel.id == approval_id).first()
    if not approval:
        return None

    approval.status = ApprovalStatus.APPROVED
    approval.decision_reason = reason or "Approved by logistics supervisor"
    approval.decided_at = datetime.utcnow()

    # Update associated route
    route = db.query(RouteModel).filter(RouteModel.id == approval.route_id).first()
    if route:
        route.total_distance_km = approval.new_distance_km
        route.total_travel_time_min = approval.new_time_min
        route.status = "REPLANNED_APPROVED"
        route.version += 1

        # Delete old stops for this route
        db.query(StopModel).filter(StopModel.route_id == approval.route_id).delete()

        # Insert new approved stops sequence
        if approval.proposed_stops:
            import uuid
            for idx, ns in enumerate(approval.proposed_stops):
                stop_obj = StopModel(
                    id=ns.get("id") or f"stp_{uuid.uuid4().hex[:8]}",
                    route_id=approval.route_id,
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
                    eta=ns.get("eta", "09:00 AM"),
                    is_no_entry_zone=ns.get("is_no_entry_zone", False),
                    no_entry_start=ns.get("no_entry_start"),
                    no_entry_end=ns.get("no_entry_end")
                )
                db.add(stop_obj)

    db.commit()
    return approval

def reject_route_change(approval_id: str, reason: str | None, db: Session):
    approval = db.query(SupervisorApprovalModel).filter(SupervisorApprovalModel.id == approval_id).first()
    if not approval:
        return None

    approval.status = ApprovalStatus.REJECTED
    approval.decision_reason = reason or "Rejected by logistics supervisor - maintaining original route"
    approval.decided_at = datetime.utcnow()

    db.commit()
    return approval
