'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, type ChangeEvent, type CSSProperties, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';

import AddToCartButton from '@/components/cart/AddToCartButton';
import QuickBuyButton from '@/components/cart/QuickBuyButton';
import { useToast } from '@/components/ui/ToastProvider';
import { trackEvent } from '@/lib/analytics';
import { productionSiteUrl } from '@/lib/seo';
import { isSparePartDirectPurchaseEnabled, isSparePartPriceVisible } from '@/lib/sparePartSales';

export type SparePart = {
  id: string;
  name: string;
  description: string;
  dimensions: string | null;
  priceCents: number;
  displayPriceCents?: number;
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
  { id: 'Tümü', label: 'Tüm modeller', categories: ['Sac Kesim', 'Boru Kesim', 'Kombine Kesim', 'Özel Kesim'] },
  { id: 'GL-3015', label: 'GL-3015 (Sac Kesim)', categories: ['Sac Kesim'] },
  { id: 'GL-6020', label: 'GL-6020 (Sac Kesim)', categories: ['Sac Kesim'] },
  { id: 'GL-9025', label: 'GL-9025 (Sac Kesim)', categories: ['Sac Kesim'] },
  { id: 'GT-6020', label: 'GT-6020 (Boru Kesim)', categories: ['Boru Kesim'] },
  { id: 'GT-12030', label: 'GT-12030 (Boru Kesim)', categories: ['Boru Kesim'] },
  { id: 'GL-COMB-1500', label: 'GL-Comb 1500 (Kombine)', categories: ['Kombine Kesim'] },
  { id: 'GL-COMB-3000', label: 'GL-Comb 3000 (Kombine)', categories: ['Kombine Kesim'] },
  { id: 'GL-9000', label: 'GL-9000 (Özel Kesim)', categories: ['Özel Kesim'] },
];

const CRITICAL_STOCK_LEVEL = 5;
const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || productionSiteUrl).replace(/\/$/, '');
const SORT_OPTIONS = ['recommended', 'price-asc', 'price-desc', 'rating-desc', 'name-asc'] as const;
const VALID_SORT_OPTIONS = new Set<string>(SORT_OPTIONS);
const VALID_MODEL_IDS = new Set<string>(machineModels.map((model) => model.id));
const LASER_HEAD_PRIORITY_NAMES = [
  'boci 421ts',
  'boci 421s',
  'jiaqiang bm110',
  'wsx nc30e',
  'wan shun xing wsx nc30e',
  'boci blt310',
];

type SearchParamsLike = { get: (key: string) => string | null };

function parseFiltersFromSearchParams(searchParams: SearchParamsLike) {
  const q = (searchParams.get('q') ?? '').trim();
  const cat = (searchParams.get('cat') ?? '').trim();
  const model = (searchParams.get('model') ?? '').trim();
  const sort = (searchParams.get('sort') ?? '').trim();

  return {
    q,
    category: cat && cat !== 'Tümü' ? cat : 'Tümü',
    model: VALID_MODEL_IDS.has(model) ? model : 'Tümü',
    sort: VALID_SORT_OPTIONS.has(sort) ? sort : 'recommended',
  };
}

function formatPriceTry(priceCents: number) {
  try {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(priceCents / 100);
  } catch {
    return `${(priceCents / 100).toFixed(2)} TL`;
  }
}

function getVisiblePriceCents(item: SparePart) {
  return item.displayPriceCents ?? item.priceCents;
}

