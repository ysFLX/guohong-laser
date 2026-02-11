'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

import AddToCartButton from '@/components/cart/AddToCartButton';
import { useCart } from '@/components/cart/CartProvider';
import { trackEvent } from '@/lib/analytics';

type OrderItem = {
  sparePartId?: string | null;
  name?: string;
  quantity?: number;
  priceCents?: number;
};

type OrderInfo = {
  id: string;
  totalCents: number;
  currency: string;
  items: OrderItem[];
};

type RecommendedItem = {
  id: string;
  name: string;
  priceCents: number;
  currency: string;
  imageUrl: string | null;
  stockOnHand: number;
  category: { name: string; slug: string };
  ratingAverage: number;
  ratingCount: number;
};

function formatPriceTry(priceCents: number) {
  try {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 2,
    }).format(priceCents / 100);
  } catch {
    return `${(priceCents / 100).toFixed(2)} TL`;
  }
}

export default function CheckoutSuccessClient() {
  const { clear } = useCart();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { status } = useSession();
  const trackedPurchase = useRef(false);
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [recommended, setRecommended] = useState<RecommendedItem[]>([]);
  const [recStatus, setRecStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [recError, setRecError] = useState('');

  const whatsAppHref = useMemo(() => {
    const subject = orderInfo?.id ? `Sipariş: #${orderInfo.id.slice(0, 8)}` : 'Sipariş sonrası destek';
    const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
    const message = `Merhaba, ödeme sonrası destek rica ediyorum.\n${subject}${pageUrl ? `\nSayfa: ${pageUrl}` : ''}`.trim();
    return `https://wa.me/905368316787?text=${encodeURIComponent(message)}`;
  }, [orderInfo?.id]);

  useEffect(() => {
    if (status === 'loading') return;
    clear();
  }, [status, clear]);

  useEffect(() => {
    if (!sessionId) return;
    if (trackedPurchase.current) return;

    const storageKey = `laser-market:purchase:${sessionId}`;
    if (typeof window !== 'undefined' && window.sessionStorage.getItem(storageKey) === '1') {
      trackedPurchase.current = true;
      return;
    }

    const delay = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

    const run = async () => {
      try {
        await fetch(`/api/orders/sync?session_id=${encodeURIComponent(sessionId)}`, { method: 'POST' });
      } catch {
        // no-op
      }

      for (let attempt = 0; attempt < 4; attempt += 1) {
        try {
          const res = await fetch(`/api/orders/by-session?session_id=${encodeURIComponent(sessionId)}`);
          if (res.status === 401 || res.status === 403) return;
          const data = (await res.json().catch(() => ({}))) as {
            order?: Partial<OrderInfo>;
          };

          if (!res.ok) throw new Error('order fetch failed');
          const order = data.order;
          if (!order?.id || typeof order.totalCents !== 'number' || !Array.isArray(order.items)) return;

          const currency = typeof order.currency === 'string' && order.currency ? order.currency : 'TRY';
          const safeOrder: OrderInfo = {
            id: order.id,
            totalCents: order.totalCents,
            currency,
            items: order.items,
          };
          setOrderInfo(safeOrder);

          const analyticsItems = order.items
            .filter((item) => item && typeof item.name === 'string' && typeof item.priceCents === 'number')
            .map((item) => {
              const itemName = item.name as string;
              const itemId =
                typeof item.sparePartId === 'string' && item.sparePartId ? item.sparePartId : itemName;
              return {
                item_id: itemId,
                item_name: itemName,
                price: (item.priceCents as number) / 100,
                quantity: typeof item.quantity === 'number' ? item.quantity : 1,
              };
            });

          trackEvent('purchase', {
            transaction_id: order.id,
            currency,
            value: order.totalCents / 100,
            items: analyticsItems,
          });

          const sparePartIds = Array.from(
            new Set(
              order.items
                .map((item) => (typeof item?.sparePartId === 'string' ? item.sparePartId : ''))
                .filter(Boolean),
            ),
          ).slice(0, 25);

          if (sparePartIds.length > 0) {
            setRecStatus('loading');
            setRecError('');
            try {
              const recRes = await fetch(
                `/api/spare-parts/recommendations?ids=${encodeURIComponent(sparePartIds.join(','))}&limit=3`,
                { cache: 'no-store' },
              );
              const recData = (await recRes.json().catch(() => ({}))) as { items?: unknown; error?: unknown };
              if (!recRes.ok) {
                throw new Error(typeof recData?.error === 'string' ? recData.error : 'Öneriler yüklenemedi.');
              }
              const items = Array.isArray(recData?.items) ? (recData.items as RecommendedItem[]) : [];
              setRecommended(items);
              setRecStatus('idle');
            } catch (err) {
              setRecommended([]);
              setRecStatus('error');
              setRecError(err instanceof Error ? err.message : 'Öneriler yüklenemedi.');
            }
          }

          trackedPurchase.current = true;
          if (typeof window !== 'undefined') {
            window.sessionStorage.setItem(storageKey, '1');
          }
          return;
        } catch {
          await delay(350);
        }
      }
    };

    run();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
        <div className="text-2xl font-semibold text-gray-900 dark:text-white">Ödeme başarılı</div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Siparişiniz alınmıştır. Detayları ´Siparişlerim´ sayfasından takip edebilirsiniz.
        </p>

        {orderInfo && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left dark:border-gray-700 dark:bg-gray-800">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                Sipariş no
              </div>
              <div className="mt-1 text-sm font-bold text-gray-900 dark:text-white">#{orderInfo.id.slice(0, 8)}</div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left dark:border-gray-700 dark:bg-gray-800">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                Toplam
              </div>
              <div className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                {formatPriceTry(orderInfo.totalCents)}
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
          İade veya değişim talebiniz olursa{' '}
          <Link href="/returns-request" className="font-semibold text-indigo-600 hover:text-indigo-700">
            iade formunu
          </Link>{' '}
          doldurabilirsiniz. Fatura/irsaliye talepleri için{' '}
          <Link href="/contact?subject=Fatura+Talebi" className="font-semibold text-indigo-600 hover:text-indigo-700">
            iletişim
          </Link>{' '}
          kurabilirsiniz.
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href={orderInfo?.id ? `/profile/orders/${orderInfo.id}` : '/profile/orders'}
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            {orderInfo?.id ? 'Sipariş detayı' : 'Siparişlerim'}
          </Link>
          <Link
            href="/spare-parts"
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Alışverişe devam et
          </Link>
          <a
            href={whatsAppHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-900 hover:border-emerald-300 hover:bg-emerald-100/70 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
          >
            WhatsApp destek
          </a>
        </div>

        {(recStatus === 'loading' || recStatus === 'error' || recommended.length > 0) && (
          <div className="mt-10 rounded-3xl border border-gray-200 bg-white p-6 text-left shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                  Tamamlayıcı parçalar
                </div>
                <div className="mt-2 text-lg font-bold text-gray-900 dark:text-white">
                  Sık birlikte alınan öneriler
                </div>
                <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  İstersen bu siparişe ek olarak hızlıca sepet oluşturabilirsin.
                </div>
              </div>
              <Link href="/spare-parts?sort=recommended" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                Tüm öneriler
              </Link>
            </div>

            {recStatus === 'loading' && (
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {[0, 1, 2].map((key) => (
                  <div
                    key={key}
                    className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4 dark:border-gray-700 dark:bg-gray-900/40"
                  >
                    <div className="h-28 w-full rounded-xl bg-gray-200/70 dark:bg-gray-700/40" />
                    <div className="mt-3 h-4 w-4/5 rounded bg-gray-200/70 dark:bg-gray-700/40" />
                    <div className="mt-2 h-3 w-2/5 rounded bg-gray-200/70 dark:bg-gray-700/40" />
                    <div className="mt-3 h-9 w-full rounded-xl bg-gray-200/70 dark:bg-gray-700/40" />
                  </div>
                ))}
              </div>
            )}

            {recStatus === 'error' && (
              <div className="mt-5 text-sm text-gray-600 dark:text-gray-300">{recError || 'Öneriler yüklenemedi.'}</div>
            )}

            {recStatus !== 'loading' && recommended.length > 0 && (
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {recommended.map((item) => (
                  <div
                    key={item.id}
                    className="group overflow-hidden rounded-2xl border border-gray-200 bg-gray-50/60 p-4 transition hover:-translate-y-0.5 hover:shadow-lg dark:border-gray-700 dark:bg-gray-900/40"
                  >
                    <Link href={`/spare-parts/${item.id}`} className="block">
                      <div className="relative h-28 w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-950">
                        <Image
                          src={item.imageUrl || '/images/1.jpg'}
                          alt={item.name}
                          fill
                          sizes="(max-width: 640px) 100vw, 33vw"
                          className="object-cover transition-transform group-hover:scale-[1.03]"
                          loading="lazy"
                          unoptimized
                        />
                      </div>
                      <div className="mt-3">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">{item.name}</div>
                        <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-600 dark:text-gray-300">
                          <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                            {item.category?.name || 'Yedek parça'}
                          </span>
                          {item.ratingCount > 0 && (
                            <span className="font-semibold text-amber-700 dark:text-amber-300">
                              ★ {item.ratingAverage.toFixed(1)} ({item.ratingCount})
                            </span>
                          )}
                        </div>
                        <div className="mt-2 text-sm font-bold text-gray-900 dark:text-white">{formatPriceTry(item.priceCents)}</div>
                      </div>
                    </Link>

                    <div className="mt-3">
                      <AddToCartButton
                        id={item.id}
                        name={item.name}
                        priceCents={item.priceCents}
                        imageUrl={item.imageUrl}
                        className="w-full inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-70"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
