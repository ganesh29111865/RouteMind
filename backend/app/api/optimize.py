from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.schemas import OptimizeRequest, OptimizeResponse
from app.services.optimization_service import run_route_optimization

router = APIRouter()

@router.post("/optimize", response_model=OptimizeResponse)
def optimize_route(request: OptimizeRequest, db: Session = Depends(get_db)):
    try:
        result = run_route_optimization(request, db)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")
