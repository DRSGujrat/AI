# TripAI Frontend

Frontend for **TripAI** — a React-based conversational UI that streams real-time travel planning results from an AI agent.

It renders live agent execution (via streaming), displays structured trip data, and provides an interactive chat-like experience.

---

## 🚀 Overview

The frontend:

* Accepts natural language travel queries
* Streams agent responses in real time (token + step level)
* Displays structured outputs:

  * Flights
  * Hotels
  * Itinerary
  * Budget
* Visualizes agent execution step-by-step

This is not a static UI — it's **state-driven and stream-first architecture**. 

---

## 🧱 Tech Stack

* React 18 (Functional Components + Hooks)
* Vite (Build tool)
* CSS / Design Tokens (custom, no heavy frameworks)
* Server-Sent Events (SSE) for streaming
* JavaScript / TypeScript (mixed support)

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── pages/
│   │   ├── Home.tsx
│   │   └── NotFound.tsx
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   └── common/
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
│   ├── lib/
│   ├── styles/
│   └── types/
│
├── public/
├── index.html
├── vite.config.ts
└── package.json
```

---

## ⚙️ Setup Instructions

### 1. Install dependencies

```
npm install
```

### 2. Run development server

```
npm run dev
```

App runs at:

```
http://localhost:5173
```

---

## 🔌 API Configuration

Set backend URL:

```
REACT_APP_API_URL=http://localhost:8000
```

Used inside:

```
src/api.js
```

---

## 🔄 Streaming Architecture

Core idea: **Frontend is driven by streamed state updates, not API responses.**

Flow:

```
User Input → Backend → SSE Stream → Frontend Hook → UI Update
```

Each stream chunk:

```
{
  "node_name": {
    // updated state fields
  }
}
```

---

## 🧠 Core Logic

### useAgentStream (IMPORTANT)

Single source of truth for:

* Messages
* Trip state
* Active node
* Completed steps
* Streaming status

Responsibilities:

* Connect to SSE endpoint
* Parse incoming chunks
* Merge state updates
* Trigger UI re-renders

If this hook is messy → your entire app breaks.

---

## 🧩 Key UI Components

### ChatMessage

* Renders user + AI messages
* Supports streaming text

### TypingIndicator

* Shows when agent is processing

### SuggestionChips

* Quick prompt inputs

### ItineraryCard

* Displays day-wise travel plan

### TripCard

* Shows flights, hotels, and budget

---

## 🎨 Design System

Defined via tokens (centralized styling):

| Token   | Purpose        |
| ------- | -------------- |
| bg      | Background     |
| surface | Cards / chat   |
| blue    | Primary        |
| green   | Success        |
| red     | Errors         |
| text    | Main text      |
| muted   | Secondary text |

All components depend on these tokens → consistency enforced.

---

## 🧪 Development Modes

### Mock Mode

* Uses local mock stream
* No backend required

### Live Mode

* Connects to real backend SSE
* Requires running API

Switch happens inside:

```
useAgentStream.js
```

---

## ⚠️ Limitations (Don’t Ignore)

* No authentication
* No persistent state
* Weak error handling
* Not mobile optimized
* No caching (every query = fresh compute)

---

## 🔧 Critical Improvements Needed

If you’re thinking this is “good enough”, it’s not.

Fix these if you want this to stand out:

* Add error boundaries (right now failures = broken UI)
* Debounce / optimize streaming renders
* Add loading skeletons (UX is basic)
* Improve state normalization (avoid deep nested merges)
* Make UI responsive
* Add retry logic for SSE failures

---

## 📌 Summary

This frontend:

* Streams AI agent execution in real time
* Renders structured travel data dynamically
* Uses a hook-driven architecture for state control

It’s architecturally interesting — but still closer to a **strong prototype than a polished product**.

---
