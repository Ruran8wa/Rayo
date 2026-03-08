import random

FLOOR_DISTRIBUTION = {
    1: 0.4,
    2: 0.3,
    3: 0.2,
    4: 0.07,
    5: 0.03
}

BUILDINGS_PER_SITE_DISTRIBUTION = {
    1: 0.5,
    2: 0.3,
    3: 0.15,
    4: 0.05
}

SITE_TYPE_DISTRIBUTION = {
    "bank": 0.3,
    "hospital": 0.25,
    "school": 0.3,
    "library": 0.15
}

SITE_STRUCTURE_RULES = {
    "bank": {
        "floors": {1: 0.8, 2: 0.15, 3: 0.05},
        "services_ground": (2, 4),
        "services_upper": (0, 1)
    },
    "hospital": {
        "floors": {1: 0.1, 2: 0.2, 3: 0.3, 4: 0.25, 5: 0.15},
        "services_ground": (4, 8),
        "services_upper": (3, 6)
    },
    "school": {
        "floors": {1: 0.3, 2: 0.4, 3: 0.2, 4: 0.1},
        "services_ground": (3, 6),
        "services_upper": (2, 5)
    },
    "library": {
        "floors": {1: 0.6, 2: 0.3, 3: 0.1},
        "services_ground": (2, 5),
        "services_upper": (1, 3)
    }
}

PROBABILITIES = {
    "step_free_entrance": 0.75,
    "ramps_present": 0.5,
    "handrails_present": 0.7,
    "elevator_if_multifloor": 0.6,
    "clear_signage": 0.7,
    "written_instructions": 0.6
}

def sample_from_distribution(distribution_dict):
    values = list(distribution_dict.keys())
    weights = list(distribution_dict.values())
    return random.choices(values, weights=weights, k=1)[0]

def random_bool(probability):
    return 1 if random.random() < probability else 0
