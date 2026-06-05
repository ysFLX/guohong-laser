'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';

import AddToCartButton from '@/components/cart/AddToCartButton';
import { useCart } from '@/components/cart/CartProvider';
import { trackEvent } from '@/lib/analytics';
import { isPaymentCheckoutEnabled } from '@/lib/checkoutMode';
import { getPaymentProviderPendingNotice } from '@/lib/paymentProviderStatus';
import { getSparePartProductIdFromCartLineId } from '@/lib/sparePartSizeOptions';
import { VAT_PERCENTAGE, calculateGrossCents } from '@/lib/vat';

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

function CartPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const recoverToken = searchParams.get('recover');
  const { data: session } = useSession();
  const { items, subtotalCents, vatCents, totalCents, addItem, removeItem, setQuantity, clear } = useCart();
  const viewedCart = useRef(false);
  const recoveryAttempted = useRef(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [reminderEmail, setReminderEmail] = useState('');
  const [reminderStatus, setReminderStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [reminderError, setReminderError] = useState('');
  const [recoveryStatus, setRecoveryStatus] = useState<'idle' | 'restoring' | 'restored' | 'error'>('idle');
  const [recoveryError, setRecoveryError] = useState('');
  const [whatsAppHref, setWhatsAppHref] = useState('https://wa.me/905368316787');
  const [recommended, setRecommended] = useState<RecommendedItem[]>([]);
  const [recommendedStatus, setRecommendedStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [recommendedError, setRecommendedError] = useState('');

  const cartItemCount = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items],
  );

  const cartIdsKey = useMemo(() => {
    if (!items.length) return '';
    const ids = Array.from(new Set(items.map((item) => getSparePartProductIdFromCartLineId(item.id)))).filter(Boolean);
    ids.sort();
    return ids.join(',');
  }, [items]);

  const paymentsEnabled = isPaymentCheckoutEnabled();

  const cartQuoteHref = useMemo(() => {
    if (!items.length) return '/quote';
    const maxItems = 10;
    const preview = items
      .slice(0, maxItems)
      .map((item) => {
        const name = item.name.length > 64 ? `${item.name.slice(0, 61)}...` : item.name;
        return `- ${name} x${item.quantity}`;
      })
      .join('\n');
    const extra = items.length > maxItems ? `\n+${items.length - maxItems} ürün daha` : '';
    const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
    const message = `Sepetimdeki ürünler için fiyat teklifi rica ediyorum.\n\nSepet:\n${preview}${extra}\n\nAra toplam (KDV hariç): ${formatPriceTry(subtotalCents)}\nKDV (%${VAT_PERCENTAGE}): ${formatPriceTry(vatCents)}\nGenel toplam (KDV dahil): ${formatPriceTry(totalCents)}${pageUrl ? `\nSayfa: ${pageUrl}` : ''}`;
    const params = new URLSearchParams({
      product: 'Sepet Teklifi',
      message,
    });
    return `/quote?${params.toString()}`;
  }, [items, subtotalCents, vatCents, totalCents]);

  useEffect(() => {
    if (session?.user?.email) {
      setReminderEmail(session.user.email);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    if (!items.length) {
      setWhatsAppHref('https://wa.me/905368316787');
      return;
    }

    const maxItems = 5;
    const preview = items
      .slice(0, maxItems)
      .map((item) => {
        const name = item.name.length > 64 ? `${item.name.slice(0, 61)}...` : item.name;
        return `- ${name} x${item.quantity}`;
      })
      .join('\n');
    const extra = items.length > maxItems ? `\n+${items.length - maxItems} ürün daha` : '';
    const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

    const message = `Merhaba, sepetimdeki ürünler için sipariş desteği rica ediyorum.\n\nSepet:\n${preview}${extra}\n\nAra toplam (KDV hariç): ${formatPriceTry(subtotalCents)}\nKDV (%${VAT_PERCENTAGE}): ${formatPriceTry(vatCents)}\nGenel toplam (KDV dahil): ${formatPriceTry(totalCents)}${pageUrl ? `\nSayfa: ${pageUrl}` : ''}`;

    setWhatsAppHref(`https://wa.me/905368316787?text=${encodeURIComponent(message)}`);
  }, [items, subtotalCents, vatCents, totalCents]);

  useEffect(() => {
    if (!cartIdsKey) {
      setRecommended([]);
      setRecommendedStatus('idle');
      setRecommendedError('');
      return;
    }

    const controller = new AbortController();
    setRecommendedStatus('loading');
    setRecommendedError('');

    const run = async () => {
      try {
        const res = await fetch(
          `/api/spare-parts/recommendations?ids=${encodeURIComponent(cartIdsKey)}&limit=3`,
          { cache: 'no-store', signal: controller.signal },
        );
        const data = (await res.json().catch(() => ({}))) as { items?: unknown; error?: unknown };
        if (!res.ok) {
          throw new Error(typeof data?.error === 'string' ? data.error : 'Öneriler yüklenemedi.');
        }

        const cartIdSet = new Set(cartIdsKey.split(',').filter(Boolean));
        const next = Array.isArray(data?.items) ? (data.items as RecommendedItem[]) : [];
        setRecommended(next.filter((item) => item && typeof item.id === 'string' && !cartIdSet.has(item.id)));
        setRecommendedStatus('idle');
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setRecommended([]);
        setRecommendedStatus('error');
        setRecommendedError(err instanceof Error ? err.message : 'Öneriler yüklenemedi.');
      }
    };

    run();
    return () => controller.abort();
  }, [cartIdsKey]);

  useEffect(() => {
    if (!recoverToken) return;
    if (recoveryAttempted.current) return;
    recoveryAttempted.current = true;

    setRecoveryStatus('restoring');
    setRecoveryError('');

    const run = async () => {
      try {
        const res = await fetch(`/api/cart-recovery?token=${encodeURIComponent(recoverToken)}`);
        const data = (await res.json().catch(() => ({}))) as { items?: unknown; error?: unknown };
        if (!res.ok) {
          throw new Error(typeof data?.error === 'string' ? data.error : 'Sepet geri yüklenemedi.');
        }

        const recovered = Array.isArray(data?.items) ? data.items : [];
        for (const item of recovered) {
          if (!item || typeof item !== 'object') continue;
          const x = item as Partial<{
            id: unknown;
            name: unknown;
            priceCents: unknown;
            quantity: unknown;
            imageUrl: unknown;
            variantValue: unknown;
          }>;

          if (typeof x.id !== 'string' || typeof x.name !== 'string') continue;
          addItem(
            {
              id: x.id,
              name: x.name,
              priceCents: typeof x.priceCents === 'number' ? x.priceCents : 0,
              imageUrl: typeof x.imageUrl === 'string' ? x.imageUrl : null,
              variantValue: typeof x.variantValue === 'string' ? x.variantValue : null,
            },
            typeof x.quantity === 'number' ? x.quantity : 1,
          );
        }

        setRecoveryStatus('restored');
        router.replace('/cart');
      } catch (err) {
        setRecoveryStatus('error');
        setRecoveryError(err instanceof Error ? err.message : 'Sepet geri yüklenemedi.');
      }
    };

    run();
  }, [recoverToken, addItem, router]);

  useEffect(() => {
    if (viewedCart.current) return;
    if (!items.length) return;
    viewedCart.current = true;
    trackEvent('view_cart', {
      currency: 'TRY',
      value: totalCents / 100,
      items: items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        price: calculateGrossCents(item.priceCents) / 100,
        quantity: item.quantity,
      })),
    });
  }, [items, totalCents]);

  useEffect(() => {
    if (!items.length) {
      setReminderStatus('idle');
      setReminderError('');
    }
  }, [items.length]);

  const handleRemoveItem = (item: (typeof items)[number]) => {
    trackEvent('remove_from_cart', {
      currency: 'TRY',
      value: (calculateGrossCents(item.priceCents) * item.quantity) / 100,
      items: [
        {
          item_id: item.id,
          item_name: item.name,
          price: calculateGrossCents(item.priceCents) / 100,
          quantity: item.quantity,
        },
      ],
    });
    removeItem(item.id);
  };

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSaveReminder = async () => {
    setReminderError('');
    if (!items.length) return;
    if (!isValidEmail(reminderEmail.trim())) {
      setReminderError('Geçerli bir e-posta girmelisin.');
      setReminderStatus('error');
      return;
    }

    setReminderStatus('saving');
    try {
      const res = await fetch('/api/cart-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: reminderEmail.trim(),
          totalCents,
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            priceCents: item.priceCents,
            quantity: item.quantity,
            imageUrl: item.imageUrl,
            variantValue: item.variantValue ?? null,
          })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'Kaydedilemedi');
      }
      setReminderStatus('saved');
    } catch (err) {
      setReminderError(err instanceof Error ? err.message : 'Kaydedilemedi');
      setReminderStatus('error');
    }
  };

  const handleClearReminder = async () => {
    setReminderError('');
    try {
      await fetch('/api/cart-reminder', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: reminderEmail.trim() }),
      });
      setReminderStatus('idle');
    } catch {
      setReminderStatus('idle');
    }
  };

  const handleCheckout = () => {
    if (!items.length) return;
    setCheckoutError('');
    if (!paymentsEnabled) {
      router.push(cartQuoteHref);
      return;
    }
    trackEvent('begin_checkout', {
      currency: 'TRY',
      value: totalCents / 100,
      items: items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        price: calculateGrossCents(item.priceCents) / 100,
        quantity: item.quantity,
      })),
    });
    router.push('/checkout/address');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-900 dark:bg-slate-950 dark:text-white lg:pb-0">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Sepet</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Ödeme öncesi sepet kontrolü.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            {items.length > 0 && (
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-600 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-indigo-600 text-[10px] text-white">
                  1
                </span>
                Sepet
                <span className="text-slate-300 dark:text-slate-600">/</span>
                <span className="grid h-5 w-5 place-items-center rounded-full border border-slate-200 bg-white text-[10px] text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                  2
                </span>
                Adres
                <span className="text-slate-300 dark:text-slate-600">/</span>
                <span className="grid h-5 w-5 place-items-center rounded-full border border-slate-200 bg-white text-[10px] text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                  3
                </span>
                Ödeme
              </div>
            )}

            {items.length > 0 && (
              <div className="rounded-2xl border border-slate-200/70 bg-white/90 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm dark:border-slate-800/70 dark:bg-slate-950/40 dark:text-white">
                {cartItemCount} ürün • {formatPriceTry(totalCents)}
              </div>
            )}

            {items.length > 0 && (
              <button
                type="button"
                onClick={clear}
                className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-200 dark:hover:bg-rose-500/20"
              >
                Sepeti temizle
              </button>
            )}
          </div>
        </div>

        {recoveryStatus !== 'idle' && (
          <div
            className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
              recoveryStatus === 'error'
                ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200'
                : recoveryStatus === 'restoring'
                  ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-200'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200'
            }`}
          >
            {recoveryStatus === 'restoring' && 'Sepetiniz geri yükleniyor...'}
            {recoveryStatus === 'restored' && 'Sepetiniz geri yüklendi.'}
            {recoveryStatus === 'error' && (recoveryError || 'Sepet geri yüklenemedi.')}
          </div>
        )}

        {items.length === 0 ? (
          <div className="mt-10 rounded-[28px] border border-slate-200/70 bg-white/90 p-8 text-center shadow-xl dark:border-slate-800/70 dark:bg-slate-950/40">
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Sepet</div>
            <div className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">Sepet boş</div>
            <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Yedek parçalara gidip ürün ekleyebilirsin.
            </div>
            <Link
              href="/spare-parts"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Yedek Parçalar
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.35fr_0.65fr] lg:items-start">
            <div className="space-y-4">
              {items.map((x) => (
                <div
                  key={x.id}
                  className="flex gap-4 rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm dark:border-slate-800/70 dark:bg-slate-950/40"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900/60">
                    <Image
                      src={x.imageUrl || '/images/1.jpg'}
                      alt={x.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                      loading="lazy"
                      unoptimized
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="line-clamp-2 text-base font-semibold text-slate-900 dark:text-white">
                          {x.name}
                        </div>
                        <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                          {formatPriceTry(x.priceCents)} <span className="text-xs text-slate-400">KDV hariç</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(x)}
                        className="text-sm font-semibold text-rose-600 hover:underline dark:text-rose-300"
                      >
                        Sil
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white/70 shadow-sm dark:border-slate-800 dark:bg-slate-950/30">
                        <>
                        <button
                          type="button"
                          className="rounded-l-xl px-4 py-2 text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-white dark:hover:bg-slate-900/60"
                          onClick={() => setQuantity(x.id, x.quantity - 1)}
                          disabled={x.quantity <= 1}
                        >
                          -
                        </button>
                        <div className="min-w-12 px-4 py-2 text-center text-sm font-semibold text-slate-900 dark:text-white">
                          {x.quantity}
                        </div>
                        <button
                          type="button"
                          className="rounded-r-xl px-4 py-2 text-slate-900 transition hover:bg-slate-50 dark:text-white dark:hover:bg-slate-900/60"
                          onClick={() => setQuantity(x.id, x.quantity + 1)}
                        >
                          +
                        </button>
                        </>
                      </div>

                      <div className="text-base font-bold text-slate-900 dark:text-white">
                        {formatPriceTry(x.priceCents * x.quantity)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {(recommendedStatus === 'loading' || recommendedStatus === 'error' || recommended.length > 0) && (
                <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-xl dark:border-slate-800/70 dark:bg-slate-950/40">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                        Tamamlayıcı parçalar
                      </div>
                      <div className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                        Sık birlikte alınan öneriler
                      </div>
                      <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        Sepetine uygun 3 ürünü hızlıca ekleyebilirsin.
                      </div>
                    </div>
                    <Link href="/spare-parts?sort=recommended" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                      Tümünü gör
                    </Link>
                  </div>

                  {recommendedStatus === 'loading' && (
                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
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

                  {recommendedStatus === 'error' && (
                    <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                      {recommendedError || 'Öneriler şu an yüklenemedi.'}
                    </div>
                  )}

                  {recommendedStatus !== 'loading' && recommended.length > 0 && (
                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                      {recommended.map((item) => (
                        <div
                          key={item.id}
                          className="group rounded-2xl border border-gray-200 bg-gray-50/60 p-4 transition hover:-translate-y-0.5 hover:shadow-lg dark:border-gray-700 dark:bg-gray-900/40"
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
                              <div className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                                {item.name}
                              </div>
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
                              <div className="mt-2 text-sm font-bold text-gray-900 dark:text-white">
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

            <div className="h-fit rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-xl backdrop-blur lg:sticky lg:top-24 dark:border-slate-800/70 dark:bg-slate-950/40">
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Özet</div>
              <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">Sipariş özeti</div>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-slate-600 dark:text-slate-300">Ara toplam (KDV hariç)</div>
                <div className="text-base font-semibold text-slate-900 dark:text-white">
                  {formatPriceTry(subtotalCents)}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                <span>{`KDV (%${VAT_PERCENTAGE})`}</span>
                <span className="font-semibold text-slate-900 dark:text-white">{formatPriceTry(vatCents)}</span>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-200/70 pt-4 dark:border-slate-800/70">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">Genel toplam (KDV dahil)</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">{formatPriceTry(totalCents)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                <span>Kargo</span>
                <span className="font-semibold text-slate-900 dark:text-white">Adresle birlikte hesaplanır</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                <span>Teslimat</span>
                <span className="font-semibold text-slate-900 dark:text-white">2-5 iş günü (stokta)</span>
              </div>
              <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                Kargo ve teslimat detayları için{' '}
                <Link href="/shipping" className="font-semibold text-indigo-600 hover:text-indigo-700">
                  kargo politikasını
                </Link>{' '}
                inceleyebilirsiniz.
              </div>
              <div className="mt-4 rounded-2xl border border-slate-200/70 bg-slate-50 px-3 py-3 text-xs text-slate-600 dark:border-slate-800/70 dark:bg-slate-900/30 dark:text-slate-200">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Güven rozetleri
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold">
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 dark:border-slate-800 dark:bg-slate-950/40">
                    SSL
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 dark:border-slate-800 dark:bg-slate-950/40">
                    PCI-DSS
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 dark:border-slate-800 dark:bg-slate-950/40">
                    3D Secure
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 dark:border-slate-800 dark:bg-slate-950/40">
                    İade garantisi
                  </span>
                </div>
              </div>

              {checkoutError && (
                <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-200">
                  {checkoutError}
                </div>
              )}

              {paymentsEnabled ? (
                <>
                  <div className="mt-6">
                    <button
                      type="button"
                      className="hidden w-full items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-70 lg:inline-flex"
                      onClick={handleCheckout}
                      disabled={!items.length}
                    >
                      Teslimat ve ödeme adımına geç
                    </button>
                    <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Kargo ya da gel al tercihini sonraki ekranda seçebilirsin.
                    </div>
                  </div>
                </>
              ) : (
                <div className="mt-6 space-y-3">
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-200">
                    {getPaymentProviderPendingNotice()} Şimdilik sepetin için teklif isteyebilir veya WhatsApp
                    hattından sipariş desteği alabilirsin.
                  </div>
                  <Link
                    href={cartQuoteHref}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                  >
                    Sepet için teklif iste
                  </Link>
                </div>
              )}

              <div className="mt-3">
                <a
                  href={whatsAppHref}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex items-center justify-center px-5 py-3 rounded-xl text-sm font-semibold border border-emerald-200 bg-emerald-50 text-emerald-900 hover:border-emerald-300 hover:bg-emerald-100/70 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
                >
                  WhatsApp&apos;tan sipariş desteği
                </a>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Sepetindeki ürünler otomatik mesaj olarak eklenir.
                </div>
              </div>

              {items.length > 0 && (
                <div className="mt-6 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4 text-xs text-slate-600 dark:border-slate-800/70 dark:bg-slate-900/30 dark:text-slate-200">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Sepet kurtarma
                  </div>
                  <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {paymentsEnabled
                      ? '24 saat sonra ödemeyi tamamlamadıysanız sepetinizi hatırlatırız.'
                      : '24 saat sonra sepetinizi hatırlatırız.'}
                  </div>
                  <div className="mt-3">
                    <label className="sr-only" htmlFor="reminder-email">
                      E-posta
                    </label>
                    <input
                      id="reminder-email"
                      type="email"
                      value={reminderEmail}
                      onChange={(e) => setReminderEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-800 dark:bg-slate-950/30 dark:text-white"
                      placeholder="E-posta adresiniz"
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleSaveReminder}
                      disabled={reminderStatus === 'saving'}
                      className="rounded-full bg-slate-900 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-slate-800 disabled:opacity-70 dark:bg-white/10 dark:hover:bg-white/20"
                    >
                      {reminderStatus === 'saved' ? 'Güncelle' : 'Hatırlatma al'}
                    </button>
                    <button
                      type="button"
                      onClick={handleClearReminder}
                      className="rounded-full border border-slate-200 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:border-slate-300 dark:border-slate-800 dark:text-slate-300"
                    >
                      İptal
                    </button>
                  </div>
                  {reminderStatus === 'saved' && (
                    <div className="mt-2 text-[11px] font-semibold text-indigo-600">
                      Hatırlatma aktif. Sepetin korunacak.
                    </div>
                  )}
                  {reminderError && (
                    <div className="mt-2 text-[11px] font-semibold text-red-600">{reminderError}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-950/95">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Sepet toplamı (KDV dahil)
              </div>
              <div className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">
                {formatPriceTry(totalCents)}
              </div>
            </div>
            <button
              type="button"
              onClick={handleCheckout}
              disabled={!items.length}
              className="ml-auto inline-flex min-h-11 items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-70"
            >
              {paymentsEnabled ? 'Teslimat ve ödeme' : 'Teklif ile Devam Et'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-950" />}>
      <CartPageContent />
    </Suspense>
  );
}

