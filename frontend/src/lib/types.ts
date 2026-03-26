export interface PricingPlan {
  name: string;
  price: string;
  features: string[];
}

export interface Pricing {
  free_tier: boolean;
  plans: PricingPlan[];
}

export interface Product {
  name: string;
  tagline: string;
  ph_url: string;
  website_url: string;
  upvotes: number;
  ph_description: string;
  website_content: string;
  image_url: string;
  pricing: Pricing;
  features: string[];
  target_audience: string;
  aero_rating: number;
  nova_rating: number;
  segment_start_seconds: number;
  segment_end_seconds: number;
}

export interface ScriptLine {
  speaker: "AERO" | "NOVA";
  text: string;
  product_ref: string | null;
  type: string;
}

export interface Episode {
  id: string;
  date: string;
  title: string;
  duration_seconds: number;
  audio_url: string;
  products: Product[];
  script: ScriptLine[];
  created_at: string;
}

export interface EpisodeSummary {
  id: string;
  date: string;
  title: string;
  duration_seconds: number;
  audio_url: string;
  product_count: number;
  created_at: string;
}

export interface SSEEvent {
  type: string;
  data: Record<string, any>;
}

export interface UserPreferences {
  interests: string[];
  deep_dives_only: boolean;
  technical_detail: boolean;
}
