import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "RouteMind API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./app/data/routemind.db")
    
    # CORS — allow all for production (Vercel + Render)
    BACKEND_CORS_ORIGINS: list[str] = ["*"]
    
    # Default Indian Logistics Constraints Default Limits
    MAX_DRIVER_HOURS: float = 8.0          # Max legal driving hours per shift
    MAX_COD_CASH_LIMIT: float = 50000.0     # Max INR cash on delivery limit per vehicle
    DEFAULT_VEHICLE_CAPACITY: int = 150     # Max packages per vehicle
    DEFAULT_VEHICLE_VOLUME: float = 12.0    # Cubic meters
    
    class Config:
        case_sensitive = True

settings = Settings()
