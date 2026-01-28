'use client';

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
          throw new Error(data?.error || 'Favoriler yuklenemedi');
        }

        setItems(Array.isArray(data?.items) ? data.items : []);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Favoriler yuklenemedi';
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
        throw new Error(data?.error || 'Favori guncellenemedi');
      }

      if (data?.favorited === false) {
        setItems((prev) => prev.filter((item) => item.sparePartId !== sparePartId));
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Favori guncellenemedi';
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
            <Link href="/profile" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
              Hesap yonetimine don
            </Link>
            <h1 className="mt-3 text-2xl font-semibold text-slate-900">Favorilerim</h1>
            <p className="mt-1 text-sm text-slate-600">Favoriledigin urunleri burada yonetebilirsin.</p>
          </div>
          <Link href="/spare-parts" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
            Yedek parcalara git
          </Link>
        </div>

        {isLoading && <div className="mt-6 text-sm text-slate-600">Yukleniyor...</div>}
        {error && <div className="mt-6 text-sm text-red-600">{error}</div>}

        {!isLoading && !error && items.length === 0 && (
          <div className="mt-8 rounded-xl border border-dashed border-slate-200 p-6 text-sm text-slate-600">
            Henuz favori urun yok. Yedek parcalardan favori ekleyebilirsin.
          </div>
        )}

        {!isLoading && !error && items.length > 0 && (
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
                {items.map((item) => (
              <div key={item.id} className="group overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/90 shadow-sm">
                <Link href={`/spare-parts/${item.sparePartId}`} className="block">
                  <div className="relative h-52 w-full">
                    <Image
                      src={item.sparePart.imageUrl || '/images/1.jpg'}
                      alt={item.sparePart.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover transition-transform group-hover:scale-[1.02]"
                      loading="lazy"
                      unoptimized
                    />
                    <div className="absolute top-3 right-3 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-slate-900">
                      {item.sparePart.category.name}
                    </div>
                  </div>
                </Link>

                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/spare-parts/${item.sparePartId}`} className="min-w-0">
                      <h3 className="text-lg font-semibold text-slate-900 line-clamp-2 hover:underline">
                        {item.sparePart.name}
                      </h3>
                    </Link>
                    <div className="text-sm font-bold text-slate-900 whitespace-nowrap">
                      {formatPriceTry(item.sparePart.priceCents)}
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 line-clamp-2">{item.sparePart.description}</p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span>Stok: {item.sparePart.stockOnHand}</span>
                    <span>Olcu: {item.sparePart.dimensions || '-'}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <AddToCartButton
                      id={item.sparePart.id}
                      name={item.sparePart.name}
                      priceCents={item.sparePart.priceCents}
                      imageUrl={item.sparePart.imageUrl}
                      disabled={item.sparePart.stockOnHand <= 0}
                      className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                        item.sparePart.stockOnHand > 0
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    />
                    {item.sparePart.stockOnHand <= 0 && (
                      <Link
                        href={`/stock-request?product=${encodeURIComponent(item.sparePart.name)}&id=${encodeURIComponent(
                          item.sparePart.id,
                        )}`}
                        className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 hover:border-amber-300"
                      >
                        Stok gelince haber ver
                      </Link>
                    )}
                    <Link
                      href={`/spare-parts/${item.sparePartId}`}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                    >
                      Detaylar
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleFavorite(item.sparePartId)}
                      disabled={toggling.has(item.sparePartId)}
                      className="rounded-xl border border-red-100 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:text-slate-400"
                    >
                      Favoriden kaldir
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



