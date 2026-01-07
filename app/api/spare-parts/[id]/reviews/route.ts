import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';
import { authOptions } from '@/auth';

const allowedStatuses: OrderStatus[] = [
  OrderStatus.PAID,
  OrderStatus.RECEIVED,
  OrderStatus.SHIPPED,
  OrderStatus.IN_TRANSIT,
  OrderStatus.DELIVERED,
];

type ReviewSummary = {
  count: number;
  average: number;
  breakdown: Record<string, number>;
};

const getDisplayName = (user: { name: string | null; firstName: string | null; lastName: string | null }) => {
  if (user.name) return user.name;
  const composed = [user.firstName, user.lastName].filter(Boolean).join(' ');
  return composed || 'Musteri';
};

const maskName = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed || trimmed === 'Musteri') return 'Gizli Musteri';
  const parts = trimmed.split(/\s+/).filter(Boolean);
  const masked = parts
    .map((part) => {
      if (!part.length) return '';
      const stars = '*'.repeat(Math.max(part.length - 1, 1));
      return `${part[0]}${stars}`;
    })
    .join(' ');
  return masked || 'Gizli Musteri';
};

const getReviewName = (review: { isAnonymous: boolean; user: { name: string | null; firstName: string | null; lastName: string | null } }) => {
  const displayName = getDisplayName(review.user);
  if (review.isAnonymous) return maskName(displayName);
  return displayName;
};

const canUserReview = async (userId: string, sparePartId: string) => {
  const existing = await prisma.sparePartReview.findUnique({
    where: { userId_sparePartId: { userId, sparePartId } },
    select: { id: true },
  });
  if (existing) return { canReview: false, hasReviewed: true };

  const purchase = await prisma.orderItem.findFirst({
    where: {
      sparePartId,
      order: {
        userId,
        status: { in: allowedStatuses },
      },
    },
    select: { id: true },
  });

  return { canReview: Boolean(purchase), hasReviewed: false };
};

const buildSummary = (ratings: number[]): ReviewSummary => {
  const count = ratings.length;
  const breakdown: Record<string, number> = {
    '1': 0,
    '2': 0,
    '3': 0,
    '4': 0,
    '5': 0,
  };

  for (const rating of ratings) {
    const key = String(rating);
    breakdown[key] = (breakdown[key] || 0) + 1;
  }

  const average = count ? ratings.reduce((sum, value) => sum + value, 0) / count : 0;
  return { count, average, breakdown };
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: sparePartId } = await params;

    const reviews = await prisma.sparePartReview.findMany({
      where: { sparePartId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, firstName: true, lastName: true, image: true },
        },
      },
    });

    const summary = buildSummary(reviews.map((review) => review.rating));

    const session = await getServerSession(authOptions);
    let reviewStatus = { canReview: false, hasReviewed: false };
    if (session?.user?.id) {
      reviewStatus = await canUserReview(session.user.id, sparePartId);
    }

    return NextResponse.json({
      items: reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        title: review.title,
        body: review.body,
        createdAt: review.createdAt,
        user: {
          id: review.user.id,
          name: getReviewName(review),
          image: review.isAnonymous ? null : review.user.image,
        },
        isAnonymous: review.isAnonymous,
      })),
      summary,
      canReview: reviewStatus.canReview,
      hasReviewed: reviewStatus.hasReviewed,
    });
  } catch (error) {
    console.error('reviews:get', error);
    return NextResponse.json({ error: 'Yorumlar alinamadi.' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Giris yapmalisin.' }, { status: 401 });
    }

    const { id: sparePartId } = await params;
    const body = await req.json();
    const rating = Number(body?.rating);
    const title = typeof body?.title === 'string' ? body.title.trim() : '';
    const reviewBody = typeof body?.body === 'string' ? body.body.trim() : '';
    const isAnonymous = Boolean(body?.isAnonymous);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Puan 1 ile 5 arasinda olmali.' }, { status: 400 });
    }

    const reviewStatus = await canUserReview(session.user.id, sparePartId);
    if (reviewStatus.hasReviewed) {
      return NextResponse.json({ error: 'Bu urun icin daha once yorum yaptin.' }, { status: 409 });
    }
    if (!reviewStatus.canReview) {
      return NextResponse.json({ error: 'Sadece satin alanlar yorum yapabilir.' }, { status: 403 });
    }

    const created = await prisma.sparePartReview.create({
      data: {
        sparePartId,
        userId: session.user.id,
        rating,
        title: title || null,
        body: reviewBody || null,
        isAnonymous,
        isApproved: true,
      },
      include: {
        user: {
          select: { id: true, name: true, firstName: true, lastName: true, image: true },
        },
      },
    });

    return NextResponse.json({
      item: {
        id: created.id,
        rating: created.rating,
        title: created.title,
        body: created.body,
        createdAt: created.createdAt,
        user: {
          id: created.user.id,
          name: getReviewName(created),
          image: created.isAnonymous ? null : created.user.image,
        },
        isAnonymous: created.isAnonymous,
      },
    });
  } catch (error) {
    console.error('reviews:post', error);
    return NextResponse.json({ error: 'Yorum kaydedilemedi.' }, { status: 500 });
  }
}
