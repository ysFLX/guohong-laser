﻿﻿'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import ProfileLayout from '@/components/profile/ProfileLayout';
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

type FavoriteItem = {
  id: string;
  sparePartId: string;
  createdAt: string;
  sparePart: SparePart;
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

export default function FavoritesPage() {
  const router = useRouter();
  const { status } = useSession();

  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [toggling, setToggling] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const load = async () => {
      if (status !== 'authenticated') return;
      setIsLoading(true);
      setError('');

      try {
        const res = await fetch('/api/favorites');
        const text = await res.text();
        const data = text ? JSON.parse(text) : {};

        if (!res.ok) {
          throw new Error(data?.error || 'Favoriler yüklenemedi');
        }

        setItems(Array.isArray(data?.items) ? data.items : []);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Favoriler yüklenemedi';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [status]);

  const toggleFavorite = async (sparePartId: string) => {
    if (toggling.has(sparePartId)) return;
    setToggling((prev) => new Set(prev).add(sparePartId));

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

      if (data?.favorited === false) {
        setItems((prev) => prev.filter((item) => item.sparePartId !== sparePartId));
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Favori güncellenemedi';
      setError(message);
    } finally {
      setToggling((prev) => {
        const next = new Set(prev);
        next.delete(sparePartId);
        return next;
      });
    }
  };

  return (
    <ProfileLayout showSide={false}>
      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Favorilerim</h1>
            <p className="mt-1 text-sm text-gray-600">Favorilediğin ürünleri burada yönetebilirsin.</p>
          </div>
          <Link href="/spare-parts" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
            Yedek Parçalara Git
          </Link>
        </div>

        {isLoading && <div className="mt-6 text-sm text-gray-600">Yükleniyor...</div>}
        {error && <div className="mt-6 text-sm text-red-600">{error}</div>}

        {!isLoading && !error && items.length === 0 && (
          <div className="mt-8 rounded-xl border border-dashed border-gray-200 p-6 text-sm text-gray-600">
            Henüz favori ürün yok. Yedek parçalardan favori ekleyebilirsin.
          </div>
        )}

        {!isLoading && !error && items.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="relative">
                  <Link href={`/spare-parts/${item.sparePartId}`} className="block">
                    <div className="relative h-52 w-full">
                      <Image
                        src={item.sparePart.imageUrl || '/images/1.jpg'}
                        alt={item.sparePart.name}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover group-hover:scale-[1.02] transition-transform"
                        loading="lazy"
                        unoptimized
                      />
                      <div className="absolute top-3 right-3 bg-white/90 text-gray-900 text-xs font-semibold px-2 py-1 rounded-full">
                        {item.sparePart.category.name}
                      </div>
                    </div>
                  </Link>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/spare-parts/${item.sparePartId}`} className="min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 hover:underline">
                        {item.sparePart.name}
                      </h3>
                    </Link>
                    <div className="text-sm font-bold text-gray-900 whitespace-nowrap">
                      {formatPriceTry(item.sparePart.priceCents)}
                    </div>
                  </div>

                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">{item.sparePart.description}</p>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span>Stok: {item.sparePart.stockOnHand}</span>
                    <span>Ölçü: {item.sparePart.dimensions || '-'}</span>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <AddToCartButton
                      id={item.sparePart.id}
                      name={item.sparePart.name}
                      priceCents={item.sparePart.priceCents}
                      imageUrl={item.sparePart.imageUrl}
                      className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
                    />
                    <Link
                      href={`/spare-parts/${item.sparePartId}`}
                      className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-900 hover:bg-gray-50"
                    >
                      Detaylar
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleFavorite(item.sparePartId)}
                      disabled={toggling.has(item.sparePartId)}
                      className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold text-red-600 border border-red-100 hover:bg-red-50 disabled:text-gray-400"
                    >
                      Favoriden kaldır
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProfileLayout>
  );
}



