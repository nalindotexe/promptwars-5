import pytest
from fastapi.testclient import TestClient
from httpx import ASGITransport, AsyncClient
from unittest.mock import AsyncMock, patch

from main import app
from schemas import (
    BudgetItem,
    BudgetResponse,
    CreativeIdeas,
    CreativeTheme,
    PlannerRequest,
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


# --- Test 1: Verify all four decoupled endpoints return 200 with valid PlannerRequest ---
@pytest.mark.asyncio
async def test_all_four_decoupled_endpoints_return_200(
    sample_payload, mock_budget, mock_timeline, mock_vendors, mock_ideas
):
    transport = ASGITransport(app=app)

    with patch("main.generate_budget", new_callable=AsyncMock) as m_budget, \
         patch("main.generate_timeline", new_callable=AsyncMock) as m_timeline, \
         patch("main.generate_vendors", new_callable=AsyncMock) as m_vendors, \
         patch("main.generate_ideas", new_callable=AsyncMock) as m_ideas:

        m_budget.return_value = mock_budget
        m_timeline.return_value = mock_timeline
        m_vendors.return_value = mock_vendors
        m_ideas.return_value = mock_ideas

        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # 1. Budget endpoint
            res_budget = await client.post("/api/plan/budget", json=sample_payload)
            assert res_budget.status_code == 200
            assert "items" in res_budget.json()
            assert len(res_budget.json()["items"]) == 3

            # 2. Timeline endpoint
            res_timeline = await client.post("/api/plan/timeline", json=sample_payload)
            assert res_timeline.status_code == 200
            assert "milestones" in res_timeline.json()
            assert len(res_timeline.json()["milestones"]) == 3

            # 3. Vendors endpoint
            res_vendors = await client.post("/api/plan/vendors", json=sample_payload)
            assert res_vendors.status_code == 200
            assert "categories" in res_vendors.json()
            assert len(res_vendors.json()["categories"]) == 2

            # 4. Ideas endpoint
            res_ideas = await client.post("/api/plan/ideas", json=sample_payload)
            assert res_ideas.status_code == 200
            assert "themes" in res_ideas.json()
            assert len(res_ideas.json()["themes"]) == 3


# --- Test 1 (Sync TestClient variant): FastAPI TestClient verification of the four endpoints ---
def test_all_four_endpoints_with_fastapi_testclient(
    sample_payload, mock_budget, mock_timeline, mock_vendors, mock_ideas
):
    with patch("main.generate_budget", new_callable=AsyncMock) as m_budget, \
         patch("main.generate_timeline", new_callable=AsyncMock) as m_timeline, \
         patch("main.generate_vendors", new_callable=AsyncMock) as m_vendors, \
         patch("main.generate_ideas", new_callable=AsyncMock) as m_ideas:

        m_budget.return_value = mock_budget
        m_timeline.return_value = mock_timeline
        m_vendors.return_value = mock_vendors
        m_ideas.return_value = mock_ideas

        with TestClient(app) as client:
            # 1. Budget
            resp1 = client.post("/api/plan/budget", json=sample_payload)
            assert resp1.status_code == 200
            assert len(resp1.json()["items"]) == 3

            # 2. Timeline
            resp2 = client.post("/api/plan/timeline", json=sample_payload)
            assert resp2.status_code == 200
            assert len(resp2.json()["milestones"]) == 3

            # 3. Vendors
            resp3 = client.post("/api/plan/vendors", json=sample_payload)
            assert resp3.status_code == 200
            assert len(resp3.json()["categories"]) == 2

            # 4. Ideas
            resp4 = client.post("/api/plan/ideas", json=sample_payload)
            assert resp4.status_code == 200
            assert len(resp4.json()["themes"]) == 3


# --- Test 2: Strict rejection of missing and malformed data ---
def test_planner_request_rejects_malformed_and_missing_data(sample_payload):
    with TestClient(app) as client:
        # Case A: String passed for budget instead of number
        malformed_budget = {**sample_payload, "budget": "not_a_valid_budget_number"}
        res_a = client.post("/api/plan/budget", json=malformed_budget)
        assert res_a.status_code == 422
        errors_a = res_a.json()["detail"]
        assert any("budget" in err["loc"] for err in errors_a)

        # Case B: String passed for guest_count instead of integer
        malformed_guest = {**sample_payload, "guest_count": "three_hundred"}
        res_b = client.post("/api/plan/timeline", json=malformed_guest)
        assert res_b.status_code == 422
        errors_b = res_b.json()["detail"]
        assert any("guest_count" in err["loc"] for err in errors_b)

        # Case C: Budget <= 0 violated
        zero_budget = {**sample_payload, "budget": 0}
        res_c = client.post("/api/plan/vendors", json=zero_budget)
        assert res_c.status_code == 422

        # Case D: Missing required field (location omitted)
        missing_location = {
            "event_type": "Wedding",
            "budget": 5000.0,
            "guest_count": 50,
            "date": "2027-09-01",
            "vibe": "Rustic",
        }
        res_d = client.post("/api/plan/ideas", json=missing_location)
        assert res_d.status_code == 422
        errors_d = res_d.json()["detail"]
        assert any("location" in err["loc"] for err in errors_d)


# --- Health check test ---
def test_health_check_endpoint():
    with TestClient(app) as client:
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}


# --- Export PDF endpoint test ---
def test_export_pdf_endpoint(sample_payload, mock_budget, mock_timeline, mock_vendors, mock_ideas):
    with TestClient(app) as client:
        full_plan_payload = {
            "event_info": sample_payload,
            "budget": mock_budget.model_dump(),
            "timeline": mock_timeline.model_dump(),
            "vendors": mock_vendors.model_dump(),
            "ideas": mock_ideas.model_dump(),
        }
        response = client.post("/api/export-pdf", json=full_plan_payload)
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/pdf"
        assert response.content.startswith(b"%PDF")
        assert len(response.content) > 1000

