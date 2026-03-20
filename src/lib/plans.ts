import { Plan } from "@/types";

export interface PlanConfig {
  id: Plan;
  name: string;
  price: number; // EUR per month (0 = free)
  creditsPerMonth: number;
  features: string[];
  stripePriceId: string | null;
  watermark: boolean;
  priority: boolean;
  batchGeneration: boolean;
  highlighted?: boolean;
}

export const PLANS: Record<Plan, PlanConfig> = {
  FREE: {
    id: Plan.FREE,
    name: "Free",
    price: 0,
    creditsPerMonth: 1,
    features: [
      "1 free video to try",
      "Watermarked export",
      "Standard speed",
    ],
    stripePriceId: null,
    watermark: true,
    priority: false,
    batchGeneration: false,
  },
  CREATOR: {
    id: Plan.CREATOR,
    name: "Creator",
    price: 19,
    creditsPerMonth: 80,
    features: [
      "80 videos / month",
      "No watermark",
      "Standard speed",
    ],
    stripePriceId: process.env.STRIPE_CREATOR_PRICE_ID ?? null,
    watermark: false,
    priority: false,
    batchGeneration: false,
    highlighted: true,
  },
  PRO: {
    id: Plan.PRO,
    name: "Pro",
    price: 49,
    creditsPerMonth: 250,
    features: [
      "250 videos / month",
      "No watermark",
      "Priority generation",
      "Batch generation",
    ],
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID ?? null,
    watermark: false,
    priority: true,
    batchGeneration: true,
  },
};

export const TOPUP = {
  credits: 50,
  price: 10, // EUR
  stripePriceId: process.env.STRIPE_TOPUP_PRICE_ID ?? null,
};

// Credits cost 1 per video generated
export const CREDITS_PER_VIDEO = 1;
