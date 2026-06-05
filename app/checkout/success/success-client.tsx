'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

import AddToCartButton from '@/components/cart/AddToCartButton';
import { useCart } from '@/components/cart/CartProvider';
import { trackEvent } from '@/lib/analytics';
import { VAT_PERCENTAGE, calculateGrossCents, calculateVatTotals } from '@/lib/vat';

type OrderItem = {
  id: string;
  sparePartId: string | null;
  name: string;
  quantity: number;
  priceCents: number;
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
  const sessionId = searchParams.get('session_id') || searchParams.get('merchant_oid');
  const { status } = useSession();
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [orderStatus, setOrderStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [orderError, setOrderError] = useState('');
  const [recommended, setRecommended] = useState<RecommendedItem[]>([]);
  const [recStatus, setRecStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [recError, setRecError] = useState('');

  const orderShortId = orderInfo?.id ? orderInfo.id.slice(0, 8) : '';
  const itemCount = useMemo(
    () => (orderInfo ? orderInfo.items.reduce((acc, item) => acc + (item.quantity || 0), 0) : 0),
    [orderInfo],
  );
  const orderTotals = useMemo(() => {
    if (!orderInfo) return { subtotalCents: 0, vatCents: 0, totalCents: 0 };
    const totals = calculateVatTotals(orderInfo.items);
    return {
      subtotalCents: totals.subtotalCents,
      vatCents: Math.max(0, orderInfo.totalCents - totals.subtotalCents),
      totalCents: orderInfo.totalCents,
    };
  }, [orderInfo]);

  const whatsAppHref = useMemo(() => {
    const subject = orderInfo?.id ? `Sipariş: #${orderInfo.id.slice(0, 8)}` : 'Sipariş sonrası destek';
    const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
    const message = `Merhaba, ödeme sonrası destek rica ediyorum.\n${subject}${pageUrl ? `\nSayfa: ${pageUrl}` : ''}`.trim();
    return `https://wa.me/905368316787?text=${encodeURIComponent(message)}`;
  }, [orderInfo?.id]);

  const orderDetailHref = orderInfo?.id ? `/profile/orders/${orderInfo.id}` : '/profile/orders';

  const loginHref = useMemo(() => {
    const next = sessionId ? `/checkout/success?merchant_oid=${encodeURIComponent(sessionId)}` : '/checkout/success';
    return `/login?next=${encodeURIComponent(next)}`;
  }, [sessionId]);

  const returnsHref = useMemo(() => {
    if (!orderInfo?.id) return '/returns-request';
    const params = new URLSearchParams({
      orderId: orderInfo.id,
      itemName: orderInfo.items[0]?.name || '',
    });
    return `/returns-request?${params.toString()}`;
  }, [orderInfo?.id, orderInfo?.items]);

  const invoiceHref = useMemo(() => {
    const shortId = orderInfo?.id ? orderInfo.id.slice(0, 8) : '';
    const params = new URLSearchParams({
      subject: shortId ? `Fatura Talebi - ${shortId}` : 'Fatura Talebi',
      message: orderInfo?.id
        ? `Merhaba,\n\n${orderInfo.id} numaralı siparişim için fatura talep ediyorum.\n\nTeşekkürler.`
        : 'Merhaba, fatura talep ediyorum.',
    });
    return `/contact?${params.toString()}`;
  }, [orderInfo?.id]);

  const supportHref = useMemo(() => {
    const shortId = orderInfo?.id ? orderInfo.id.slice(0, 8) : '';
    const params = new URLSearchParams({
      subject: shortId ? `Sipariş desteği - ${shortId}` : 'Sipariş desteği',
      message: orderInfo?.id
        ? `Merhaba,\n\n${orderInfo.id} numaralı siparişim ile ilgili destek rica ediyorum.\n\nTeşekkürler.`
        : 'Merhaba, siparişim ile ilgili destek rica ediyorum.',
    });
    return `/contact?${params.toString()}`;
  }, [orderInfo?.id]);

  useEffect(() => {
    if (status === 'loading') return;
    clear();
  }, [status, clear]);

  useEffect(() => {
    if (!sessionId) {
      setOrderStatus('error');
      setOrderError('Ödeme oturumu bulunamadı. Siparişlerini “Siparişlerim” sayfasından kontrol edebilirsin.');
      return;
    }

    let cancelled = false;
    setOrderStatus('loading');
    setOrderError('');

    const delay = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

    const run = async () => {
      for (let attempt = 0; attempt < 4; attempt += 1) {
        try {
          const res = await fetch(`/api/orders/by-session?merchant_oid=${encodeURIComponent(sessionId)}`);
          if (res.status === 401 || res.status === 403) {
            if (cancelled) return;
            setOrderStatus('error');
            setOrderError('Sipariş bilgisi için giriş yapmalısın.');
            return;
          }
          const data = (await res.json().catch(() => ({}))) as {
            order?: Partial<OrderInfo>;
          };

          if (!res.ok) throw new Error('order fetch failed');
          const order = data.order;
          if (!order?.id || typeof order.totalCents !== 'number' || !Array.isArray(order.items)) return;

          const currency = typeof order.currency === 'string' && order.currency ? order.currency : 'TRY';
          const safeItems = order.items
            .filter(Boolean)
            .map((item, index) => ({
              id: typeof item?.id === 'string' && item.id ? item.id : `${order.id}:${index}`,
              sparePartId: typeof item?.sparePartId === 'string' && item.sparePartId ? item.sparePartId : null,
              name: typeof item?.name === 'string' && item.name ? item.name : `Ürün ${index + 1}`,
              quantity: typeof item?.quantity === 'number' && item.quantity > 0 ? item.quantity : 1,
              priceCents: typeof item?.priceCents === 'number' && Number.isFinite(item.priceCents) ? item.priceCents : 0,
            }));

          const safeOrder: OrderInfo = {
            id: order.id,
            totalCents: order.totalCents,
            currency,
            items: safeItems,
          };

          if (!cancelled) {
            setOrderInfo(safeOrder);
            setOrderStatus('ready');
          }

          const storageKey = `laser-market:purchase-tracked:${sessionId}`;
          const alreadyTracked =
            typeof window !== 'undefined' && window.sessionStorage.getItem(storageKey) === '1';

          if (!alreadyTracked) {
            const trackedItemTotals = calculateVatTotals(safeItems);
            const trackedItemsAreNet = order.totalCents > trackedItemTotals.subtotalCents;
            const analyticsItems = safeItems.map((item) => ({
              item_id: item.sparePartId || item.id,
              item_name: item.name,
              price: (trackedItemsAreNet ? calculateGrossCents(item.priceCents) : item.priceCents) / 100,
              quantity: item.quantity,
            }));

            trackEvent('purchase', {
              transaction_id: order.id,
              currency,
              value: order.totalCents / 100,
              items: analyticsItems,
            });

            try {
              window.sessionStorage.setItem(storageKey, '1');
            } catch {
              // no-op
            }
          }

          const sparePartIds = Array.from(
            new Set(
              safeItems.map((item) => (typeof item.sparePartId === 'string' ? item.sparePartId : '')).filter(Boolean),
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

          return;
        } catch {
          await delay(350);
        }
      }

      if (cancelled) return;
      setOrderStatus('error');
      setOrderError('Sipariş bilgisi yüklenemedi. Lütfen birkaç dakika sonra tekrar dene.');
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-200">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-24 top-10 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-500/10" />
        <div className="pointer-events-none absolute -left-32 top-48 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl dark:bg-indigo-500/10" />
        <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_55%)]" />

        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-12 sm:px-6 lg:px-8">
          <div className="rounded-[36px] border border-slate-900/10 bg-slate-950 px-6 py-10 text-white shadow-2xl sm:px-10">
            <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
                Ödeme tamamlandı
              </div>

              <h1 className="mt-5 text-3xl font-semibold tracking-tight !text-white sm:text-4xl">Siparişin alındı</h1>
              <p className="mt-3 text-sm text-white/70">
                Sipariş detaylarını ve kargo güncellemelerini{' '}
                <span className="font-semibold text-white">Siparişlerim</span> sayfasından takip edebilirsin.
              </p>

              <div className="mt-6 grid w-full max-w-2xl gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/20 bg-white px-4 py-4 text-left shadow-lg shadow-slate-950/10">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500">Sipariş no</div>
                  <div className="mt-2 text-sm font-semibold text-slate-950">
                    {orderInfo ? `#${orderShortId}` : orderStatus === 'loading' ? 'Yükleniyor...' : '-'}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white px-4 py-4 text-left shadow-lg shadow-slate-950/10">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500">Toplam</div>
                  <div className="mt-2 text-sm font-semibold text-slate-950">
                    {orderInfo ? formatPriceTry(orderInfo.totalCents) : orderStatus === 'loading' ? 'Yükleniyor...' : '-'}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white px-4 py-4 text-left shadow-lg shadow-slate-950/10">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500">Ürün</div>
                  <div className="mt-2 text-sm font-semibold text-slate-950">
                    {orderInfo ? `${itemCount} adet` : orderStatus === 'loading' ? 'Yükleniyor...' : '-'}
                  </div>
                </div>
              </div>

              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Link
                  href={orderDetailHref}
                  className="rounded-full bg-indigo-600 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-500"
                >
                  {orderInfo?.id ? 'Sipariş detayı' : 'Siparişlerim'}
                </Link>
                <Link
                  href="/spare-parts"
                  className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                  Alışverişe devam
                </Link>
                <a
                  href={whatsAppHref}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100 transition hover:bg-emerald-500/15"
                >
                  WhatsApp destek
                </a>
              </div>

              {orderStatus === 'error' ? (
                <div className="mt-6 w-full max-w-2xl rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-4 text-left text-sm text-amber-100">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-200">Bilgi</div>
                  <div className="mt-1">{orderError || 'Sipariş bilgisi yüklenemedi.'}</div>
                  {status === 'unauthenticated' ? (
                    <Link
                      href={loginHref}
                      className="mt-3 inline-flex items-center justify-center rounded-full border border-amber-200/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-100 hover:bg-white/10"
                    >
                      Giriş yap
                    </Link>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 text-left shadow-xl backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/40">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Sipariş özeti
                  </div>
                  <div className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">Ürünler</div>
                  <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Kargo bilgisi eklendiğinde sipariş detayında görünür ve e-posta ile bilgilendirilirsin.
                  </div>
                </div>
                {orderInfo ? (
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200">
                    #{orderShortId}
                  </span>
                ) : null}
              </div>

              {orderStatus === 'loading' && (
                <div className="mt-5 grid gap-3">
                  {[0, 1, 2].map((key) => (
                    <div
                      key={key}
                      className="rounded-2xl border border-slate-200/70 bg-slate-50/70 px-4 py-3 dark:border-slate-800/70 dark:bg-slate-900/30"
                    >
                      <div className="h-4 w-3/5 rounded bg-slate-200/70 dark:bg-slate-800/60" />
                      <div className="mt-2 h-3 w-2/5 rounded bg-slate-200/70 dark:bg-slate-800/60" />
                    </div>
                  ))}
                </div>
              )}

              {orderInfo ? (
                <div className="mt-5 space-y-3">
                  {orderInfo.items.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 text-sm dark:border-slate-800/70 dark:bg-slate-950/20"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-slate-900 dark:text-white">{item.name}</div>
                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.quantity} adet, KDV hariç</div>
                      </div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">
                        {formatPriceTry(item.priceCents * item.quantity)}
                      </div>
                    </div>
                  ))}

                  {orderInfo.items.length > 4 ? (
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      +{orderInfo.items.length - 4} ürün daha
                    </div>
                  ) : null}

                  <div className="mt-4 space-y-2 rounded-2xl border border-slate-200/70 bg-slate-50/70 px-4 py-3 text-sm dark:border-slate-800/70 dark:bg-slate-900/40">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-300">Ara toplam (KDV hariç)</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatPriceTry(orderTotals.subtotalCents)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-300">{`KDV (%${VAT_PERCENTAGE})`}</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatPriceTry(orderTotals.vatCents)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-200/70 pt-2 dark:border-slate-800/70">
                      <span className="font-semibold text-slate-900 dark:text-white">Genel toplam</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatPriceTry(orderTotals.totalCents)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="space-y-4">
              <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 text-left shadow-xl backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/40">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Sonraki adımlar
                </div>
                <div className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">Ne olacak?</div>
                <ol className="mt-4 space-y-4 text-sm text-slate-700 dark:text-slate-300">
                  {[
                    {
                      title: 'Sipariş kaydı oluştu',
                      desc: 'Siparişin sisteme işlendi. Ürünler hazırlanmaya başlar.',
                    },
                    {
                      title: 'Hazırlık & paketleme',
                      desc: 'Stoklu ürünlerde genelde 2-3 iş günü içinde çıkış yapılır.',
                    },
                    {
                      title: 'Kargo bilgisi',
                      desc: 'Kargo takip numarası girildiğinde “Sipariş detayı”nda görünür.',
                    },
                  ].map((step, idx) => (
                    <li key={step.title} className="flex gap-3">
                      <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 dark:text-white">{step.title}</div>
                        <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{step.desc}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <Link
                  href={returnsHref}
                  className="rounded-2xl border border-slate-200/70 bg-white/90 px-5 py-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg dark:border-slate-800/70 dark:bg-slate-950/40 dark:hover:border-indigo-500/40"
                >
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    İade / Değişim
                  </div>
                  <div className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">Talep oluştur</div>
                  <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">Sipariş no ile hızlı başlat.</div>
                </Link>

                <Link
                  href={invoiceHref}
                  className="rounded-2xl border border-slate-200/70 bg-white/90 px-5 py-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg dark:border-slate-800/70 dark:bg-slate-950/40 dark:hover:border-indigo-500/40"
                >
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Fatura / İrsaliye
                  </div>
                  <div className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">Fatura talebi</div>
                  <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">Form otomatik dolu gelir.</div>
                </Link>

                <Link
                  href={supportHref}
                  className="rounded-2xl border border-emerald-200 bg-emerald-50/70 px-5 py-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:hover:border-emerald-500/50"
                >
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-200">
                    Destek
                  </div>
                  <div className="mt-2 text-sm font-semibold text-emerald-900 dark:text-white">Sorun yaşarsan yaz</div>
                  <div className="mt-1 text-xs text-emerald-800/90 dark:text-emerald-100/90">
                    Sipariş numarasıyla hızlı yönlendirme.
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {(recStatus === 'loading' || recStatus === 'error' || recommended.length > 0) && (
            <div className="mt-10 rounded-[28px] border border-slate-200/70 bg-white/90 p-6 text-left shadow-xl dark:border-slate-800/70 dark:bg-slate-950/40">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Tamamlayıcı parçalar
                  </div>
                  <div className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                    Sık birlikte alınan öneriler
                  </div>
                  <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
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
                      className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-800/70 dark:bg-slate-900/30"
                    >
                      <div className="h-28 w-full rounded-xl bg-slate-200/70 dark:bg-slate-800/60" />
                      <div className="mt-3 h-4 w-4/5 rounded bg-slate-200/70 dark:bg-slate-800/60" />
                      <div className="mt-2 h-3 w-2/5 rounded bg-slate-200/70 dark:bg-slate-800/60" />
                      <div className="mt-3 h-9 w-full rounded-xl bg-slate-200/70 dark:bg-slate-800/60" />
                    </div>
                  ))}
                </div>
              )}

              {recStatus === 'error' && (
                <div className="mt-5 text-sm text-slate-600 dark:text-slate-300">{recError || 'Öneriler yüklenemedi.'}</div>
              )}

              {recStatus !== 'loading' && recommended.length > 0 && (
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  {recommended.map((item) => (
                    <div
                      key={item.id}
                      className="group overflow-hidden rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800/70 dark:bg-slate-900/30"
                    >
                      <Link href={`/spare-parts/${item.id}`} className="block">
                        <div className="relative h-28 w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-950/60">
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
                          <div className="line-clamp-2 text-sm font-semibold text-slate-900 dark:text-white">{item.name}</div>
                          <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
                            <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200">
                              {item.category?.name || 'Yedek parça'}
                            </span>
                            {item.ratingCount > 0 && (
                              <span className="font-semibold text-amber-700 dark:text-amber-300">
                                ★ {item.ratingAverage.toFixed(1)} ({item.ratingCount})
                              </span>
                            )}
                          </div>
                          <div className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                            {formatPriceTry(item.priceCents)}
                          </div>
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
    </div>
  );
}

