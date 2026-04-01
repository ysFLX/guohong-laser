'use client';

import { usePathname } from 'next/navigation';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageShell from '@/components/layout/PageShell';
import ScrollPulse from '@/components/layout/ScrollPulse';
import SupportWidget from '@/components/support/SupportWidget';

export default function RootChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <main className="flex-grow">{children}</main>;
  }

  return (
    <>
      <Header />
      <main className="flex-grow">
        <PageShell>{children}</PageShell>
      </main>
      <ScrollPulse />
      <SupportWidget />
      <Footer />
    </>
  );
}
