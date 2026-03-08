"""
Real-world data adapter.

Converts ALU / RMH style JSON into the same flat feature format
the trained model expects, applying heuristics for missing fields
(service accessibility, priority levels).
"""

import json

CRITICAL_SERVICES = {

    "icu", "picu", "nicu", "emergency", "pharmacy", "sub_pharmacy",
    "distribution_pharmacy", "laboratory", "hospitalization", "labor",
    "neonatology", "radio_theraphy", "scanner", "mri",

    "registrar", "library", "wellness_center", "sick_bay",

    "cashier", "customer_care", "insurance", "reception",
}

def _normalize(name):
    """Lowercase + underscore-normalize a service name."""
    return name.strip().lower().replace(" ", "_")

def _is_critical(service_name):
    return _normalize(service_name) in CRITICAL_SERVICES

def flatten_real_world(filepath):
    """
    Read a real-world JSON file (ALU or RMH format) and return
    a list of building-level feature dicts matching the trained model's
    expected input schema.
    """
    with open(filepath, "r") as f:
        site = json.load(f)

    site_type = site["site_type"].lower()
    buildings = site.get("structure", {}).get("buildings", site.get("buildings", []))

    rows = []

    for building in buildings:
        total_floors = building["total_floors"]

        entrance = building.get("entrance", {})
        vert = building.get("vertical_access", {})

        step_free = int(entrance.get("step_free", False))
        handrails = int(vert.get("handrails_present", False))
        elevator = int(vert.get("elevator_present", False))

        total_services = 0
        num_accessible = 0
        num_critical = 0
        num_accessible_critical = 0
        num_services_ground = 0
        num_services_upper = 0
        num_critical_upper = 0

        signage_clear_sum = 0
        signage_contrast_sum = 0
        counted_floors = 0

        for floor in building.get("floors", []):

            if floor.get("service_scope") == "out_of_scope":
                continue

            floor_level = int(floor.get("floor_level", 0))

            acc_block = floor.get("accessibility", {})
            vision = acc_block.get("vision_support", {})
            clear_signage = int(vision.get("clear_signage", False))
            high_contrast = int(vision.get("high_contrast_signage", False))
            signage_clear_sum += clear_signage
            signage_contrast_sum += high_contrast
            counted_floors += 1

            floor_accessible = acc_block.get("mobility_accessible", False)

            if floor_level == 0:
                floor_reachable = bool(step_free)
            else:
                floor_reachable = bool(elevator)

            service_accessible = floor_accessible and floor_reachable

            services = floor.get("services", [])
            for svc in services:
                total_services += 1
                is_crit = _is_critical(svc)

                if service_accessible:
                    num_accessible += 1

                if is_crit:
                    num_critical += 1
                    if service_accessible:
                        num_accessible_critical += 1
                    if floor_level > 0:
                        num_critical_upper += 1

                if floor_level == 0:
                    num_services_ground += 1
                else:
                    num_services_upper += 1

        avg_clear = (
            round(signage_clear_sum / counted_floors, 3) if counted_floors else 0
        )
        avg_high_contrast = (
            round(signage_contrast_sum / counted_floors, 3) if counted_floors else 0
        )
        accessible_service_ratio = (
            round(num_accessible / total_services, 3) if total_services else 0
        )
        upper_service_ratio = (
            round(num_services_upper / total_services, 3) if total_services else 0
        )
        critical_upper_ratio = (
            round(num_critical_upper / num_critical, 3) if num_critical else 0
        )
        accessible_critical_ratio = (
            round(num_accessible_critical / num_critical, 3) if num_critical else 0
        )

        mobility_score = 0.4 * step_free + 0.4 * elevator + 0.2 * handrails
        vision_score = 0.6 * avg_clear + 0.4 * avg_high_contrast
        svc_ratio = num_accessible / total_services if total_services else 0
        crit_ratio = num_accessible_critical / num_critical if num_critical else 0

        expected_score = round(
            0.4 * mobility_score + 0.2 * vision_score
            + 0.2 * svc_ratio + 0.2 * crit_ratio,
            3,
        )

        if expected_score >= 0.75:
            expected_class = "high"
        elif expected_score >= 0.4:
            expected_class = "medium"
        else:
            expected_class = "low"

        rows.append({
            "building_id": building.get("building_id", ""),
            "building_name": building.get("building_name", ""),
            "site_type": site_type,
            "total_floors": total_floors,
            "step_free_entrance": step_free,
            "handrails_present": handrails,
            "elevator_present": elevator,
            "total_services": total_services,
            "avg_clear_signage": avg_clear,
            "avg_high_contrast": avg_high_contrast,
            "accessible_service_ratio": accessible_service_ratio,
            "upper_service_ratio": upper_service_ratio,
            "critical_upper_ratio": critical_upper_ratio,
            "accessible_critical_ratio": accessible_critical_ratio,

            "num_critical_services": num_critical,
            "num_services_ground": num_services_ground,
            "num_services_upper": num_services_upper,
            "num_critical_upper": num_critical_upper,

            "expected_score": expected_score,
            "expected_class": expected_class,
        })

    return rows
