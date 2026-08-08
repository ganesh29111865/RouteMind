from typing import List, Dict, Any

def get_sample_amazon_dataset() -> List[Dict[str, Any]]:
    """Returns a realistic Amazon Last Mile Routing Challenge dataset sample for Bengaluru City."""
    return [
        {
            "route_id": "Route_BLR_01",
            "hub_name": "Amazon Indiranagar Sorting Hub",
            "hub_latitude": 12.9716,
            "hub_longitude": 77.6412,
            "stops": [
                {
                    "stop_id": "STP_DEPOT",
                    "location_name": "Amazon Hub Indiranagar",
                    "latitude": 12.9716,
                    "longitude": 77.6412,
                    "package_id": "DEPOT",
                    "package_weight_kg": 0.0,
                    "cod_amount_inr": 0.0,
                    "time_window_start": "08:00",
                    "time_window_end": "20:00",
                    "is_no_entry_zone": False
                },
                {
                    "stop_id": "STP_101",
                    "location_name": "Koramangala 4th Block - Flat 302",
                    "latitude": 12.9352,
                    "longitude": 77.6245,
                    "package_id": "AMZ-IN-9812",
                    "package_weight_kg": 2.5,
                    "cod_amount_inr": 2500.0,
                    "time_window_start": "09:00",
                    "time_window_end": "12:00",
                    "is_no_entry_zone": False
                },
                {
                    "stop_id": "STP_102",
                    "location_name": "HSR Layout Sector 1 - Villa 45",
                    "latitude": 12.9121,
                    "longitude": 77.6445,
                    "package_id": "AMZ-IN-9813",
                    "package_weight_kg": 1.2,
                    "cod_amount_inr": 1200.0,
                    "time_window_start": "10:00",
                    "time_window_end": "14:00",
                    "is_no_entry_zone": False
                },
                {
                    "stop_id": "STP_103",
                    "location_name": "Bellandur EcoSpace Tech Park",
                    "latitude": 12.9279,
                    "longitude": 77.6811,
                    "package_id": "AMZ-IN-9814",
                    "package_weight_kg": 4.8,
                    "cod_amount_inr": 5000.0,
                    "time_window_start": "11:00",
                    "time_window_end": "16:00",
                    "is_no_entry_zone": True,
                    "no_entry_start": "14:00",
                    "no_entry_end": "17:00"
                },
                {
                    "stop_id": "STP_104",
                    "location_name": "Whitefield ITPB Main Gate",
                    "latitude": 12.9863,
                    "longitude": 77.7381,
                    "package_id": "AMZ-IN-9815",
                    "package_weight_kg": 3.1,
                    "cod_amount_inr": 850.0,
                    "time_window_start": "13:00",
                    "time_window_end": "18:00",
                    "is_no_entry_zone": False
                }
            ]
        }
    ]
