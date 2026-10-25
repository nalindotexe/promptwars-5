# Autonomous Celebration & Event Planner
### PromptWars Hackathon Submission

An AI-powered, state-driven event planning assistant designed for structural integrity and real-world resilience. Instead of relying on a single monolithic prompt that outputs static Markdown, this application utilizes a **Multi-Agent Orchestrator** and a **Decoupled Micro-Frontend Architecture** to generate deterministic, interactive budgets, timelines, and creative dashboards in real-time.

---

## 🏗 System Architecture & Innovation

To maximize performance, reduce latency, and guarantee schema compliance, this application decouples the GenAI workload into four independent streams.

### 1. Decoupled Micro-Frontend (Asynchronous UI)
To prevent blocking the main thread and eliminate timeout errors (like standard 90s HTTP limits), the backend exposes four separate API endpoints:
- `/api/plan/budget`
- `/api/plan/timeline`
- `/api/plan/vendors`
- `/api/plan/ideas`

When the user submits an event prompt, the React frontend instantly mounts the layout and fires four simultaneous requests. As each Gemini sub-agent finishes its task, its specific UI component hydrates independently. Users can interact with the budget while the creative ideas are still generating.

### 2. Multi-Agent Orchestration (Gemini 3.1 Flash Lite)
The backend leverages the `google-genai` SDK and Pydantic structured outputs. Instead of one AI trying to juggle math, scheduling, and creativity, a router delegates the event "vibe" to specialized prompts.

### 3. Resilience Engineering (Exponential Backoff)
Public API free tiers frequently experience traffic spikes, leading to 503 Service Unavailable or 429 Rate Limit errors.
- **Backend**: Built with `tenacity`, each endpoint features automated exponential backoff (retrying up to 3 times, waiting 2 to 10 seconds).
- **Frontend**: If an API completely times out, the UI degrades gracefully. A localized error is shown only in the failed component (e.g., "Moodboard generation delayed"), preserving the rest of the generated event plan.

### 4. Deterministic Math via "Contingency Buffers"
Small LLMs often hallucinate budget math, leaving fractional remainders. The Finance Agent's system prompt utilizes a strict **Contingency Bucket Method**, mathematically forcing the model to dump any rounding discrepancies into a "Contingency & Buffer" line item. This ensures the React pie charts always render exactly 100% of the user's budget.

---

## 🛠 Tech Stack

- **Frontend**: React, Vite (TypeScript), Tailwind CSS, Recharts, Lucide Icons.
- **Backend**: FastAPI, Python, uv (Package Manager), tenacity (Retry logic).
- **AI Provider**: Google GenAI SDK (`gemini-3.1-flash-lite`), Pydantic (Schema enforcement).

---

## 🚀 Local Setup & Installation

### Prerequisites
- Python 3.10+ and [uv](https://docs.astral.sh/uv/) installed.
- Node.js and npm installed.
- A Google Gemini API Key.

### 1. Backend Setup
```bash
cd backend
uv venv
source .venv/bin/activate  # Or .venv\Scripts\activate on Windows
uv pip install fastapi uvicorn pydantic google-genai python-dotenv tenacity
```

Create a `.env` file in the `backend/` directory (ignored via `.gitignore` for security) and add your key:
```env
GEMINI_API_KEY=your_api_key_here
```

Start the FastAPI server:
```bash
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## 📊 PromptWars Rubric Alignment

- **High-Impact (Problem Alignment & Dynamic Assistant)**: Delivers a state-driven UI where generated budgets can be recalculated and vendors tracked, fulfilling the event planning brief entirely through structured JSON.
- **Medium-Impact (Efficiency & Security)**: Concurrent API calls drastically lower time-to-first-byte. API keys are strictly managed via environment variables and excluded from version control.
- **Low-Impact (Polish & Testing)**: Fully responsive UI, high-contrast accessible design, modular component structure, and robust exception handling for real-world network conditions.
