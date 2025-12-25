import { Suspense } from 'react';

import ResetPasswordClient from '@/components/auth/ResetPasswordClient';

export const dynamic = 'force-dynamic';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-700">Yukleniyor...</div>}>
      <ResetPasswordClient />
    </Suspense>
  );
}
