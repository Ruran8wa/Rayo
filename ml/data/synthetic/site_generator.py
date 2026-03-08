import json
from distribution import (
    sample_from_distribution,
    SITE_TYPE_DISTRIBUTION,
    BUILDINGS_PER_SITE_DISTRIBUTION
)
from building_generator import generate_building
from utils import aggregate_site_score

def generate_site(site_id):
    site_type = sample_from_distribution(SITE_TYPE_DISTRIBUTION)
    num_buildings = sample_from_distribution(BUILDINGS_PER_SITE_DISTRIBUTION)

    buildings = []

    for i in range(num_buildings):
        building_id = f"{site_id}_B{i}"
        buildings.append(generate_building(building_id, site_type))

    site_score = aggregate_site_score(buildings)

    return {
        "site_id": site_id,
        "site_type": site_type,
        "num_buildings": num_buildings,
        "site_score": site_score,
        "buildings": buildings
    }

def generate_dataset(num_sites=300, output_file="synthetic_dataset_v1.json"):
    dataset = []

    for i in range(num_sites):
        site_id = f"SYN_SITE_{i:03d}"
        dataset.append(generate_site(site_id))

    with open(output_file, "w") as f:
        json.dump(dataset, f, indent=4)

    print(f"Generated {num_sites} sites.")
