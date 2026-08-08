import uuid
import time
from sqlalchemy.orm import Session
from app.models.domain import RouteModel, StopModel
from app.models.schemas import OptimizeRequest, OptimizeResponse, StopSchema
from app.optimizer.ortools_solver import ORToolsVRPSolver
from app.optimizer.greedy_solver import NaiveGreedySolver
from app.constraints.engine import IndianConstraintsEngine
from app.utils.sample_dataset import get_sample_amazon_dataset

def run_route_optimization(request: OptimizeRequest, db: Session) -> OptimizeResponse:
    start_time = time.time()
    route_id = f"rt_{uuid.uuid4().hex[:8]}"

    from app.models.domain import DatasetModel

    # Load stops from request or dataset or default sample
    raw_stops = []
    if request.stops:
        raw_stops = [s.model_dump() for s in request.stops]
    elif request.dataset_id:
        ds = db.query(DatasetModel).filter(DatasetModel.id == request.dataset_id).first()
        if ds and ds.raw_json and "raw_csv" in ds.raw_json:
            csv_content = ds.raw_json["raw_csv"]
            lines = csv_content.splitlines()
            if len(lines) > 1:
                header = [h.strip().upper() for h in lines[0].split(',')]
                
                cust_idx = header.index("CUST NO.") if "CUST NO." in header else 0
                x_idx = header.index("XCOORD.") if "XCOORD." in header else 1
                y_idx = header.index("YCOORD.") if "YCOORD." in header else 2
                demand_idx = header.index("DEMAND") if "DEMAND" in header else 3
                ready_idx = header.index("READY TIME") if "READY TIME" in header else 4
                due_idx = header.index("DUE DATE") if "DUE DATE" in header else 5
                
                # Depot coordinate base
                depot_parts = lines[1].split(',')
                depot_x = float(depot_parts[x_idx]) if len(depot_parts) > x_idx else 40.0
                depot_y = float(depot_parts[y_idx]) if len(depot_parts) > y_idx else 50.0
                
                for idx, line in enumerate(lines[1:]):
                    if not line.strip():
                        continue
                    parts = line.split(',')
                    if len(parts) < max(x_idx, y_idx) + 1:
                        continue
                    
                    cust_no = parts[cust_idx].strip()
                    x_val = float(parts[x_idx])
                    y_val = float(parts[y_idx])
                    demand = float(parts[demand_idx]) if len(parts) > demand_idx else 0.0
                    
                    ready_min = float(parts[ready_idx]) if len(parts) > ready_idx else 0.0
                    due_min = float(parts[due_idx]) if len(parts) > due_idx else 1200.0
                    
                    tw_s_h = min(23, 8 + int(ready_min) // 60)
                    tw_s_m = int(ready_min) % 60
                    tw_e_h = min(23, 8 + int(due_min) // 60)
                    tw_e_m = int(due_min) % 60
                    
                    time_window_start = f"{tw_s_h:02d}:{tw_s_m:02d}"
                    time_window_end = f"{tw_e_h:02d}:{tw_e_m:02d}"
                    
                    # Scale Cartesian coordinates to Bengaluru bounding box
                    lat = 12.9716 + (y_val - depot_y) * 0.005
                    lng = 77.6412 + (x_val - depot_x) * 0.005
                    
                    is_depot = idx == 0
                    
                    raw_stops.append({
                        "stop_id": f"STP_{cust_no}",
                        "location_name": "Amazon Hub Indiranagar" if is_depot else f"Solomon Cust #{cust_no}",
                        "latitude": lat,
                        "longitude": lng,
                        "package_id": "DEPOT" if is_depot else f"AMZ-IN-{cust_no}",
                        "package_weight_kg": 0.0 if is_depot else 1.5,
                        "cod_amount_inr": 0.0 if is_depot else (demand * 250.0),
                        "time_window_start": time_window_start,
                        "time_window_end": time_window_end,
                        "is_no_entry_zone": False
                    })
        else:
            sample_ds = get_sample_amazon_dataset()
            raw_stops = sample_ds[0]["stops"]
    else:
        sample_ds = get_sample_amazon_dataset()
        raw_stops = sample_ds[0]["stops"]

    # Choose Solver
    solver_name = "Google OR-Tools VRPTW" if request.use_or_tools else "Naive Greedy Solver"
    if request.use_or_tools:
        solver = ORToolsVRPSolver()
        res = solver.solve(raw_stops)
    else:
        solver = NaiveGreedySolver()
        res = solver.solve(raw_stops)

    seq = res["route_sequence"]
    total_dist = res["total_distance_km"]
    total_time = res["total_time_min"]

    # Validate Constraints
    constraint_engine = IndianConstraintsEngine(
        max_cod_limit=request.max_cod_limit,
        max_vehicle_capacity=request.vehicle_capacity
    )
    is_valid, violations = constraint_engine.validate_route_constraints(raw_stops, total_time)

    # Save to Database
    route_db = RouteModel(
        id=route_id,
        route_name=f"Route - {route_id}",
        dataset_id=request.dataset_id,
        total_distance_km=total_dist,
        total_travel_time_min=total_time,
        total_stops_count=len(raw_stops),
        status="OPTIMIZED"
    )
    db.add(route_db)

    stop_schemas = []
    for idx, s_idx in enumerate(seq):
        s_data = raw_stops[s_idx]
        base_stop_id = s_data.get("stop_id") or f"stp_{uuid.uuid4().hex[:8]}"
        stop_id = f"{base_stop_id}_{route_id}"
        stop_obj = StopModel(
            id=stop_id,
            route_id=route_id,
            stop_sequence=idx + 1,
            location_name=s_data.get("location_name", f"Stop {idx+1}"),
            latitude=s_data.get("latitude", 12.9716),
            longitude=s_data.get("longitude", 77.6412),
            package_id=s_data.get("package_id"),
            package_weight_kg=s_data.get("package_weight_kg", 1.0),
            cod_amount_inr=s_data.get("cod_amount_inr", 0.0),
            time_window_start=s_data.get("time_window_start", "09:00"),
            time_window_end=s_data.get("time_window_end", "18:00"),
            is_no_entry_zone=s_data.get("is_no_entry_zone", False),
            no_entry_start=s_data.get("no_entry_start"),
            no_entry_end=s_data.get("no_entry_end"),
            eta=f"{8 + (idx*30)//60:02d}:{(idx*30)%60:02d} AM",
            status="PENDING"
        )
        db.add(stop_obj)
        stop_schemas.append(StopSchema.model_validate(stop_obj))

    db.commit()

    exec_time = round(time.time() - start_time, 3)

    return OptimizeResponse(
        route_id=route_id,
        route_name=route_db.route_name,
        total_distance_km=total_dist,
        total_travel_time_min=total_time,
        stops=stop_schemas,
        solver_used=solver_name,
        optimization_time_sec=exec_time,
        constraint_violations=violations
    )
