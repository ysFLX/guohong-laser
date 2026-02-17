import { Suspense } from 'react';

import LoginClient from '@/components/auth/LoginClient';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#070707] text-amber-100/70">Yukleniyor...</div>}>
      <LoginClient />
    </Suspense>
  );
}
