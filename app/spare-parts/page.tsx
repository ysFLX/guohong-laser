import SparePartsPageClient, { type SparePart } from '@/components/spare-parts/SparePartsPageClient';
import { getActiveSparePartsWithRatings } from '@/lib/sparePartsData';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function SparePartsPage() {
  try {
    const initialItems: SparePart[] = await getActiveSparePartsWithRatings();

    return <SparePartsPageClient initialItems={initialItems} />;
  } catch (error) {
    console.error('spare-parts:page', error);
    return <SparePartsPageClient initialItems={[]} />;
  }
}
