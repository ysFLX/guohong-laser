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
      setError(err instanceof Error ? err.message : 'Yorumlar alinamadi.');
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
      setSubmitError('Lutfen puan sec.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/spare-parts/${sparePartId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, title, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Yorum kaydedilemedi.');

      setRating(0);
      setTitle('');
      setBody('');
      await fetchReviews();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Yorum kaydedilemedi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-[28px] border border-gray-100 bg-white/90 p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-teal-600">Yorumlar</p>
          <h2 className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">Musteri degerlendirmeleri</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-teal-100 px-3 py-1 text-sm font-semibold text-teal-700">
            {averageLabel}
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-300">{summary.count} yorum</span>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div>
          <div className="space-y-3">
            {ratings.map((value) => {
              const count = summary.breakdown?.[String(value)] || 0;
              const percent = summary.count ? Math.round((count / summary.count) * 100) : 0;
              return (
                <div key={value} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <span className="w-10">{value}?</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                    <div className="h-full rounded-full bg-teal-500" style={{ width: `${percent}%` }} />
                  </div>
                  <span className="w-10 text-right">{count}</span>
                </div>
              );
            })}
          </div>

          {loading && <div className="mt-6 text-sm text-gray-500">Yukleniyor...</div>}
          {error && <div className="mt-6 text-sm text-red-600">{error}</div>}

          {!loading && !error && items.length === 0 && (
            <div className="mt-6 text-sm text-gray-500">Henuz yorum yok.</div>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            {items.map((review) => (
              <div key={review.id} className="rounded-2xl border border-gray-100 bg-white/80 p-4 dark:border-gray-700 dark:bg-gray-900/60">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-9 w-9 overflow-hidden rounded-full bg-gray-100">
                      {review.user.image ? (
                        <Image src={review.user.image} alt={review.user.name} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-gray-600">
                          {review.user.name.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">{review.user.name}</div>
                      <div className="text-xs text-gray-500">{formatDate(review.createdAt)}</div>
                    </div>
                  </div>
                  <div className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700">
                    {review.rating} / 5
                  </div>
                </div>
                {review.title && <div className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">{review.title}</div>}
                {review.body && <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{review.body}</p>}
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-teal-100 bg-teal-50/70 p-4 text-sm text-teal-900">
            {status !== 'authenticated' && (
              <p>Yorum yazmak icin giris yapmalisin.</p>
            )}
            {status === 'authenticated' && hasReviewed && (
              <p>Bu urun icin yorumun alinmis. Tesekkurler.</p>
            )}
            {status === 'authenticated' && !hasReviewed && !canReview && (
              <p>Yorum yazmak icin urunu satin almalisin.</p>
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
                          ? 'bg-teal-600 text-white'
                          : 'bg-white text-teal-700 hover:bg-white/80'
                      }`}
                    >
                      {value}?
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Baslik (opsiyonel)"
                  className="w-full rounded-xl border border-teal-100 bg-white px-3 py-2 text-sm text-gray-900 focus:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-100"
                />
                <textarea
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  placeholder="Yorumunuz"
                  rows={3}
                  className="w-full rounded-xl border border-teal-100 bg-white px-3 py-2 text-sm text-gray-900 focus:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-100"
                />
                {submitError && <div className="text-sm text-red-600">{submitError}</div>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center rounded-full bg-teal-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? 'Gonderiliyor' : 'Yorum gonder'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
