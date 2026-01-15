import Link from 'next/link';

import { prisma } from '@/lib/prisma';

const quickLinks = [
  {
    title: 'Yedek Parcalar',
    description: 'Stok, fiyat ve vitrin urunlerini yonet.',
    href: '/admin/spare-parts',
    action: 'Yonet',
  },
  {
    title: 'Teklifler',
    description: 'Fiyat teklifi taleplerini goruntule ve yanitla.',
    href: '/admin/inquiries#quotes',
    action: 'Goruntule',
  },
  {
    title: 'Iletisim',
    description: 'Iletisim mesajlarini takip et.',
    href: '/admin/inquiries#contact',
    action: 'Goruntule',
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
    { label: 'Toplam Parca', value: totalParts },
    { label: 'Aktif Parca', value: activeParts },
    { label: 'Vitrin', value: featuredParts },
    { label: 'Dusuk Stok', value: lowStockParts },
    { label: 'Yeni Teklif', value: newQuotes },
    { label: 'Yeni Iletisim', value: newContacts },
  ];

  const statusBadge = (status: 'NEW' | 'READ' | 'CLOSED') => {
    if (status === 'NEW') return 'bg-green-100 text-green-800';
    if (status === 'READ') return 'bg-yellow-100 text-yellow-800';
    return 'bg-slate-200 text-slate-700';
  };

  const typeLabel = (type: 'CONTACT' | 'QUOTE') => (type === 'QUOTE' ? 'Teklif' : 'Iletisim');

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-lg font-bold text-slate-900">Admin Dashboard</div>
            <div className="mt-1 text-sm text-slate-600">
              Yedek parca, stok ve iletisim taleplerini tek ekrandan takip et.
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/spare-parts"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800"
            >
              Yedek Parca
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
              Iletisim
            </Link>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>{stat.label}</span>
                <span className="h-2 w-2 rounded-full bg-teal-500" />
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: 'Siparisler',
              description: 'Tum siparisleri aninda izle.',
              href: '/admin/orders',
              count: totalOrders,
            },
            {
              title: 'Iadeler',
              description: 'Iade taleplerini yonet.',
              href: '/admin/returns',
              count: totalReturns,
            },
            {
              title: 'Talepler',
              description: 'Teklif ve iletisim kutusu.',
              href: '/admin/inquiries',
              count: newQuotes + newContacts,
            },
            {
              title: 'Urunler',
              description: 'Stok, vitrin ve fiyatlar.',
              href: '/admin/spare-parts',
              count: totalParts,
            },
          ].map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-teal-300 hover:bg-white hover:shadow-md"
            >
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>{card.title}</span>
                <span className="rounded-full bg-slate-900 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                  {card.count}
                </span>
              </div>
              <div className="mt-3 text-sm font-semibold text-slate-900">{card.description}</div>
              <div className="mt-4 inline-flex items-center text-xs font-semibold uppercase tracking-[0.2em] text-teal-600">
                Hemen git
                <span className="ml-1 transition group-hover:translate-x-1">-&gt;</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-teal-600">Anasayfa panelleri</div>
              <div className="mt-2 text-sm text-slate-600">
                Son guncelleme: {homePanels ? formatDateTime(homePanels.updatedAt) : 'Henuz ayarlanmadı'}
              </div>
            </div>
            <Link
              href="/admin/site-config"
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300"
            >
              Panelleri duzenle
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-base font-semibold text-slate-900">Guncel Stok</div>
                <div className="text-sm text-slate-600">Son guncellenen 5 urun</div>
              </div>
              <Link href="/admin/spare-parts" className="text-sm font-semibold text-teal-600 hover:text-teal-700">
                Tumunu gor
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
                      {p.category.name} · Stok: {p.stockOnHand} · {formatPriceTry(p.priceCents)}
                    </div>
                  </div>
                  <Link
                    href={`/admin/spare-parts/${p.id}`}
                    className="text-sm font-semibold text-teal-600 hover:text-teal-700"
                  >
                    Duzenle
                  </Link>
                </div>
              ))}
              {latestParts.length === 0 && (
                <div className="py-6 text-sm text-slate-600">Henuz urun yok.</div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-base font-semibold text-slate-900">Hizli Islemler</div>
                <div className="text-sm text-slate-600">Sik kullanilan sayfalara kisa yollar</div>
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
                  <div className="mt-3 text-sm font-semibold text-teal-600 hover:text-teal-700">{link.action}</div>
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
                      {inq.name || 'Isim yok'} · {inq.email}
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusBadge(inq.status)}`}>
                      {typeLabel(inq.type)} · {inq.status === 'NEW' ? 'Yeni' : inq.status === 'READ' ? 'Okundu' : 'Kapali'}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">{formatDateTime(inq.createdAt)}</div>
                  <div className="mt-2 text-sm text-slate-700 line-clamp-2">{inq.message}</div>
                </div>
              ))}
              {recentInquiries.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-600">
                  Henuz talep yok.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}






