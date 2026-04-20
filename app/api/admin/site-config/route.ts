import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import { normalizeHomePanelConfig } from '@/lib/homePanelDefaults';

type ConfigPayload = {
  capacitySchedule?: unknown;
  priceAlertSteps?: unknown;
  procurementFlow?: unknown;
  capacityImageUrl?: unknown;
  priceAlertImageUrl?: unknown;
  procurementImageUrl?: unknown;
};

type HomePanelConfigDelegate = {
  findUnique: (args: unknown) => Promise<{ id: string; capacitySchedule: unknown; priceAlertSteps: unknown; procurementFlow: unknown } | null>;
  upsert: (args: unknown) => Promise<{ id: string }>;
};

const prismaConfig = prisma as unknown as {
  homePanelConfig: HomePanelConfigDelegate;
};

const CONFIG_ID = 'home';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { ok: false, status: 401, error: 'Yetkisiz' } as const;
  }
  if (session.user.role !== 'ADMIN') {
    return { ok: false, status: 403, error: 'Yetersiz yetki' } as const;
  }
  return { ok: true } as const;
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const existing = await prismaConfig.homePanelConfig.findUnique({
    where: { id: CONFIG_ID },
  });

  if (!existing) {
    return NextResponse.json({ item: null });
  }

  return NextResponse.json({
    item: normalizeHomePanelConfig(existing),
  });
}

export async function PUT(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: ConfigPayload;
  try {
    body = (await req.json()) as ConfigPayload;
  } catch {
    return NextResponse.json({ error: 'Geçersiz JSON' }, { status: 400 });
  }

  const normalized = normalizeHomePanelConfig(body);

  await prismaConfig.homePanelConfig.upsert({
    where: { id: CONFIG_ID },
    create: { id: CONFIG_ID, ...normalized },
    update: normalized,
  });

  return NextResponse.json({ ok: true });
}

