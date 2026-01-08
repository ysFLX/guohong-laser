import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Yetkisiz' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await request.json();
  const enabled = Boolean(body?.enabled);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { twoFactorEnabled: enabled },
  });

  if (!enabled) {
    await prisma.twoFactorToken.deleteMany({
      where: { userId: session.user.id },
    });
  }

  return new Response(JSON.stringify({ enabled }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
