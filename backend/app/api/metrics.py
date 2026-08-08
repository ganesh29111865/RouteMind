from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.schemas import MetricsResponse
from app.services.benchmark_service import get_system_metrics

router = APIRouter()

@router.get("/metrics", response_model=MetricsResponse)
def get_metrics(db: Session = Depends(get_db)):
    return get_system_metrics(db)
