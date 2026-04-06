from langgraph_states.travel_state import TravelState,PlannerOutput,DayPlan,ItineraryOutput,Activity
import re
import json
from datetime import datetime
from google import genai
from datetime import datetime

client = genai.Client(api_key="AIzaSyBVGbAitWnI_mumhm0lBf090MuJ9jc4TQg")

def planner_node(state: TravelState):
    text = state.query
    # ... prompt and response code ...
    prompt = f"""
You are a travel planning assistant. Your goal is to extract structured travel information from a user's query.

USER QUERY: "{state.query}"

DIRECTIONS:
1. Extract the destination, start_date, end_date, budget, and travel preferences.
2. The dates MUST be in "YYYY-MM-DD" format. If a date is missing, return null.
3. The budget MUST be an integer. If missing, return null.
4. Preferences should be a list of strings (e.g., ["beach", "luxury", "vegan-friendly"]).
5. Return ONLY a valid JSON object. Do not include any conversational text or explanations.

REQUIRED JSON SCHEMA:
{{
    "destination": string or null,
    "start_date": "YYYY-MM-DD" or null,
    "end_date": "YYYY-MM-DD" or null,
    "budget": integer or null,
    "preferences": [string] or null
}}
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents=prompt
    )

    
    raw = response.text.strip()
    # Remove markdown blocks more safely
    if "```json" in raw:
        raw = raw.split("```json")[1].split("```")[0].strip()
    elif "```" in raw:
        raw = raw.split("```")[1].split("```")[0].strip()

    try:
        data = json.loads(raw)
        
        # Safer date conversion
        for key in ["start_date", "end_date"]:
            if data.get(key) and isinstance(data[key], str) and len(data[key]) > 0:
                data[key] = datetime.strptime(data[key], "%Y-%m-%d").date()
            else:
                data[key] = None # Ensure it's None, not an empty string

        parsed = PlannerOutput(**data)
        return parsed.model_dump(exclude_none=True)
        
    except (json.JSONDecodeError, ValueError) as e:
        print(f"Parsing Error: {e}")
        return {"error": "Failed to parse LLM output"}

def parse_json(text: str):
    try:
        # remove markdown formatting
        text = text.replace("```json", "").replace("```", "").strip()

        # sometimes LLM adds extra text before/after JSON
        start = text.find("{")
        end = text.rfind("}") + 1

        if start != -1 and end != -1:
            text = text[start:end]

        return json.loads(text)

    except Exception as e:
        print("JSON parsing failed:", e)
        return {}

def planner_route(state : TravelState):
    
     
    # if budget , destination or dates are missing , flag the user and ask again for the following

    if state.destination is None or state.start_date is None or state.end_date is None or state.budget is None:
        
        return "ask_user_node"
    else:
        return "Flights"

def ask_user_node(state: TravelState):
    missing_info = []

    if state.destination is None:
        missing_info.append("destination")
    if state.start_date is None:
        missing_info.append("start_date")
    if state.end_date is None:
        missing_info.append("end_date")
    if state.budget is None:
        missing_info.append("budget")

    print("Please enter:", missing_info)

    updates = {}

    for field in missing_info:
        if field == "destination":
            updates["destination"] = input("Destination: ")

        elif field == "start_date":
            updates["start_date"] = datetime.strptime(
                input("Start date (YYYY-MM-DD): "), "%Y-%m-%d"
            ).date()

        elif field == "end_date":
            updates["end_date"] = datetime.strptime(
                input("End date (YYYY-MM-DD): "), "%Y-%m-%d"
            ).date()

        elif field == "budget":
            updates["budget"] = int(input("Budget: "))

    return updates

def flight_node(state: TravelState):
    # Simple deterministic pricing logic
    base_price = 4000

    if state.budget:
        if state.budget > 100000:
            base_price = 8000
        elif state.budget > 50000:
            base_price = 6000

    flights = {
        "IndiGo": base_price,
        "Air India": base_price + 1500,
        "Vistara": base_price + 2500
    }

    return {"flight": flights}

def hotel_node(state: TravelState):
    # Simple tiering based on budget
    if state.budget is None:
        budget_tier = "mid"
    elif state.budget < 20000:
        budget_tier = "low"
    elif state.budget < 80000:
        budget_tier = "mid"
    else:
        budget_tier = "high"

    if budget_tier == "low":
        hotels = {
            "OYO Rooms": 1200,
            "Zostel": 1500,
            "Budget Inn": 1800
        }

    elif budget_tier == "mid":
        hotels = {
            "Treebo": 3000,
            "FabHotel": 3500,
            "Lemon Tree": 4500
        }

    else:
        hotels = {
            "Taj Hotel": 9000,
            "ITC Hotels": 11000,
            "Marriott": 13000
        }

    return {"hotels": hotels}

def itinerary_node(state: TravelState):
    # Pass all relevant details from the state into the prompt
    prompt = f"""
    You are an expert Indian Travel Guide. Create a day-by-day itinerary for:
    Destination: {state.destination}
    Dates: {state.start_date} to {state.end_date}
    Budget: ₹{state.budget}
    Preferences: {", ".join(state.preferences) if state.preferences else "None"}

    DIRECTIONS:
    1. Organize the trip day-by-day.
    2. For each day, provide a theme (e.g., "South Mumbai Heritage") and 3-4 specific activities.
    3. Include local Indian travel tips (e.g., "Use local trains for fast travel" or "Try street food at Chowpatty").
    4. Ensure the total cost of activities stays within the budget.
    5. Return ONLY a valid JSON object matching the schema below.
    6. Give total budget using the expenses

    JSON SCHEMA:
    {{
        "itinerary": [
            {{
                "day_number": 1,
                "date": "YYYY-MM-DD",
                "theme": "string",
                "activities": [
                    {{"time": "9:00 AM", "description": "text", "location": "text"}}
                ]
            }}
        ],
        "total_estimated_cost": integer
    }}
    """

    response = client.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents=prompt
    )

    # Use the same cleaning logic we discussed for planner_node
    raw = response.text.strip()
    if "```json" in raw:
        raw = raw.split("```json")[1].split("```")[0].strip()
    
    data = json.loads(raw)
    parsed = ItineraryOutput(**data)

    # Return the structured itinerary to update the state
    return {"itinerary": parsed.model_dump()["itinerary"]}
