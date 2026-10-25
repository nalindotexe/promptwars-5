import pytest
from httpx import ASGITransport, AsyncClient
from unittest.mock import AsyncMock, patch

from main import app
from schemas import (
    BudgetItem,
    BudgetResponse,
    CreativeIdeas,
    CreativeTheme,
    TimelineMilestone,
    TimelineResponse,
    VendorCategory,
    VendorChecklist,
)


@pytest.fixture
def sample_payload():
    return {
        "event_type": "Wedding",
        "budget": 20000.0,
        "guest_count": 120,
        "date": "2027-08-20",
        "location": "Sonoma, CA",
        "vibe": "Rustic elegance with string lights and local wine",
    }


@pytest.fixture
def mock_budget():
    return BudgetResponse(
        items=[
            BudgetItem(name="Venue & Catering", allocated_amount=10000.0, percentage=50.0),
            BudgetItem(name="Photography", allocated_amount=4000.0, percentage=20.0),
            BudgetItem(name="Entertainment & Decor", allocated_amount=6000.0, percentage=30.0),
        ]
    )


@pytest.fixture
def mock_timeline():
    return TimelineResponse(
        milestones=[
            TimelineMilestone(timeline_label="6 Months Prior", task="Lock venue and caterer", priority="High"),
            TimelineMilestone(timeline_label="3 Months Prior", task="Send invitations and finalize menu", priority="Medium"),
            TimelineMilestone(timeline_label="1 Week Prior", task="Finalize seating chart", priority="Low"),
        ]
    )


@pytest.fixture
def mock_vendors():
    return VendorChecklist(
        categories=[
            VendorCategory(category="Catering", suggested_search_terms=["Sonoma organic farm-to-table caterer"]),
            VendorCategory(category="Florist", suggested_search_terms=["Sonoma rustic floral designer"]),
        ]
    )


@pytest.fixture
def mock_ideas():
    return CreativeIdeas(
        themes=[
            CreativeTheme(
                theme_name="Vineyard Sunset",
                color_palette=["#800020", "#D4AF37", "#2E4F4F"],
                activity_ideas=["Wine blending workshop", "Acoustic golden-hour performance"],
            ),
            CreativeTheme(
                theme_name="Earthy Minimalist",
                color_palette=["#F4EAD5", "#6B8E23", "#3C2A21"],
                activity_ideas=["Botanical place-card station", "Farm-fresh olive oil tasting"],
            ),
            CreativeTheme(
                theme_name="Twilight Sparkle",
                color_palette=["#1A120B", "#E5BA73", "#C58940"],
                activity_ideas=["Stargazing with telescopes", "Sparkler send-off"],
            ),
        ]
    )


@pytest.mark.asyncio
async def test_health_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_budget_endpoint(sample_payload, mock_budget):
    transport = ASGITransport(app=app)
    with patch("main.generate_budget", new_callable=AsyncMock) as m:
        m.return_value = mock_budget
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.post("/api/plan/budget", json=sample_payload)
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["items"]) == 3


@pytest.mark.asyncio
async def test_timeline_endpoint(sample_payload, mock_timeline):
    transport = ASGITransport(app=app)
    with patch("main.generate_timeline", new_callable=AsyncMock) as m:
        m.return_value = mock_timeline
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.post("/api/plan/timeline", json=sample_payload)
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["milestones"]) == 3


@pytest.mark.asyncio
async def test_vendors_endpoint(sample_payload, mock_vendors):
    transport = ASGITransport(app=app)
    with patch("main.generate_vendors", new_callable=AsyncMock) as m:
        m.return_value = mock_vendors
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.post("/api/plan/vendors", json=sample_payload)
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["categories"]) == 2


@pytest.mark.asyncio
async def test_ideas_endpoint(sample_payload, mock_ideas):
    transport = ASGITransport(app=app)
    with patch("main.generate_ideas", new_callable=AsyncMock) as m:
        m.return_value = mock_ideas
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.post("/api/plan/ideas", json=sample_payload)
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["themes"]) == 3


@pytest.mark.asyncio
async def test_endpoint_invalid_payload():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Missing required fields like budget and guest_count
        resp = await client.post("/api/plan/budget", json={"event_type": "Wedding"})
        assert resp.status_code == 422
