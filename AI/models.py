from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import date

class ManualOverrides(BaseModel):
    budget: Optional[int] = None
    destination: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class PlanRequest(BaseModel):
    query: str
    manual_overrides: Optional[ManualOverrides] = None

class PlanResponse(BaseModel):
    status: str
    missing_fields: Optional[List[str]] = None
    itinerary: Optional[List[Dict[str, Any]]] = None
    flight_cost: Optional[Dict[str, int]] = None
    hotel_cost: Optional[Dict[str, int]] = None
