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
  type:
    | "intro"
    | "analysis"
    | "hot_take"
    | "rating"
    | "transition"
    | "outro";
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

export interface GenerateRequest {
  preferences?: {
    interests?: string[];
    deep_dives_only?: boolean;
    technical_detail?: boolean;
  };
}

export interface SSEEvent {
  type: string;
  data: Record<string, unknown>;
}

export function createProduct(partial: Partial<Product> & { name: string }): Product {
  return {
    name: partial.name,
    tagline: partial.tagline || "",
    ph_url: partial.ph_url || "",
    website_url: partial.website_url || "",
    upvotes: partial.upvotes || 0,
    ph_description: partial.ph_description || "",
    website_content: partial.website_content || "",
    image_url: partial.image_url || "",
    pricing: partial.pricing || { free_tier: false, plans: [] },
    features: partial.features || [],
    target_audience: partial.target_audience || "",
    aero_rating: partial.aero_rating || 0,
    nova_rating: partial.nova_rating || 0,
    segment_start_seconds: partial.segment_start_seconds || 0,
    segment_end_seconds: partial.segment_end_seconds || 0,
  };
}
