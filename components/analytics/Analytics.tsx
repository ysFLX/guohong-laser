'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

type Props = {
  gaId?: string;
};

const COOKIE_KEY = 'cookie_consent';

const readCookie = () => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_KEY}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

export default function Analytics({ gaId }: Props) {
  const [consent, setConsent] = useState<string | null>(null);

  useEffect(() => {
    const stored = readCookie() || (typeof window !== 'undefined' ? window.localStorage.getItem(COOKIE_KEY) : null);
    if (stored) setConsent(stored);
  }, []);

  if (!gaId || consent !== 'accepted') return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}', { anonymize_ip: true });`}
      </Script>
    </>
  );
}
