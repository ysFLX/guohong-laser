import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Yetkisiz' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      addresses: {
        orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
      },
    } as unknown as Prisma.UserSelect,
  });

  return new Response(JSON.stringify({ user }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Yetkisiz' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await request.json();

  const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : '';
  const lastName = typeof body.lastName === 'string' ? body.lastName.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';

  if (!firstName || !lastName || !phone) {
    return new Response(
      JSON.stringify({ error: 'Ad, soyad ve telefon zorunludur' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const address = body.address && typeof body.address === 'object' ? body.address : null;

  const addressData = address
    ? {
        label: typeof address.label === 'string' ? address.label.trim() : null,
        fullName: typeof address.fullName === 'string' ? address.fullName.trim() : null,
        phone: typeof address.phone === 'string' ? address.phone.trim() : null,
        line1: typeof address.line1 === 'string' ? address.line1.trim() : null,
        line2: typeof address.line2 === 'string' ? address.line2.trim() : null,
        city: typeof address.city === 'string' ? address.city.trim() : null,
        state: typeof address.state === 'string' ? address.state.trim() : null,
        postalCode: typeof address.postalCode === 'string' ? address.postalCode.trim() : null,
        country: typeof address.country === 'string' ? address.country.trim() : null,
        isDefault: true,
      }
    : null;

  const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const user = await tx.user.update({
      where: { id: session.user.id },
      data: {
        firstName: firstName || null,
        lastName: lastName || null,
        phone: phone || null,
        name: firstName || lastName ? `${firstName} ${lastName}`.trim() : undefined,
      } as unknown as Prisma.UserUpdateInput,
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
      } as unknown as Prisma.UserSelect,
    });

    if (addressData) {
      await tx.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      });

      await tx.address.create({
        data: {
          userId: session.user.id,
          ...addressData,
        },
      });
    }

    const addresses = await tx.address.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
    });

    return { user, addresses };
  });

  return new Response(JSON.stringify({ success: true, ...updated }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
