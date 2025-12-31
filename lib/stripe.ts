import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

export function getStripe() {
  if (stripeClient) return stripeClient;
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY env eksik.');
  }
  stripeClient = new Stripe(stripeSecretKey, {
    apiVersion: '2025-12-15.clover',
  });
  return stripeClient;
}
