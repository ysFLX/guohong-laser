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

  const [selectedCategory, setSelectedCategory] = useState('Tümü');
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
        if (!res.ok) throw new Error(data?.error || 'Yedek parçalar alınamadı');
        setItems(Array.isArray(data?.items) ? data.items : []);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Yedek parçalar alınamadı';
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
          throw new Error(data?.error || 'Favoriler alınamadı');
        }

        const ids = new Set<string>();
        if (Array.isArray(data?.items)) {
          for (const item of data.items) {
            if (typeof item?.sparePartId === 'string') ids.add(item.sparePartId);
          }
        }
        setFavoriteIds(ids);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Favoriler alınamadı';
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
        throw new Error(data?.error || 'Favori güncellenemedi');
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
      const message = e instanceof Error ? e.message : 'Favori güncellenemedi';
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
    return ['Tümü', ...Array.from(set).sort((a, b) => a.localeCompare(b, 'tr'))];
  }, [items]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return items.filter((p) => {
      const matchesCategory = selectedCategory === 'Tümü' || p.category.name === selectedCategory;
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.dimensions ?? '').toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [items, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Yedek Parçalar</h1>
            <p className="mt-4 text-base text-gray-200 sm:text-lg">
              Fiber lazer makineleri için sarf malzeme ve kritik yedek parçalar. Uyum ve stok bilgisi için bize ulaş.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/quote"
                className="inline-flex items-center justify-center px-5 py-3 rounded-xl text-sm font-semibold bg-white text-gray-900 hover:bg-gray-100"
              >
                Fiyat Teklifi Al
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-5 py-3 rounded-xl text-sm font-semibold border border-white/20 hover:bg-white/10"
              >
                Uyum Danış
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="w-full lg:w-1/3">
              <label htmlFor="spSearch" className="sr-only">
                Ara
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
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
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 sm:text-sm"
                  placeholder="Parça adı, açıklama veya uyumluluk ara..."
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedCategory(c)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === c
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            {isLoading ? 'Yükleniyor...' : `${filtered.length} ürün listeleniyor`}
          </div>
          {favoriteError && <div className="mt-3 text-sm text-red-600">{favoriteError}</div>}
        </div>

        {loadError && (
          <div className="mt-8 bg-red-50 border border-red-100 text-red-700 rounded-xl p-4">
            {loadError}
          </div>
        )}

        {!loadError && (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => {
              const isFavorited = favoriteIds.has(p.id);
              return (
                <div
                  key={p.id}
                  className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <Link href={`/spare-parts/${p.id}`} className="block">
                    <div className="relative h-44 w-full">
                      <Image
                        src={p.imageUrl || '/images/1.jpg'}
                        alt={p.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-[1.02] transition-transform"
                        loading="lazy"
                        unoptimized
                      />
                      <div className="absolute top-4 right-4 bg-white/90 text-gray-900 text-xs font-semibold px-3 py-1 rounded-full">
                        {p.category.name}
                      </div>
                      {p.isFeatured && (
                        <div className="absolute top-4 left-4 bg-gray-900/90 text-white text-xs font-semibold px-3 py-1 rounded-full">
                          Vitrin
                        </div>
                      )}
                  </Link>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <Link href={`/spare-parts/${p.id}`} className="min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:underline line-clamp-2">
                          {p.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">
                          {formatPriceTry(p.priceCents)}
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleFavorite(p.id)}
                          disabled={favoriteLoading.has(p.id)}
                          aria-pressed={isFavorited}
                          aria-label={isFavorited ? 'Favoriden kaldır' : 'Favorilere ekle'}
                          className={`h-9 w-9 rounded-full border flex items-center justify-center transition-colors ${
                            isFavorited
                              ? 'border-red-200 bg-red-50 text-red-600'
                              : 'border-gray-200 bg-white text-gray-500 hover:text-red-600'
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
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{p.description}</p>

                    <div className="mt-4 flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-white">Stok</span>
                        <span className="ml-2">{p.stockOnHand}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-white">Olcu</span>
                        <span className="ml-2">{p.dimensions || '-'}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-3">
                      <AddToCartButton
                        id={p.id}
                        name={p.name}
                        priceCents={p.priceCents}
                        imageUrl={p.imageUrl}
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
                      />
                      <Link
                        href={`/spare-parts/${p.id}`}
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Detay
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!isLoading && !loadError && filtered.length === 0 && (
          <div className="text-center py-14">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sonuç bulunamadı</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Filtreleri değiştirip tekrar deneyebilirsin.</p>
          </div>
        )}
      </div>
    </div>
  );
}



