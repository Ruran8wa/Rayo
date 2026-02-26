import json
import pandas as pd

input_file = "../data/synthetic/data/synthetic_dataset_v1.json"
output_file = "../data/processed/building_level.csv"


def flatten_dataset():
    with open(input_file, "r") as f:
        sites = json.load(f)

    rows = []

    for site in sites:
        site_type = site["site_type"]

        for building in site["buildings"]:
            total_floors = building["total_floors"]
            step_free = int(building["step_free_entrance"])
            ramps = int(building["ramps_present"])
            handrails = int(building["handrails_present"])
            elevator = int(building["elevator_present"])

            total_services = 0
            num_accessible_services = 0
            num_critical_services = 0
            num_accessible_critical = 0

            num_services_ground = 0
            num_services_upper = 0
            num_critical_upper = 0

            # Vision feature accumulators
            signage_clear_sum = 0
            signage_contrast_sum = 0
            num_floors = len(building["floors"])

            for floor in building["floors"]:
                floor_level = floor["floor_level"]

                # Accumulate vision features per floor
                signage_clear_sum += int(floor.get("clear_signage", 0))
                signage_contrast_sum += int(
                    floor.get("high_contrast_signage", 0)
                )

                for service in floor.get("services", []):
                    priority = service["priority_level"]
                    accessible = service["accessible"]

                    total_services += 1

                    if accessible:
                        num_accessible_services += 1

                    if priority == 1:
                        num_critical_services += 1
                        if accessible:
                            num_accessible_critical += 1
                        if floor_level > 0:
                            num_critical_upper += 1

                    if floor_level == 0:
                        num_services_ground += 1
                    if floor_level > 0:
                        num_services_upper += 1

            # Vision features (averaged across floors)
            avg_clear_signage = (
                round(signage_clear_sum / num_floors, 3)
                if num_floors else 0
            )
            avg_high_contrast = (
                round(signage_contrast_sum / num_floors, 3)
                if num_floors else 0
            )

            # Ratio features
            accessible_service_ratio = (
                round(num_accessible_services / total_services, 3)
                if total_services else 0
            )
            upper_service_ratio = (
                round(num_services_upper / total_services, 3)
                if total_services else 0
            )
            critical_upper_ratio = (
                round(num_critical_upper / num_critical_services, 3)
                if num_critical_services else 0
            )
            accessible_critical_ratio = (
                round(num_accessible_critical / num_critical_services, 3)
                if num_critical_services else 0
            )

            accessibility_class = building["accessibility_class"]

            rows.append({
                "site_type": site_type,
                "total_floors": total_floors,
                "step_free_entrance": step_free,
                "ramps_present": ramps,
                "handrails_present": handrails,
                "elevator_present": elevator,

                "total_services": total_services,
                "num_accessible_services": num_accessible_services,
                "num_critical_services": num_critical_services,
                "num_accessible_critical": num_accessible_critical,
                "num_services_ground": num_services_ground,
                "num_services_upper": num_services_upper,
                "num_critical_upper": num_critical_upper,

                "avg_clear_signage": avg_clear_signage,
                "avg_high_contrast": avg_high_contrast,

                "accessible_service_ratio": accessible_service_ratio,
                "upper_service_ratio": upper_service_ratio,
                "critical_upper_ratio": critical_upper_ratio,
                "accessible_critical_ratio": accessible_critical_ratio,

                "accessibility_class": accessibility_class
            })

    df = pd.DataFrame(rows)
    df.to_csv(output_file, index=False)
    print(f"Saved building-level dataset to {output_file}")
    print(f"Shape: {df.shape}")
    print(f"Columns: {list(df.columns)}")


if __name__ == "__main__":
    flatten_dataset()
