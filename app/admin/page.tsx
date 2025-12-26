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
    href: '/admin/inquiries/quotes',
    action: 'Goruntule',
  },
  {
    title: 'Iletisim',
    description: 'Iletisim mesajlarini takip et.',
    href: '/admin/inquiries/contact',
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
    latestParts,
    recentInquiries,
  ] = await Promise.all([
    prismaAdmin.sparePart.count(),
    prismaAdmin.sparePart.count({ where: { isActive: true } }),
    prismaAdmin.sparePart.count({ where: { isFeatured: true } }),
    prismaAdmin.sparePart.count({ where: { stockOnHand: { lte: 3 } } }),
    prismaAdmin.inquiry.count({ where: { type: 'QUOTE', status: 'NEW' } }),
    prismaAdmin.inquiry.count({ where: { type: 'CONTACT', status: 'NEW' } }),
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
    return 'bg-gray-200 text-gray-700';
  };

  const typeLabel = (type: 'CONTACT' | 'QUOTE') => (type === 'QUOTE' ? 'Teklif' : 'Iletisim');

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">Admin Dashboard</div>
            <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Yedek parca, stok ve iletisim taleplerini tek ekrandan takip et.
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/spare-parts"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800"
            >
              Yedek Parca
            </Link>
            <Link
              href="/admin/inquiries/quotes"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Teklifler
            </Link>
            <Link
              href="/admin/inquiries/contact"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Iletisim
            </Link>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4"
            >
              <div className="text-sm text-gray-600 dark:text-gray-300">{stat.label}</div>
              <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-base font-semibold text-gray-900 dark:text-white">Guncel Stok</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Son guncellenen 5 urun</div>
              </div>
              <Link href="/admin/spare-parts" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
                Tumunu gor
              </Link>
            </div>

            <div className="mt-4 divide-y divide-gray-100 dark:divide-gray-700">
              {latestParts.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {p.name}{' '}
                      {!p.isActive && (
                        <span className="ml-1 rounded-full bg-gray-200 text-gray-700 px-2 py-0.5 text-[11px] font-semibold">
                          Pasif
                        </span>
                      )}
                      {p.isFeatured && (
                        <span className="ml-1 rounded-full bg-gray-900 text-white px-2 py-0.5 text-[11px] font-semibold">
                          Vitrin
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">
                      {p.category.name} Â· Stok: {p.stockOnHand} Â· {formatPriceTry(p.priceCents)}
                    </div>
                  </div>
                  <Link
                    href={`/admin/spare-parts/${p.id}`}
                    className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                  >
                    Duzenle
                  </Link>
                </div>
              ))}
              {latestParts.length === 0 && (
                <div className="py-6 text-sm text-gray-600 dark:text-gray-300">Henuz urun yok.</div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-base font-semibold text-gray-900 dark:text-white">Hizli Islemler</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Sik kullanilan sayfalara kisa yollar</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4 hover:border-gray-300 dark:hover:border-gray-600 transition"
                >
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">{link.title}</div>
                  <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">{link.description}</div>
                  <div className="mt-3 text-sm font-semibold text-emerald-600 hover:text-emerald-700">{link.action}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
            <div className="text-base font-semibold text-gray-900 dark:text-white">Son Talepler</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Son 5 teklif/iletisim talebi</div>

            <div className="mt-4 space-y-3">
              {recentInquiries.map((inq) => (
                <div key={inq.id} className="rounded-xl border border-gray-100 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-900/40">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {inq.name || 'Isim yok'} Â· {inq.email}
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusBadge(inq.status)}`}>
                      {typeLabel(inq.type)} Â· {inq.status === 'NEW' ? 'Yeni' : inq.status === 'READ' ? 'Okundu' : 'Kapali'}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-300">{formatDateTime(inq.createdAt)}</div>
                  <div className="mt-2 text-sm text-gray-700 dark:text-gray-200 line-clamp-2">{inq.message}</div>
                </div>
              ))}
              {recentInquiries.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 p-4 text-sm text-gray-600 dark:text-gray-300">
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


