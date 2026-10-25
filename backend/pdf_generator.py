from typing import Any, Dict
from fpdf import FPDF
from fpdf.enums import XPos, YPos


class EventPlanPDF(FPDF):
    def header(self):
        self.set_font("Helvetica", "B", 14)
        self.set_text_color(30, 41, 59)  # Dark slate
        self.cell(
            0,
            10,
            "Autonomous Celebration & Event Planner - Master Plan",
            border=False,
            align="C",
            new_x=XPos.LMARGIN,
            new_y=YPos.NEXT,
        )
        self.set_draw_color(203, 213, 225)
        self.line(10, 20, 200, 20)
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 9)
        self.set_text_color(148, 163, 184)
        self.cell(0, 10, f"Page {self.page_no()}/{{nb}}", border=False, align="C")


def _sanitize(text: Any) -> str:
    """Sanitize strings for latin-1 encoding in standard Helvetica font."""
    if text is None:
        return ""
    s = str(text)
    # Replace common typographic unicode characters with ASCII equivalents
    replacements = {
        "\u2018": "'",
        "\u2019": "'",
        "\u201c": '"',
        "\u201d": '"',
        "\u2014": "--",
        "\u2013": "-",
        "\u2022": "*",
        "\u2026": "...",
        "\xa0": " ",
    }
    for old, new in replacements.items():
        s = s.replace(old, new)
    return s.encode("latin-1", "replace").decode("latin-1")


