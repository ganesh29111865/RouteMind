"""
Distance & Transit Duration Matrix Generator for Urban Indian Logistics Networks
"""
import math
from typing import List, Tuple, Dict, Any
from haversine import haversine, Unit

class DistanceMatrixGenerator:
    """Generates pairwise distance (meters) and duration (seconds) matrices."""
    
    # 1.3x circuity factor for Indian urban road networks, 22 km/h average speed
    CIRCUITY_FACTOR = 1.3
    AVG_SPEED_KMH = 22.0

    @classmethod
    def generate_matrices(cls, depot_coords: Tuple[float, float], stop_coords: List[Tuple[float, float]]) -> Dict[str, Any]:
        all_coords = [depot_coords] + stop_coords
        n = len(all_coords)

        distance_matrix = [[0 for _ in range(n)] for _ in range(n)]
        duration_matrix = [[0 for _ in range(n)] for _ in range(n)]

        for i in range(n):
            for j in range(n):
                if i == j:
                    distance_matrix[i][j] = 0
                    duration_matrix[i][j] = 0
                else:
                    direct_dist_km = haversine(all_coords[i], all_coords[j], unit=Unit.KILOMETERS)
                    road_dist_km = direct_dist_km * cls.CIRCUITY_FACTOR
                    
                    # Convert to meters
                    distance_matrix[i][j] = int(road_dist_km * 1000)
                    
                    # Travel duration in seconds
                    duration_sec = int((road_dist_km / cls.AVG_SPEED_KMH) * 3600)
                    duration_matrix[i][j] = duration_sec

        return {
            "distance_matrix_m": distance_matrix,
            "duration_matrix_sec": duration_matrix,
            "num_locations": n
        }

matrix_generator = DistanceMatrixGenerator()

def build_distance_and_duration_matrices(depot_coords: Tuple[float, float], stop_coords: List[Tuple[float, float]]) -> Tuple[List[List[int]], List[List[int]]]:
    """Helper function to build distance and duration matrices."""
    matrices = matrix_generator.generate_matrices(depot_coords, stop_coords)
    return matrices["distance_matrix_m"], matrices["duration_matrix_sec"]
