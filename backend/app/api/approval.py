from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.schemas import ApprovalActionRequest
from app.services.approval_service import approve_route_change, reject_route_change, get_pending_approvals

router = APIRouter()

@router.get("/approvals/pending")
def list_pending_approvals(db: Session = Depends(get_db)):
    return get_pending_approvals(db)

@router.post("/approve")
def approve(request: ApprovalActionRequest, db: Session = Depends(get_db)):
    result = approve_route_change(request.approval_id, request.reason, db)
    if not result:
        raise HTTPException(status_code=404, detail="Approval request not found or already processed")
    return {"message": "Route change approved successfully", "approval_id": request.approval_id}

@router.post("/reject")
def reject(request: ApprovalActionRequest, db: Session = Depends(get_db)):
    result = reject_route_change(request.approval_id, request.reason, db)
    if not result:
        raise HTTPException(status_code=404, detail="Approval request not found or already processed")
    return {"message": "Route change rejected successfully", "approval_id": request.approval_id}
