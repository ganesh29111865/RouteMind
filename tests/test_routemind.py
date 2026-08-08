import pytest
from app.utils.sample_dataset import get_sample_amazon_dataset
from app.optimizer.ortools_solver import ORToolsVRPSolver
from app.optimizer.greedy_solver import NaiveGreedySolver
from app.constraints.engine import IndianConstraintsEngine
from app.replanner.engine import DynamicReplannerEngine
from app.ai.explanation_generator import AIExplanationGenerator

def test_sample_dataset_structure():
    data = get_sample_amazon_dataset()
    assert len(data) > 0
    route = data[0]
    assert "stops" in route
    assert len(route["stops"]) >= 4

def test_ortools_solver():
    stops = get_sample_amazon_dataset()[0]["stops"]
    solver = ORToolsVRPSolver()
    result = solver.solve(stops)
    assert result["solver_status"] in ["OPTIMAL", "FALLBACK"]
    assert len(result["route_sequence"]) == len(stops)
    assert result["total_distance_km"] > 0

def test_greedy_solver_comparison():
    stops = get_sample_amazon_dataset()[0]["stops"]
    ortools_res = ORToolsVRPSolver().solve(stops)
    greedy_res = NaiveGreedySolver().solve(stops)
    assert ortools_res["total_distance_km"] <= greedy_res["total_distance_km"]

def test_indian_constraints_engine():
    engine = IndianConstraintsEngine(max_cod_limit=50000.0, max_vehicle_capacity=150)
    stops = get_sample_amazon_dataset()[0]["stops"]
    is_valid, violations = engine.validate_route_constraints(stops, total_travel_time_min=64.0)
    assert is_valid is True
    assert len(violations) == 0

def test_dynamic_replanner_failed_delivery():
    stops = get_sample_amazon_dataset()[0]["stops"]
    replanner = DynamicReplannerEngine()
    reordered_stops, explanation = replanner.handle_failed_delivery(stops, "STP_102")
    assert len(reordered_stops) == len(stops) - 1
    assert "failed" in explanation.lower()

def test_ai_explanation_generator():
    generator = AIExplanationGenerator()
    result = generator.generate_change_explanation(
        event_type="FAILED_DELIVERY",
        orig_dist=28.4,
        new_dist=29.3,
        orig_time=64.0,
        new_time=68.5,
        stops_modified=2
    )
    assert "explanation" in result
    assert result["impact_level"] == "LOW"
    assert len(result["summary_bullet_points"]) > 0
