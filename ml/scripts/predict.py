
"""
Prediction entry point for the Rayo accessibility model.

Reads a building JSON from stdin, runs the real_world_adapter + model,
and prints the prediction result as JSON to stdout.
"""

import json
import sys
import os
import tempfile

import joblib
import numpy as np
import pandas as pd

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(SCRIPT_DIR, '..', 'models')

sys.path.insert(0, SCRIPT_DIR)
from real_world_adapter import flatten_real_world

def load_model():
    """Load trained model artifacts."""
    model = joblib.load(os.path.join(MODELS_DIR, 'accessibility_model.joblib'))
    label_encoder = joblib.load(os.path.join(MODELS_DIR, 'label_encoder.joblib'))
    metadata = joblib.load(os.path.join(MODELS_DIR, 'model_metadata.joblib'))
    return model, label_encoder, metadata

def predict_building(building_json: dict) -> dict:
    """
    Run prediction on a single building.

    Args:
        building_json: Site-level JSON with structure.buildings containing one building.

    Returns:
        dict with accessibility_class and accessibility_score.
    """
    model, label_encoder, metadata = load_model()

    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as tmp:
        json.dump(building_json, tmp)
        tmp_path = tmp.name

    try:
        rows = flatten_real_world(tmp_path)
    finally:
        os.unlink(tmp_path)

    if not rows:
        return {
            'accessibility_class': 'unknown',
            'accessibility_score': 0.0,
        }

    row = rows[0]

    feature_names = metadata.get('feature_names', metadata.get('features', []))
    features = {k: row.get(k, 0) for k in feature_names}
    df = pd.DataFrame([features])

    predicted_label = model.predict(df)[0]
    probabilities = model.predict_proba(df)[0]

    if hasattr(predicted_label, 'item'):
        predicted_label = predicted_label.item()

    try:
        class_name = label_encoder.inverse_transform([predicted_label])[0]
    except (ValueError, TypeError):
        class_name = str(predicted_label)

    predicted_index = list(model.classes_).index(predicted_label)
    score = round(float(probabilities[predicted_index]), 4)

    return {
        'accessibility_class': class_name,
        'accessibility_score': score,
    }

def main():
    """Read JSON from stdin, predict, write JSON to stdout."""
    try:
        input_data = json.loads(sys.stdin.read())
        result = predict_building(input_data)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({
            'error': str(e),
            'accessibility_class': 'unknown',
            'accessibility_score': 0.0,
        }), file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
