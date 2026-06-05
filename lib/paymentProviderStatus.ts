export type PaymentProviderStatus = 'pending' | 'active';

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function getPaymentProviderName() {
  const raw = (process.env.NEXT_PUBLIC_PAYMENT_PROVIDER_NAME || '').trim();
  return raw || 'PAYTR';
}

export function getPaymentProviderStatus(): PaymentProviderStatus {
  const raw = normalize(process.env.NEXT_PUBLIC_PAYMENT_PROVIDER_STATUS || '');
  if (raw === 'pending') return 'pending';
  return 'active';
}

export function isPaymentProviderActive() {
  return getPaymentProviderStatus() === 'active';
}

export function getPaymentProviderPendingNotice() {
  return `Ödeme altyapısı hazırlanıyor. ${getPaymentProviderName()} aktivasyon süreci devam ediyor.`;
}
