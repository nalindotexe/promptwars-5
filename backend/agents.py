import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
from tenacity import retry, stop_after_attempt, wait_exponential

from schemas import (
    BudgetResponse,
    CreativeIdeas,
    PlannerRequest,
    TimelineResponse,
    VendorChecklist,
)

load_dotenv()

MODEL_NAME = "gemini-3.1-flash-lite"


def _get_genai_client() -> genai.Client:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError(
            "GEMINI_API_KEY environment variable is missing or empty. Please set it in backend/.env"
        )
    return genai.Client(api_key=api_key)


def _build_context(request: PlannerRequest) -> str:
    return (
        f"Event Type: {request.event_type}\n"
        f"Total Budget: ${request.budget:,.2f}\n"
        f"Guest Count: {request.guest_count}\n"
        f"Target Date/Timeline: {request.date}\n"
        f"Location: {request.location}\n"
        f"Vibe & Aesthetic: {request.vibe}\n"
    )


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    reraise=True,
)
async def generate_budget(request: PlannerRequest) -> BudgetResponse:
    client = _get_genai_client()
    prompt = (
        f"You are an expert Event Financial Planner. Your strict objective is to allocate a total budget of ${request.budget} for a {request.event_type} for {request.guest_count} guests.\n\n"
        "CRITICAL MATH RULES:\n\n"
        f"The sum of all allocated_amount values MUST EXACTLY EQUAL ${request.budget}. Not a dollar more, not a dollar less.\n\n"
        "Determine logical percentage allocations for the top 4-5 categories (e.g., Venue 30%, Food 40%) based on the event type.\n\n"
        "Calculate the exact dollar amount for each category.\n\n"
        f"MANDATORY CONTINGENCY: You must include a final line item named 'Contingency & Buffer'. You must mathematically use this specific line item to absorb any rounding differences or leftover funds so the total sum matches ${request.budget} perfectly.\n\n"
        "Do not generate any text outside of the requested JSON schema."
    )
    config = types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=BudgetResponse,
        temperature=0.2,
    )
    response = await client.aio.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config=config,
    )
    if response.parsed is not None:
        return response.parsed
    return BudgetResponse.model_validate_json(response.text)


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    reraise=True,
)
async def generate_timeline(request: PlannerRequest) -> TimelineResponse:
    client = _get_genai_client()
    prompt = (
        "You are a master event coordinator. Produce a chronological milestone timeline "
        "covering planning checkpoints leading up to and including event day, with priority ratings.\n\n"
        f"{_build_context(request)}"
    )
    config = types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=TimelineResponse,
        temperature=0.3,
    )
    response = await client.aio.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config=config,
    )
    if response.parsed is not None:
        return response.parsed
    return TimelineResponse.model_validate_json(response.text)


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    reraise=True,
)
async def generate_vendors(request: PlannerRequest) -> VendorChecklist:
    client = _get_genai_client()
    prompt = (
        "You are a professional vendor procurement specialist. Recommend vendor categories needed "
        "for this event, along with actionable, localized search terms to locate quality vendors.\n\n"
        f"{_build_context(request)}"
    )
    config = types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=VendorChecklist,
        temperature=0.3,
    )
    response = await client.aio.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config=config,
    )
    if response.parsed is not None:
        return response.parsed
    return VendorChecklist.model_validate_json(response.text)


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    reraise=True,
)
async def generate_ideas(request: PlannerRequest) -> CreativeIdeas:
    client = _get_genai_client()
    prompt = (
        "You are an innovative creative director for luxury and bespoke events. "
        "Provide exactly 3 distinct, compelling event themes with color palettes and experiential activities.\n\n"
        f"{_build_context(request)}"
    )
    config = types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=CreativeIdeas,
        temperature=0.7,
    )
    response = await client.aio.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config=config,
    )
    if response.parsed is not None:
        return response.parsed
    return CreativeIdeas.model_validate_json(response.text)
