import Link from 'next/link';

import { prisma } from '@/lib/prisma';

const quickLinks = [
  {
    title: 'Yedek Parçalar',
    description: 'Stok, fiyat ve vitrin ürünleri yönet.',
    href: '/admin/spare-parts',
    action: 'Yönet',
  },
  {
    title: 'Teklifler',
    description: 'Fiyat teklifi taleplerini görüntüle ve yanıtla.',
    href: '/admin/inquiries#quotes',
    action: 'Görüntüle',
  },
  {
    title: 'İletişim',
    description: 'İletişim mesajlarını takip et.',
    href: '/admin/inquiries#contact',
    action: 'Görüntüle',
  },
];

type PrismaClientLike = {
  sparePart: {
    count: (args?: unknown) => Promise<number>;
    findMany: (args: unknown) => Promise<
      Array<{
        id: string;
        name: string;
        stockOnHand: number;
        priceCents: number;
        isFeatured: boolean;
        isActive: boolean;
        updatedAt: Date;
        category: { name: string };
      }>
    >;
  };
  inquiry: {
    count: (args: unknown) => Promise<number>;
    findMany: (args: unknown) => Promise<
      Array<{
        id: string;
        type: 'CONTACT' | 'QUOTE';
        status: 'NEW' | 'READ' | 'CLOSED';
        name: string;
        email: string;
        message: string;
        createdAt: Date;
      }>
    >;
  };
  order: {
    count: (args?: unknown) => Promise<number>;
  };
  returnRequest: {
    count: (args?: unknown) => Promise<number>;
  };
  homePanelConfig: {
    findUnique: (args: unknown) => Promise<{ updatedAt: Date } | null>;
  };
};

const prismaAdmin = prisma as unknown as PrismaClientLike;

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

