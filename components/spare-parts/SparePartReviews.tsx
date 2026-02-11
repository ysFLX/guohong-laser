'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

const ratings = [5, 4, 3, 2, 1];

type ReviewItem = {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  createdAt: string;
  user: { id: string; name: string; image: string | null };
  isAnonymous?: boolean;
};

type ReviewSummary = {
  count: number;
  average: number;
  breakdown: Record<string, number>;
};

type ReviewsPayload = {
  items: ReviewItem[];
  summary: ReviewSummary;
  canReview: boolean;
  hasReviewed: boolean;
};

const formatDate = (value: string) => {
  try {
    return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium' }).format(new Date(value));
  } catch {
    return value;
  }
};

export default function SparePartReviews({ sparePartId }: { sparePartId: string }) {
  const { status } = useSession();
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [summary, setSummary] = useState<ReviewSummary>({ count: 0, average: 0, breakdown: {} });
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/spare-parts/${sparePartId}/reviews`);
      const data = (await res.json()) as ReviewsPayload;
      if (!res.ok) throw new Error(data as unknown as string);
      setItems(data.items || []);
      setSummary(data.summary || { count: 0, average: 0, breakdown: {} });
      setCanReview(Boolean(data.canReview));
      setHasReviewed(Boolean(data.hasReviewed));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Yorumlar alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [sparePartId]);

  const averageLabel = useMemo(() => {
    if (!summary.count) return '0.0';
    return summary.average.toFixed(1);
  }, [summary]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError('');

    if (!rating) {
      setSubmitError('Lütfen puan seçin.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/spare-parts/${sparePartId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, title, body, isAnonymous }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Yorum kaydedilemedi.');

      setRating(0);
      setTitle('');
      setBody('');
      setIsAnonymous(false);
      await fetchReviews();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Yorum kaydedilemedi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-xl dark:border-slate-800/70 dark:bg-slate-950/40">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-600">Yorumlar</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">Müşteri değerlendirmeleri</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">
            {averageLabel}
          </div>
          <span className="text-sm text-slate-600 dark:text-slate-300">{summary.count} yorum</span>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div>
          <div className="space-y-3">
            {ratings.map((value) => {
              const count = summary.breakdown?.[String(value)] || 0;
              const percent = summary.count ? Math.round((count / summary.count) * 100) : 0;
              return (
                <div key={value} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <span className="flex w-12 items-center gap-1">
                    <span>{value}</span>
                    <svg viewBox="0 0 20 20" className="h-4 w-4 text-amber-400" fill="currentColor" aria-hidden="true">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.96a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.447a1 1 0 00-.364 1.118l1.286 3.96c.3.921-.755 1.688-1.538 1.118l-3.367-2.447a1 1 0 00-1.176 0l-3.367 2.447c-.783.57-1.838-.197-1.538-1.118l1.286-3.96a1 1 0 00-.364-1.118L2.025 9.387c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.96z" />
                    </svg>
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800/60">
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${percent}%` }} />
                  </div>
                  <span className="w-10 text-right">{count}</span>
                </div>
              );
            })}
          </div>

          {loading && <div className="mt-6 text-sm text-slate-500">Yükleniyor...</div>}
          {error && <div className="mt-6 text-sm text-red-600">{error}</div>}

          {!loading && !error && items.length === 0 && (
            <div className="mt-6 text-sm text-slate-500">Henüz yorum yok.</div>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            {items.map((review) => (
              <div
                key={review.id}
                className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm dark:border-slate-800/70 dark:bg-slate-950/30"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-9 w-9 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800/60">
                      {review.user.image ? (
                        <Image src={review.user.image} alt={review.user.name} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-600">
                          {review.user.name.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">{review.user.name}</div>
                      <div className="text-xs text-slate-500">{formatDate(review.createdAt)}</div>
                    </div>
                  </div>
                  <div className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                    {review.rating} / 5
                  </div>
                </div>
                {review.title && (
                  <div className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">{review.title}</div>
                )}
                {review.body && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{review.body}</p>}
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 text-sm text-indigo-900">
            {status !== 'authenticated' && (
              <p>Yorum yazmak için giriş yapmalısın.</p>
            )}
            {status === 'authenticated' && hasReviewed && (
              <p>Bu ürün için yorumun alındı. Teşekkürler.</p>
            )}
            {status === 'authenticated' && !hasReviewed && !canReview && (
              <p>Yorum yazmak için ürün satın almalısın.</p>
            )}
            {status === 'authenticated' && canReview && (
              <form onSubmit={handleSubmit} className="mt-2 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
                        rating === value
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-indigo-700 hover:bg-white/80'
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        <span>{value}</span>
                        <svg viewBox="0 0 20 20" className="h-4 w-4 text-amber-400" fill="currentColor" aria-hidden="true">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.96a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.447a1 1 0 00-.364 1.118l1.286 3.96c.3.921-.755 1.688-1.538 1.118l-3.367-2.447a1 1 0 00-1.176 0l-3.367 2.447c-.783.57-1.838-.197-1.538-1.118l1.286-3.96a1 1 0 00-.364-1.118L2.025 9.387c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.96z" />
                        </svg>
                      </span>
                    </button>
                  ))}
                </div>
                <label className="flex items-center gap-2 text-xs text-indigo-800">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(event) => setIsAnonymous(event.target.checked)}
                    className="h-4 w-4 rounded border-indigo-200 text-indigo-600 focus:ring-indigo-200"
                  />
                  İsmini gizle
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Başlık (opsiyonel)"
                  className="w-full rounded-xl border border-indigo-100 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
                <textarea
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  placeholder="Yorumunuz"
                  rows={3}
                  className="w-full rounded-xl border border-indigo-100 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
                {submitError && <div className="text-sm text-red-600">{submitError}</div>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? 'Gönderiliyor' : 'Yorum gönder'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
