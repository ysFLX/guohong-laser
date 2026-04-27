import SparePartsPageClient, { type SparePart } from '@/components/spare-parts/SparePartsPageClient';
import { getActiveSparePartsWithRatings } from '@/lib/sparePartsData';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function SparePartsPage() {
  let initialItems: SparePart[] = [];

  try {
    initialItems = await getActiveSparePartsWithRatings();
  } catch (error) {
    console.error('spare-parts:page', error);
  }

  return <SparePartsPageClient initialItems={initialItems} />;
}
