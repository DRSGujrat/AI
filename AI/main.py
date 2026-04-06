import sys
import os

# Ensure the subdirectories are in the python path to avoid import errors 
# since planner_graph uses absolute imports assuming Travel_planner is the root.
sys.path.append(os.path.join(os.path.dirname(__file__), 'Travel_planner'))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

from models import PlanRequest, PlanResponse
from Travel_planner.planner_graph import graph

app = FastAPI(title="AI Travel Planner API")

# Add CORS Middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Change this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/travel/plan", response_model=PlanResponse)
async def plan_travel(request: PlanRequest):
    # Prepare the initial state
    input_state = {
        "query": request.query
    }
    
    # If the user has supplied manual overrides (e.g. from the frontend form),
    # inject them into the initial state overrides so the langgraph agent uses them.
    if request.manual_overrides:
        if request.manual_overrides.budget:
            input_state["budget"] = request.manual_overrides.budget
        if request.manual_overrides.destination:
            input_state["destination"] = request.manual_overrides.destination
        if request.manual_overrides.start_date:
            input_state["start_date"] = request.manual_overrides.start_date
        if request.manual_overrides.end_date:
            input_state["end_date"] = request.manual_overrides.end_date
            
    # Invoke the LangGraph agent
    try:
        result = graph.invoke(input_state)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    # Check if the graph ended early at ask_user_node because of missing info
    if result.get("missing_fields") and len(result["missing_fields"]) > 0:
        return PlanResponse(
            status="missing_info",
            missing_fields=result["missing_fields"]
        )
        
    # Otherwise, returning the full successful itinerary
    return PlanResponse(
        status="success",
        itinerary=result.get("itinerary"),
        flight_cost=result.get("flight"),
        hotel_cost=result.get("hotels")
    )

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
