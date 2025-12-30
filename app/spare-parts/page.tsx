'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import AddToCartButton from '@/components/cart/AddToCartButton';

type SparePart = {
  id: string;
  name: string;
  description: string;
  dimensions: string | null;
  priceCents: number;
  currency: string;
  imageUrl: string | null;
  stockOnHand: number;
  isFeatured: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
  };
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

export default function SparePartsPage() {
  const router = useRouter();
  const { status } = useSession();

  const [selectedCategory, setSelectedCategory] = useState('Tumu');
  const [searchQuery, setSearchQuery] = useState('');

  const [items, setItems] = useState<SparePart[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [favoriteLoading, setFavoriteLoading] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [favoriteError, setFavoriteError] = useState('');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setLoadError('');
      try {
        const res = await fetch('/api/spare-parts');
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Yedek parcalar alinamadi');
        setItems(Array.isArray(data?.items) ? data.items : []);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Yedek parcalar alinamadi';
        setLoadError(message);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    const loadFavorites = async () => {
      if (status !== 'authenticated') {
        setFavoriteIds(new Set());
        return;
      }

      setFavoriteError('');
      try {
        const res = await fetch('/api/favorites');
        const text = await res.text();
        const data = text ? JSON.parse(text) : {};

        if (!res.ok) {
          throw new Error(data?.error || 'Favoriler alinamadi');
        }

        const ids = new Set<string>();
        if (Array.isArray(data?.items)) {
          for (const item of data.items) {
            if (typeof item?.sparePartId === 'string') ids.add(item.sparePartId);
          }
        }
        setFavoriteIds(ids);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Favoriler alinamadi';
        setFavoriteError(message);
      }
    };

    loadFavorites();
  }, [status]);

  const toggleFavorite = async (sparePartId: string) => {
    if (status !== 'authenticated') {
      router.push('/login');
      return;
    }

    if (favoriteLoading.has(sparePartId)) return;
    setFavoriteLoading((prev) => new Set(prev).add(sparePartId));

    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sparePartId }),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) {
        throw new Error(data?.error || 'Favori guncellenemedi');
      }

      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (data?.favorited) {
          next.add(sparePartId);
        } else {
          next.delete(sparePartId);
        }
        return next;
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Favori guncellenemedi';
      setFavoriteError(message);
    } finally {
      setFavoriteLoading((prev) => {
        const next = new Set(prev);
        next.delete(sparePartId);
        return next;
      });
    }
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of items) set.add(p.category.name);
    return ['Tumu', ...Array.from(set).sort((a, b) => a.localeCompare(b, 'tr'))];
  }, [items]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return items.filter((p) => {
      const matchesCategory = selectedCategory === 'Tumu' || p.category.name === selectedCategory;
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.dimensions ?? '').toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [items, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen space-y-16">
      <section className="relative overflow-hidden rounded-[36px] bg-slate-950 px-6 py-12 text-white shadow-2xl sm:px-10 lg:px-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.4),_transparent_55%)] opacity-70" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(15,23,42,0.8),_rgba(15,23,42,0.2))]" />
        <div className="relative space-y-4">
          <p className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white/80">
            Yedek Parcalar
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">Sarf ve kritik parcalar</h1>
          <p className="max-w-2xl text-base text-white/70">
            Fiber lazer makineleri icin kritik yedek parcayi hizli temin edin.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/quote"
              className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-6 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:bg-emerald-300"
            >
              Fiyat teklifi al
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-2.5 text-sm font-semibold text-white/80 transition hover:border-white/60 hover:text-white"
            >
              Uyum danis
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:w-1/3">
            <label htmlFor="spSearch" className="sr-only">
              Ara
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                id="spSearch"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 bg-white/90 py-3 pl-10 pr-3 text-sm text-slate-900 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                placeholder="Parca adi, aciklama veya uyumluluk ara..."
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedCategory(c)}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
                  selectedCategory === c
                    ? 'bg-emerald-500 text-slate-900'
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 text-sm text-slate-500">
          {isLoading ? 'Yukleniyor...' : `${filtered.length} urun listeleniyor`}
        </div>
        {favoriteError && <div className="mt-3 text-sm text-red-600">{favoriteError}</div>}
      </section>

      {loadError && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-red-700">{loadError}</div>
      )}

      {!loadError && (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
          {filtered.map((p) => {
            const isFavorited = favoriteIds.has(p.id);
            return (
              <div
                key={p.id}
                className="perf-card overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/90 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/5"
              >
                <Link href={`/spare-parts/${p.id}`} className="block">
                  <div className="relative h-44 w-full overflow-hidden bg-white">
                    <Image
                      src={p.imageUrl || '/images/1.jpg'}
                      alt={p.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
                      className="object-cover"
                      loading="lazy"
                      unoptimized
                    />
                    <div className="absolute top-4 right-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900">
                      {p.category.name}
                    </div>
                    {p.isFeatured && (
                      <div className="absolute top-4 left-4 rounded-full bg-slate-900/90 px-3 py-1 text-xs font-semibold text-white">
                        Vitrin
                      </div>
                    )}
                  </div>
                </Link>

                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/spare-parts/${p.id}`} className="min-w-0">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white line-clamp-2 hover:underline">
                        {p.name}
                      </h3>
                    </Link>
                    <div className="text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {formatPriceTry(p.priceCents)}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{p.description}</p>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-300">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">Stok</span>
                      <span className="ml-2">{p.stockOnHand}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">Olcu</span>
                      <span className="ml-2">{p.dimensions || '-'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <AddToCartButton
                      id={p.id}
                      name={p.name}
                      priceCents={p.priceCents}
                      imageUrl={p.imageUrl}
                      className="flex-1 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                    />
                    <button
                      type="button"
                      onClick={() => toggleFavorite(p.id)}
                      disabled={favoriteLoading.has(p.id)}
                      aria-pressed={isFavorited}
                      aria-label={isFavorited ? 'Favoriden kaldir' : 'Favorilere ekle'}
                      className={`h-10 w-10 rounded-full border transition-colors ${
                        isFavorited
                          ? 'border-red-200 bg-red-50 text-red-600'
                          : 'border-slate-200 bg-white text-slate-500 hover:text-red-600'
                      } ${favoriteLoading.has(p.id) ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill={isFavorited ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path d="M12 21s-6.716-4.35-9.192-7.1C1.01 11.92 1 8.905 3.05 6.857 4.7 5.21 7.2 5 9 6.3 10 7.02 11 8.2 12 9.2c1-1 2-2.18 3-2.9 1.8-1.3 4.3-1.09 5.95.557 2.05 2.048 2.04 5.063.242 7.043C18.716 16.65 12 21 12 21z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {!isLoading && !loadError && filtered.length === 0 && (
        <div className="text-center py-14 text-slate-600">Sonuc bulunamadi. Filtreleri degistirip tekrar deneyebilirsin.</div>
      )}
    </div>
  );
}
