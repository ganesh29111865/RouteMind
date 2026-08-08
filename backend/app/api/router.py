from fastapi import APIRouter
from app.api import upload, optimize, replan, routes, metrics, approval, explain

api_router = APIRouter()

api_router.include_router(upload.router, tags=["Dataset Upload"])
api_router.include_router(optimize.router, tags=["Route Optimization"])
api_router.include_router(replan.router, tags=["Dynamic Replanning"])
api_router.include_router(routes.router, tags=["Route Management"])
api_router.include_router(metrics.router, tags=["Benchmarking & Analytics"])
api_router.include_router(approval.router, tags=["Supervisor Approval"])
api_router.include_router(explain.router, tags=["AI Explanation Engine"])
