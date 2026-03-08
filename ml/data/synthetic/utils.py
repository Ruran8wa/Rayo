def compute_building_score(building_features, floors):
    mobility_score = (
        0.4 * building_features["step_free_entrance"] +
        0.4 * building_features["elevator_present"] +
        0.2 * building_features["handrails_present"]
    )

    avg_clear = sum(f["clear_signage"] for f in floors) / len(floors)
    avg_contrast = sum(f["high_contrast_signage"] for f in floors) / len(floors)

    vision_score = (
        0.6 * avg_clear +
        0.4 * avg_contrast
    )

    total_services = 0
    accessible_services = 0
    critical_services = 0
    accessible_critical = 0

    for floor in floors:
        for service in floor["services"]:
            total_services += 1
            if service["accessible"]:
                accessible_services += 1
            if service["priority_level"] == 1:
                critical_services += 1
                if service["accessible"]:
                    accessible_critical += 1

    service_ratio = (
        accessible_services / total_services
        if total_services else 0
    )

    critical_ratio = (
        accessible_critical / critical_services
        if critical_services else 0
    )

    overall = (
        0.4 * mobility_score +
        0.2 * vision_score +
        0.2 * service_ratio +
        0.2 * critical_ratio
    )

    return round(overall, 3)

def classify(score):
    if score >= 0.75:
        return "high"
    elif score >= 0.4:
        return "medium"
    return "low"

def aggregate_site_score(buildings):
    scores = [b["accessibility_score"] for b in buildings]
    return round(sum(scores) / len(scores), 3)