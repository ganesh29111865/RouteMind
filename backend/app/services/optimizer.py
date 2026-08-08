"""
RouteMind Optimizer Service Bridge
"""
from app.optimizer.vrp_solver import vrp_solver, ORToolsVRPBaselineSolver

baseline_optimizer = vrp_solver
