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

app = FastAPI(title="Decoupled Event Planner API")

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


@app.post("/api/plan/budget", response_model=BudgetResponse)
async def plan_budget(request: PlannerRequest):
    try:
        return await generate_budget(request)
    except ValueError as exc:
        logger.error("Config error in /api/plan/budget: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Failed to generate budget")
        raise HTTPException(
            status_code=502,
            detail=f"Budget generation failed: {exc}",
        ) from exc


@app.post("/api/plan/timeline", response_model=TimelineResponse)
async def plan_timeline(request: PlannerRequest):
    try:
        return await generate_timeline(request)
    except ValueError as exc:
        logger.error("Config error in /api/plan/timeline: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Failed to generate timeline")
        raise HTTPException(
            status_code=502,
            detail=f"Timeline generation failed: {exc}",
        ) from exc


@app.post("/api/plan/vendors", response_model=VendorChecklist)
async def plan_vendors(request: PlannerRequest):
    try:
        return await generate_vendors(request)
    except ValueError as exc:
        logger.error("Config error in /api/plan/vendors: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Failed to generate vendors")
        raise HTTPException(
            status_code=502,
            detail=f"Vendor checklist generation failed: {exc}",
        ) from exc


@app.post("/api/plan/ideas", response_model=CreativeIdeas)
async def plan_ideas(request: PlannerRequest):
    try:
        return await generate_ideas(request)
    except ValueError as exc:
        logger.error("Config error in /api/plan/ideas: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Failed to generate ideas")
        raise HTTPException(
            status_code=502,
            detail=f"Creative ideas generation failed: {exc}",
        ) from exc
