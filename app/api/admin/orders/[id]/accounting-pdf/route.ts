import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/auth';
import { createProformaPdf } from '@/lib/invoicing/proformaPdf';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
  }

  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      createdAt: true,
      totalCents: true,
      currency: true,
      user: { select: { name: true, email: true } },
      items: { select: { name: true, quantity: true, priceCents: true } },
      billingAddress: {
        select: {
          label: true,
          fullName: true,
          phone: true,
          line1: true,
          line2: true,
          city: true,
          state: true,
          postalCode: true,
          country: true,
          invoiceType: true,
          companyName: true,
          taxOffice: true,
          taxNumber: true,
          identityNumber: true,
        },
      },
      shippingAddress: {
        select: {
          label: true,
          fullName: true,
          phone: true,
          line1: true,
          line2: true,
          city: true,
          state: true,
          postalCode: true,
          country: true,
          invoiceType: true,
          companyName: true,
          taxOffice: true,
          taxNumber: true,
          identityNumber: true,
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 });
  }

  try {
    const shortId = order.id.slice(0, 8);
    const pdfBuffer = await createProformaPdf({
      order,
      invoiceNumber: `MUHASEBE-${shortId}`,
      issuedAtIso: new Date().toISOString(),
      documentTitle: 'MUHASEBE BİLGİ FORMU',
      watermark: 'MUHASEBE',
      footerNote: 'Bu belge muhasebe fatura kesim bilgileri için hazırlanmıştır.',
      infoTitlePrefix: 'Muhasebe bilgi formu',
    });

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Muhasebe-${shortId}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Muhasebe PDF oluşturulamadı';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
