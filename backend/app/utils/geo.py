import math
import numpy as np
from typing import List, Tuple

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates geodesic distance between two points in kilometers using Haversine formula."""
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c
    # Apply 1.25 urban road factor for Indian city traffic layout simulation
    return round(distance * 1.25, 3)

def calculate_distance_matrix(coords: List[Tuple[float, float]]) -> List[List[int]]:
    """Generates an integer distance matrix in meters for OR-Tools routing model."""
    n = len(coords)
    matrix = []
    for i in range(n):
        row = []
        for j in range(n):
            if i == j:
                row.append(0)
            else:
                dist_km = haversine_distance_km(coords[i][0], coords[i][1], coords[j][0], coords[j][1])
                row.append(int(dist_km * 1000)) # Convert to meters
        matrix.append(row)
    return matrix

def calculate_time_matrix(distance_matrix_meters: List[List[int]], avg_speed_kmh: float = 25.0) -> List[List[int]]:
    """Calculates travel time matrix in minutes assuming an average urban speed (e.g. 25 km/h in Bengaluru)."""
    n = len(distance_matrix_meters)
    time_matrix = []
    speed_m_per_min = (avg_speed_kmh * 1000) / 60.0
    for i in range(n):
        row = []
        for j in range(n):
            meters = distance_matrix_meters[i][j]
            minutes = int(meters / speed_m_per_min)
            row.append(minutes)
        time_matrix.append(row)
    return time_matrix
