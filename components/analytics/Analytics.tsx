'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

type Props = {
  gaId?: string;
  adsId?: string;
};

const COOKIE_KEY = 'cookie_consent';

const readCookie = () => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_KEY}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

const parseAnalyticsConsent = (raw: string | null) => {
  if (!raw) return null;
  if (raw === 'accepted') return true;
  if (raw === 'rejected') return false;
  try {
    const parsed = JSON.parse(raw) as { analytics?: boolean };
    if (typeof parsed.analytics === 'boolean') {
      return parsed.analytics;
    }
  } catch {
    return null;
  }
  return null;
};

export default function Analytics({ gaId, adsId }: Props) {
  const [consent, setConsent] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = readCookie() || (typeof window !== 'undefined' ? window.localStorage.getItem(COOKIE_KEY) : null);
    const parsed = parseAnalyticsConsent(stored);
    if (parsed !== null) setConsent(parsed);
  }, []);

  const primaryTagId = gaId || adsId;

  if (!primaryTagId || consent !== true) return null;

  const configLines = [
    gaId ? `gtag('config', '${gaId}', { anonymize_ip: true });` : null,
    adsId ? `gtag('config', '${adsId}');` : null,
  ]
    .filter(Boolean)
    .join('\n');

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${primaryTagId}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
${configLines}`}
      </Script>
    </>
  );
}
