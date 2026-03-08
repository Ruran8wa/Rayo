from distribution import (
    sample_from_distribution,
    random_bool,
    PROBABILITIES,
    SITE_STRUCTURE_RULES
)
from floor_generator import generate_floor
from utils import compute_building_score, classify

def generate_building(building_id, site_type):
    floor_distribution = SITE_STRUCTURE_RULES[site_type]["floors"]
    total_floors = sample_from_distribution(floor_distribution)

    step_free_entrance = random_bool(PROBABILITIES["step_free_entrance"])
    ramps_present = random_bool(PROBABILITIES["ramps_present"])
    handrails_present = random_bool(PROBABILITIES["handrails_present"])

    if total_floors > 1:
        elevator_present = random_bool(PROBABILITIES["elevator_if_multifloor"])
    else:
        elevator_present = 0

    floors = []
    for level in range(total_floors):
        floor = generate_floor(
            level,
            step_free_entrance,
            elevator_present,
            site_type
        )
        floors.append(floor)

    building_features = {
        "step_free_entrance": step_free_entrance,
        "elevator_present": elevator_present,
        "handrails_present": handrails_present
    }

    score = compute_building_score(building_features, floors)
    label = classify(score)

    return {
        "building_id": building_id,
        "site_type": site_type,
        "total_floors": total_floors,
        "step_free_entrance": step_free_entrance,
        "ramps_present": ramps_present,
        "handrails_present": handrails_present,
        "elevator_present": elevator_present,
        "floors": floors,
        "accessibility_score": score,
        "accessibility_class": label
    }
