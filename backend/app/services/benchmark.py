"""
RouteMind Benchmarking Engine Service
Compares Naive Sequential Routing vs Unconstrained OR-Tools vs RouteMind Constrained Engine
"""
import time
from typing import Dict, Any, List
from app.models.schemas import (
    RouteDataset, RouteOptimizationResponse, RouteSummary,
    OptimizedRouteStop, StopType, LogisticConstraints
)
from app.utils.distance_matrix import build_distance_and_duration_matrices
from app.services.optimizer import baseline_optimizer
from app.services.constraint_engine import constraint_engine

class BenchmarkEngine:
    def __init__(self):
        pass

    def evaluate_naive_routing(self, dataset: RouteDataset) -> RouteOptimizationResponse:
        """Evaluates naive sequential routing (visiting stops in dataset input order 1..N)."""
        start_time = time.time()
        locations = [(dataset.depot.lat, dataset.depot.lng)]
        for stop in dataset.stops:
            locations.append((stop.lat, stop.lng))

        dist_matrix, dur_matrix = build_distance_and_duration_matrices(locations)

        raw_stops: List[OptimizedRouteStop] = []
        current_time = 0
        total_cod = 0.0

        # Depot start
        raw_stops.append(OptimizedRouteStop(
            sequence=1,
            stop_id=dataset.depot.depot_id,
            stop_type=StopType.DEPOT,
            address=dataset.depot.address,
            lat=dataset.depot.lat,
            lng=dataset.depot.lng,
            zone_id="DEPOT_ZONE",
            estimated_arrival_min=0,
            estimated_departure_min=0,
            time_window=dataset.depot.operating_hours,
            cod_amount=0.0,
            cumulative_cod=0.0,
            service_time_min=0,
            status="scheduled"
        ))

        # Naive sequence 1..N
        for idx, stop in enumerate(dataset.stops):
            from_node = idx
            to_node = idx + 1
            travel_time = dur_matrix[from_node][to_node]

            arr_time = current_time + travel_time
            dep_time = arr_time + stop.service_time_min
            total_cod += stop.cod_amount

            raw_stops.append(OptimizedRouteStop(
                sequence=idx + 2,
                stop_id=stop.stop_id,
                stop_type=stop.stop_type,
                address=stop.address,
                lat=stop.lat,
                lng=stop.lng,
                zone_id=stop.zone_id,
                estimated_arrival_min=arr_time,
                estimated_departure_min=dep_time,
                time_window=stop.time_window,
                cod_amount=stop.cod_amount,
                cumulative_cod=round(total_cod, 2),
                service_time_min=stop.service_time_min,
                status="scheduled"
            ))
            current_time = dep_time

        # Validate constraints
        validated_stops, summary = constraint_engine.validate_and_apply_constraints(
            dataset, raw_stops, LogisticConstraints()
        )

        elapsed_ms = round((time.time() - start_time) * 1000, 2)

        return RouteOptimizationResponse(
            route_id=dataset.route_id,
            solver_name="Naive Sequential Routing (Baseline)",
            runtime_ms=elapsed_ms,
            summary=summary,
            stops=validated_stops
        )

    def run_full_benchmark(self, dataset: RouteDataset) -> Dict[str, Any]:
        """Runs comparative benchmark across Naive, Unconstrained OR-Tools, and RouteMind Constrained."""
        # 1. Naive Routing
        naive_result = self.evaluate_naive_routing(dataset)

        # 2. Unconstrained OR-Tools
        unconstrained_config = LogisticConstraints(
            enforce_time_windows=False,
            enforce_cod_limit=False,
            enforce_zone_restrictions=False,
            enforce_legal_hours=False
        )
        unconstrained_result = baseline_optimizer.solve(dataset, unconstrained_config)

        # 3. RouteMind Constrained Engine
        constrained_result = baseline_optimizer.solve(dataset, LogisticConstraints())

        # Percentage Improvements vs Naive
        naive_dist = naive_result.summary.total_distance_km
        or_dist = constrained_result.summary.total_distance_km
        dist_saved_pct = round(((naive_dist - or_dist) / naive_dist) * 100, 1) if naive_dist > 0 else 0.0

        naive_dur = naive_result.summary.total_duration_min
        or_dur = constrained_result.summary.total_duration_min
        time_saved_pct = round(((naive_dur - or_dur) / naive_dur) * 100, 1) if naive_dur > 0 else 0.0

        return {
            "route_id": dataset.route_id,
            "solvers": {
                "naive": naive_result.model_dump(),
                "unconstrained_ortools": unconstrained_result.model_dump(),
                "routemind_constrained": constrained_result.model_dump()
            },
            "metrics_comparison": {
                "distance_saved_km": round(naive_dist - or_dist, 2),
                "distance_saved_pct": dist_saved_pct,
                "time_saved_min": round(naive_dur - or_dur, 1),
                "time_saved_pct": time_saved_pct,
                "naive_violations": naive_result.summary.time_window_violations + naive_result.summary.cod_limit_violations + naive_result.summary.zone_violations,
                "routemind_violations": constrained_result.summary.time_window_violations + constrained_result.summary.cod_limit_violations + constrained_result.summary.zone_violations
            }
        }

# Global benchmark engine instance
benchmark_engine = BenchmarkEngine()
