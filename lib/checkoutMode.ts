export type CheckoutMode = 'payment' | 'quote';

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function getCheckoutMode(): CheckoutMode {
  const raw = normalize(process.env.NEXT_PUBLIC_CHECKOUT_MODE || '');
  if (raw === 'quote') return 'quote';
  return 'payment';
}

export function isPaymentCheckoutEnabled() {
  return getCheckoutMode() === 'payment';
}

