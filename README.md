# SkyBridge

**Self-service flight disruption recovery MVP for SkyJet Airways.**

Built for the **22North Product Engineering Challenge 2026**.

| | |
|---|---|
| **Team Name** | Solo Submission |
| **Team Members** | Dhyan Mehta |
| **College** | CHARUSAT University |

## Project Description

SkyBridge is a self-service web application that lets SkyJet Airways passengers instantly resolve flight disruptions — cancelled flights, long delays, and short delays — without calling the contact center. Passengers enter their booking reference (PNR) and full name, and the system automatically classifies the disruption, decides the correct recovery action (rebook, refund, wait, or escalate to a human agent), and presents a clear, AI-summarized result. All decision logic is deterministic Python rules; the only LLM call is a cosmetic natural-language summary layer.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | FastAPI (Python) |
| Agent Framework | LangGraph + LangChain |
| LLM | Groq (Llama 3.1 8B via `langchain-groq`) — used only for `summarize_node` |
| Frontend | React 19 + Vite |
| Styling | Tailwind CSS 3 |
| Data | Static JSON (mock API layer) |

## AI Tools Disclosure

- **Antigravity** (AI coding agent) was used for implementation assistance.
- **Groq LLM** (via LangChain) is used **at runtime only** for the `summarize_node` — it generates a plain-language summary of the disruption and recovery action for the passenger.
- **All decision logic** (disruption classification, action routing, escalation triggers, refund eligibility) is **deterministic Python rules**, not LLM-based. See `backend/agent/rules.py`.

## Demo Credentials

Use these test passengers to exercise every scenario:

| PNR | Full Name | Flight | Scenario | Expected Decision |
|---|---|---|---|---|
| AB12CD | Dhyan Mehta | SK203 (CANCELLED / WEATHER) | Rebook | REBOOK — 2 alternate flights offered |
| XY99ZT | Neha Shah | SK407 (DELAYED 255 min / ATC) | Rebook (long delay) | REBOOK — 2 alternate flights offered |
| QW56ER | Ravi Patel | SK550 (DELAYED 90 min / OPERATIONAL) | Wait | WAIT — minor delay, no action needed |
| LM33NO | Sneha Rao | SK610 (ON_TIME) | Wait | WAIT — flight on schedule |
| ZZ77XX | Anil Verma | SK780 (CANCELLED / OPERATIONAL) | Escalate | ESCALATE — 3 prior rebookings exceeds limit |
| RT44UV | Kavya Iyer | SK521 (CANCELLED / OPERATIONAL) | Refund (not eligible) | REFUND — OPERATIONAL reason, not eligible |
| RF99XX | John Smith | SK203 (CANCELLED / WEATHER) | Refund (eligible) | REFUND — WEATHER reason, eligible + REF-ID |

## Build & Run Instructions

### Prerequisites

- Python 3.11+
- Node.js 18+
- A [Groq API key](https://console.groq.com/) (free tier works)

### Backend

```bash
# 1. Create and activate virtual environment
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure API key
#    Copy .env.example to .env and replace with your real Groq key
copy .env.example .env
#    Then edit .env and set: GROQ_API_KEY=gsk_your_real_key_here

# 4. Go back to project root and start the server
cd ..
uvicorn backend.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` and the backend at `http://localhost:8000`.

> **Why run uvicorn from the project root?**
> `main.py` uses absolute Python imports (`from backend.agent.graph import ...`).
> Running `uvicorn main:app` from inside `backend/` will fail with
> `ModuleNotFoundError: No module named 'backend'`. The correct command is
> `uvicorn backend.main:app` from the **project root directory**.

## Deployment (Vercel)

SkyBridge is configured to deploy as two separate Vercel projects from this single repository.

### Backend (Python Serverless)
1. Import this repository into Vercel.
2. Set the **Root Directory** to `backend`.
3. In the Environment Variables settings, add:
   - `GROQ_API_KEY`: Your real Groq API key.
   - `ALLOWED_ORIGINS`: The deployed URL of your frontend (e.g., `https://your-frontend.vercel.app`).
4. Deploy. Vercel will automatically use `api/index.py` as the serverless function entry point.

### Frontend (React/Vite)
1. Import this repository into Vercel as a **second, separate project**.
2. Set the **Root Directory** to `frontend`.
3. In the Environment Variables settings, add:
   - `VITE_API_BASE_URL`: The deployed URL of your backend project (e.g., `https://your-backend.vercel.app`).
4. Deploy. Vercel will automatically detect Vite and run `npm run build`.

*(Note: Local development instructions are unchanged and still work exactly as before by using the local `.env` files).*

## Known Limitations

| Item | Detail |
|---|---|
| Refund routing | Passengers RT44UV and RF99XX are flagged with `refund_requested: true` in `passengers.json` to trigger the REFUND path. A production system would have a proper refund-request mechanism. |
| LLM summary | The Groq LLM generates the passenger-facing summary. If the API key is missing or invalid, the system falls back to a deterministic template — it never crashes. |
| "Talk to an Agent" | All agent contact buttons use `alert()` as a placeholder. In production this would be a `mailto:`, chat widget, or phone link. |
| No global auth | Authentication is PNR + full name only (no OTP, no login). |
| Single passenger per PNR | Group bookings are not supported in this MVP. |
| Mock data only | Flight and passenger data are static JSON files, not a live database or PSS integration. |

## Project Structure

```
SkyBridge/
├── backend/
│   ├── agent/          # LangGraph graph, nodes, rules, state
│   ├── mock_data/      # flights.json, passengers.json
│   ├── tools/          # mock_api.py (data access layer)
│   ├── tests/          # Test scripts
│   ├── main.py         # FastAPI entry point
│   ├── requirements.txt
│   ├── .env.example
│   └── .env            # (gitignored — add your Groq key here)
├── frontend/
│   ├── src/
│   │   ├── components/ # PNRLookupForm, StatusResult, ActionPanel
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── PRD.md              # Product Requirements Document
└── README.md           # ← You are here
```