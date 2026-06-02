'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const SupportWidget = dynamic(() => import('@/components/support/SupportWidget'), {
  ssr: false,
  loading: () => null,
});

export default function LazySupportWidget() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const schedule =
      window.requestIdleCallback ?? ((callback: IdleRequestCallback) => window.setTimeout(callback, 2500));
    const cancel = window.cancelIdleCallback ?? ((id: number) => window.clearTimeout(id));
    const id = schedule(() => setReady(true), { timeout: 3500 });

    return () => cancel(id);
  }, []);

  return ready ? <SupportWidget /> : null;
}
