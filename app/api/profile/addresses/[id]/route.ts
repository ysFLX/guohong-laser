import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Yetkisiz' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  const { id } = await params;
  const body = await request.json();

  const data: any = {};
  const fields = ['label', 'fullName', 'phone', 'line1', 'line2', 'city', 'state', 'postalCode', 'country', 'isDefault'];
  for (const f of fields) {
    if (Object.prototype.hasOwnProperty.call(body, f)) {
      data[f] = body[f];
    }
  }

  try {
    // Ensure address belongs to user
    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.user.id) {
      return new Response(JSON.stringify({ error: 'Adres bulunamadi' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    // If setting default, unset others
    if (data.isDefault) {
      await prisma.address.updateMany({ where: { userId: session.user.id, isDefault: true }, data: { isDefault: false } });
    }

    const updated = await prisma.address.update({ where: { id }, data });

    const addresses = await prisma.address.findMany({ where: { userId: session.user.id }, orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }] });

    return new Response(JSON.stringify({ success: true, address: updated, addresses }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('[PATCH] /api/profile/addresses/[id] error:', e);
    const msg = e instanceof Error ? e.message : 'Guncelleme hatasi';
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
      return new Response(JSON.stringify({ error: 'Adres bulunamadi' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    await prisma.address.delete({ where: { id } });

    const addresses = await prisma.address.findMany({ where: { userId: session.user.id }, orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }] });

    return new Response(JSON.stringify({ success: true, addresses }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('[DELETE] /api/profile/addresses/[id] error:', e);
    const msg = e instanceof Error ? e.message : 'Silme hatasi';
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
