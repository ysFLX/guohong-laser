'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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

export default function CartPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, subtotalCents, removeItem, setQuantity, clear } = useCart();
  const [checkoutError, setCheckoutError] = useState('');
  const [isQuickBuying, setIsQuickBuying] = useState(false);
  const [showQuickBuyPrompt, setShowQuickBuyPrompt] = useState(false);
  const [reminderEmail, setReminderEmail] = useState('');
  const [reminderStatus, setReminderStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [reminderError, setReminderError] = useState('');

  useEffect(() => {
    if (session?.user?.email) {
      setReminderEmail(session.user.email);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    if (!items.length) {
      setReminderStatus('idle');
      setReminderError('');
    }
  }, [items.length]);

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSaveReminder = async () => {
    setReminderError('');
    if (!items.length) return;
    if (!isValidEmail(reminderEmail.trim())) {
      setReminderError('Gecerli bir e-posta girmelisin.');
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
        throw new Error(data?.error || 'Odeme baslatilamadi');
      }

      window.location.href = data.url as string;
    } catch (err: unknown) {
      setCheckoutError(err instanceof Error ? err.message : 'Odeme baslatilamadi');
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

        {items.length === 0 ? (
          <div className="mt-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center">
            <div className="text-gray-900 dark:text-white font-semibold">Sepet bos.</div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Yedek parcalara gidip urun ekleyebilirsin.
            </div>
            <Link
              href="/spare-parts"
              className="mt-6 inline-flex items-center justify-center px-5 py-3 rounded-xl text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800"
            >
              Yedek Parcalar
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
                        onClick={() => removeItem(x.id)}
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
              <div className="text-lg font-bold text-gray-900 dark:text-white">Ozet</div>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-300">Ara Toplam</div>
                <div className="text-base font-bold text-gray-900 dark:text-white">
                  {formatPriceTry(subtotalCents)}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                <span>Kargo</span>
                <span className="font-semibold text-gray-900 dark:text-white">Adresle hesaplanir</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                <span>Teslimat</span>
                <span className="font-semibold text-gray-900 dark:text-white">2-5 is gunu (stokta)</span>
              </div>
              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                Kargo ve teslimat detaylari icin{' '}
                <Link href="/shipping" className="font-semibold text-teal-600 hover:text-teal-700">
                  kargo politikasini
                </Link>{' '}
                inceleyebilirsin.
              </div>
              <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                  Guven rozetleri
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
                  {isQuickBuying ? 'Hizli odeme hazirlaniyor...' : 'Hizli Al (tek sayfa)'}
                </button>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Varsayilan adresinle direkt odemeye gecersin.
                </div>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  className="w-full inline-flex items-center justify-center px-5 py-3 rounded-xl text-sm font-semibold bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-70"
                  onClick={handleCheckout}
                  disabled={!items.length}
                >
                  Adres secerek devam et
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
                    24 saat sonra odemeyi tamamlamadiysan sepetini hatirlatiriz.
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
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                      placeholder="E-posta adresin"
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleSaveReminder}
                      disabled={reminderStatus === 'saving'}
                      className="rounded-full bg-gray-900 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white hover:bg-gray-800 disabled:opacity-70"
                    >
                      {reminderStatus === 'saved' ? 'Guncelle' : 'Hatirlatma al'}
                    </button>
                    <button
                      type="button"
                      onClick={handleClearReminder}
                      className="rounded-full border border-gray-200 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-300"
                    >
                      Iptal
                    </button>
                  </div>
                  {reminderStatus === 'saved' && (
                    <div className="mt-2 text-[11px] font-semibold text-teal-600">
                      Hatirlatma aktif. Sepetin korunacak.
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
              Hizli Al icin adres gerekli
            </div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Kayitli adresin yoksa hizli odeme baslatilamaz. Simdi adres ekleyelim mi?
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowQuickBuyPrompt(false)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:border-gray-300 dark:border-gray-800 dark:text-gray-300"
              >
                Vazgec
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
