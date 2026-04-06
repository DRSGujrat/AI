from langgraph.graph import StateGraph,END
from langgraph_states.travel_state import TravelState
from nodes import hotel_node, flight_node, planner_node,itinerary_node,ask_user_node,planner_route

builder = StateGraph(TravelState)
builder.add_node("ask_user",ask_user_node)

builder.add_node("Planner",planner_node)
builder.add_node("Flight",flight_node)
builder.add_node("Hotel",hotel_node)
builder.add_node("Itinerary",itinerary_node)


builder.set_entry_point("Planner")

builder.add_conditional_edges("Planner", planner_route,{
    "ask_user_node" : "ask_user",
    "Flights" : "Flight"

})
builder.add_edge("ask_user", END)

builder.add_edge('Flight',"Hotel")
builder.add_edge("Hotel","Itinerary")

builder.add_edge("Itinerary",END)


graph = builder.compile()

# Graph is now exported for the FastAPI router to invoke.