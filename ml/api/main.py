import sys
import os

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Any

# Make scripts directory importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))

from predict import predict_building

app = FastAPI(title="Rayo ML API", description="Accessibility prediction service")


class BuildingPayload(BaseModel):
    model_config = {"extra": "allow"}

    site_type: str
    structure: dict[str, Any]


class PredictionResult(BaseModel):
    accessibility_class: str
    accessibility_score: float


@app.get("/")
def root():
    return {"service": "Rayo ML API", "status": "ok", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict", response_model=PredictionResult)
def predict(payload: BuildingPayload):
    try:
        result = predict_building(payload.model_dump())
        if result.get("accessibility_class") == "unknown":
            raise HTTPException(status_code=422, detail="Could not extract features from building data")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
