import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import type { AddressInvoiceType } from '@/lib/invoicing/types';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Kayıt sırasında hata' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  const body = (await request.json()) as Record<string, unknown>;

  const invoiceTypeRaw = typeof body.invoiceType === 'string' ? body.invoiceType.trim().toUpperCase() : '';
  const invoiceType: AddressInvoiceType = invoiceTypeRaw === 'COMPANY' ? 'COMPANY' : 'INDIVIDUAL';

  const baseData = {
    label: typeof body.label === 'string' ? body.label.trim() : null,
    fullName: typeof body.fullName === 'string' ? body.fullName.trim() : null,
    phone: typeof body.phone === 'string' ? body.phone.trim() : null,
    line1: typeof body.line1 === 'string' ? body.line1.trim() : null,
    line2: typeof body.line2 === 'string' ? body.line2.trim() : null,
    city: typeof body.city === 'string' ? body.city.trim() : null,
    state: typeof body.state === 'string' ? body.state.trim() : null,
    postalCode: typeof body.postalCode === 'string' ? body.postalCode.trim() : null,
    country: typeof body.country === 'string' ? body.country.trim() : null,
    isDefault: false,
  };

  const invoiceData = {
    ...baseData,
    invoiceType,
    companyName: typeof body.companyName === 'string' ? body.companyName.trim() : null,
    taxOffice: typeof body.taxOffice === 'string' ? body.taxOffice.trim() : null,
    taxNumber: typeof body.taxNumber === 'string' ? body.taxNumber.trim() : null,
    identityNumber: typeof body.identityNumber === 'string' ? body.identityNumber.trim() : null,
  };

  try {
    const addressSelectBase = {
      id: true,
      label: true,
      fullName: true,
      phone: true,
      line1: true,
      line2: true,
      city: true,
      state: true,
      postalCode: true,
      country: true,
      isDefault: true,
    };

    const addressSelectInvoice = {
      ...addressSelectBase,
      invoiceType: true,
      companyName: true,
      taxOffice: true,
      taxNumber: true,
      identityNumber: true,
    };

    let created;
    try {
      created = await prisma.address.create({ data: { userId: session.user.id, ...invoiceData } });
    } catch {
      created = await prisma.address.create({ data: { userId: session.user.id, ...baseData } });
    }

    let addresses = [];
    try {
      addresses = await prisma.address.findMany({
        where: { userId: session.user.id },
        orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
        select: addressSelectInvoice,
      });
    } catch {
      addresses = await prisma.address.findMany({
        where: { userId: session.user.id },
        orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
        select: addressSelectBase,
      });
    }

    return new Response(JSON.stringify({ success: true, address: created, addresses }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e: unknown) {
    return new Response(JSON.stringify({ error: 'Kayıt sırasında hata' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
