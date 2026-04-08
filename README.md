# ✈ TripAI Agent

> **Conversational travel planning powered by a LangGraph multi-agent pipeline — live state streaming, real-time UI, and a structured trip plan in seconds.**

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![LangGraph](https://img.shields.io/badge/LangGraph-0.2-FF6B6B?style=flat-square)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## What is TripAI?

TripAI is a full-stack agentic AI application where a user types a trip request in plain English — *"Plan a 4-day Goa trip from Mumbai, budget ₹50k, beach and adventure"* — and a LangGraph-powered agent autonomously parses intent, searches flights, finds hotels, builds an itinerary, and calculates the budget.

The frontend streams each agent step live, showing both the natural-language response **and** the raw LangGraph `TripState` as it gets populated node by node.

```
User types a message
       ↓
  FastAPI backend
       ↓
  LangGraph graph.astream()
       ↓  (SSE — one event per node)
  React frontend
       ↓
  Chat bubble + live State Panel
```

---

## Features

- **Natural language input** — No forms. Just describe your trip.
- **Live agent execution** — Watch each LangGraph node execute in real-time with animated step pills.
- **Live state panel** — A sidebar mirrors the `TripState` TypedDict as each field gets populated.
- **Token-level LLM streaming** — The assistant's response streams word-by-word.
- **Structured output** — Flights, hotels, day-by-day itinerary, and a full budget breakdown.
- **Modular architecture** — Clean file separation: one hook, one component per concern.
- **Production-ready SSE** — Drop-in swap from mock stream to real FastAPI backend.

---

## Project Structure
```
frontend/
├── src/
│   ├── app/                      # App-level setup
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── pages/                   # Route-level components
│   │   ├── Home.tsx             # (rename Index → Home)
│   │   └── NotFound.tsx
│   │
│   ├── components/              # Shared components ONLY
│   │   ├── ui/                  # Reusable UI (buttons, cards)
│   │   ├── layout/              # Navbar, wrappers
│   │   └── common/              # Generic reusable stuff
│   │
│   ├── features/                
│   │   └── chat/
│   │       ├── ChatMessage.tsx
│   │       ├── TypingIndicator.tsx
│   │       ├── SuggestionChips.tsx
│   │       ├── ItineraryCard.tsx
│   │       └── TripCard.tsx
│   │
│   ├── hooks/
│   │   ├── useMobile.ts
│   │   └── useToast.ts
│   │
│   ├── lib/                     # utils, helpers
│   │
│   ├── styles/
│   │   ├── App.css
│   │   └── index.css
│   │
│   └── types/                   # (optional but useful)
│
├── public/
├── index.html
├── vite.config.ts
└── bun.lock

---

## Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Frontend  | React 18, plain CSS-in-JS (no Tailwind needed)  |
| Fonts     | DM Sans (UI) + IBM Plex Mono (code/state panel) |
| Backend   | Python 3.11, FastAPI, LangChain, LangGraph      |
| LLM       | OpenAI GPT-4o (or any LangChain-compatible LLM) |
| Streaming | Server-Sent Events (SSE) via FastAPI            |
| State     | LangGraph `StateGraph` with `TypedDict`         |

---

## LangGraph State — The Core Concept

The **entire frontend is driven by the LangGraph state**. Every node in the graph reads from and writes to a shared `TripState` TypedDict. The backend streams these state updates to the frontend as SSE events.

### Python state definition

```python
# backend/state.py
from typing import TypedDict, Annotated
import operator

class TripState(TypedDict):
    messages:     Annotated[list, operator.add]  # appends on each node
    trip_details: dict        # filled by parse_intent
    flights:      list        # filled by search_flights
    hotels:       list        # filled by search_hotels
    itinerary:    list        # filled by build_itinerary
    budget:       dict        # filled by calculate_budget
```

### Graph wiring

```python
# backend/graph.py
from langgraph.graph import StateGraph, END
from .state import TripState
from .nodes import *

graph = StateGraph(TripState)

graph.add_node("parse_intent",     parse_intent)
graph.add_node("validate_input",   validate_input)
graph.add_node("search_flights",   search_flights)
graph.add_node("search_hotels",    search_hotels)
graph.add_node("build_itinerary",  build_itinerary)
graph.add_node("calculate_budget", calculate_budget)
graph.add_node("llm_response",     llm_response)

graph.set_entry_point("parse_intent")
graph.add_edge("parse_intent",     "validate_input")
graph.add_edge("validate_input",   "search_flights")
graph.add_edge("search_flights",   "search_hotels")
graph.add_edge("search_hotels",    "build_itinerary")
graph.add_edge("build_itinerary",  "calculate_budget")
graph.add_edge("calculate_budget", "llm_response")
graph.add_edge("llm_response",     END)

compiled_graph = graph.compile()
```

### SSE streaming endpoint

```python
# backend/main.py
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json

app = FastAPI()

class ChatRequest(BaseModel):
    messages: list

@app.post("/chat/stream")
async def chat_stream(body: ChatRequest):
    async def event_generator():
        # stream_mode="updates" → yields only the DIFF after each node
        # chunk = { "node_name": { ...fields that changed... } }
        async for chunk in compiled_graph.astream(
            {"messages": body.messages},
            stream_mode="updates"
        ):
            yield f"data: {json.dumps(chunk)}\n\n"

        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
```

---

## Frontend — How Streaming Works

The `useAgentStream` hook is the single source of truth for all streaming state.

```
graph.astream() emits:
  { "search_flights": { "flights": [...] } }
       ↓
  FastAPI SSE: data: {"search_flights": {"flights": [...]}}
       ↓
  useAgentStream.js reads the stream:
    - sets activeNode = "search_flights"     → StepPill animates
    - merges state update into tripState      → StatePanel fills in
    - adds node to completedNodes             → StepPill turns green
       ↓
  StatePanel re-renders with new flights data
```

### Switching from mock to real backend

In `useAgentStream.js`, replace one import:

```js
// Development (mock)
import { mockStream } from "../mockStream";
// …
for await (const chunk of mockStream(text)) { … }

// Production (real backend)
import { streamChat } from "../api";
// …
for await (const chunk of streamChat(messages)) { … }
```

That's the only change needed.

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- An OpenAI API key (or any LangChain-supported LLM)

### 1 — Clone the repository

```bash
git clone https://github.com/your-username/tripai-agent.git
cd tripai-agent
```

### 2 — Backend setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

pip install fastapi uvicorn langgraph langchain langchain-openai python-dotenv

# Create .env
echo "OPENAI_API_KEY=sk-..." > .env

# Start the server
uvicorn main:app --reload --port 8000
```

### 3 — Frontend setup

```bash
cd frontend
npm install
npm start                         # runs on http://localhost:3000
```

### 4 — Connect frontend to backend

In `frontend/src/api.js`, verify:

```js
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";
```

Then in `useAgentStream.js`, swap from `mockStream` to `streamChat` as described above.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable           | Description                                  | Required |
|--------------------|----------------------------------------------|----------|
| `OPENAI_API_KEY`   | Your OpenAI key                              | ✅       |
| `OPENAI_MODEL`     | Model name, default `gpt-4o`                 | Optional |
| `FLIGHT_API_KEY`   | Key for real flight search API               | Optional |
| `HOTEL_API_KEY`    | Key for real hotel search API                | Optional |

### Frontend (`frontend/.env`)

| Variable                  | Description                          | Default                   |
|---------------------------|--------------------------------------|---------------------------|
| `REACT_APP_API_URL`       | Backend URL                          | `http://localhost:8000`   |

---

## UI Design System

The interface uses a dark, minimal aesthetic with a fixed palette.

| Token         | Value       | Usage                              |
|---------------|-------------|------------------------------------|
| `T.bg`        | `#0D0F14`   | Page background                    |
| `T.panel`     | `#13161E`   | Sidebar, navbar                    |
| `T.surface`   | `#1C2030`   | Chat bubbles, input                |
| `T.blue`      | `#6383FF`   | Primary accent, user messages      |
| `T.green`     | `#34D399`   | Completed steps, within-budget     |
| `T.amber`     | `#FBBF24`   | Itinerary section                  |
| `T.cyan`      | `#38BDF8`   | Parse and LLM nodes                |
| `T.red`       | `#F87171`   | Over-budget indicator              |
| `T.text`      | `#E8EAF0`   | Primary text                       |
| `T.muted`     | `#6B7280`   | Secondary text, placeholders       |

All tokens live in `tokens.js` and are imported by every component.

---

## Component Reference

### `TripAgentChat.jsx`
Root component. Composes all pieces. Handles the `panelOpen` toggle and auto-scroll. Contains zero business logic — just layout and prop wiring.

### `useAgentStream.js`
The only place where streaming state is managed. Exports `messages`, `tripState`, `activeNode`, `completedNodes`, `streaming`, and `sendMessage`. All components are purely presentational relative to this hook.

### `StatePanel.jsx`
Renders 5 collapsible sections — `trip_details`, `flights[]`, `hotels[]`, `itinerary[]`, `budget{}` — each showing an `EMPTY` placeholder until the corresponding LangGraph node fires and populates that field. Includes `StepPill` sub-components for the execution trace.

### `ChatBubble.jsx`
Renders user and assistant messages. Parses `**bold**` markdown and `\n` line breaks inline. Shows an animated cursor while `isStreaming` is true.

### `ThinkingBubble.jsx`
Shown between user message and the assistant response while graph nodes (other than `llm_response`) are executing. Displays the current node label with a three-dot pulse animation.

### `InputBar.jsx`
Self-contained textarea with focus state, `Enter` to send, `Shift+Enter` for newlines, and a send button that disables while streaming.

### `mockStream.js`
An async generator that mimics the exact SSE payload shape of the real backend. Useful for frontend development without needing a running Python server.

---

## Extending the Graph

To add a new node — for example, a `check_visa` step:

**1. Add the node function**
```python
# backend/nodes/check_visa.py
def check_visa(state: TripState) -> dict:
    # read from state, return only what changed
    visa_info = get_visa_requirements(state["trip_details"]["to"])
    return {"visa_info": visa_info}
```

**2. Add the field to `TripState`**
```python
class TripState(TypedDict):
    # ... existing fields
    visa_info: dict | None
```

**3. Wire it into the graph**
```python
graph.add_node("check_visa", check_visa)
graph.add_edge("validate_input", "check_visa")   # insert into the chain
graph.add_edge("check_visa",     "search_flights")
```

**4. Register it in the frontend**
```js
// tokens.js
export const NODES = {
  // ... existing nodes
  check_visa: { label: "Checking visa rules", icon: "◈", color: T.amber },
};
```

**5. Add a section to `StatePanel.jsx`**
```jsx
function VisaSection({ visaInfo }) {
  return (
    <Section title="visa_info{}" icon="🛂" filled={!!visaInfo}>
      {visaInfo
        ? <KV label="required" value={visaInfo.required ? "Yes" : "No"} />
        : <EmptySlot label="checking…" />}
    </Section>
  );
}
```

The frontend will automatically pick up the new step pill since `NODES` drives the display.

---

## Roadmap

- [ ] Multi-city trip support
- [ ] Real flight & hotel API integrations (Amadeus, Booking.com)
- [ ] LangGraph checkpointing — resume interrupted trips
- [ ] Trip history saved per user session
- [ ] Export itinerary as PDF
- [ ] Voice input support
- [ ] Budget preference slider before planning

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add visa check node"`
4. Push and open a Pull Request

Please keep frontend changes to their respective component files and backend node logic isolated in `backend/nodes/`.

---

## License

MIT © 2025 TripAI Contributors

---

<div align="center">
  <sub>Built with LangGraph · FastAPI · React</sub>
</div>
