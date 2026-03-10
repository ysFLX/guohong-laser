import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

type LiveMessage = {
  id: string;
  role: 'user' | 'agent';
  text: string;
  at: string;
  status?: string;
};

function splitInquiryToMessages(inquiry: {
  id: string;
  message: string;
  createdAt: Date;
  status: string;
  adminResponse: string | null;
  respondedAt: Date | null;
}): LiveMessage[] {
  const result: LiveMessage[] = [
    {
      id: `${inquiry.id}-user`,
      role: 'user',
      text: inquiry.message,
      at: inquiry.createdAt.toISOString(),
      status: inquiry.status,
    },
  ];

  if (inquiry.adminResponse) {
    result.push({
      id: `${inquiry.id}-agent`,
      role: 'agent',
      text: inquiry.adminResponse,
      at: (inquiry.respondedAt ?? inquiry.createdAt).toISOString(),
      status: inquiry.status,
    });
  }

  return result;
}

const SUPPORT_AGENT_FALLBACK = 'Musteri Hizmetleri';
const AGENT_TYPING_WINDOW_MS = 12_000;
const HISTORY_KEEP_COUNT = 120;
const HISTORY_HARD_DELETE_DAYS = 90;

const LIVE_SUPPORT_SUBJECT_WHERE = {
  OR: [
    { subject: { equals: 'Canli destek', mode: 'insensitive' as const } },
    { subject: { equals: 'Canlı destek', mode: 'insensitive' as const } },
    { subject: { contains: 'live support', mode: 'insensitive' as const } },
  ],
};

async function pruneSupportHistory(userId: string) {
  const inquiries = await prisma.inquiry.findMany({
    where: {
      userId,
      type: 'CONTACT',
      ...LIVE_SUPPORT_SUBJECT_WHERE,
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      status: true,
      adminResponse: true,
      updatedAt: true,
    },
  });

  const oldEnough = new Date(Date.now() - HISTORY_HARD_DELETE_DAYS * 24 * 60 * 60 * 1000);
  const byAgeIds = inquiries
    .filter((item) => item.status === 'CLOSED' && item.updatedAt < oldEnough)
    .map((item) => item.id);

  const overLimitIds = inquiries
    .slice(HISTORY_KEEP_COUNT)
    .filter((item) => item.status === 'CLOSED' || Boolean(item.adminResponse))
    .map((item) => item.id);

  const deleteIds = Array.from(new Set([...byAgeIds, ...overLimitIds]));
  if (!deleteIds.length) return;

  await prisma.inquiry.deleteMany({
    where: { id: { in: deleteIds } },
  });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({
      authenticated: false,
      messages: [] as LiveMessage[],
      supportAgentName: SUPPORT_AGENT_FALLBACK,
      supportOnline: true,
      waitingReply: false,
      agentTyping: false,
    });
  }

  const inquiries = await prisma.inquiry.findMany({
    where: {
      userId,
      type: 'CONTACT',
      ...LIVE_SUPPORT_SUBJECT_WHERE,
    },
    orderBy: { createdAt: 'desc' },
    take: 60,
    select: {
      id: true,
      message: true,
      createdAt: true,
      updatedAt: true,
      status: true,
      adminResponse: true,
      respondedAt: true,
    },
  });

  const activeInquiries = inquiries.filter((item) => item.status !== 'CLOSED');

  const messages = activeInquiries
    .flatMap(splitInquiryToMessages)
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  const openInquiries = activeInquiries.filter((item) => !item.adminResponse);
  const latestOpen = openInquiries[0] ?? null;

  const waitingReply = openInquiries.length > 0;
  const agentTyping = Boolean(
    latestOpen
      && latestOpen.status === 'READ'
      && Date.now() - new Date(latestOpen.updatedAt).getTime() <= AGENT_TYPING_WINDOW_MS,
  );

  return NextResponse.json({
    authenticated: true,
    messages,
    supportAgentName: SUPPORT_AGENT_FALLBACK,
    supportOnline: true,
    waitingReply,
    agentTyping,
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Lutfen giris yapin.' }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { message?: string };
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (message.length < 2) {
    return NextResponse.json({ error: 'Mesaj cok kisa.' }, { status: 400 });
  }

  if (message.length > 1000) {
    return NextResponse.json({ error: 'Mesaj cok uzun.' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  });

  if (!user?.email) {
    return NextResponse.json({ error: 'Hesap e-postasi eksik.' }, { status: 400 });
  }

  const created = await prisma.inquiry.create({
    data: {
      type: 'CONTACT',
      status: 'NEW',
      name: user.name || 'Musteri',
      email: user.email,
      subject: 'Canli destek',
      message,
      userId,
    },
    select: {
      id: true,
      message: true,
      createdAt: true,
      status: true,
    },
  });

  await pruneSupportHistory(userId);

  return NextResponse.json({
    ok: true,
    message: {
      id: `${created.id}-user`,
      role: 'user',
      text: created.message,
      at: created.createdAt.toISOString(),
      status: created.status,
    } satisfies LiveMessage,
  });
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Lutfen giris yapin.' }, { status: 401 });
  }

  const result = await prisma.inquiry.updateMany({
    where: {
      userId,
      type: 'CONTACT',
      status: { not: 'CLOSED' },
      ...LIVE_SUPPORT_SUBJECT_WHERE,
    },
    data: {
      status: 'CLOSED',
    },
  });

  await pruneSupportHistory(userId);

  return NextResponse.json({
    ok: true,
    closedCount: result.count,
  });
}
