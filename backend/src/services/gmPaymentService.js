// Mock payment service for Gigs Mint bids

export async function createPaymentIntent({ amountInPaise, currency = 'INR', metadata = {} }) {
  // Simulate a payment intent creation
  return {
    id: `pi_${Math.random().toString(36).slice(2, 10)}`,
    amount: amountInPaise,
    currency,
    status: 'requires_confirmation',
    metadata
  };
}

export async function confirmPaymentIntent(intentId) {
  // Simulate random but biased success for now; we'll treat as always success for deterministic tests
  return {
    id: intentId,
    status: 'succeeded'
  };
}


