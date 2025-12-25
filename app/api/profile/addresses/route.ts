import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Yetkisiz' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  const body = await request.json();

  const data = {
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

  try {
    // If new address isDefault true logic not implemented in form; keep simple create
    const created = await prisma.address.create({ data: { userId: session.user.id, ...data } });

    const addresses = await prisma.address.findMany({ where: { userId: session.user.id }, orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }] });

    return new Response(JSON.stringify({ success: true, address: created, addresses }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e: unknown) {
    return new Response(JSON.stringify({ error: 'Kayıt sırasında hata' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
