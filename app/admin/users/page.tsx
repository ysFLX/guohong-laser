import Link from 'next/link';

/* eslint-disable @next/next/no-img-element */
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { prisma } from '@/lib/prisma';

type AdminUserRow = {
  id: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  image: string | null;
  role: string;
  twoFactorEnabled: boolean;
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    orders: number;
    addresses: number;
    favorites: number;
  };
};

type PrismaClientLike = {
  user: {
    count: (args?: unknown) => Promise<number>;
    findMany: (args: unknown) => Promise<AdminUserRow[]>;
  };
};

const prismaAdmin = prisma as unknown as PrismaClientLike;
const PAGE_SIZE = 25;

function formatDateTime(date: Date) {
  try {
    return new Intl.DateTimeFormat('tr-TR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  } catch {
    return date.toISOString();
  }
}

function getPageNumber(value?: string) {
  const parsed = Number(value || '1');
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.floor(parsed);
}

function getDisplayName(user: AdminUserRow) {
  return (
    user.name ||
    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
    user.email ||
    'İsimsiz üye'
  );
}

function getInitials(user: AdminUserRow) {
  const source = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.name || user.email || 'U';
  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; page?: string }>;
}) {
  const resolved = await searchParams;
  const query = typeof resolved.q === 'string' ? resolved.q.trim() : '';
  const role = typeof resolved.role === 'string' ? resolved.role.trim().toUpperCase() : 'ALL';
  const page = getPageNumber(resolved.page);
  const where: Record<string, unknown> = {};

  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { firstName: { contains: query, mode: 'insensitive' } },
      { lastName: { contains: query, mode: 'insensitive' } },
      { email: { contains: query, mode: 'insensitive' } },
      { phone: { contains: query, mode: 'insensitive' } },
    ];
  }

  if (role === 'ADMIN' || role === 'USER') {
    where.role = role;
  }

  const skip = (page - 1) * PAGE_SIZE;

  const [totalUsers, adminCount, verifiedCount, recentUsers, users] = await Promise.all([
    prismaAdmin.user.count(),
    prismaAdmin.user.count({ where: { role: 'ADMIN' } }),
    prismaAdmin.user.count({ where: { emailVerified: { not: null } } }),
    prismaAdmin.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        role: true,
      },
    }),
    prismaAdmin.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: PAGE_SIZE,
      skip,
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        image: true,
        role: true,
        twoFactorEnabled: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
            addresses: true,
            favorites: true,
          },
        },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalUsers / PAGE_SIZE));
  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;

  const stats = [
    { label: 'Toplam üye', value: totalUsers },
    { label: 'Admin', value: adminCount },
    { label: 'Doğrulanmış e-posta', value: verifiedCount },
    { label: 'Son kayıtlar', value: recentUsers.length },
  ];

  const roleLabel = (value: string) => {
    if (value === 'ADMIN') return 'Admin';
    return 'Üye';
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Üye merkezi"
        title="Kayıtlı üyeler"
        description="Sitede üye olan kullanıcıları, iletişim bilgileri ve hesap durumlarıyla birlikte görüntüle."
        actions={
          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-2 text-xs font-semibold text-[var(--admin-text)] shadow-sm hover:bg-[var(--admin-card-muted)]"
          >
            Ana panele dön
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--admin-muted)]">{stat.label}</div>
            <div className="mt-2 text-2xl font-semibold text-[var(--admin-text)]">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5 shadow-[var(--admin-shadow)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-base font-semibold text-[var(--admin-text)]">Üye listesi</div>
            <div className="text-sm text-[var(--admin-muted)]">
              Toplam {totalUsers} kayıtlı üye. Sayfa {page} / {totalPages}
            </div>
          </div>
          <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto]">
            <input
              name="q"
              defaultValue={query}
              placeholder="İsim, e-posta, telefon ara"
              className="w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-3 text-sm text-[var(--admin-text)] shadow-sm placeholder:text-[var(--admin-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-accent)]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--admin-bg)]"
            />
            <select
              name="role"
              defaultValue={role === 'ADMIN' || role === 'USER' ? role : 'ALL'}
              className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-3 text-sm text-[var(--admin-text)] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-accent)]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--admin-bg)]"
            >
              <option value="ALL">Tüm roller</option>
              <option value="USER">Üyeler</option>
              <option value="ADMIN">Adminler</option>
            </select>
            <button
              type="submit"
              className="rounded-2xl bg-[var(--admin-accent)] px-5 py-3 text-sm font-semibold text-[var(--admin-accent-contrast)] shadow-sm hover:opacity-95"
            >
              Filtrele
            </button>
          </form>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--admin-border)]">
          <div className="hidden grid-cols-[1.2fr_1.2fr_1fr_1fr_1fr_1fr] bg-[var(--admin-card-muted)] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--admin-muted)] md:grid">
            <div>Üye</div>
            <div>İletişim</div>
            <div>Rol</div>
            <div>Durum</div>
            <div>Hesap</div>
            <div>Kayıt</div>
          </div>

          <div className="divide-y divide-[var(--admin-border)]">
            {users.map((user) => {
              const displayName = getDisplayName(user);
              const emailStatus = user.emailVerified ? 'Doğrulandı' : 'Bekliyor';

              return (
                <div
                  key={user.id}
                  className="grid gap-3 px-4 py-4 md:grid-cols-[1.2fr_1.2fr_1fr_1fr_1fr_1fr] md:items-center"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--admin-accent)]/12 text-sm font-semibold text-[var(--admin-accent)]">
                      {user.image ? (
                        <img src={user.image} alt={displayName} className="h-11 w-11 rounded-2xl object-cover" />
                      ) : (
                        getInitials(user)
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--admin-text)]">{displayName}</div>
                      <div className="text-xs text-[var(--admin-muted)]">ID: {user.id.slice(0, 8)}</div>
                    </div>
                  </div>

                  <div className="text-sm text-[var(--admin-muted)]">
                    <div>{user.email || 'E-posta yok'}</div>
                    <div>{user.phone || 'Telefon yok'}</div>
                  </div>

                  <div>
                    <span className="inline-flex rounded-full bg-[var(--admin-card-muted)] px-3 py-1 text-xs font-semibold text-[var(--admin-text)]">
                      {roleLabel(user.role)}
                    </span>
                  </div>

                  <div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        user.emailVerified
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {emailStatus}
                    </span>
                  </div>

                  <div className="text-sm text-[var(--admin-muted)]">
                    <div>{user.twoFactorEnabled ? '2FA açık' : '2FA kapalı'}</div>
                    <div>
                      {user._count.orders} sipariş, {user._count.addresses} adres
                    </div>
                  </div>

                  <div className="text-sm text-[var(--admin-muted)]">{formatDateTime(user.createdAt)}</div>
                </div>
              );
            })}

            {users.length === 0 && (
              <div className="px-4 py-10 text-center text-sm text-[var(--admin-muted)]">
                Sonuç bulunamadı.
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="text-sm text-[var(--admin-muted)]">
            Sayfa {page} / {totalPages}
          </div>
          <div className="flex items-center gap-2">
            {prevPage ? (
              <Link
                href={`/admin/users?page=${prevPage}${query ? `&q=${encodeURIComponent(query)}` : ''}${role && role !== 'ALL' ? `&role=${encodeURIComponent(role)}` : ''}`}
                className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-2 text-sm font-semibold text-[var(--admin-text)] shadow-sm hover:bg-[var(--admin-card-muted)]"
              >
                Önceki
              </Link>
            ) : null}
            {nextPage ? (
              <Link
                href={`/admin/users?page=${nextPage}${query ? `&q=${encodeURIComponent(query)}` : ''}${role && role !== 'ALL' ? `&role=${encodeURIComponent(role)}` : ''}`}
                className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-2 text-sm font-semibold text-[var(--admin-text)] shadow-sm hover:bg-[var(--admin-card-muted)]"
              >
                Sonraki
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

