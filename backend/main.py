"""SkyBridge API -- FastAPI entry point.

Endpoints:
    GET /health
    POST /resolve  { pnr, last_name }  ->  final SkyBridgeState as JSON
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.agent.graph import run_skybridge_graph

app = FastAPI(
    title="SkyBridge",
    description="Self-service flight disruption recovery API",
    version="0.1.0",
)

# -- CORS -- allow Vite (5173) and CRA/Next (3000) dev servers --
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -- Request schema --------------------------------------------
class ResolveRequest(BaseModel):
    pnr: str
    last_name: str


# -- GET /health -----------------------------------------------
@app.get("/health")
def health_check():
    """Simple health check endpoint."""
    return {"status": "ok"}


# -- POST /resolve ---------------------------------------------
@app.post("/resolve")
def resolve(req: ResolveRequest):
    """Run the SkyBridge disruption-recovery graph and return the result."""
    result = run_skybridge_graph(pnr=req.pnr, last_name=req.last_name)
    
    # If fetch_data_node set an error (e.g. passenger not found), return 404
    if result.get("passenger") is None and result.get("error"):
        raise HTTPException(status_code=404, detail=result["error"])
        
    return result
