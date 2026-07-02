# SkyBridge MVP

## Backend Setup
1. `cd backend`
2. `python -m venv venv`
3. `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux)
4. `pip install -r requirements.txt`
5. Copy `.env.example` to `.env` and add your Groq API key.
6. Run: `uvicorn main:app --reload --port 8000`

## Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npm run dev`