function formatDateTime(date: Date) {
  try {
    return new Intl.DateTimeFormat('tr-TR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 16).replace('T', ' ');
  }
}

export default async function AdminHomePage() {
  const [
    totalParts,
    activeParts,
    featuredParts,
    lowStockParts,
    newQuotes,
    newContacts,
    totalOrders,
    totalReturns,
    latestParts,
    recentInquiries,
    homePanels,
  ] = await Promise.all([
    prismaAdmin.sparePart.count(),
    prismaAdmin.sparePart.count({ where: { isActive: true } }),
    prismaAdmin.sparePart.count({ where: { isFeatured: true } }),
    prismaAdmin.sparePart.count({ where: { stockOnHand: { lte: 3 } } }),
    prismaAdmin.inquiry.count({ where: { type: 'QUOTE', status: 'NEW' } }),
    prismaAdmin.inquiry.count({ where: { type: 'CONTACT', status: 'NEW' } }),
    prismaAdmin.order.count(),
    prismaAdmin.returnRequest.count(),
    prismaAdmin.sparePart.findMany({
      take: 5,
      orderBy: { updatedAt: 'desc' },
      include: { category: true },
    }),
    prismaAdmin.inquiry.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        status: true,
        name: true,
        email: true,
        message: true,
        createdAt: true,
      },
    }),
    prismaAdmin.homePanelConfig.findUnique({ where: { id: 'home' }, select: { updatedAt: true } }),
  ]);

  const stats = [
    { label: 'Toplam Parça', value: totalParts },
    { label: 'Aktif Parça', value: activeParts },
    { label: 'Vitrin', value: featuredParts },
    { label: 'Düşük Stok', value: lowStockParts },
    { label: 'Yeni Teklif', value: newQuotes },
    { label: 'Yeni İletişim', value: newContacts },
  ];

  const statusBadge = (status: 'NEW' | 'READ' | 'CLOSED') => {
    if (status === 'NEW') return 'bg-green-100 text-green-800';
    if (status === 'READ') return 'bg-yellow-100 text-yellow-800';
    return 'bg-slate-200 text-slate-700';
  };

  const typeLabel = (type: 'CONTACT' | 'QUOTE') => (type === 'QUOTE' ? 'Teklif' : 'İletişim');

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-lg font-bold text-slate-900">Admin Anasayfa</div>
            <div className="mt-1 text-sm text-slate-600">
              Yedek parça, stok ve iletişim taleplerini tek ekrandan takip et.
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/spare-parts"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800"
            >
              Yedek Parça
            </Link>
            <Link
              href="/admin/inquiries#quotes"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 text-slate-900 hover:bg-slate-50"
            >
              Teklifler
            </Link>
            <Link
              href="/admin/inquiries#contact"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 text-slate-900 hover:bg-slate-50"
            >
              İletişim
            </Link>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400">
                <span>{stat.label}</span>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-indigo-600 shadow-sm">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                    <path d="M12 2l8 4v12l-8 4-8-4V6l8-4zm0 2.3L6 6.1v9.8l6 2.8 6-2.8V6.1L12 4.3z" />
                  </svg>
                </span>
              </div>
              <div className="mt-3 text-2xl font-semibold text-slate-900">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: 'Siparişler',
              description: 'Tüm siparişleri anında izle.',
              href: '/admin/orders',
              count: totalOrders,
              tone: 'border-indigo-200',
            },
            {
              title: 'İadeler',
              description: 'İade taleplerini yönet.',
              href: '/admin/returns',
              count: totalReturns,
              tone: 'border-indigo-200',
            },
            {
              title: 'Talepler',
              description: 'Teklif ve iletişim kutusu.',
              href: '/admin/inquiries',
              count: newQuotes + newContacts,
              tone: 'border-amber-200',
            },
            {
              title: 'Ürünler',
              description: 'Stok, vitrin ve fiyatlar.',
              href: '/admin/spare-parts',
              count: totalParts,
              tone: 'border-slate-200',
            },
          ].map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className={`group rounded-2xl border bg-white p-4 transition hover:shadow-md ${card.tone}`}
            >
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span className="text-xs uppercase tracking-[0.2em]">{card.title}</span>
                <span className="rounded-full bg-slate-900 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                  {card.count}
                </span>
              </div>
              <div className="mt-3 text-sm font-semibold text-slate-900">{card.description}</div>
              <div className="mt-4 inline-flex items-center text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
                Hemen git
                <span className="ml-1 transition group-hover:translate-x-1">-&gt;</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-indigo-600">Anasayfa panelleri</div>
              <div className="mt-2 text-sm text-slate-600">
                Son güncelleme: {homePanels ? formatDateTime(homePanels.updatedAt) : 'Henüz ayarlanmadı'}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Ana sayfadaki 3 blok (kapasite, fiyat alarmı, satın alma) buradan yönetilir.
              </div>
            </div>
            <Link
              href="/admin/site-config"
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300"
            >
              Panelleri düzenle
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-base font-semibold text-slate-900">Güncel Stok</div>
                <div className="text-sm text-slate-600">Son güncellenen 5 ürün</div>
              </div>
              <Link href="/admin/spare-parts" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                Tümünü gör
              </Link>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {latestParts.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {p.name}{' '}
                      {!p.isActive && (
                        <span className="ml-1 rounded-full bg-slate-200 text-slate-700 px-2 py-0.5 text-[11px] font-semibold">
                          Pasif
                        </span>
                      )}
                      {p.isFeatured && (
                        <span className="ml-1 rounded-full bg-slate-900 text-white px-2 py-0.5 text-[11px] font-semibold">
                          Vitrin
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-600">
                      {p.category.name} - Stok: {p.stockOnHand} - {formatPriceTry(p.priceCents)}
                    </div>
                  </div>
                  <Link
                    href={`/admin/spare-parts/${p.id}`}
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    Düzenle
                  </Link>
                </div>
              ))}
              {latestParts.length === 0 && (
                <div className="py-6 text-sm text-slate-600">Henüz ürün yok.</div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-base font-semibold text-slate-900">Hızlı İşlemler</div>
                <div className="text-sm text-slate-600">Sık kullanılan sayfalara kısa yollar</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 hover:border-slate-300 transition"
                >
                  <div className="text-sm font-semibold text-slate-900">{link.title}</div>
                  <div className="mt-1 text-xs text-slate-600">{link.description}</div>
                  <div className="mt-3 text-sm font-semibold text-indigo-600 hover:text-indigo-700">{link.action}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-base font-semibold text-slate-900">Son Talepler</div>
            <div className="text-sm text-slate-600">Son 5 teklif/iletisim talebi</div>

            <div className="mt-4 space-y-3">
              {recentInquiries.map((inq) => (
                <div key={inq.id} className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-slate-900">
                      {inq.name || 'İsim yok'} - {inq.email}
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusBadge(inq.status)}`}>
                      {typeLabel(inq.type)} - {inq.status === 'NEW' ? 'Yeni' : inq.status === 'READ' ? 'Okundu' : 'Kapalı'}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">{formatDateTime(inq.createdAt)}</div>
                  <div className="mt-2 text-sm text-slate-700 line-clamp-2">{inq.message}</div>
                </div>
              ))}
              {recentInquiries.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-600">
                  Henüz talep yok.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}







