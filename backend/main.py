"""SkyBridge API -- FastAPI entry point.

Endpoints:
    GET /health
    POST /resolve  { pnr, full_name }  ->  final SkyBridgeState as JSON
"""

import os
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.agent.graph import run_skybridge_graph

app = FastAPI(
    title="SkyBridge",
    description="Self-service flight disruption recovery API",
    version="0.1.0",
)

allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000")
allowed_origins = [origin.strip().rstrip('/') for origin in allowed_origins_env.split(",") if origin.strip()]

# -- CORS -- allow Vite (5173) and CRA/Next (3000) dev servers --
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": "Something went wrong. Please try again or talk to an agent."},
    )


# -- Request schema --------------------------------------------
class ResolveRequest(BaseModel):
    pnr: str
    full_name: str


# -- GET /health -----------------------------------------------
@app.get("/health")
def health_check():
    """Simple health check endpoint."""
    return {"status": "ok"}


# -- POST /resolve ---------------------------------------------
@app.post("/resolve")
def resolve(req: ResolveRequest):
    """Run the SkyBridge disruption-recovery graph and return the result."""
    result = run_skybridge_graph(pnr=req.pnr, full_name=req.full_name)
    
    # If fetch_data_node set an error (e.g. passenger not found), return 404
    if result.get("passenger") is None and result.get("error"):
        raise HTTPException(status_code=404, detail=result["error"])
        
    return result
