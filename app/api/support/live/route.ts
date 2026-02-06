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

const SUPPORT_AGENT_FALLBACK = 'Guohong Destek';

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
    where: { userId, type: 'CONTACT' },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: {
      id: true,
      message: true,
      createdAt: true,
      status: true,
      adminResponse: true,
      respondedAt: true,
      respondedByUser: {
        select: {
          name: true,
        },
      },
    },
  });

  const messages = inquiries
    .flatMap(splitInquiryToMessages)
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  const latestAnswered = inquiries.find((item) => Boolean(item.adminResponse));
  const supportAgentName = latestAnswered?.respondedByUser?.name || SUPPORT_AGENT_FALLBACK;

  const waitingReply = inquiries.some((item) => !item.adminResponse && item.status !== 'CLOSED');
  const agentTyping = inquiries.some((item) => !item.adminResponse && item.status === 'READ');

  return NextResponse.json({
    authenticated: true,
    messages,
    supportAgentName,
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
