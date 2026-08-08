from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.schemas import ExplanationRequest, ExplanationResponse
from app.services.explanation_service import generate_route_explanation

router = APIRouter()

@router.post("/explain", response_model=ExplanationResponse)
def explain_route(request: ExplanationRequest, db: Session = Depends(get_db)):
    try:
        return generate_route_explanation(request, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Explanation generation failed: {str(e)}")
