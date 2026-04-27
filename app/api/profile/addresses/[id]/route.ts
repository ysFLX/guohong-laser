import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

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

type AddressPatchData = {
  label?: string;
  fullName?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  invoiceType?: 'INDIVIDUAL' | 'COMPANY';
  companyName?: string;
  taxOffice?: string;
  taxNumber?: string;
  identityNumber?: string;
  isDefault?: boolean;
};

async function listAddresses(userId: string) {
  try {
    return await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
      select: addressSelectInvoice,
    });
  } catch {
    return await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
      select: addressSelectBase,
    });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Yetkisiz' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  const { id } = await params;
  const body = (await request.json()) as Record<string, unknown>;

  const data: AddressPatchData = {};
  const stringFields = [
    'label',
    'fullName',
    'phone',
    'line1',
    'line2',
    'city',
    'state',
    'postalCode',
    'country',
    'invoiceType',
    'companyName',
    'taxOffice',
    'taxNumber',
    'identityNumber',
  ] as const;

  for (const f of stringFields) {
    if (Object.prototype.hasOwnProperty.call(body, f)) {
      if (f === 'invoiceType') {
        const raw = typeof body[f] === 'string' ? String(body[f]).trim().toUpperCase() : '';
        data[f] = raw === 'COMPANY' ? 'COMPANY' : 'INDIVIDUAL';
        continue;
      }
      data[f] = typeof body[f] === 'string' ? String(body[f]).trim() : '';
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'isDefault')) {
    data.isDefault = Boolean(body.isDefault);
  }

  try {
    // Ensure address belongs to user
    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.user.id) {
      return new Response(JSON.stringify({ error: 'Adres bulunamadı' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    // If setting default, unset others
    if (data.isDefault) {
      await prisma.address.updateMany({ where: { userId: session.user.id, isDefault: true }, data: { isDefault: false } });
    }

    let updated;
    try {
      updated = await prisma.address.update({ where: { id }, data });
    } catch {
      const fallback = { ...data };
      delete fallback.invoiceType;
      delete fallback.companyName;
      delete fallback.taxOffice;
      delete fallback.taxNumber;
      delete fallback.identityNumber;
      updated = await prisma.address.update({ where: { id }, data: fallback });
    }

    const addresses = await listAddresses(session.user.id);

    return new Response(JSON.stringify({ success: true, address: updated, addresses }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('[PATCH] /api/profile/addresses/[id] error:', e);
    const msg = e instanceof Error ? e.message : 'Güncelleme hatası';
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Yetkisiz' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  const { id } = await params;

  try {
    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.user.id) {
      return new Response(JSON.stringify({ error: 'Adres bulunamadı' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    await prisma.address.delete({ where: { id } });

    const addresses = await listAddresses(session.user.id);

    return new Response(JSON.stringify({ success: true, addresses }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('[DELETE] /api/profile/addresses/[id] error:', e);
    const msg = e instanceof Error ? e.message : 'Silme hatası';
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
