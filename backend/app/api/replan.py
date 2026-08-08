from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.schemas import ReplanRequest, ReplanResponse
from app.services.replan_service import execute_dynamic_replan

router = APIRouter()

@router.post("/replan", response_model=ReplanResponse)
def replan_route(request: ReplanRequest, db: Session = Depends(get_db)):
    try:
        response = execute_dynamic_replan(request, db)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Replanning failed: {str(e)}")
