'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';

import { useCart } from '@/components/cart/CartProvider';
import { trackEvent } from '@/lib/analytics';

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
  const { items, subtotalCents, addItem, removeItem, setQuantity, clear } = useCart();
  const viewedCart = useRef(false);
  const recoveryAttempted = useRef(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [isQuickBuying, setIsQuickBuying] = useState(false);
  const [showQuickBuyPrompt, setShowQuickBuyPrompt] = useState(false);
  const [reminderEmail, setReminderEmail] = useState('');
  const [reminderStatus, setReminderStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [reminderError, setReminderError] = useState('');
  const [recoveryStatus, setRecoveryStatus] = useState<'idle' | 'restoring' | 'restored' | 'error'>('idle');
  const [recoveryError, setRecoveryError] = useState('');

  useEffect(() => {
    if (session?.user?.email) {
      setReminderEmail(session.user.email);
    }
  }, [session?.user?.email]);

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
          }>;

          if (typeof x.id !== 'string' || typeof x.name !== 'string') continue;
          addItem(
            {
              id: x.id,
              name: x.name,
              priceCents: typeof x.priceCents === 'number' ? x.priceCents : 0,
              imageUrl: typeof x.imageUrl === 'string' ? x.imageUrl : null,
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
      value: subtotalCents / 100,
      items: items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        price: item.priceCents / 100,
        quantity: item.quantity,
      })),
    });
  }, [items, subtotalCents]);

  useEffect(() => {
    if (!items.length) {
      setReminderStatus('idle');
      setReminderError('');
    }
  }, [items.length]);

  const handleRemoveItem = (item: (typeof items)[number]) => {
    trackEvent('remove_from_cart', {
      currency: 'TRY',
      value: (item.priceCents * item.quantity) / 100,
      items: [
        {
          item_id: item.id,
          item_name: item.name,
          price: item.priceCents / 100,
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
          totalCents: subtotalCents,
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            priceCents: item.priceCents,
            quantity: item.quantity,
            imageUrl: item.imageUrl,
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
    trackEvent('begin_checkout', {
      currency: 'TRY',
      value: subtotalCents / 100,
      items: items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        price: item.priceCents / 100,
        quantity: item.quantity,
      })),
    });
    router.push('/checkout/address');
  };

  const handleQuickBuy = async () => {
    if (!items.length || isQuickBuying) return;
    setCheckoutError('');
    setIsQuickBuying(true);
    try {
      const profileRes = await fetch('/api/profile');
      if (profileRes.status === 401) {
        router.push('/login');
        return;
      }
      const profile = await profileRes.json();
      const addresses = (profile.user?.addresses || []) as Array<{ id: string; isDefault: boolean }>;
      const selected = addresses.find((addr) => addr.isDefault) ?? addresses[0];

      if (!selected?.id) {
        setShowQuickBuyPrompt(true);
        return;
      }

      trackEvent('begin_checkout', {
        currency: 'TRY',
        value: subtotalCents / 100,
        items: items.map((item) => ({
          item_id: item.id,
          item_name: item.name,
          price: item.priceCents / 100,
          quantity: item.quantity,
        })),
      });

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addressId: selected.id,
          billingAddressId: selected.id,
          items: items.map((x) => ({
            id: x.id,
            name: x.name,
            priceCents: x.priceCents,
            quantity: x.quantity,
            imageUrl: x.imageUrl,
          })),
        }),
      });

      if (res.status === 401) {
        router.push('/login');
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.url) {
        throw new Error(data?.error || 'Ödeme başlatılamadı');
      }

      window.location.href = data.url as string;
    } catch (err: unknown) {
      setCheckoutError(err instanceof Error ? err.message : 'Ödeme başlatılamadı');
    } finally {
      setIsQuickBuying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">Sepet</h1>
          {items.length > 0 && (
            <button
              type="button"
              onClick={clear}
              className="text-sm font-semibold text-red-600 hover:underline"
            >
              Sepeti Temizle
            </button>
          )}
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
          <div className="mt-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center">
            <div className="text-gray-900 dark:text-white font-semibold">Sepet boş.</div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Yedek parçalara gidip ürün ekleyebilirsin.
            </div>
            <Link
              href="/spare-parts"
              className="mt-6 inline-flex items-center justify-center px-5 py-3 rounded-xl text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800"
            >
              Yedek Parçalar
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="lg:col-span-2 space-y-4">
              {items.map((x) => (
                <div
                  key={x.id}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 flex gap-4"
                >
                  <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 shrink-0">
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
                        <div className="text-base font-semibold text-gray-900 dark:text-white line-clamp-2">
                          {x.name}
                        </div>
                        <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                          {formatPriceTry(x.priceCents)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(x)}
                        className="text-sm font-semibold text-red-600 hover:underline"
                      >
                        Sil
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="inline-flex items-center rounded-xl border border-gray-200 dark:border-gray-700">
                        <button
                          type="button"
                          className="px-4 py-2 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 rounded-l-xl"
                          onClick={() => setQuantity(x.id, x.quantity - 1)}
                        >
                          -
                        </button>
                        <div className="px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white min-w-12 text-center">
                          {x.quantity}
                        </div>
                        <button
                          type="button"
                          className="px-4 py-2 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 rounded-r-xl"
                          onClick={() => setQuantity(x.id, x.quantity + 1)}
                        >
                          +
                        </button>
                      </div>

                      <div className="text-base font-bold text-gray-900 dark:text-white">
                        {formatPriceTry(x.priceCents * x.quantity)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 h-fit">
              <div className="text-lg font-bold text-gray-900 dark:text-white">Özet</div>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-300">Ara Toplam</div>
                <div className="text-base font-bold text-gray-900 dark:text-white">
                  {formatPriceTry(subtotalCents)}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                <span>Kargo</span>
                <span className="font-semibold text-gray-900 dark:text-white">Adresle birlikte hesaplanır</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                <span>Teslimat</span>
                <span className="font-semibold text-gray-900 dark:text-white">2-5 iş günü (stokta)</span>
              </div>
              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                Kargo ve teslimat detayları için{' '}
                <Link href="/shipping" className="font-semibold text-indigo-600 hover:text-indigo-700">
                  kargo politikasını
                </Link>{' '}
                inceleyebilirsiniz.
              </div>
              <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                  Güven rozetleri
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold">
                  <span className="rounded-full border border-gray-200 bg-white px-3 py-1 dark:border-gray-700 dark:bg-gray-800">
                    SSL
                  </span>
                  <span className="rounded-full border border-gray-200 bg-white px-3 py-1 dark:border-gray-700 dark:bg-gray-800">
                    PCI-DSS
                  </span>
                  <span className="rounded-full border border-gray-200 bg-white px-3 py-1 dark:border-gray-700 dark:bg-gray-800">
                    3D Secure
                  </span>
                  <span className="rounded-full border border-gray-200 bg-white px-3 py-1 dark:border-gray-700 dark:bg-gray-800">
                    İade garantisi
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  className="w-full inline-flex items-center justify-center px-5 py-3 rounded-xl text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-70"
                  onClick={handleQuickBuy}
                  disabled={!items.length || isQuickBuying}
                >
                  {isQuickBuying ? 'Hızlı ödeme hazırlanıyor...' : 'Hızlı Al (tek sayfa)'}
                </button>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Varsayılan adresinizle direkt ödemeye geçebilirsiniz.
                </div>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  className="w-full inline-flex items-center justify-center px-5 py-3 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-70"
                  onClick={handleCheckout}
                  disabled={!items.length}
                >
                  Adres seçerek devam et
                </button>
              </div>

              {checkoutError && (
                <div className="mt-3 text-xs text-red-600">{checkoutError}</div>
              )}

              {items.length > 0 && (
                <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                    Sepet kurtarma
                  </div>
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    24 saat sonra ödemeyi tamamlamadıysanız sepetinizi hatırlatırız.
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
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                      placeholder="E-posta adresiniz"
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleSaveReminder}
                      disabled={reminderStatus === 'saving'}
                      className="rounded-full bg-gray-900 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white hover:bg-gray-800 disabled:opacity-70"
                    >
                      {reminderStatus === 'saved' ? 'Güncelle' : 'Hatırlatma al'}
                    </button>
                    <button
                      type="button"
                      onClick={handleClearReminder}
                      className="rounded-full border border-gray-200 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-300"
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

      {showQuickBuyPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              Hızlı Al için adres gerekli
            </div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Kayıtlı adresiniz yoksa hızlı ödeme başlatılamaz. Şimdi adres eklemek ister misiniz?
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowQuickBuyPrompt(false)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:border-gray-300 dark:border-gray-800 dark:text-gray-300"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowQuickBuyPrompt(false);
                  router.push('/profile/addresses');
                }}
                className="rounded-xl bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800"
              >
                Adres ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-gray-900" />}>
      <CartPageContent />
    </Suspense>
  );
}
