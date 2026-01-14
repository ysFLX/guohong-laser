export type AnalyticsItem = {
  item_id: string;
  item_name: string;
  price: number;
  quantity?: number;
};

export type AnalyticsParams = {
  currency?: string;
  value?: number;
  items?: AnalyticsItem[];
  [key: string]: unknown;
};

export function trackEvent(name: string, params?: AnalyticsParams) {
  if (typeof window === 'undefined') return;
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag !== 'function') return;
  gtag('event', name, params || {});
}
