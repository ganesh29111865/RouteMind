"""
RouteMind Dataset Loader Service
Ingests Amazon Last Mile Routing Research Challenge dataset JSON files.
"""
import os
import json
from typing import List, Dict, Any, Optional
from app.models.schemas import RouteDataset, Stop, Depot, StopType

class DatasetLoader:
    def __init__(self, data_dir: str = None):
        if data_dir is None:
            data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
        self.data_dir = data_dir
        self.routes_cache: Dict[str, RouteDataset] = {}
        self.load_all_sample_routes()

    def load_all_sample_routes(self):
        """Discovers and loads all sample Amazon dataset JSON files in data directory."""
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir, exist_ok=True)
        
        # Load primary sample
        sample_path = os.path.join(self.data_dir, "sample_amazon_route.json")
        if os.path.exists(sample_path):
            with open(sample_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                route = self._parse_amazon_json(data)
                self.routes_cache[route.route_id] = route

    def load_custom_json(self, raw_json: Dict[str, Any]) -> RouteDataset:
        """Parses a custom uploaded Amazon JSON dataset."""
        route = self._parse_amazon_json(raw_json)
        self.routes_cache[route.route_id] = route
        return route

    def get_route(self, route_id: str) -> Optional[RouteDataset]:
        """Retrieves parsed route dataset by ID."""
        return self.routes_cache.get(route_id)

    def list_available_routes(self) -> List[Dict[str, Any]]:
        """Returns metadata list of all available ingested routes."""
        summary_list = []
        for rid, route in self.routes_cache.items():
            total_cod = sum(s.cod_amount for s in route.stops)
            total_packages = sum(s.package_count for s in route.stops)
            zones = set(s.zone_id for s in route.stops)
            summary_list.append({
                "route_id": rid,
                "city": route.city,
                "date": route.date,
                "total_stops": len(route.stops),
                "total_cod_amount": total_cod,
                "total_packages": total_packages,
                "depot_address": route.depot.address,
                "zones_count": len(zones)
            })
        return summary_list

    def _parse_amazon_json(self, data: Dict[str, Any]) -> RouteDataset:
        route_id = data.get("route_id", "ROUTE_AMZN_BOM_4001")
        city = data.get("city", "Mumbai")
        date = data.get("date", "2026-08-08")

        depot_raw = data.get("depot", {
            "depot_id": "DEPOT_KURLA_01",
            "lat": 19.0657,
            "lng": 72.8797,
            "address": "Amazon Last Mile Logistics Hub, Kurla West, Mumbai, MH 400070",
            "operating_hours": [480, 1200]
        })
        depot = Depot(
            depot_id=depot_raw.get("depot_id", "DEPOT_BOM_01"),
            lat=float(depot_raw.get("lat", 19.0657)),
            lng=float(depot_raw.get("lng", 72.8797)),
            address=depot_raw.get("address", "Amazon Hub, Kurla"),
            operating_hours=tuple(depot_raw.get("operating_hours", [480, 1200]))
        )

        stops_raw = data.get("stops", [])
        parsed_stops: List[Stop] = []
        for idx, s in enumerate(stops_raw):
            tw_raw = s.get("time_window", [480, 1080])
            st = s.get("stop_type", "delivery")
            stop_obj = Stop(
                stop_id=s.get("stop_id", f"STP_{idx+1:02d}"),
                lat=float(s.get("lat")),
                lng=float(s.get("lng")),
                address=s.get("address", f"Delivery Stop #{idx+1}"),
                stop_type=StopType(st) if st in [e.value for e in StopType] else StopType.DELIVERY,
                time_window=(int(tw_raw[0]), int(tw_raw[1])),
                service_time_min=int(s.get("service_time_min", 10)),
                package_count=int(s.get("package_count", 1)),
                cod_amount=float(s.get("cod_amount", 0.0)),
                zone_id=s.get("zone_id", "ZONE_GENERIC"),
                sequence=int(s.get("sequence", idx + 1))
            )
            parsed_stops.append(stop_obj)

        return RouteDataset(
            route_id=route_id,
            city=city,
            date=date,
            depot=depot,
            stops=parsed_stops
        )

loader = DatasetLoader()
