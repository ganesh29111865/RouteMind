from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.domain import RouteModel
from app.models.schemas import RouteSchema

router = APIRouter()

@router.get("/routes", response_model=List[RouteSchema])
def get_routes(db: Session = Depends(get_db)):
    routes = db.query(RouteModel).all()
    return routes

@router.get("/routes/{route_id}", response_model=RouteSchema)
def get_route_by_id(route_id: str, db: Session = Depends(get_db)):
    route = db.query(RouteModel).filter(RouteModel.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    return route
