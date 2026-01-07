'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
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
  ratingAverage: number;
  ratingCount: number;
  category: {
    id: string;
    name: string;
    slug: string;
  };
};

const machineModels = [
  { id: 'Tumu', label: 'Tum modeller', categories: ['Sac Kesim', 'Boru Kesim', 'Kombine Kesim', 'Ozel Kesim'] },
  { id: 'GL-3015', label: 'GL-3015 (Sac Kesim)', categories: ['Sac Kesim'] },
  { id: 'GL-6020', label: 'GL-6020 (Sac Kesim)', categories: ['Sac Kesim'] },
  { id: 'GT-6020', label: 'GT-6020 (Boru Kesim)', categories: ['Boru Kesim'] },
  { id: 'GT-12030', label: 'GT-12030 (Boru Kesim)', categories: ['Boru Kesim'] },
  { id: 'GL-COMB-1500', label: 'GL-Comb 1500 (Kombine)', categories: ['Kombine Kesim'] },
  { id: 'GL-9000', label: 'GL-9000 (Ozel Kesim)', categories: ['Ozel Kesim'] },
];

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

const renderStars = (average: number) =>
  Array.from({ length: 5 }, (_, index) => {
    const value = average - index;
    const isFull = value >= 0.75;
    const isHalf = value >= 0.25 && value < 0.75;

    if (isHalf) {
      return (
        <span key={`star-${index}`} className="relative inline-flex h-4 w-4">
          <svg viewBox="0 0 20 20" className="h-4 w-4 text-slate-300" fill="currentColor" aria-hidden="true">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.96a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.447a1 1 0 00-.364 1.118l1.286 3.96c.3.921-.755 1.688-1.538 1.118l-3.367-2.447a1 1 0 00-1.176 0l-3.367 2.447c-.783.57-1.838-.197-1.538-1.118l1.286-3.96a1 1 0 00-.364-1.118L2.025 9.387c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.96z" />
          </svg>
          <span className="absolute left-0 top-0 h-4 w-2 overflow-hidden">
            <svg viewBox="0 0 20 20" className="h-4 w-4 text-amber-400" fill="currentColor" aria-hidden="true">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.96a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.447a1 1 0 00-.364 1.118l1.286 3.96c.3.921-.755 1.688-1.538 1.118l-3.367-2.447a1 1 0 00-1.176 0l-3.367 2.447c-.783.57-1.838-.197-1.538-1.118l1.286-3.96a1 1 0 00-.364-1.118L2.025 9.387c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.96z" />
            </svg>
          </span>
        </span>
      );
    }

    return (
      <svg
        key={`star-${index}`}
        viewBox="0 0 20 20"
        className={`h-4 w-4 ${isFull ? 'text-amber-400' : 'text-slate-300'}`}
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.96a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.447a1 1 0 00-.364 1.118l1.286 3.96c.3.921-.755 1.688-1.538 1.118l-3.367-2.447a1 1 0 00-1.176 0l-3.367 2.447c-.783.57-1.838-.197-1.538-1.118l1.286-3.96a1 1 0 00-.364-1.118L2.025 9.387c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.96z" />
      </svg>
    );
  });

