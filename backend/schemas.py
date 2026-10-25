from typing import Annotated
from pydantic import BaseModel, Field, HttpUrl


class PlannerRequest(BaseModel):
    event_type: Annotated[str, Field(min_length=1, max_length=100, description="Type of event, e.g., Wedding, Birthday, Corporate Retreat")]
    budget: Annotated[float, Field(gt=0, description="Total budget in currency units")]
    guest_count: Annotated[int, Field(gt=0, description="Estimated number of attendees")]
    date: Annotated[str, Field(min_length=1, max_length=50, description="Target date or timeline range for the event")]
    location: Annotated[str, Field(min_length=1, max_length=150, description="City, venue type, or target location")]
    vibe: Annotated[str, Field(min_length=1, max_length=150, description="Desired aesthetic, mood, or theme")]


class BudgetItem(BaseModel):
    name: Annotated[str, Field(min_length=1, description="Category or expense item name")]
    allocated_amount: Annotated[float, Field(ge=0, description="Monetary amount assigned")]
    percentage: Annotated[float, Field(ge=0, le=100, description="Percentage of total budget allocated")]


class BudgetResponse(BaseModel):
    items: Annotated[list[BudgetItem], Field(description="List of budget line items")]


class TimelineMilestone(BaseModel):
    timeline_label: Annotated[str, Field(min_length=1, description="Timeframe relative to event date, e.g., '6 Months Before'")]
    task: Annotated[str, Field(min_length=1, description="Actionable planning milestone or task")]
    priority: Annotated[str, Field(pattern="^(High|Medium|Low)$", description="Priority level: High, Medium, or Low")]


class TimelineResponse(BaseModel):
    milestones: Annotated[list[TimelineMilestone], Field(description="Chronological milestones and planning tasks")]


class VendorCategory(BaseModel):
    category: Annotated[str, Field(min_length=1, description="Vendor classification, e.g., Catering, Photography")]
    suggested_search_terms: Annotated[list[str], Field(min_length=1, description="Recommended search terms to find providers")]


class VendorChecklist(BaseModel):
    categories: Annotated[list[VendorCategory], Field(description="Vendor categories and query guidance")]


class CreativeTheme(BaseModel):
    theme_name: Annotated[str, Field(min_length=1, description="Theme title")]
    color_palette: Annotated[list[str], Field(min_length=1, description="Palette hex codes or color names")]
    activity_ideas: Annotated[list[str], Field(min_length=1, description="Specific event activities matching the theme")]


class CreativeIdeas(BaseModel):
    themes: Annotated[list[CreativeTheme], Field(min_length=3, max_length=3, description="List of exactly 3 curated themes")]
