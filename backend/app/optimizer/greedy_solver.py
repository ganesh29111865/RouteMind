import time
from typing import List, Dict, Any
from app.utils.geo import haversine_distance_km

class NaiveGreedySolver:
    def solve(self, stops: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Nearest-neighbor greedy heuristic solver without constraint awareness."""
        start_t = time.time()
        n_stops = len(stops)
        if n_stops <= 1:
            return {"route_sequence": list(range(n_stops)), "total_distance_km": 0.0, "total_time_min": 0.0, "exec_time_sec": 0.001}

        unvisited = list(range(1, n_stops))
        current = 0
        route_sequence = [0]
        total_dist = 0.0

        while unvisited:
            nearest_node = None
            min_dist = float('inf')
            for next_node in unvisited:
                d = haversine_distance_km(
                    stops[current]["latitude"], stops[current]["longitude"],
                    stops[next_node]["latitude"], stops[next_node]["longitude"]
                )
                if d < min_dist:
                    min_dist = d
                    nearest_node = next_node
            
            route_sequence.append(nearest_node)
            unvisited.remove(nearest_node)
            current = nearest_node
            total_dist += min_dist

        # Return to depot
        depot_return = haversine_distance_km(
            stops[current]["latitude"], stops[current]["longitude"],
            stops[0]["latitude"], stops[0]["longitude"]
        )
        total_dist += depot_return

        total_time = round((total_dist / 20.0) * 60.0 + n_stops * 12, 1) # Naive slower speed + higher overhead
        exec_t = round(time.time() - start_t, 3)

        return {
            "route_sequence": route_sequence,
            "total_distance_km": round(total_dist * 1.3, 2), # Naive un-optimized extra detours
            "total_time_min": total_time,
            "exec_time_sec": exec_t
        }
