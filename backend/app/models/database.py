"""
RouteMind SQLite Database Model & Connection Setup
"""
import os
import json
from sqlalchemy import create_engine, Column, String, Float, Integer, DateTime, Text
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime

DATABASE_URL = "sqlite:///./routemind.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class RouteApprovalRequest(Base):
    __tablename__ = "route_approval_requests"

    id = Column(String, primary_key=True, index=True)
    route_id = Column(String, index=True)
    event_type = Column(String)
    event_payload = Column(Text)
    old_route_json = Column(Text)
    proposed_route_json = Column(Text)
    diff_summary_json = Column(Text)
    ai_explanation = Column(Text)
    status = Column(String, default="pending")
    supervisor_notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
