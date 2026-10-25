export interface PlannerRequest {
  event_type: string;
  budget: number;
  guest_count: number;
  date: string;
  location: string;
  vibe: string;
}

export interface BudgetItem {
  name: string;
  allocated_amount: number;
  percentage: number;
}

export interface BudgetResponse {
  items: BudgetItem[];
  error?: string;
}

export interface TimelineMilestone {
  timeline_label: string;
  task: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface TimelineResponse {
  milestones: TimelineMilestone[];
  error?: string;
}

export interface VendorCategory {
  category: string;
  suggested_search_terms: string[];
}

export interface VendorChecklist {
  categories: VendorCategory[];
  error?: string;
}

export interface CreativeTheme {
  theme_name: string;
  color_palette: string[];
  activity_ideas: string[];
}

export interface CreativeIdeas {
  themes: CreativeTheme[];
  error?: string;
}

export interface ConsolidatedPlan {
  budget: BudgetResponse | { error: string };
  timeline: TimelineResponse | { error: string };
  vendors: VendorChecklist | { error: string };
  ideas: CreativeIdeas | { error: string };
}
