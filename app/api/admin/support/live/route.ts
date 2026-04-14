import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/auth';
import { parseInquiryAdminResponse } from '@/lib/inquiryAdminResponses';
import { prisma } from '@/lib/prisma';

type ThreadSummary = {
  key: string;
  userId: string | null;
  name: string;
  email: string;
  lastAt: string;
  lastPreview: string;
  unreadCount: number;
};

type ThreadMessage = {
  id: string;
  role: 'user' | 'agent';
  text: string;
  at: string;
  status: 'NEW' | 'READ' | 'CLOSED';
  senderName?: string;
};

const LEGACY_RESPONSE_TIMESTAMP = new Date(0).toISOString();

const LIVE_SUPPORT_SUBJECT_WHERE = {
  OR: [
    { subject: { equals: 'Canli destek', mode: 'insensitive' as const } },
    { subject: { equals: 'Canlı destek', mode: 'insensitive' as const } },
    { subject: { contains: 'live support', mode: 'insensitive' as const } },
  ],
};

function makeThreadKey(userId: string | null, email: string) {
  return userId ? `user:${userId}` : `email:${email.toLowerCase()}`;
}

function resolveThreadWhere(thread: string) {
  if (thread.startsWith('user:')) {
    const userId = thread.slice(5).trim();
    if (!userId) return null;
    return { userId };
  }

  if (thread.startsWith('email:')) {
    const email = thread.slice(6).trim().toLowerCase();
    if (!email) return null;
    return {
      userId: null as string | null,
      email: { equals: email, mode: 'insensitive' as const },
    };
  }

  return null;
}

function hasSessionUser(session: unknown): session is { user: { id: string; role?: string } } {
  if (!session || typeof session !== 'object') return false;
  const maybe = session as { user?: { id?: unknown; role?: unknown } };
  return typeof maybe.user?.id === 'string' && maybe.user.id.length > 0;
}

function isAdminSession(session: unknown): session is { user: { id: string; role: 'ADMIN' } } {
  if (!hasSessionUser(session)) return false;
  return session.user.role === 'ADMIN';
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!hasSessionUser(session)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }
  if (!isAdminSession(session)) {
    return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
  }

  const url = new URL(request.url);
  const selectedThread = url.searchParams.get('thread') || null;

  const inquiries = await prisma.inquiry.findMany({
    where: {
      type: 'CONTACT',
      ...LIVE_SUPPORT_SUBJECT_WHERE,
    },
    orderBy: { createdAt: 'desc' },
    take: 300,
    select: {
      id: true,
      userId: true,
      name: true,
      email: true,
      message: true,
      status: true,
      createdAt: true,
      adminResponse: true,
      respondedAt: true,
      respondedByUser: { select: { name: true } },
    },
  });

  const grouped = new Map<string, typeof inquiries>();
  for (const item of inquiries) {
    const key = makeThreadKey(item.userId, item.email);
    const arr = grouped.get(key) || [];
    arr.push(item);
    grouped.set(key, arr);
  }

  const threads: ThreadSummary[] = Array.from(grouped.entries())
    .map(([key, list]) => {
      const sorted = [...list].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      const last = sorted[0];
      const unreadCount = sorted.filter((x) => parseInquiryAdminResponse(x.adminResponse).length === 0 && x.status !== 'CLOSED').length;
      return {
        key,
        userId: last.userId,
        name: last.name || 'Müşteri',
        email: last.email,
        lastAt: last.createdAt.toISOString(),
        lastPreview: last.message.slice(0, 120),
        unreadCount,
      };
    })
    .sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime());

  const activeThread = selectedThread && grouped.has(selectedThread) ? selectedThread : threads[0]?.key || null;
  const activeInquiries = activeThread ? grouped.get(activeThread) || [] : [];

  const messages: ThreadMessage[] = [...activeInquiries]
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .flatMap((item) => {
      const rows: ThreadMessage[] = [
        {
          id: `${item.id}-user`,
          role: 'user',
          text: item.message,
          at: item.createdAt.toISOString(),
          status: item.status,
          senderName: item.name || undefined,
        },
      ];
      const replies = parseInquiryAdminResponse(item.adminResponse);
      replies.forEach((reply, index) => {
        const replyAt =
          reply.at && reply.at !== LEGACY_RESPONSE_TIMESTAMP
            ? reply.at
            : (item.respondedAt ?? item.createdAt).toISOString();
        rows.push({
          id: `${item.id}-agent-${index}`,
          role: 'agent',
          text: reply.text,
          at: replyAt,
          status: item.status,
          senderName: reply.senderName || item.respondedByUser?.name || 'Destek',
        });
      });
      return rows;
    });

  const replyTargetInquiryId = [...activeInquiries]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .find((x) => parseInquiryAdminResponse(x.adminResponse).length === 0)?.id
    ?? [...activeInquiries].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]?.id
    ?? null;

  return NextResponse.json({
    threads,
    activeThread,
    messages,
    replyTargetInquiryId,
  });
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!hasSessionUser(session)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }
  if (!isAdminSession(session)) {
    return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
  }

  const url = new URL(request.url);
  const thread = (url.searchParams.get('thread') || '').trim();

  if (!thread) {
    return NextResponse.json({ error: 'Thread parametresi zorunlu.' }, { status: 400 });
  }

  const threadWhere = resolveThreadWhere(thread);
  if (!threadWhere) {
    return NextResponse.json({ error: 'Geçersiz thread anahtarı.' }, { status: 400 });
  }

  const result = await prisma.inquiry.deleteMany({
    where: {
      type: 'CONTACT',
      ...LIVE_SUPPORT_SUBJECT_WHERE,
      ...threadWhere,
    },
  });

  return NextResponse.json({
    ok: true,
    deletedCount: result.count,
  });
}
