'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { useCart } from '@/components/cart/CartProvider';

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

export default function CheckoutAddressPage() {
  const router = useRouter();
  const { items, subtotalCents } = useCart();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedBillingId, setSelectedBillingId] = useState<string | null>(null);
  const [useBillingSame, setUseBillingSame] = useState(true);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
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
        router.push('/login');
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
      setCheckoutError('Adresler yuklenemedi');
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
      setCheckoutError('Iller yuklenemedi');
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
      setCheckoutError('Ilceler yuklenemedi');
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
      setCheckoutError('Ilce secimi zorunludur');
      return;
    }

    const payload = {
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
      setCheckoutError('Adres secmelisin');
      return;
    }
    if (!useBillingSame && !selectedBillingId) {
      setCheckoutError('Fatura adresi secmelisin');
      return;
    }
    setLoadingCheckout(true);
    setCheckoutError('');

    try {
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
      setLoadingCheckout(false);
    }
  }

  if (!items.length) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Sepet bos</h1>
          <p className="mt-2 text-sm text-gray-600">Odeme icin once urun eklemelisin.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/spare-parts"
              className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Urunlere git
            </Link>
            <Link
              href="/cart"
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
            >
              Sepete don
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/cart" className="text-sm font-semibold text-teal-600 hover:text-teal-700">
              Sepete geri don
            </Link>
            <h1 className="mt-3 text-2xl font-semibold text-gray-900">Teslimat adresi</h1>
            <p className="mt-1 text-sm text-gray-600">Odeme oncesi adres secimini tamamla.</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900">
            {cartItemCount} urun - {formatPriceTry(subtotalCents)}
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Adres sec</h2>
              <button
                type="button"
                onClick={() => {
                  if (showForm && formTarget === 'shipping') {
                    setShowForm(false);
                    return;
                  }
                  setFormTarget('shipping');
                  setShowForm(true);
                }}
                className="text-sm font-semibold text-teal-600 hover:text-teal-700"
              >
                {showForm && formTarget === 'shipping' ? 'Vazgec' : 'Yeni adres ekle'}
              </button>
            </div>

            {loadingAddresses && <div className="mt-6 text-sm text-gray-500">Adresler yukleniyor...</div>}

            {!loadingAddresses && addresses.length > 0 && (
              <div className="mt-6 space-y-3">
                {addresses.map((address) => (
                  <label
                    key={address.id}
                    className={`flex cursor-pointer flex-col gap-2 rounded-2xl border px-4 py-4 text-sm transition ${
                      selectedId === address.id
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 bg-white hover:border-teal-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-gray-900">{address.label || 'Adres'}</div>
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
                          />
                    </div>
                    <div className="text-gray-700">{address.fullName || '-'}</div>
                    <div className="text-gray-500">
                      {address.line1 || '-'}
                      {address.line2 ? `, ${address.line2}` : ''}
                      <br />
                      {address.city || '-'}
                      {address.state ? ` / ${address.state}` : ''} {address.postalCode || ''}{' '}
                      {address.country || ''}
                    </div>
                    <div className="text-gray-500">{address.phone || '-'}</div>
                  </label>
                ))}
              </div>
            )}

            {!loadingAddresses && addresses.length === 0 && (
              <div className="mt-6 rounded-2xl border border-dashed border-gray-200 p-5 text-sm text-gray-600">
                Kayitli adres bulunamadi. Devam etmek icin yeni adres ekle.
              </div>
            )}

            {showForm && formTarget === 'shipping' && (
              <form onSubmit={submitAddress} className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="form-label">Etiket</div>
                  <input
                    className="form-input"
                    placeholder="Etiket (Ev, Is)"
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
                  <div className="form-label">Il Secimi</div>
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
                      Il sec
                    </option>
                    {cities.map((city) => (
                      <option key={city.code} value={city.code}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                  {loadingCities && <div className="text-xs text-gray-500">Iller yukleniyor...</div>}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <div className="form-label">Ilce Secimi</div>
                  <select
                    className="form-input"
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                    disabled={!form.cityCode || loadingDistricts}
                  >
                    <option value="" disabled>
                      Ilce sec
                    </option>
                    {districts.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                  {loadingDistricts && <div className="text-xs text-gray-500">Ilceler yukleniyor...</div>}
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
                  <div className="form-label">Ulke</div>
                  <input
                    className="form-input"
                    placeholder="Ulke"
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
                    Iptal
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Adresi kaydet
                  </button>
                </div>
              </form>
            )}

            <div className="mt-8 border-t border-gray-200 pt-6">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <input
                  type="checkbox"
                  checked={useBillingSame}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setUseBillingSame(checked);
                    if (checked) {
                      setSelectedBillingId(selectedId);
                      setShowForm(false);
                    }
                  }}
                />
                Fatura adresi teslimat adresi ile ayni
              </label>
            </div>

            {!useBillingSame && (
              <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-900">Fatura adresi</h3>
                  <button
                    type="button"
                    onClick={() => {
                      if (showForm && formTarget === 'billing') {
                        setShowForm(false);
                        return;
                      }
                      setFormTarget('billing');
                      setShowForm(true);
                    }}
                    className="text-sm font-semibold text-teal-600 hover:text-teal-700"
                  >
                    {showForm && formTarget === 'billing' ? 'Vazgec' : 'Yeni adres ekle'}
                  </button>
                </div>

                {addresses.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {addresses.map((address) => (
                      <label
                        key={`billing-${address.id}`}
                        className={`flex cursor-pointer flex-col gap-2 rounded-2xl border px-4 py-4 text-sm transition ${
                          selectedBillingId === address.id
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-gray-200 bg-white hover:border-teal-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-gray-900">{address.label || 'Adres'}</div>
                          <input
                            type="radio"
                            name="billingAddress"
                            checked={selectedBillingId === address.id}
                            onChange={() => setSelectedBillingId(address.id)}
                          />
                        </div>
                        <div className="text-gray-700">{address.fullName || '-'}</div>
                        <div className="text-gray-500">
                          {address.line1 || '-'}
                          {address.line2 ? `, ${address.line2}` : ''}
                          <br />
                          {address.city || '-'}
                          {address.state ? ` / ${address.state}` : ''} {address.postalCode || ''}{' '}
                          {address.country || ''}
                        </div>
                        <div className="text-gray-500">{address.phone || '-'}</div>
                      </label>
                    ))}
                  </div>
                )}

                {addresses.length === 0 && (
                  <div className="mt-4 rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-600">
                    Fatura adresi icin once yeni adres ekle.
                  </div>
                )}

                {showForm && formTarget === 'billing' && (
                  <form onSubmit={submitAddress} className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="form-label">Etiket</div>
                      <input
                        className="form-input"
                        placeholder="Etiket (Ev, Is)"
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
                      <div className="form-label">Il Secimi</div>
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
                          Il sec
                        </option>
                        {cities.map((city) => (
                          <option key={city.code} value={city.code}>
                            {city.name}
                          </option>
                        ))}
                      </select>
                      {loadingCities && <div className="text-xs text-gray-500">Iller yukleniyor...</div>}
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <div className="form-label">Ilce Secimi</div>
                      <select
                        className="form-input"
                        value={form.district}
                        onChange={(e) => setForm({ ...form, district: e.target.value })}
                        disabled={!form.cityCode || loadingDistricts}
                      >
                        <option value="" disabled>
                          Ilce sec
                        </option>
                        {districts.map((district) => (
                          <option key={district} value={district}>
                            {district}
                          </option>
                        ))}
                      </select>
                      {loadingDistricts && <div className="text-xs text-gray-500">Ilceler yukleniyor...</div>}
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
                      <div className="form-label">Ulke</div>
                      <input
                        className="form-input"
                        placeholder="Ulke"
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
                        Iptal
                      </button>
                      <button
                        type="submit"
                        className="btn-primary"
                      >
                        Adresi kaydet
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-lg">
            <div className="text-lg font-semibold text-gray-900">Siparis ozeti</div>
            <div className="mt-4 space-y-3 text-sm text-gray-600">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-gray-900">{item.name}</div>
                    <div className="text-xs text-gray-500">{item.quantity} adet</div>
                  </div>
                  <div className="font-semibold text-gray-900">
                    {formatPriceTry(item.priceCents * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4 text-sm">
              <span className="text-gray-600">Toplam</span>
              <span className="font-semibold text-gray-900">{formatPriceTry(subtotalCents)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
              <span>Kargo</span>
              <span className="font-semibold text-gray-900">Adresle hesaplanir</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
              <span>Teslimat</span>
              <span className="font-semibold text-gray-900">2-5 is gunu (stokta)</span>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Kargo ucreti ve sure, secilen adrese gore netlesir.
            </div>
            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-xs text-gray-600">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                Guven rozetleri
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold">
                <span className="rounded-full border border-gray-200 bg-white px-3 py-1">SSL</span>
                <span className="rounded-full border border-gray-200 bg-white px-3 py-1">PCI-DSS</span>
                <span className="rounded-full border border-gray-200 bg-white px-3 py-1">3D Secure</span>
                <span className="rounded-full border border-gray-200 bg-white px-3 py-1">Iade garantisi</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={loadingCheckout || loadingAddresses}
              className="mt-6 w-full rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-70"
            >
              {loadingCheckout ? 'Yonlendiriliyor...' : 'Odemeye devam et'}
            </button>

            {checkoutError && <div className="mt-3 text-xs text-red-600">{checkoutError}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

