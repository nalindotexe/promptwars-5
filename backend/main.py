import asyncio
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from agents import (
    generate_budget,
    generate_ideas,
    generate_timeline,
    generate_vendors,
)
from schemas import (
    BudgetResponse,
    CreativeIdeas,
    PlannerRequest,
    TimelineResponse,
    VendorChecklist,
)

logger = logging.getLogger("event_planner")
logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Event Planner API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/api/plan")
async def create_plan(request: PlannerRequest):
    try:
        budget, timeline, vendors, ideas = await asyncio.gather(
            generate_budget(request),
            generate_timeline(request),
            generate_vendors(request),
            generate_ideas(request),
        )
        return {
            "budget": budget,
            "timeline": timeline,
            "vendors": vendors,
            "ideas": ideas,
        }
    except ValueError as exc:
        logger.error("Configuration error in /api/plan: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Failed to generate complete event plan")
        raise HTTPException(
            status_code=502,
            detail=f"Downstream AI generation service error: {exc}",
        ) from exc
