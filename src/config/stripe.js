// Stripe publishable key (set in .env as VITE_STRIPE_PK)
export const STRIPE_PK = import.meta.env.VITE_STRIPE_PK

// Map plan + billing period to Stripe Price IDs
// Replace 'price_xxx' with real IDs from Stripe Dashboard
export const STRIPE_PRICE_MAP = {
  starter: {
    monthly: 'price_starter_monthly',
    half:    'price_starter_half',
    annual:  'price_starter_annual',
  },
  business: {
    monthly: 'price_business_monthly',
    half:    'price_business_half',
    annual:  'price_business_annual',
  },
  personal: {
    monthly: 'price_personal_monthly',
    half:    'price_personal_half',
    annual:  'price_personal_annual',
  },
  // Corporate is contact-sales only, no self-serve checkout
}

// Helper to get price ID
export function getStripePriceId(planId, period) {
  const plan = STRIPE_PRICE_MAP[planId]
  if (!plan) return null
  return plan[period] || plan.monthly
}
