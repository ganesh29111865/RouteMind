from typing import List, Dict, Any, Tuple

class IndianConstraintsEngine:
    def __init__(self, 
                 max_cod_limit: float = 50000.0, 
                 max_vehicle_capacity: int = 150, 
                 max_driving_hours: float = 8.0):
        self.max_cod_limit = max_cod_limit
        self.max_vehicle_capacity = max_vehicle_capacity
        self.max_driving_hours = max_driving_hours

    def validate_route_constraints(self, stops: List[Dict[str, Any]], total_travel_time_min: float) -> Tuple[bool, List[str]]:
        """Evaluates all 5 Indian logistics constraints on a given candidate route."""
        violations = []

        # 1. COD Cash Limit Check
        total_cod = sum(s.get("cod_amount_inr", 0.0) for s in stops)
        if total_cod > self.max_cod_limit:
            violations.append(f"COD Cash Limit Exceeded: Total ₹{total_cod:,.2f} exceeds max allowed ₹{self.max_cod_limit:,.2f}")

        # 2. Vehicle Package Capacity Check
        total_packages = len([s for s in stops if s.get("package_id") != "DEPOT"])
        if total_packages > self.max_vehicle_capacity:
            violations.append(f"Vehicle Capacity Exceeded: {total_packages} packages exceeds max vehicle limit of {self.max_vehicle_capacity}")

        # 3. Legal Driving Hours Check
        driving_hours = total_travel_time_min / 60.0
        if driving_hours > self.max_driving_hours:
            violations.append(f"Legal Driving Hours Exceeded: {driving_hours:.1f} hrs exceeds continuous driver limit of {self.max_driving_hours:.1f} hrs")

        # 4. No-Entry Zone & Delivery Time Windows Check
        current_time_min = 8 * 60 # Assume start at 08:00 AM (480 mins from midnight)
        for idx, stop in enumerate(stops):
            if idx == 0:
                continue # Depot
            
            # Simple travel addition (e.g. 15 min per stop + travel)
            current_time_min += 20
            
            # Time Window Check
            tw_start_str = stop.get("time_window_start", "08:00")
            tw_end_str = stop.get("time_window_end", "20:00")
            
            sh, sm = map(int, tw_start_str.split(":"))
            eh, em = map(int, tw_end_str.split(":"))
            
            tw_start_min = sh * 60 + sm
            tw_end_min = eh * 60 + em
            
            if current_time_min < tw_start_min:
                # Driver arrived early, must wait (not a failure, but noted)
                pass
            elif current_time_min > tw_end_min:
                violations.append(f"Time Window Missed at Stop #{idx} ({stop.get('location_name')}): Arrived at {current_time_min//60:02d}:{current_time_min%60:02d}, window closed at {tw_end_str}")

            # No-Entry Zone Timing Check
            if stop.get("is_no_entry_zone"):
                ne_start = stop.get("no_entry_start", "08:00")
                ne_end = stop.get("no_entry_end", "11:00")
                nsh, nsm = map(int, ne_start.split(":"))
                neh, nem = map(int, ne_end.split(":"))
                ne_s_min = nsh * 60 + nsm
                ne_e_min = neh * 60 + nem
                
                if ne_s_min <= current_time_min <= ne_e_min:
                    violations.append(f"No-Entry Zone Violation at Stop #{idx} ({stop.get('location_name')}): Vehicle entered restricted zone during active ban hours ({ne_start} - {ne_end})")

        is_valid = len(violations) == 0
        return is_valid, violations