def generate_event_pdf(event_data: Dict[str, Any]) -> bytes:
    pdf = EventPlanPDF(orientation="P", unit="mm", format="A4")
    pdf.alias_nb_pages()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    # --- Event Overview Section ---
    event_info = event_data.get("event_info") or {}
    event_type = _sanitize(event_info.get("event_type", "Event"))
    budget_target = event_info.get("budget", 0)
    guest_count = event_info.get("guest_count", 0)
    date_str = _sanitize(event_info.get("date", "Not specified"))
    location_str = _sanitize(event_info.get("location", "Not specified"))
    vibe_str = _sanitize(event_info.get("vibe", "Not specified"))

    pdf.set_fill_color(241, 245, 249)  # Light slate container
    pdf.rect(10, 24, 190, 28, "F")

    pdf.set_xy(14, 26)
    pdf.set_font("Helvetica", "B", 13)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 7, f"{event_type} Executive Brief", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_x(14)
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(51, 65, 85)
    pdf.cell(60, 6, f"Target Budget: ${float(budget_target):,.2f}")
    pdf.cell(50, 6, f"Guest Count: {guest_count}")
    pdf.cell(70, 6, f"Date: {date_str}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_x(14)
    pdf.cell(90, 6, f"Location: {location_str}")
    pdf.cell(90, 6, f"Vibe: {vibe_str[:45]}...", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.ln(10)

    # --- 1. Budget Breakdown Table ---
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(79, 70, 229)  # Indigo
    pdf.cell(0, 8, "1. Budget Allocation Breakdown", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    budget_section = event_data.get("budget") or {}
    items = budget_section.get("items", []) if isinstance(budget_section, dict) else []

    if items:
        # Table Header
        pdf.set_font("Helvetica", "B", 9)
        pdf.set_fill_color(224, 231, 255)  # Light indigo
        pdf.set_text_color(30, 41, 59)
        pdf.cell(100, 7, "Category / Item", border=1, fill=True)
        pdf.cell(50, 7, "Allocated Amount ($)", border=1, align="R", fill=True)
        pdf.cell(40, 7, "Share (%)", border=1, align="R", fill=True, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

        # Table Rows
        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(51, 65, 85)
        total_amount = 0.0

        for idx, item in enumerate(items):
            name = _sanitize(item.get("name", "Item"))
            amount = float(item.get("allocated_amount", 0))
            percentage = float(item.get("percentage", 0))
            total_amount += amount

            fill_row = idx % 2 == 1
            if fill_row:
                pdf.set_fill_color(248, 250, 252)
            else:
                pdf.set_fill_color(255, 255, 255)

            pdf.cell(100, 6.5, f"  {name}", border=1, fill=fill_row)
            pdf.cell(50, 6.5, f"${amount:,.2f}  ", border=1, align="R", fill=fill_row)
            pdf.cell(40, 6.5, f"{percentage:.1f}%  ", border=1, align="R", fill=fill_row, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

        # Total Row
        pdf.set_font("Helvetica", "B", 9)
        pdf.set_fill_color(241, 245, 249)
        pdf.cell(100, 7, "  Total Planned Allocation", border=1, fill=True)
        pdf.cell(50, 7, f"${total_amount:,.2f}  ", border=1, align="R", fill=True)
        pdf.cell(40, 7, "100.0%  ", border=1, align="R", fill=True, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    else:
        pdf.set_font("Helvetica", "I", 9)
        pdf.set_text_color(100, 116, 139)
        err_msg = budget_section.get("error", "No budget data available.") if isinstance(budget_section, dict) else "No data."
        pdf.cell(0, 6, f"Notice: {_sanitize(err_msg)}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.ln(8)

    # --- 2. Chronological Milestones Table ---
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(147, 51, 234)  # Purple
    pdf.cell(0, 8, "2. Operational Timeline Milestones", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    timeline_section = event_data.get("timeline") or {}
    milestones = timeline_section.get("milestones", []) if isinstance(timeline_section, dict) else []

    if milestones:
        pdf.set_font("Helvetica", "B", 9)
        pdf.set_fill_color(243, 232, 255)  # Light purple
        pdf.set_text_color(30, 41, 59)
        pdf.cell(45, 7, "Timeline Label", border=1, fill=True)
        pdf.cell(115, 7, "Milestone Task", border=1, fill=True)
        pdf.cell(30, 7, "Priority", border=1, align="C", fill=True, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(51, 65, 85)

        for idx, m in enumerate(milestones):
            label = _sanitize(m.get("timeline_label", ""))
            task = _sanitize(m.get("task", ""))
            priority = _sanitize(m.get("priority", "Medium"))

            fill_row = idx % 2 == 1
            if fill_row:
                pdf.set_fill_color(250, 245, 255)
            else:
                pdf.set_fill_color(255, 255, 255)

            pdf.cell(45, 6.5, f" {label}", border=1, fill=fill_row)
            pdf.cell(115, 6.5, f" {task[:75]}", border=1, fill=fill_row)
            pdf.cell(30, 6.5, priority, border=1, align="C", fill=fill_row, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    else:
        pdf.set_font("Helvetica", "I", 9)
        pdf.set_text_color(100, 116, 139)
        err_msg = timeline_section.get("error", "No timeline data available.") if isinstance(timeline_section, dict) else "No data."
        pdf.cell(0, 6, f"Notice: {_sanitize(err_msg)}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.ln(8)

    # --- 3. Vendor Procurement Checklist ---
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(14, 116, 144)  # Cyan
    pdf.cell(0, 8, "3. Vendor Procurement Checklist", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    vendors_section = event_data.get("vendors") or {}
    categories = vendors_section.get("categories", []) if isinstance(vendors_section, dict) else []

    if categories:
        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(30, 41, 59)
        for cat in categories:
            cat_name = _sanitize(cat.get("category", "Vendor Category"))
            terms = [_sanitize(t) for t in cat.get("suggested_search_terms", [])]
            terms_str = ", ".join(terms)

            pdf.set_font("Helvetica", "B", 9)
            pdf.cell(0, 5, f"[ ] {cat_name}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
            pdf.set_font("Helvetica", "", 8.5)
            pdf.set_text_color(71, 85, 105)
            pdf.cell(0, 5, f"    Suggested search queries: {terms_str}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
            pdf.set_text_color(30, 41, 59)
            pdf.ln(1)
    else:
        pdf.set_font("Helvetica", "I", 9)
        pdf.set_text_color(100, 116, 139)
        err_msg = vendors_section.get("error", "No vendor data available.") if isinstance(vendors_section, dict) else "No data."
        pdf.cell(0, 6, f"Notice: {_sanitize(err_msg)}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.ln(8)

    # --- 4. Creative Themes & Aesthetics ---
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(219, 39, 119)  # Pink
    pdf.cell(0, 8, "4. Creative Themes & Aesthetics", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    ideas_section = event_data.get("ideas") or {}
    themes = ideas_section.get("themes", []) if isinstance(ideas_section, dict) else []

    if themes:
        for idx, th in enumerate(themes, start=1):
            name = _sanitize(th.get("theme_name", f"Concept {idx}"))
            pal = [_sanitize(c) for c in th.get("color_palette", [])]
            acts = [_sanitize(a) for a in th.get("activity_ideas", [])]

            pdf.set_font("Helvetica", "B", 10)
            pdf.set_text_color(15, 23, 42)
            pdf.cell(0, 5.5, f"Concept 0{idx}: {name}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

            pdf.set_font("Helvetica", "", 8.5)
            pdf.set_text_color(71, 85, 105)
            pdf.cell(0, 5, f"Color Harmony: {', '.join(pal)}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

            for act in acts:
                pdf.cell(0, 4.5, f"  * {act}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
            pdf.ln(2)
    else:
        pdf.set_font("Helvetica", "I", 9)
        pdf.set_text_color(100, 116, 139)
        err_msg = ideas_section.get("error", "No creative ideas data available.") if isinstance(ideas_section, dict) else "No data."
        pdf.cell(0, 6, f"Notice: {_sanitize(err_msg)}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    return bytes(pdf.output())
