'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { useCart } from '@/components/cart/CartProvider';
import { trackEvent } from '@/lib/analytics';
import { isPaymentCheckoutEnabled } from '@/lib/checkoutMode';
import { getPaymentProviderPendingNotice } from '@/lib/paymentProviderStatus';

type Address = {
  id: string;
  label: string | null;
  fullName: string | null;
  phone: string | null;
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  invoiceType?: 'INDIVIDUAL' | 'COMPANY';
  companyName?: string | null;
  taxOffice?: string | null;
  taxNumber?: string | null;
  identityNumber?: string | null;
  isDefault: boolean;
};

type City = {
  code: string;
  name: string;
};

const emptyForm = {
  label: 'Ev',
  firstName: '',
  lastName: '',
  phone: '',
  line1: '',
  line2: '',
  cityCode: '',
  cityName: '',
  district: '',
  postalCode: '',
  country: 'Turkiye',
  invoiceType: 'INDIVIDUAL' as 'INDIVIDUAL' | 'COMPANY',
  companyName: '',
  taxOffice: '',
  taxNumber: '',
  identityNumber: '',
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

function CheckoutAddressEnabled() {
  const router = useRouter();
  const { items, subtotalCents } = useCart();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedBillingId, setSelectedBillingId] = useState<string | null>(null);
  const [useBillingSame, setUseBillingSame] = useState(true);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formTarget, setFormTarget] = useState<'shipping' | 'billing'>('shipping');
  const [form, setForm] = useState({ ...emptyForm });
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  const cartItemCount = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items],
  );

  useEffect(() => {
    loadAddresses();
    loadCities();
  }, []);

  useEffect(() => {
    if (!form.cityCode) {
      setDistricts([]);
      return;
    }
    loadDistricts(form.cityCode);
  }, [form.cityCode]);

  async function loadAddresses() {
    setLoadingAddresses(true);
    setCheckoutError('');
    try {
      const res = await fetch('/api/profile');
      if (res.status === 401) {
        router.push(`/login?next=${encodeURIComponent('/checkout/address')}`);
        return;
      }
      const data = await res.json();
      const list = (data.user?.addresses || []) as Address[];
      setAddresses(list);
      const def = list.find((a) => a.isDefault) ?? list[0] ?? null;
      setSelectedId(def?.id ?? null);
      setSelectedBillingId(def?.id ?? null);
      setUseBillingSame(true);
      setFormTarget('shipping');
      setShowForm(list.length === 0);
    } catch {
      setCheckoutError('Adresler yüklenemedi');
    } finally {
      setLoadingAddresses(false);
    }
  }

  async function loadCities() {
    setLoadingCities(true);
    try {
      const res = await fetch('/api/locations/tr/cities');
      const data = await res.json();
      setCities(data.cities || []);
    } catch {
      setCheckoutError('İller yüklenemedi');
    } finally {
      setLoadingCities(false);
    }
  }

  async function loadDistricts(cityCode: string) {
    setLoadingDistricts(true);
    try {
      const res = await fetch(`/api/locations/tr/districts?code=${encodeURIComponent(cityCode)}`);
      const data = await res.json();
      setDistricts(data.districts || []);
    } catch {
      setCheckoutError('İlçeler yüklenemedi');
    } finally {
      setLoadingDistricts(false);
    }
  }

  async function submitAddress(e: React.FormEvent) {
    e.preventDefault();
    setCheckoutError('');

    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const fullName = `${firstName} ${lastName}`.trim();
    const cityValue =
      form.cityName.trim() || cities.find((city) => city.code === form.cityCode)?.name || '';
    const districtValue = form.district.trim();

    if (!firstName || !lastName || !form.phone.trim() || !form.line1.trim() || !cityValue) {
      setCheckoutError('Ad, soyad, telefon, adres ve il zorunludur');
      return;
    }
    if (!districtValue) {
      setCheckoutError('İlçe seçimi zorunludur');
      return;
    }

    const invoiceType = form.invoiceType === 'COMPANY' ? 'COMPANY' : 'INDIVIDUAL';
    const companyName = form.companyName.trim();
    const taxOffice = form.taxOffice.trim();
    const taxNumber = form.taxNumber.trim();
    const identityNumber = form.identityNumber.trim();

    if (formTarget === 'billing' && invoiceType === 'COMPANY' && (!companyName || !taxNumber)) {
      setCheckoutError('Kurumsal fatura için Firma ünvanı ve VKN zorunludur');
      return;
    }

    const payload: Record<string, unknown> = {
      label: form.label.trim() || 'Ev',
      fullName,
      phone: form.phone.trim(),
      line1: form.line1.trim(),
      line2: form.line2.trim() || null,
      city: cityValue,
      state: districtValue,
      postalCode: form.postalCode.trim() || null,
      country: form.country.trim() || 'Turkiye',
    };

    if (formTarget === 'billing') {
      payload.invoiceType = invoiceType;
      payload.companyName = companyName || null;
      payload.taxOffice = taxOffice || null;
      payload.taxNumber = taxNumber || null;
      payload.identityNumber = identityNumber || null;
    }

    try {
      const res = await fetch('/api/profile/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Adres kaydedilemedi');
      }

      const updated = (data.addresses || []) as Address[];
      setAddresses(updated);
      const createdId = (data.address?.id as string | undefined) ?? updated[0]?.id ?? null;
      if (formTarget === 'shipping') {
        setSelectedId(createdId);
      } else {
        setSelectedBillingId(createdId);
        setUseBillingSame(false);
      }
      setShowForm(false);
      setForm({ ...emptyForm });
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'Adres kaydedilemedi');
    }
  }

  async function handleCheckout() {
    if (!items.length || loadingCheckout) return;
    if (!selectedId) {
      setCheckoutError('Adres seçmelisin');
      return;
    }
    if (!useBillingSame && !selectedBillingId) {
      setCheckoutError('Fatura adresi seçmelisin');
      return;
    }
    if (!acceptedTerms) {
      setCheckoutError('Mesafeli satış ve iade koşullarını kabul etmelisin');
      return;
    }
    setLoadingCheckout(true);
    setCheckoutError('');

    try {
      trackEvent('add_shipping_info', {
        currency: 'TRY',
        value: subtotalCents / 100,
        shipping_tier: 'Standart',
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
          addressId: selectedId,
          billingAddressId: useBillingSame ? selectedId : selectedBillingId,
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
        router.push(`/login?next=${encodeURIComponent('/checkout/address')}`);
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
      setLoadingCheckout(false);
    }
  }

  if (!items.length) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-8 text-center shadow-xl dark:border-slate-800/70 dark:bg-slate-950/40">
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Checkout
            </div>
            <h1 className="mt-3 text-2xl font-semibold">Sepet boş</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Ödeme için önce ürün eklemelisin.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/spare-parts"
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Ürünlere git
              </Link>
              <Link
                href="/cart"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900/60"
              >
                Sepete dön
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32 text-slate-900 dark:bg-slate-950 dark:text-white lg:pb-0">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              <span aria-hidden>←</span>
              Sepete geri dön
            </Link>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">Teslimat adresi</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Ödeme öncesi adres seçimini tamamla.
            </p>
          </div>
          <div className="space-y-2 sm:text-right">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-600 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-slate-900 text-[10px] text-white">
                1
              </span>
              Sepet
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span className="grid h-5 w-5 place-items-center rounded-full bg-indigo-600 text-[10px] text-white">
                2
              </span>
              Adres
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span className="grid h-5 w-5 place-items-center rounded-full border border-slate-200 bg-white text-[10px] text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                3
              </span>
              Ödeme
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-white/90 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm dark:border-slate-800/70 dark:bg-slate-950/40 dark:text-white">
              {cartItemCount} ürün • {formatPriceTry(subtotalCents)}
            </div>
          </div>
        </div>

        {checkoutError && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-200">
            {checkoutError}
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="h-fit rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-xl backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/40">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Teslimat adresi</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Siparişi teslim edeceğimiz adresi seç.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/profile/addresses"
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900/60"
                >
                  Adresleri yönet
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    if (showForm && formTarget === 'shipping') {
                      setShowForm(false);
                      return;
                    }
                    setFormTarget('shipping');
                    setForm({ ...emptyForm });
                    setShowForm(true);
                  }}
                  className="rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
                >
                  {showForm && formTarget === 'shipping' ? 'Vazgeç' : 'Yeni adres ekle'}
                </button>
              </div>
            </div>

            {loadingAddresses && (
              <div className="mt-6 text-sm text-slate-500 dark:text-slate-300">Adresler yükleniyor...</div>
            )}
            {!loadingAddresses && addresses.length > 0 && (
              <div className="mt-6 space-y-3">
                {addresses.map((address) => (
                  <label
                    key={address.id}
                    className={`flex cursor-pointer flex-col gap-2 rounded-2xl border px-4 py-4 text-sm transition ${
                      selectedId === address.id
                        ? 'border-indigo-500 bg-indigo-50 shadow-sm dark:border-indigo-400/60 dark:bg-indigo-500/10'
                        : 'border-slate-200 bg-white hover:border-indigo-200 dark:border-slate-800 dark:bg-slate-950/30 dark:hover:border-indigo-400/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <div className="truncate font-semibold text-slate-900 dark:text-white">
                          {address.label || 'Adres'}
                        </div>
                        {address.isDefault && (
                          <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white dark:bg-white/10">
                            Varsayılan
                          </span>
                        )}
                      </div>
                      <input
                        type="radio"
                        name="address"
                        checked={selectedId === address.id}
                        onChange={() => {
                          setSelectedId(address.id);
                          if (useBillingSame) {
                            setSelectedBillingId(address.id);
                          }
                        }}
                        className="h-4 w-4 accent-indigo-600"
                      />
                    </div>
                    <div className="text-slate-700 dark:text-slate-200">{address.fullName || '-'}</div>
                    <div className="text-slate-500 dark:text-slate-400">
                      {address.line1 || '-'}
                      {address.line2 ? `, ${address.line2}` : ''}
                      <br />
                      {address.city || '-'}
                      {address.state ? ` / ${address.state}` : ''} {address.postalCode || ''}{' '}
                      {address.country || ''}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400">{address.phone || '-'}</div>
                  </label>
                ))}
              </div>
            )}

            {!loadingAddresses && addresses.length === 0 && (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white/70 p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-300">
                Kayıtlı adres bulunamadı. Devam etmek için yeni adres ekle.
              </div>
            )}

            {showForm && formTarget === 'shipping' && (
              <div className="mt-6 rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm dark:border-slate-800/70 dark:bg-slate-950/30">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                      Yeni adres
                    </div>
                    <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                      Teslimat için yeni adres ekle
                    </div>
                  </div>
                </div>

                <form onSubmit={submitAddress} className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="form-label">Etiket</div>
                    <input
                      className="form-input"
                      placeholder="Etiket (Ev, İş)"
                      value={form.label}
                      onChange={(e) => setForm({ ...form, label: e.target.value })}
                    />
                  </div>

                <div className="space-y-2">
                  <div className="form-label">Ad</div>
                  <input
                    className="form-input"
                    placeholder="Ad"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <div className="form-label">Soyad</div>
                  <input
                    className="form-input"
                    placeholder="Soyad"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <div className="form-label">Telefon</div>
                  <input
                    className="form-input"
                    placeholder="Telefon"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <div className="form-label">Adres</div>
                  <input
                    className="form-input"
                    placeholder="Adres"
                    value={form.line1}
                    onChange={(e) => setForm({ ...form, line1: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <div className="form-label">İl Seçimi</div>
                  <select
                    className="form-input"
                    value={form.cityCode}
                    onChange={(e) => {
                      const cityCode = e.target.value;
                      const selected = cities.find((city) => city.code === cityCode);
                      setForm({
                        ...form,
                        cityCode,
                        cityName: selected?.name ?? '',
                        district: '',
                      });
                    }}
                    disabled={loadingCities}
                  >
                    <option value="" disabled>
                      İl seç
                    </option>
                    {cities.map((city) => (
                      <option key={city.code} value={city.code}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                  {loadingCities && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">İller yükleniyor...</div>
                  )}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <div className="form-label">İlçe Seçimi</div>
                  <select
                    className="form-input"
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                    disabled={!form.cityCode || loadingDistricts}
                  >
                    <option value="" disabled>
                      İlçe seç
                    </option>
                    {districts.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                  {loadingDistricts && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">İlçeler yükleniyor...</div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="form-label">Posta Kodu</div>
                  <input
                    className="form-input"
                    placeholder="Posta Kodu"
                    value={form.postalCode}
                    onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <div className="form-label">Daire / Not</div>
                  <input
                    className="form-input"
                    placeholder="Daire / Not (opsiyonel)"
                    value={form.line2}
                    onChange={(e) => setForm({ ...form, line2: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <div className="form-label">Ülke</div>
                  <input
                    className="form-input"
                    placeholder="Ülke"
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2 flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="btn-secondary"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Adresi Kaydet
                  </button>
                </div>
                </form>
              </div>
            )}

            <div className="mt-8 border-t border-slate-200/70 pt-6 dark:border-slate-800/70">
              <label className="flex items-start gap-3 text-sm font-semibold text-slate-900 dark:text-white">
                <input
                  type="checkbox"
                  checked={useBillingSame}
                  className="mt-1 h-4 w-4 accent-indigo-600"
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setUseBillingSame(checked);
                    if (checked) {
                      setSelectedBillingId(selectedId);
                      setShowForm(false);
                    }
                  }}
                />
                <span>
                  Fatura adresi teslimat adresi ile aynı
                  <span className="mt-1 block text-xs font-normal text-slate-500 dark:text-slate-400">
                    Kurumsal fatura için farklı adres seçebilirsin.
                  </span>
                </span>
              </label>
            </div>

            {!useBillingSame && (
              <div className="mt-6 rounded-2xl border border-slate-200/70 bg-white/70 p-5 shadow-sm dark:border-slate-800/70 dark:bg-slate-950/30">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">Fatura adresi</h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      Fatura bilgileri için farklı adres seç.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (showForm && formTarget === 'billing') {
                        setShowForm(false);
                        return;
                      }
                      setFormTarget('billing');
                      setForm({ ...emptyForm });
                      setShowForm(true);
                    }}
                    className="rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
                  >
                    {showForm && formTarget === 'billing' ? 'Vazgeç' : 'Yeni adres ekle'}
                  </button>
                </div>

                {addresses.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {addresses.map((address) => (
                      <label
                        key={`billing-${address.id}`}
                        className={`flex cursor-pointer flex-col gap-2 rounded-2xl border px-4 py-4 text-sm transition ${
                          selectedBillingId === address.id
                            ? 'border-indigo-500 bg-indigo-50 shadow-sm dark:border-indigo-400/60 dark:bg-indigo-500/10'
                            : 'border-slate-200 bg-white hover:border-indigo-200 dark:border-slate-800 dark:bg-slate-950/30 dark:hover:border-indigo-400/40'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-2">
                            <div className="truncate font-semibold text-slate-900 dark:text-white">
                              {address.label || 'Adres'}
                            </div>
                            {address.isDefault && (
                              <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white dark:bg-white/10">
                                Varsayılan
                              </span>
                            )}
                          </div>
                          <input
                            type="radio"
                            name="billingAddress"
                            checked={selectedBillingId === address.id}
                            onChange={() => setSelectedBillingId(address.id)}
                            className="h-4 w-4 accent-indigo-600"
                          />
                        </div>
                        <div className="text-slate-700 dark:text-slate-200">{address.fullName || '-'}</div>
                        <div className="text-slate-500 dark:text-slate-400">
                          {address.line1 || '-'}
                          {address.line2 ? `, ${address.line2}` : ''}
                          <br />
                          {address.city || '-'}
                          {address.state ? ` / ${address.state}` : ''} {address.postalCode || ''}{' '}
                          {address.country || ''}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400">{address.phone || '-'}</div>
                      </label>
                    ))}
                  </div>
                )}

                {addresses.length === 0 && (
                  <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white/70 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-300">
                    Fatura adresi için önce yeni adres ekle.
                  </div>
                )}

                {showForm && formTarget === 'billing' && (
                  <div className="mt-6 rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm dark:border-slate-800/70 dark:bg-slate-950/30">
                    <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                      Yeni adres
                    </div>
                    <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                      Fatura için yeni adres ekle
                    </div>

                    <form onSubmit={submitAddress} className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="form-label">Etiket</div>
                        <input
                          className="form-input"
                          placeholder="Etiket (Ev, İş)"
                          value={form.label}
                          onChange={(e) => setForm({ ...form, label: e.target.value })}
                        />
                      </div>

                    <div className="space-y-2">
                      <div className="form-label">Ad</div>
                      <input
                        className="form-input"
                        placeholder="Ad"
                        value={form.firstName}
                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="form-label">Soyad</div>
                      <input
                        className="form-input"
                        placeholder="Soyad"
                        value={form.lastName}
                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="form-label">Telefon</div>
                      <input
                        className="form-input"
                        placeholder="Telefon"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <div className="form-label">Adres</div>
                      <input
                        className="form-input"
                        placeholder="Adres"
                        value={form.line1}
                        onChange={(e) => setForm({ ...form, line1: e.target.value })}
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <div className="form-label">İl Seçimi</div>
                      <select
                        className="form-input"
                        value={form.cityCode}
                        onChange={(e) => {
                          const cityCode = e.target.value;
                          const selected = cities.find((city) => city.code === cityCode);
                          setForm({
                            ...form,
                            cityCode,
                            cityName: selected?.name ?? '',
                            district: '',
                          });
                        }}
                        disabled={loadingCities}
                      >
                        <option value="" disabled>
                          İl seç
                        </option>
                        {cities.map((city) => (
                          <option key={city.code} value={city.code}>
                            {city.name}
                          </option>
                        ))}
                      </select>
                      {loadingCities && (
                        <div className="text-xs text-slate-500 dark:text-slate-400">İller yükleniyor...</div>
                      )}
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <div className="form-label">İlçe Seçimi</div>
                      <select
                        className="form-input"
                        value={form.district}
                        onChange={(e) => setForm({ ...form, district: e.target.value })}
                        disabled={!form.cityCode || loadingDistricts}
                      >
                        <option value="" disabled>
                          İlçe seç
                        </option>
                        {districts.map((district) => (
                          <option key={district} value={district}>
                            {district}
                          </option>
                        ))}
                      </select>
                      {loadingDistricts && (
                        <div className="text-xs text-slate-500 dark:text-slate-400">İlçeler yükleniyor...</div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="form-label">Posta Kodu</div>
                      <input
                        className="form-input"
                        placeholder="Posta Kodu"
                        value={form.postalCode}
                        onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <div className="form-label">Daire / Not</div>
                      <input
                        className="form-input"
                        placeholder="Daire / Not (opsiyonel)"
                        value={form.line2}
                        onChange={(e) => setForm({ ...form, line2: e.target.value })}
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <div className="form-label">Ülke</div>
                      <input
                        className="form-input"
                        placeholder="Ülke"
                        value={form.country}
                        onChange={(e) => setForm({ ...form, country: e.target.value })}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 text-sm text-slate-700 dark:border-slate-800/70 dark:bg-slate-900/40 dark:text-slate-200">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">
                          Fatura bilgileri
                        </div>
                        <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="space-y-2 md:col-span-2">
                            <div className="form-label">Fatura tipi</div>
                            <select
                              className="form-input"
                              value={form.invoiceType}
                              onChange={(e) =>
                                setForm((prev) => ({
                                  ...prev,
                                  invoiceType: e.target.value === 'COMPANY' ? 'COMPANY' : 'INDIVIDUAL',
                                }))
                              }
                            >
                              <option value="INDIVIDUAL">Bireysel</option>
                              <option value="COMPANY">Kurumsal</option>
                            </select>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              Kurumsal fatura için firma ünvanı ve VKN girilmelidir.
                            </div>
                          </div>

                          {form.invoiceType === 'COMPANY' ? (
                            <>
                              <div className="space-y-2 md:col-span-2">
                                <div className="form-label">Firma ünvanı</div>
                                <input
                                  className="form-input"
                                  placeholder="Örn: Guohong Lazer Sanayi"
                                  value={form.companyName}
                                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <div className="form-label">Vergi dairesi</div>
                                <input
                                  className="form-input"
                                  placeholder="Örn: Meram"
                                  value={form.taxOffice}
                                  onChange={(e) => setForm({ ...form, taxOffice: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <div className="form-label">VKN</div>
                                <input
                                  className="form-input"
                                  placeholder="Vergi numarası"
                                  value={form.taxNumber}
                                  onChange={(e) => setForm({ ...form, taxNumber: e.target.value })}
                                />
                              </div>
                            </>
                          ) : (
                            <div className="space-y-2 md:col-span-2">
                              <div className="form-label">TCKN (opsiyonel)</div>
                              <input
                                className="form-input"
                                placeholder="Kimlik numarası"
                                value={form.identityNumber}
                                onChange={(e) => setForm({ ...form, identityNumber: e.target.value })}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2 flex flex-wrap justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="btn-secondary"
                      >
                        İptal
                      </button>
                      <button
                        type="submit"
                        className="btn-primary"
                      >
                        Adresi Kaydet
                      </button>
                    </div>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="h-fit rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-xl backdrop-blur lg:sticky lg:top-24 dark:border-slate-800/70 dark:bg-slate-950/40">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Özet</div>
              <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">Sipariş özeti</div>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-slate-900 dark:text-white">{item.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{item.quantity} adet</div>
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {formatPriceTry(item.priceCents * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-200/70 pt-4 text-sm dark:border-slate-800/70">
              <span className="text-slate-600 dark:text-slate-300">Toplam</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatPriceTry(subtotalCents)}</span>
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
              Kargo ücreti ve süre, seçilen adrese göre netleşir.
            </div>
            <div className="mt-4 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4 text-xs text-slate-600 dark:border-slate-800/70 dark:bg-slate-900/30 dark:text-slate-200">
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

            <div className="mt-4 hidden rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-4 text-xs text-slate-600 dark:border-slate-800/70 dark:bg-slate-950/30 dark:text-slate-200 lg:block">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-indigo-600"
                />
                <span>
                  <span className="font-semibold text-slate-900 dark:text-white">Mesafeli satış</span> ve{' '}
                  <span className="font-semibold text-slate-900 dark:text-white">iade koşullarını</span> okudum,
                  kabul ediyorum.{' '}
                  <Link href="/distance-sales" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-200">
                    Mesafeli satış
                  </Link>
                  {' / '}
                  <Link href="/returns" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-200">
                    İade
                  </Link>
                  {' / '}
                  <Link href="/privacy" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-200">
                    Gizlilik
                  </Link>
                </span>
              </label>
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={loadingCheckout || loadingAddresses || !acceptedTerms}
              className="mt-6 hidden w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-70 lg:block"
            >
              {loadingCheckout ? 'Yönlendiriliyor...' : 'Ödemeye devam et'}
            </button>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto max-w-6xl space-y-3 px-4 py-3">
          <label className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-indigo-600"
            />
            <span>
              Mesafeli satis ve iade kosullarini kabul ediyorum.
              {' '}
              <Link href="/distance-sales" className="font-semibold text-indigo-600">
                Sozlesme
              </Link>
            </span>
          </label>
          <div className="flex items-center gap-3">
            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Toplam
              </div>
              <div className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">
                {formatPriceTry(subtotalCents)}
              </div>
            </div>
            <button
              type="button"
              onClick={handleCheckout}
              disabled={loadingCheckout || loadingAddresses || !acceptedTerms}
              className="ml-auto inline-flex min-h-11 items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-70"
            >
              {loadingCheckout ? 'Yonlendiriliyor...' : 'Odemeye Devam Et'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckoutAddressDisabled() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)] dark:border-slate-800/70 dark:bg-slate-900/30">
          <div className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600 dark:text-amber-300">
            Ödeme kapalı
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">Şimdilik teklif ile ilerliyoruz</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {getPaymentProviderPendingNotice()} Sepetiniz icin teklif isteyebilir veya WhatsApp hattindan siparis
            destegi alabilirsiniz.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/cart"
              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40 dark:text-white dark:hover:bg-slate-950/70"
            >
              Sepete dön
            </Link>
            <Link
              href="/quote?product=Sepet%20Teklifi"
              className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Teklif iste
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutAddressPage() {
  return isPaymentCheckoutEnabled() ? <CheckoutAddressEnabled /> : <CheckoutAddressDisabled />;
}