function normalizeSearchText(value: string) {
  return value
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

function getLaserHeadPriority(item: SparePart) {
  const name = normalizeSearchText(item.name);
  const category = normalizeSearchText(item.category.name);
  const explicitIndex = LASER_HEAD_PRIORITY_NAMES.findIndex((priorityName) => {
    const priority = normalizeSearchText(priorityName);
    return name === priority || name.includes(priority);
  });

  if (explicitIndex >= 0) return explicitIndex;
  if (category.includes('lazer kafasi')) return LASER_HEAD_PRIORITY_NAMES.length;
  return Number.POSITIVE_INFINITY;
}

const renderStars = (average: number) =>
  Array.from({ length: 5 }, (_, index) => {
    const value = average - index;
    const isFull = value >= 0.9;
    const isHalf = value >= 0.1 && value < 0.9;

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

function VirtualizedPartsGridRows({
  items,
  gridColumns,
  scrollMargin,
  renderPartCard,
}: {
  items: SparePart[];
  gridColumns: number;
  scrollMargin: number;
  renderPartCard: (part: SparePart, index: number) => ReactNode;
}) {
  const rowCount = Math.ceil(items.length / gridColumns);
  const rowVirtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => 620,
    overscan: 8,
    scrollMargin,
  });

  return (
    <div className="relative" style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
        const startIndex = virtualRow.index * gridColumns;
        const rowItems = items.slice(startIndex, Math.min(startIndex + gridColumns, items.length));

        return (
          <div
            key={virtualRow.key}
            data-index={virtualRow.index}
            ref={rowVirtualizer.measureElement}
            className="pb-6"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start - scrollMargin}px)`,
            }}
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              {rowItems.map((part, idx) => renderPartCard(part, startIndex + idx))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SparePartsPageContent({ initialItems }: { initialItems: SparePart[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { status, data: session } = useSession();
  const { show } = useToast();
  const sparePartPriceVisible = isSparePartPriceVisible();
  const sparePartDirectPurchaseEnabled = isSparePartDirectPurchaseEnabled();
  const urlFilters = useMemo(() => parseFiltersFromSearchParams(searchParams), [searchParams]);

  const listRef = useRef<HTMLDivElement | null>(null);
  const viewedItemListKey = useRef('');
  const [selectedCategory, setSelectedCategory] = useState(urlFilters.category);
  const [selectedModel, setSelectedModel] = useState(urlFilters.model);
  const [searchQuery, setSearchQuery] = useState(urlFilters.q);
  const [visibleCount, setVisibleCount] = useState(24);
  const [sortOption, setSortOption] = useState(urlFilters.sort);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [stockRequestOpen, setStockRequestOpen] = useState(false);
  const [stockRequestPart, setStockRequestPart] = useState<SparePart | null>(null);
  const [stockRequestForm, setStockRequestForm] = useState({
    name: '',
    email: '',
    phone: '',
    quantity: '1',
    note: '',
  });
  const [stockRequestOtp, setStockRequestOtp] = useState('');
  const [stockRequestStep, setStockRequestStep] = useState<'details' | 'verify'>('details');
  const [stockRequestStatus, setStockRequestStatus] = useState<{ success: boolean; message: string } | null>(
    null,
  );
  const [stockRequestInfo, setStockRequestInfo] = useState('');
  const [stockRequestLoading, setStockRequestLoading] = useState(false);
  const [stockRequestEmailError, setStockRequestEmailError] = useState('');

  const [items, setItems] = useState<SparePart[]>(() => initialItems);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [favoriteLoading, setFavoriteLoading] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(() => initialItems.length === 0);
  const [loadError, setLoadError] = useState('');
  const [favoriteError, setFavoriteError] = useState('');
  const [virtualizeList, setVirtualizeList] = useState(false);
  const [gridColumns, setGridColumns] = useState(1);
  const [scrollMargin, setScrollMargin] = useState(0);

  const urlUpdateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevFiltersRef = useRef({
    selectedCategory: urlFilters.category,
    selectedModel: urlFilters.model,
    searchQuery: urlFilters.q,
    sortOption: urlFilters.sort,
  });

  useEffect(() => {
    return () => {
      if (urlUpdateTimer.current) {
        clearTimeout(urlUpdateTimer.current);
        urlUpdateTimer.current = null;
      }
    };
  }, []);

  useEffect(() => {
    setSelectedCategory(urlFilters.category);
    setSelectedModel(urlFilters.model);
    setSearchQuery(urlFilters.q);
    setSortOption(urlFilters.sort);
  }, [urlFilters.category, urlFilters.model, urlFilters.q, urlFilters.sort]);

  // Load products
  useEffect(() => {
    if (initialItems.length > 0) return;

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
  }, [initialItems.length]);

  /*
  useEffect(() => {
    return;
    if (!items.length) return;

    const lowStockItems = items.filter(
      (item) => item.stockOnHand > 0 && item.stockOnHand <= CRITICAL_STOCK_LEVEL,
    );

    if (!lowStockItems.length) return;

    lowStockNotified.current = true;
    const preview = lowStockItems
      .slice(0, 2)
      .map((item) => item.name)
      .join(', ');
    const extra = lowStockItems.length > 2 ? ` +${lowStockItems.length - 2}` : '';
    show(`Stok hızla azalıyor: ${preview}${extra}`, undefined, 'error');
  }, [items, show]);
  */

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
      const next = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      router.push(`/login?next=${encodeURIComponent(next)}`);
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

  useEffect(() => {
    if (!items.length) return;
    if (selectedCategory === 'Tümü') return;
    if (categories.includes(selectedCategory)) return;
    setSelectedCategory('Tümü');
  }, [categories, items.length, selectedCategory]);

  useEffect(() => {
    const prev = prevFiltersRef.current;
    const changedSearch = prev.searchQuery !== searchQuery;
    const changedCategory = prev.selectedCategory !== selectedCategory;
    const changedModel = prev.selectedModel !== selectedModel;
    const changedSort = prev.sortOption !== sortOption;

    prevFiltersRef.current = { selectedCategory, selectedModel, searchQuery, sortOption };

    const normalizedDesired = {
      q: searchQuery.trim(),
      category: selectedCategory,
      model: selectedModel,
      sort: sortOption,
    };

    const current = parseFiltersFromSearchParams(searchParams);
    if (
      normalizedDesired.q === current.q &&
      normalizedDesired.category === current.category &&
      normalizedDesired.model === current.model &&
      normalizedDesired.sort === current.sort
    ) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    if (normalizedDesired.q) nextParams.set('q', normalizedDesired.q);
    else nextParams.delete('q');

    if (normalizedDesired.category !== 'Tümü') nextParams.set('cat', normalizedDesired.category);
    else nextParams.delete('cat');

    if (normalizedDesired.model !== 'Tümü') nextParams.set('model', normalizedDesired.model);
    else nextParams.delete('model');

    if (normalizedDesired.sort !== 'recommended') nextParams.set('sort', normalizedDesired.sort);
    else nextParams.delete('sort');

    const href = nextParams.toString() ? `${pathname}?${nextParams.toString()}` : pathname;
    const shouldDebounce = changedSearch && !changedCategory && !changedModel && !changedSort;

    if (urlUpdateTimer.current) {
      clearTimeout(urlUpdateTimer.current);
      urlUpdateTimer.current = null;
    }

    if (shouldDebounce) {
      urlUpdateTimer.current = setTimeout(() => {
        router.replace(href);
      }, 350);
      return;
    }

    router.push(href);
  }, [pathname, router, searchParams, searchQuery, selectedCategory, selectedModel, sortOption]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const modelInfo = machineModels.find((model) => model.id === selectedModel);
    const modelCategories = modelInfo?.categories ?? [];

    return items.filter((p) => {
      const matchesCategory = selectedCategory === 'Tümü' || p.category.name === selectedCategory;
      const matchesModel = selectedModel === 'Tümü' || modelCategories.includes(p.category.name);
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.dimensions ?? '').toLowerCase().includes(q);
      return matchesCategory && matchesModel && matchesSearch;
    });
  }, [items, selectedCategory, selectedModel, searchQuery]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    switch (sortOption) {
      case 'price-asc':
        list.sort((a, b) => getVisiblePriceCents(a) - getVisiblePriceCents(b));
        break;
      case 'price-desc':
        list.sort((a, b) => getVisiblePriceCents(b) - getVisiblePriceCents(a));
        break;
      case 'rating-desc':
        list.sort((a, b) => {
          const scoreA = a.ratingCount > 0 ? a.ratingAverage : 0;
          const scoreB = b.ratingCount > 0 ? b.ratingAverage : 0;
          if (scoreB !== scoreA) return scoreB - scoreA;
          return b.ratingCount - a.ratingCount;
        });
        break;
      case 'name-asc':
        list.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
        break;
      default:
        list.sort((a, b) => {
          const priorityA = getLaserHeadPriority(a);
          const priorityB = getLaserHeadPriority(b);
          const aIsLaserHead = Number.isFinite(priorityA);
          const bIsLaserHead = Number.isFinite(priorityB);

          if (aIsLaserHead || bIsLaserHead) {
            if (aIsLaserHead !== bIsLaserHead) return aIsLaserHead ? -1 : 1;
            if (priorityA !== priorityB) return priorityA - priorityB;
          }

          const featuredDiff = Number(b.isFeatured) - Number(a.isFeatured);
          if (featuredDiff !== 0) return featuredDiff;
          return a.name.localeCompare(b.name, 'tr');
        });
        break;
    }
    return list;
  }, [filtered, sortOption]);

  const visibleItems = useMemo(
    () => sorted.slice(0, Math.min(visibleCount, sorted.length)),
    [sorted, visibleCount],
  );

  const selectedCompare = useMemo(
    () =>
      compareIds
        .map((id) => items.find((item) => item.id === id))
        .filter((item): item is SparePart => Boolean(item)),
    [compareIds, items],
  );

  const compareCategory = selectedCompare[0]?.category.name ?? null;

  const itemListSchema = useMemo(() => {
    if (!visibleItems.length) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Guohong Lazer yedek parçalar',
      itemListElement: visibleItems.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        url: baseUrl ? `${baseUrl}/spare-parts/${item.id}` : `/spare-parts/${item.id}`,
        price: getVisiblePriceCents(item) / 100,
      })),
    };
  }, [visibleItems]);

  useEffect(() => {
    if (isLoading || loadError) return;
    if (!visibleItems.length) return;

    const q = searchQuery.trim();
    const listName = q
      ? `Arama: ${q}`
      : selectedCategory !== 'Tümü'
        ? `Kategori: ${selectedCategory}`
        : selectedModel !== 'Tümü'
          ? `Model: ${selectedModel}`
          : 'Yedek Parçalar';

    const key = `${listName}|${sortOption}`;
    if (viewedItemListKey.current === key) return;
    viewedItemListKey.current = key;

    trackEvent('view_item_list', {
      item_list_name: listName,
      items: visibleItems.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        price: item.priceCents / 100,
      })),
    });
  }, [isLoading, loadError, visibleItems, searchQuery, selectedCategory, selectedModel, sortOption]);

  useEffect(() => {
    setVisibleCount(24);
  }, [selectedCategory, selectedModel, searchQuery, sortOption]);

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      if (width >= 1280) {
        setGridColumns(5);
      } else if (width >= 1024) {
        setGridColumns(4);
      } else if (width >= 768) {
        setGridColumns(2);
      } else {
        setGridColumns(1);
      }
      const rect = listRef.current?.getBoundingClientRect();
      setScrollMargin(rect ? rect.top + window.scrollY : 0);
    };

    update();
    setVirtualizeList(true);

    window.addEventListener('resize', update);

    return () => {
      window.removeEventListener('resize', update);
    };
  }, []);

  const selectedModelInfo = useMemo(
    () => machineModels.find((model) => model.id === selectedModel),
    [selectedModel],
  );

  const activeFiltersCount =
    (searchQuery.trim() ? 1 : 0) + (selectedCategory !== 'Tümü' ? 1 : 0) + (selectedModel !== 'Tümü' ? 1 : 0);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('Tümü');
    setSelectedModel('Tümü');
  };

  const fromParam = useMemo(() => {
    const params = new URLSearchParams();
    const q = searchQuery.trim();
    if (q) params.set('q', q);
    if (selectedCategory !== 'Tümü') params.set('cat', selectedCategory);
    if (selectedModel !== 'Tümü') params.set('model', selectedModel);
    if (sortOption !== 'recommended') params.set('sort', sortOption);
    const qs = params.toString();
    return qs ? `/spare-parts?${qs}` : '';
  }, [searchQuery, selectedCategory, selectedModel, sortOption]);

  const getPartHref = (id: string) =>
    fromParam ? `/spare-parts/${id}?from=${encodeURIComponent(fromParam)}` : `/spare-parts/${id}`;

  const isEmailValid = (value: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value.trim());

  const handleStockRequestChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setStockRequestForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'email' && stockRequestEmailError) setStockRequestEmailError('');
  };

  const submitStockRequest = async () => {
    if (!stockRequestPart || stockRequestLoading) return;
    setStockRequestStatus(null);
    setStockRequestInfo('');
    setStockRequestEmailError('');

    if (!isEmailValid(stockRequestForm.email)) {
      setStockRequestEmailError('Lütfen doğru bir e-posta adresi giriniz.');
      return;
    }

      setStockRequestLoading(true);
      try {
        const message = [
          `Ürün: ${stockRequestPart.name}`,
          `Ürün ID: ${stockRequestPart.id}`,
          `Adet: ${stockRequestForm.quantity || '-'}`,
          `Telefon: ${stockRequestForm.phone || '-'}`,
          `Not: ${stockRequestForm.note || '-'}`,
        ].join('\n');

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: stockRequestForm.name || 'Misafir',
          email: stockRequestForm.email,
          phone: stockRequestForm.phone,
          subject: 'Stok Talebi',
          product: stockRequestPart.name,
          message,
          otp: stockRequestStep === 'verify' ? stockRequestOtp : undefined,
        }),
      });

      const data = await response.json();

        if (data.step === 'verify') {
          setStockRequestStep('verify');
          setStockRequestInfo('Doğrulama kodu e-posta adresine gönderildi.');
        } else if (data.success) {
          trackEvent('generate_lead', {
            lead_type: 'stock_request',
            source: 'spare_parts_modal',
            product: stockRequestPart.name,
            quantity: stockRequestForm.quantity,
          });
          setStockRequestStatus({
            success: true,
            message: 'Talebin alındı. Stok girişinde sana bilgi vereceğiz.',
          });
        setStockRequestStep('details');
        setStockRequestOtp('');
      } else {
        throw new Error(data.error || data.message || 'Talep gönderilemedi. Lütfen daha sonra tekrar deneyin.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
      setStockRequestStatus({ success: false, message });
    } finally {
      setStockRequestLoading(false);
    }
  };

  const renderPartCard = (p: SparePart, index: number) => {
    const isFavorited = favoriteIds.has(p.id);
    const inStock = p.stockOnHand > 0;
    const isCritical = inStock && p.stockOnHand <= CRITICAL_STOCK_LEVEL;

    return (
      <article
        key={p.id}
        className="group relative flex h-full flex-col overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950"
        style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 320px' } as CSSProperties}
        onClick={() => router.push(getPartHref(p.id))}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            router.push(getPartHref(p.id));
          }
        }}
        role="link"
        tabIndex={0}
      >
        <div className="relative">
          <Link href={getPartHref(p.id)} className="block">
            <div className="relative aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-900/60">
              <Image
                src={p.imageUrl || '/images/1.jpg'}
                alt={p.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-contain p-5 transition duration-500 group-hover:scale-[1.02]"
                quality={70}
                decoding="async"
                priority={index < 3}
              />
            </div>
          </Link>

          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {p.isFeatured ? (
              <span className="rounded-full bg-[#15148c] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                Vitrin
              </span>
            ) : null}
          </div>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              toggleFavorite(p.id);
            }}
            disabled={favoriteLoading.has(p.id)}
            aria-pressed={isFavorited}
            aria-label={isFavorited ? 'Favoriden kaldir' : 'Favorilere ekle'}
            className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-500 shadow-sm transition hover:border-rose-200 hover:text-rose-600"
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

        <div className="px-3 pt-3">
          <div className="flex min-h-[56px] flex-wrap content-start gap-2 text-[11px] font-semibold">
            <span
              className={`rounded-full px-2.5 py-1 ${inStock ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}
            >
              {inStock ? 'Stokta' : 'Siparisle'}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
              {inStock ? '2-3 gun teslim' : '7-10 gun teslim'}
            </span>
            {isCritical ? <span className="rounded-full bg-rose-50 px-2.5 py-1 text-rose-700">Son stoklar</span> : null}
          </div>
        </div>

        <div className="flex flex-1 flex-col px-3.5 pb-3.5">
          <Link href={getPartHref(p.id)} className="block min-h-[42px]">
            <h3 className="line-clamp-2 text-[16px] font-medium leading-6 text-slate-900 dark:text-white">{p.name}</h3>
          </Link>

          <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-300">
            <div className="flex items-center gap-1">{renderStars(p.ratingCount > 0 ? p.ratingAverage : 0)}</div>
            <span>{p.ratingCount > 0 ? `${p.ratingAverage.toFixed(1)} (${p.ratingCount})` : 'Degerlendirme yok'}</span>
          </div>

          <div className="mt-2 rounded-2xl bg-slate-50 px-3 py-2 dark:bg-slate-900/60">
            <div className="mt-1 text-[25px] font-bold leading-none text-[#ff6a0d] dark:text-amber-300">
              {sparePartPriceVisible ? formatPriceTry(getVisiblePriceCents(p)) : 'Teklif al'}
            </div>
          </div>

          {selectedModel !== 'Tümü' ? (
            <div className="mt-1.5 rounded-lg bg-indigo-50 px-3 py-2 text-[11px] font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200">
              {selectedModelInfo?.label} ile uyumlu
            </div>
          ) : null}

          <div className="relative z-10 mt-2.5" onClick={(event) => event.stopPropagation()}>
            {inStock && sparePartDirectPurchaseEnabled ? (
              <div className="grid grid-cols-2 gap-2">
                <QuickBuyButton
                  item={{
                    id: p.id,
                    name: p.name,
                    priceCents: getVisiblePriceCents(p),
                    imageUrl: p.imageUrl,
                  }}
                  label="Satin al"
                />
                <AddToCartButton
                  id={p.id}
                  name={p.name}
                  priceCents={getVisiblePriceCents(p)}
                  imageUrl={p.imageUrl}
                  className="rounded-xl border border-[#ff6a0d] bg-white px-4 py-2.5 text-sm font-semibold text-[#ff6a0d] transition hover:bg-orange-50"
                />
              </div>
            ) : (
              <div className="grid gap-2">
                <Link
                  href={`/quote?product=${encodeURIComponent(p.name)}&id=${encodeURIComponent(p.id)}`}
                  className="rounded-xl bg-[#ff6a0d] px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#ff6a0d]"
                >
                  Satin al
                </Link>
              </div>
            )}
          </div>
        </div>
      </article>
    );
  };

  const crossSell = useMemo(() => {
    if (!items.length) return [];
    const featured = items.filter((item) => item.isFeatured);
    const merged = [...featured, ...items.filter((item) => !item.isFeatured)];
    return merged.slice(0, 3);
  }, [items]);

  return (
    <div className="min-h-screen space-y-16 bg-slate-50 pb-24 dark:bg-slate-950 dark:text-slate-200 dark:[&_.bg-white]:bg-slate-900/70 dark:[&_[class*='border-slate-200/70']]:border-white/10 dark:[&_.text-slate-900]:text-white dark:[&_.text-slate-600]:text-slate-300 dark:[&_.text-slate-500]:text-slate-400">
      {itemListSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      )}
      <section className="relative overflow-hidden rounded-[40px] bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 px-6 py-14 text-white shadow-2xl sm:px-10 lg:px-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(251,146,60,0.22),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(148,163,184,0.18),transparent_55%)]" />
        <div className="absolute inset-0 opacity-60 bg-[linear-gradient(120deg,rgba(148,163,184,0.16),transparent)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-4">
            <p className="inline-flex items-center gap-3 rounded-full border border-[#ff6a0d]/35 bg-[#ff6a0d]/20 px-4 py-2 text-xs uppercase tracking-[0.34em] !text-white shadow-[0_10px_30px_rgba(255,106,13,0.15)]">
              Yedek Parçalar
            </p>
            <h1 className="text-3xl font-semibold !text-white sm:text-4xl">Sarf ve kritik parçalar</h1>
            <p className="max-w-2xl text-base !text-white/80">
              Fiber lazer makineleri için kritik yedek parçayı hızlı temin edin.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/quote"
                className="inline-flex items-center justify-center rounded-full bg-indigo-400 px-6 py-2.5 text-sm font-semibold !text-white shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5 hover:bg-indigo-300"
              >
                Fiyat teklifi al
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-2.5 text-sm font-semibold !text-white/80 transition hover:border-white/60 hover:!text-white"
              >
                Uyum danış
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { title: 'Hızlı teslim', detail: 'Stokta 2-3 gün, özel siparişte 7-10 gün.' },
              { title: 'Uyum kontrolü', detail: 'Model seçerek sadece uyumlu parçaları görün.' },
              { title: 'Kurumsal destek', detail: 'Teknik ekipten doğrudan teyit ve destek.' },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-900 backdrop-blur"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-900">
                  {item.title}
                </p>
                <p className="mt-2 text-sm text-slate-700">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
        <div className="sticky top-[66px] z-30 -mx-2 rounded-2xl border border-slate-200/70 bg-white/95 px-2 py-2 backdrop-blur lg:hidden dark:border-slate-800/70 dark:bg-slate-950/95">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              Filtreler
              {activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ''}
            </button>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="min-h-10 flex-1 rounded-xl border border-slate-200/70 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
            >
              <option value="recommended">One Cikanlar</option>
              <option value="price-asc">Fiyat (artan)</option>
              <option value="price-desc">Fiyat (azalan)</option>
              <option value="rating-desc">Puan (yuksek)</option>
              <option value="name-asc">Isim (A-Z)</option>
            </select>
          </div>
        </div>

        <aside className="hidden h-fit rounded-[28px] border border-slate-200/70 bg-white/90 p-5 shadow-lg dark:border-slate-800/70 dark:bg-slate-900/60 lg:block">
          <div className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                  Filtreler
                </p>
                <div className="flex items-center gap-2">
                  {activeFiltersCount > 0 && (
                    <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-700 dark:border-indigo-400/40 dark:bg-indigo-500/10 dark:text-indigo-200">
                      {activeFiltersCount} filtre
                    </span>
                  )}
                   <button
                     type="button"
                     onClick={resetFilters}
                     disabled={activeFiltersCount === 0}
                     className={`rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600 transition dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 ${
                       activeFiltersCount === 0
                         ? 'cursor-not-allowed opacity-60'
                         : 'hover:border-slate-300 hover:text-slate-900 dark:hover:bg-slate-800/70'
                     }`}
                   >
                     Temizle
                   </button>
                 </div>
               </div>
              <div>
                <label
                  htmlFor="spSearch"
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400"
                >
                  Arama
                </label>
                <div className="relative mt-2">
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
                    className="block w-full rounded-xl border border-slate-200 bg-white/90 py-3 pl-10 pr-3 text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-500/30"
                    placeholder="Parça ara..."
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Kategori
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {categories.map((c) => (
                     <button
                       key={c}
                       type="button"
                       onClick={() => setSelectedCategory(c)}
                       className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                         selectedCategory === c
                           ? 'border-indigo-500/40 bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                           : 'border-slate-200/70 bg-white/90 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-800/70'
                       }`}
                     >
                       {c}
                     </button>
                   ))}
                </div>
              </div>
              <div>
                <label
                  htmlFor="modelSelect"
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400"
                >
                  Model uyumu
                </label>
                <select
                  id="modelSelect"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="mt-2 block w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-3 text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-500/30"
                >
                  {machineModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.label}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  {selectedModel === 'Tümü'
                    ? 'Model seçerek uyumluluk listele.'
                    : `${selectedModelInfo?.label} filtreleniyor.`}
                </p>
              </div>
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 px-4 py-4 text-xs text-indigo-900 dark:border-indigo-400/40 dark:bg-slate-900/70 dark:text-indigo-200">
                {isLoading ? 'Yükleniyor...' : `${filtered.length} ürün listeleniyor`}
              </div>
              {favoriteError && <div className="text-xs text-red-600">{favoriteError}</div>}
          </div>
        </aside>

          <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] dark:border-slate-800/70 dark:bg-slate-950/40">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Ürün listesi
                </p>
                <p className="mt-2 text-base font-semibold text-slate-900">
                  {isLoading ? 'Yükleniyor...' : `${filtered.length} ürün bulundu`}
                </p>
              </div>
              <div className="hidden items-center gap-3 lg:flex">
                <label
                  htmlFor="sortSelect"
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400"
                >
                  Sıralama
                </label>
                <select
                  id="sortSelect"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="rounded-xl border border-slate-200/70 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:focus:ring-indigo-500/30"
                >
                  <option value="recommended">Öne çıkanlar</option>
                  <option value="price-asc">Fiyat (artan)</option>
                  <option value="price-desc">Fiyat (azalan)</option>
                  <option value="rating-desc">Puan (yüksek)</option>
                  <option value="name-asc">İsim (A-Z)</option>
                </select>
              </div>
            </div>
          {loadError && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-red-700">{loadError}</div>
          )}

            {!loadError && (
              <div ref={listRef}>
                {virtualizeList ? (
                  <VirtualizedPartsGridRows
                    items={sorted}
                    gridColumns={gridColumns}
                    scrollMargin={scrollMargin}
                    renderPartCard={renderPartCard}
                  />
                ) : (
                  <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                    {visibleItems.map((p, index) => renderPartCard(p, index))}
                  </section>
                )}
              </div>
            )}

          {!isLoading && !loadError && filtered.length === 0 && (
            <div className="py-14 text-center text-slate-600 dark:text-slate-300">
              Sonuç bulunamadı. Filtreleri değiştirip tekrar deneyebilirsiniz.
            </div>
          )}
        </div>
      </section>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[90] bg-black/45 px-4 py-6 backdrop-blur-sm lg:hidden">
          <div className="mx-auto h-full w-full max-w-xl overflow-y-auto rounded-3xl border border-slate-200/70 bg-white p-5 shadow-2xl dark:border-slate-800/70 dark:bg-slate-950">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                Filtreler
              </p>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                Kapat
              </button>
            </div>

            <div className="mt-4 space-y-5">
              <div>
                <label
                  htmlFor="spSearchMobile"
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400"
                >
                  Arama
                </label>
                <input
                  id="spSearchMobile"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mt-2 block w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-3 text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-500/30"
                  placeholder="Parca ara..."
                />
              </div>

              <div>
                <label
                  htmlFor="modelSelectMobile"
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400"
                >
                  Model uyumu
                </label>
                <select
                  id="modelSelectMobile"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="mt-2 block w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-3 text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-500/30"
                >
                  {machineModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Kategori
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <button
                      key={`m-${c}`}
                      type="button"
                      onClick={() => setSelectedCategory(c)}
                      className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                        selectedCategory === c
                          ? 'border-indigo-500/40 bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                          : 'border-slate-200/70 bg-white/90 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-800/70'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={resetFilters}
                disabled={activeFiltersCount === 0}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                Temizle
              </button>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-xl bg-indigo-600 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white"
              >
                Sonuclari Gor
              </button>
            </div>
          </div>
        </div>
      )}

      {compareIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 z-40 flex w-[92%] max-w-2xl -translate-x-1/2 items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-white/95 px-4 py-3 text-sm shadow-2xl dark:border-slate-800/70 dark:bg-slate-950/80">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-400">Karşılaştırma</div>
            <div className="font-semibold text-slate-900 dark:text-white">
              {compareIds.length} ürün seçildi {compareCategory ? `- ${compareCategory}` : ''}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCompareOpen(true)}
              className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
            >
              Karşılaştır
            </button>
          </div>
        </div>
      )}

      {compareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur">
          <div className="relative w-full max-w-6xl overflow-hidden rounded-[36px] border border-white/20 bg-white shadow-[0_30px_120px_rgba(15,23,42,0.35)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.15),_transparent_55%)]" />
            <div className="relative max-h-[85vh] overflow-y-auto p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-indigo-600">Karşılaştırma paneli</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Yedek parçaları yan yana gör</h2>
                  <p className="mt-2 text-sm text-slate-500">
                    {selectedCompare.length || 0} ürün seçildi. En fazla 3 ürün karşılaştırabilirsin.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCompareOpen(false);
                    setCompareIds([]);
                  }}
                  className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
                >
                  Kapat
                </button>
                </div>
              </div>

              {selectedCompare.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-200 px-6 py-8 text-sm text-slate-600">
                  Karşılaştırma için kartlardan en az 2 ürün seçmelisin.
                </div>
              ) : (
                <div className="mt-6 grid gap-5 lg:grid-cols-3">
                  {selectedCompare.map((item) => (
                    <div
                      key={item.id}
                      className="group relative overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-lg transition hover:-translate-y-1 hover:shadow-2xl"
                    >
                      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                        <Image
                          src={item.imageUrl || '/images/1.jpg'}
                          alt={item.name}
                          fill
                          sizes="(max-width: 1024px) 100vw, 320px"
                          className="object-cover transition duration-500 group-hover:scale-[1.03]"
                          quality={60}
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="absolute left-4 top-4 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-700">
                          <span className="rounded-full border border-white/70 bg-white/90 px-3 py-1">
                            {item.category.name}
                          </span>
                          <span className="rounded-full border border-white/70 bg-white/90 px-3 py-1">
                            {item.stockOnHand > 0 ? 'Stokta' : 'Siparişle'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-4 p-5">
                        <div>
                          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Ürün</div>
                          <div className="mt-2 text-lg font-semibold text-slate-900">{item.name}</div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          {renderStars(item.ratingAverage)}
                          <span className="font-semibold text-slate-700">{item.ratingAverage.toFixed(1)}</span>
                        </div>
                        <div className="grid gap-3 text-sm text-slate-600">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Stok</span>
                            <span className="font-semibold text-slate-900">{item.stockOnHand}</span>
                          </div>
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Ölçü</span>
                            <span className="font-semibold text-slate-900">{item.dimensions || '-'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Teslim</span>
                            <span className="font-semibold text-slate-900">
                              {item.stockOnHand > 0 ? '2-3 gün' : '7-10 gün'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
                          <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Fiyat</span>
                          <span className="text-base font-semibold text-slate-900">
                            {sparePartPriceVisible ? formatPriceTry(item.priceCents) : 'Fiyat icin teklif al'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {stockRequestOpen && stockRequestPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-amber-500">Stok talebi</div>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">Hızlı stok talebi oluştur</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {stockRequestPart.name} için öncelikli bilgilendirme istiyorum.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStockRequestOpen(false)}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-300"
              >
                Kapat
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Ad Soyad</label>
                <input
                  name="name"
                  value={stockRequestForm.name}
                  onChange={handleStockRequestChange}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
                  placeholder="Ad Soyad"
                />
              </div>
              <div className="sm:col-span-1">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">E-posta</label>
                <input
                  name="email"
                  type="email"
                  value={stockRequestForm.email}
                  onChange={handleStockRequestChange}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
                  placeholder="örnek@mail.com"
                />
                {stockRequestEmailError && (
                  <div className="mt-1 text-xs font-semibold text-red-600">{stockRequestEmailError}</div>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Telefon</label>
                <input
                  name="phone"
                  value={stockRequestForm.phone}
                  onChange={handleStockRequestChange}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
                  placeholder="05xx xxx xx xx"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Adet</label>
                <input
                  name="quantity"
                  value={stockRequestForm.quantity}
                  onChange={handleStockRequestChange}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
                  placeholder="1"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Not</label>
                <textarea
                  name="note"
                  value={stockRequestForm.note}
                  onChange={handleStockRequestChange}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
                  rows={3}
                  placeholder="Varsa ek bilgi..."
                />
              </div>
            </div>

            {stockRequestStep === 'verify' && (
              <div className="mt-4 space-y-2">
                <div className="text-sm text-slate-600">
                  Doğrulama kodunu e-posta adresine gönderdik. Kodu girip tamamla.
                </div>
                <input
                  name="otp"
                  inputMode="numeric"
                  value={stockRequestOtp}
                  onChange={(e) => setStockRequestOtp(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-center text-sm text-slate-900"
                  placeholder="000000"
                />
              </div>
            )}

            {stockRequestInfo && (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {stockRequestInfo}
              </div>
            )}

            {stockRequestStatus && (
              <div
                className={`mt-3 rounded-xl px-4 py-3 text-sm ${
                  stockRequestStatus.success
                    ? 'border border-indigo-200 bg-indigo-50 text-indigo-800'
                    : 'border border-red-200 bg-red-50 text-red-700'
                }`}
              >
                {stockRequestStatus.message}
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setStockRequestOpen(false)}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:border-slate-300"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={submitStockRequest}
                disabled={stockRequestLoading}
                className="rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-70"
              >
                {stockRequestLoading
                  ? 'Gönderiliyor...'
                  : stockRequestStep === 'verify'
                    ? 'Doğrula ve gönder'
                    : 'Talebi gönder'}
              </button>
            </div>
          </div>
        </div>
      )}

      {crossSell.length > 0 && (
        <section className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-lg dark:border-slate-800/70 dark:bg-slate-900/60">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-300">
                Satın alanlar bunları da aldı
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
                Tamamlayıcı parçalar
              </h2>
            </div>
            <Link
              href="/spare-parts"
              className="rounded-full border border-slate-200 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800/60"
            >
              Tüm yedek parçalar
            </Link>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {crossSell.map((item) => (
              <Link
                key={item.id}
                href={getPartHref(item.id)}
                className="group flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-white/80 p-4 transition-colors hover:border-indigo-200 dark:border-slate-800/60 dark:bg-slate-900/70 dark:hover:border-indigo-400/50"
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
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {sparePartPriceVisible ? formatPriceTry(getVisiblePriceCents(item)) : 'Fiyat icin teklif al'}
                  </p>
                </div>
                <span className="ml-auto text-indigo-600 dark:text-indigo-300">-&gt;</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function SparePartsPageClient({ initialItems = [] }: { initialItems?: SparePart[] }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <SparePartsPageContent initialItems={initialItems} />
    </Suspense>
  );
}


