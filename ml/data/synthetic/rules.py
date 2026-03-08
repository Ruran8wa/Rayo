def mobility_access_logic(floor_level, step_free_entrance, elevator_present):
    if floor_level == 0:
        return 1 if step_free_entrance else 0
    return 1 if elevator_present else 0

def correlated_signage(clear_signage):
    import random
    if clear_signage:
        return 1 if random.random() < 0.8 else 0
    return 1 if random.random() < 0.3 else 0