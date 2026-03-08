import random
from distribution import random_bool, PROBABILITIES, SITE_STRUCTURE_RULES
from rules import mobility_access_logic, correlated_signage

def generate_floor(floor_level, step_free_entrance, elevator_present, site_type):
    mobility_accessible = mobility_access_logic(
        floor_level,
        step_free_entrance,
        elevator_present
    )

    clear_signage = random_bool(PROBABILITIES["clear_signage"])
    high_contrast_signage = correlated_signage(clear_signage)
    written_instructions = random_bool(PROBABILITIES["written_instructions"])

    service_range = (
        SITE_STRUCTURE_RULES[site_type]["services_ground"]
        if floor_level == 0
        else SITE_STRUCTURE_RULES[site_type]["services_upper"]
    )

    num_services = random.randint(service_range[0], service_range[1])

    services = []

    for i in range(num_services):
        accessible = 1 if mobility_accessible else 0

        if accessible == 1 and random.random() < 0.1:
            accessible = 0

        services.append({
            "service_id": f"S_{floor_level}_{i}",
            "priority_level": random.choice([1, 2, 3]),
            "accessible": accessible
        })

    return {
        "floor_level": floor_level,
        "mobility_accessible": mobility_accessible,
        "clear_signage": clear_signage,
        "high_contrast_signage": high_contrast_signage,
        "written_instructions": written_instructions,
        "services": services
    }
