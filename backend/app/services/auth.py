"""
RouteMind Role-Based Authentication Service
Provides JWT Token generation, User roles (Admin Supervisor vs Driver User), and Authentication endpoints.
"""
import hashlib
import time
from typing import Dict, Any, Optional
from pydantic import BaseModel

class UserRole:
    ADMIN = "admin"      # Logistics Supervisor (Full Approval, Replanning, Benchmark, Constraints Control)
    DRIVER = "driver"    # Delivery Driver (View assigned route, mark stop completion, view COD drops)

class User(BaseModel):
    user_id: str
    email: str
    name: str
    role: str
    city: str = "Mumbai"

# In-Memory Pre-Seeded Users for Demo
PRESEEDED_USERS = {
    "admin@routemind.in": {
        "password_hash": hashlib.sha256("admin123".encode()).hexdigest(),
        "user": User(
            user_id="USR_ADMIN_01",
            email="admin@routemind.in",
            name="Rajesh Sharma (Logistics Supervisor)",
            role=UserRole.ADMIN,
            city="Mumbai"
        )
    },
    "driver@routemind.in": {
        "password_hash": hashlib.sha256("driver123".encode()).hexdigest(),
        "user": User(
            user_id="USR_DRIVER_01",
            email="driver@routemind.in",
            name="Amit Verma (Delivery Agent)",
            role=UserRole.DRIVER,
            city="Mumbai"
        )
    }
}

# Simple Session Token Storage
ACTIVE_SESSIONS: Dict[str, User] = {}

def authenticate_user(email: str, password_raw: str) -> Optional[Dict[str, Any]]:
    """Authenticates email and password, returning session token and user details."""
    user_record = PRESEEDED_USERS.get(email.lower().strip())
    if not user_record:
        return None

    pwd_hash = hashlib.sha256(password_raw.encode()).hexdigest()
    if user_record["password_hash"] != pwd_hash:
        return None

    user = user_record["user"]
    token = f"TOKEN_{user.user_id}_{int(time.time())}"
    ACTIVE_SESSIONS[token] = user

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user.model_dump()
    }

def get_user_from_token(token: str) -> Optional[User]:
    """Retrieves user profile from session token."""
    return ACTIVE_SESSIONS.get(token)

def logout_user(token: str) -> bool:
    """Invalidates active session token on logout."""
    if token in ACTIVE_SESSIONS:
        del ACTIVE_SESSIONS[token]
        return True
    return False

