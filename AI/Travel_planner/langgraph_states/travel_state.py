from pydantic import BaseModel
from typing import Optional,Dict,List
from datetime import date

class TravelState(BaseModel):
    query: str

    destination: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget: Optional[int] = None
    preferences: Optional[List[str]] = None

    flight: Optional[Dict[str, int]] = None
    hotels: Optional[Dict[str, int]] = None
    itinerary: Optional[str] = None

class PlannerOutput(BaseModel):
    destination: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget: Optional[int] = None
    preferences: Optional[List[str]] = None

class Activity(BaseModel):
    time: str
    description: str
    location: str

class DayPlan(BaseModel):
    day_number: int
    date: str
    theme: str
    activities: List[Activity]

class ItineraryOutput(BaseModel):
    itinerary: List[DayPlan]
    total_estimated_cost: int


