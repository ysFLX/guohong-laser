import { NextResponse } from 'next/server';

export const revalidate = 60;

import { getActiveSparePartsWithRatings } from '@/lib/sparePartsData';

export async function GET() {
  try {
    const items = await getActiveSparePartsWithRatings();
    return NextResponse.json({
      items,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Bilinmeyen hata';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
