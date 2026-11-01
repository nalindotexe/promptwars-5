"""Decoupled FastAPI Application for Autonomous Event Planning.

Exposes RESTful endpoints for individual planning modules (budget, timeline,
vendors, creative ideas) and server-side PDF document generation.
"""

import logging
import os
from typing import Any, Dict
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from agents import (
    generate_budget,
    generate_ideas,
    generate_timeline,
    generate_vendors,
)
from pdf_generator import generate_event_pdf
from schemas import (
    BudgetResponse,
    CreativeIdeas,
    PlannerRequest,
    TimelineResponse,
    VendorChecklist,
)

logger: logging.Logger = logging.getLogger("event_planner")
logging.basicConfig(level=logging.INFO)

app: FastAPI = FastAPI(title="Decoupled Event Planner API")

app.add_middleware(GZipMiddleware, minimum_size=1000)

ALLOWED_ORIGINS: list[str] = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://promptwars-5-nalindotexe.vercel.app",
]

# Allow custom production frontends configured via environment variables
custom_frontend: str | None = os.getenv("FRONTEND_URL")
if custom_frontend:
    for origin in custom_frontend.split(","):
        stripped = origin.strip().rstrip("/")
        if stripped and stripped not in ALLOWED_ORIGINS:
            ALLOWED_ORIGINS.append(stripped)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"^https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check() -> Dict[str, str]:
    """Perform a simple health check.

    Returns:
        dict[str, str]: Service health status indicating the API is operational.
    """
    return {"status": "ok"}


@app.post("/api/plan/budget", response_model=BudgetResponse)
async def plan_budget(request: PlannerRequest) -> BudgetResponse:
    """Generate the structured event budget breakdown.

    Args:
        request: Validated event criteria and constraints.

    Returns:
        BudgetResponse: Allocated line items with amounts and percentage distribution.

    Raises:
        HTTPException: 500 on configuration/credential errors, or 502 on upstream AI errors.
    """
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
async def plan_timeline(request: PlannerRequest) -> TimelineResponse:
    """Generate the phased milestone schedule for the event.

    Args:
        request: Validated event criteria and constraints.

    Returns:
        TimelineResponse: Chronological planning checkpoints with assigned priorities.

    Raises:
        HTTPException: 500 on configuration/credential errors, or 502 on upstream AI errors.
    """
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
async def plan_vendors(request: PlannerRequest) -> VendorChecklist:
    """Generate a localized vendor checklist and suggested search queries.

    Args:
        request: Validated event criteria and constraints.

    Returns:
        VendorChecklist: Recommended vendor categories and tailored query terms.

    Raises:
        HTTPException: 500 on configuration/credential errors, or 502 on upstream AI errors.
    """
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
async def plan_ideas(request: PlannerRequest) -> CreativeIdeas:
    """Generate 3 creative themes, color harmonies, and event activities.

    Args:
        request: Validated event criteria and constraints.

    Returns:
        CreativeIdeas: Exactly 3 curated event design concepts.

    Raises:
        HTTPException: 500 on configuration/credential errors, or 502 on upstream AI errors.
    """
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


@app.post("/api/export-pdf")
async def export_pdf(payload: Dict[str, Any]) -> Response:
    """Generate and stream a multi-page PDF document of the consolidated event plan.

    Args:
        payload: Full event plan state containing event info, budget, timeline, vendors, and ideas.

    Returns:
        Response: Binary PDF stream with attachment content disposition header.

    Raises:
        HTTPException: 500 if server-side document rendering fails.
    """
    try:
        pdf_bytes: bytes = generate_event_pdf(payload)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": 'attachment; filename="Event_Plan.pdf"'
            },
        )
    except Exception as exc:
        logger.exception("Failed to generate server-side PDF")
        raise HTTPException(
            status_code=500,
            detail=f"PDF generation failed: {exc}",
        ) from exc