export default function SparePartsPage() {
  const router = useRouter();
  const { status } = useSession();

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('Tumu');
  const [selectedModel, setSelectedModel] = useState('Tumu');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(24);

  const [items, setItems] = useState<SparePart[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [favoriteLoading, setFavoriteLoading] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [favoriteError, setFavoriteError] = useState('');

  // Load products
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

  // Load favorites
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
    const modelInfo = machineModels.find((model) => model.id === selectedModel);
    const modelCategories = modelInfo?.categories ?? [];

    return items.filter((p) => {
      const matchesCategory = selectedCategory === 'Tumu' || p.category.name === selectedCategory;
      const matchesModel = selectedModel === 'Tumu' || modelCategories.includes(p.category.name);
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.dimensions ?? '').toLowerCase().includes(q);
      return matchesCategory && matchesModel && matchesSearch;
    });
  }, [items, selectedCategory, selectedModel, searchQuery]);

  const visibleItems = useMemo(
    () => filtered.slice(0, Math.min(visibleCount, filtered.length)),
    [filtered, visibleCount],
  );

  useEffect(() => {
    setVisibleCount(24);
  }, [selectedCategory, selectedModel, searchQuery]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        setVisibleCount((prev) => {
          if (prev >= filtered.length) return prev;
          return Math.min(prev + 24, filtered.length);
        });
      },
      { rootMargin: '200px' },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [filtered.length]);

  const selectedModelInfo = useMemo(
    () => machineModels.find((model) => model.id === selectedModel),
    [selectedModel],
  );

  const crossSell = useMemo(() => {
    if (!items.length) return [];
    const featured = items.filter((item) => item.isFeatured);
    const merged = [...featured, ...items.filter((item) => !item.isFeatured)];
    return merged.slice(0, 3);
  }, [items]);

  return (
    <div className="min-h-screen space-y-16">
      <section className="relative overflow-hidden rounded-[40px] bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 px-6 py-14 text-white shadow-2xl sm:px-10 lg:px-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(251,146,60,0.22),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(148,163,184,0.18),transparent_55%)]" />
        <div className="absolute inset-0 opacity-60 bg-[linear-gradient(120deg,rgba(148,163,184,0.16),transparent)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-4">
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
                className="inline-flex items-center justify-center rounded-full bg-teal-400 px-6 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-teal-500/30 transition hover:-translate-y-0.5 hover:bg-teal-300"
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

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { title: 'Hizli teslim', detail: 'Stokta 2-3 gun, ozel sipariste 7-10 gun.' },
              { title: 'Uyum kontrolu', detail: 'Model secerek sadece uyumlu parcalari gorun.' },
              { title: 'Kurumsal destek', detail: 'Teknik ekipten dogrudan teyit ve destek.' },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/80 backdrop-blur"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">
                  {item.title}
                </p>
                <p className="mt-2 text-sm text-white/75">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-lg dark:border-slate-800/70 dark:bg-slate-900/60">
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
                className="block w-full rounded-xl border border-slate-200 bg-white/90 py-3 pl-10 pr-3 text-sm text-slate-900 shadow-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-teal-400 dark:focus:ring-teal-500/30"
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
                    ? 'bg-teal-500 text-slate-900'
                    : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr]">
          <div>
            <label
              htmlFor="modelSelect"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400"
            >
              Uyumluluk kontrolu
            </label>
            <select
              id="modelSelect"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="mt-2 block w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-3 text-sm text-slate-900 shadow-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-teal-400 dark:focus:ring-teal-500/30"
            >
              {machineModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.label}
                </option>
              ))}
            </select>
          </div>
          <div className="rounded-2xl border border-teal-100 bg-teal-50/70 px-4 py-4 text-sm text-teal-900 dark:border-teal-400/40 dark:bg-slate-900/70 dark:text-teal-200">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">
              Uyum sonucu
            </p>
            <p className="mt-2">
              {selectedModel === 'Tumu'
                ? 'Model secerek uyumluluk filtresi uygulayabilirsin.'
                : `${selectedModelInfo?.label} icin uyumlu parcalar listeleniyor.`}
            </p>
          </div>
        </div>

        <div className="mt-4 text-sm text-slate-500 dark:text-slate-300">
          {isLoading ? 'Yukleniyor...' : `${filtered.length} urun listeleniyor`}
        </div>
        {favoriteError && <div className="mt-3 text-sm text-red-600">{favoriteError}</div>}
      </section>

      {loadError && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-red-700">{loadError}</div>
      )}

      {!loadError && (
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleItems.map((p) => {
            const isFavorited = favoriteIds.has(p.id);
            const inStock = p.stockOnHand > 0;

            return (
              <div
                key={p.id}
                className="group overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/90 shadow-sm transition-colors hover:border-teal-200 dark:border-slate-800/70 dark:bg-slate-900/60 dark:hover:border-teal-400/50"
              >
                <Link href={`/spare-parts/${p.id}`} className="block">
                  <div className="relative h-52 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <Image
                      src={p.imageUrl || '/images/1.jpg'}
                      alt={p.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                      quality={70}
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute top-4 right-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 dark:bg-slate-900/80 dark:text-white">
                      {p.category.name}
                    </div>
                    {p.isFeatured && (
                      <div className="absolute top-4 left-4 rounded-full bg-slate-900/90 px-3 py-1 text-xs font-semibold text-white dark:bg-teal-500/90 dark:text-slate-950">
                        Vitrin
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 text-xs font-semibold">
                      <span
                        className={`rounded-full px-3 py-1 ${
                          inStock ? 'bg-teal-500 text-slate-900' : 'bg-amber-200 text-amber-900'
                        }`}
                      >
                        {inStock ? 'Stokta' : 'Siparisle'}
                      </span>
                      <span className="rounded-full bg-white/90 px-3 py-1 text-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
                        {inStock ? '2-3 gun teslim' : '7-10 gun teslim'}
                      </span>
                    </div>
                  </div>
                </Link>

                <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/spare-parts/${p.id}`} className="min-w-0">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white line-clamp-2">
                      {p.name}
                    </h3>
                  </Link>
                  <div className="text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {formatPriceTry(p.priceCents)}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-300">
                  <div className="flex items-center gap-1">
                    {renderStars(p.ratingCount > 0 ? p.ratingAverage : 0)}
                  </div>
                  {p.ratingCount > 0 && (
                    <span>
                      {p.ratingAverage.toFixed(1)} ({p.ratingCount})
                    </span>
                  )}
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

                  <div className="text-xs text-teal-700 dark:text-teal-300">
                    {selectedModel === 'Tumu'
                      ? 'Uyumluluk icin model sec'
                      : `${selectedModelInfo?.label} ile uyumlu`}
                  </div>

                  <div className="flex items-center gap-2">
                    <AddToCartButton
                      id={p.id}
                      name={p.name}
                      priceCents={p.priceCents}
                      imageUrl={p.imageUrl}
                      className="flex-1 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
                    />
                    <button
                      type="button"
                      onClick={() => toggleFavorite(p.id)}
                      disabled={favoriteLoading.has(p.id)}
                      aria-pressed={isFavorited}
                      aria-label={isFavorited ? 'Favoriden kaldir' : 'Favorilere ekle'}
                      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center self-center rounded-full border transition-colors ${
                        isFavorited
                          ? 'border-red-200 bg-red-50 text-red-600'
                          : 'border-slate-200 bg-white text-slate-500 hover:text-red-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
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
        <div className="text-center py-14 text-slate-600 dark:text-slate-300">
          Sonuç bulunamadı. Filtreleri degistirip tekrar deneyebilirsin.
        </div>
      )}

      {!isLoading && !loadError && visibleCount < filtered.length && (
        <div ref={loadMoreRef} aria-hidden className="h-1" />
      )}

      {crossSell.length > 0 && (
        <section className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-lg dark:border-slate-800/70 dark:bg-slate-900/60">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-teal-600 dark:text-teal-300">
                Satin alanlar bunlari da aldi
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
                Tamamlayici parcalar
              </h2>
            </div>
            <Link
              href="/spare-parts"
              className="rounded-full border border-slate-200 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800/60"
            >
              Tum yedek parcalar
            </Link>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {crossSell.map((item) => (
              <Link
                key={item.id}
                href={`/spare-parts/${item.id}`}
                className="group flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-white/80 p-4 transition-colors hover:border-teal-200 dark:border-slate-800/60 dark:bg-slate-900/70 dark:hover:border-teal-400/50"
              >
                <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-white">
                  <Image
                    src={item.imageUrl || '/images/1.jpg'}
                    alt={item.name}
                    fill
                    className="object-cover"
                    quality={70}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">{item.name}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatPriceTry(item.priceCents)}</p>
                </div>
                <span className="ml-auto text-teal-600 dark:text-teal-300">-&gt;</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

