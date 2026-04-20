'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { AdminBadge, AdminButton, AdminRadioCard } from '@/components/admin/AdminUi';

type OrderItem = {
  id: string;
  name: string;
  imageUrl: string | null;
  quantity: number;
  priceCents: number;
};

type OrderUser = {
  name: string | null;
  email: string | null;
};

type OrderAddress = {
  label: string | null;
  fullName: string | null;
  phone: string | null;
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
};

type OrderInvoice = {
  id: string;
  status: string;
  issuedAt: string | null;
  invoiceNumber: string | null;
  ettn: string | null;
  errorMessage: string | null;
} | null;

type AdminOrder = {
  id: string;
  status: string;
  totalCents: number;
  currency: string;
  createdAt: string;
  shippingCarrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  user: OrderUser | null;
  shippingAddress: OrderAddress | null;
  billingAddress: OrderAddress | null;
  invoice: OrderInvoice;
  items: OrderItem[];
};

const statusOptions = [
  { value: 'RECEIVED', label: 'Sipariş alındı' },
  { value: 'IN_TRANSIT', label: 'Sipariş hazırlanıyor' },
  { value: 'SHIPPED', label: 'Kargoya verildi' },
  { value: 'DELIVERED', label: 'Teslim edildi' },
  { value: 'CANCELED', label: 'İptal' },
];

const statusLabel = statusOptions.reduce<Record<string, string>>((acc, item) => {
  acc[item.value] = item.label;
  return acc;
}, {});

const normalizeStatus = (value: string) => {
  if (value === 'PAID' || value === 'PENDING' || value === 'FAILED') {
    return 'RECEIVED';
  }
  return value;
};

const statusTone = (value: string) => {
  switch (value) {
    case 'DELIVERED':
      return 'emerald';
    case 'SHIPPED':
      return 'indigo';
    case 'IN_TRANSIT':
      return 'amber';
    case 'CANCELED':
      return 'rose';
    default:
      return 'slate';
  }
};

const statusAccent = (value: string) => {
  switch (value) {
    case 'DELIVERED':
      return 'border-l-emerald-500';
    case 'SHIPPED':
      return 'border-l-indigo-500';
    case 'IN_TRANSIT':
      return 'border-l-amber-500';
    case 'CANCELED':
      return 'border-l-rose-500';
    default:
      return 'border-l-[var(--admin-border)]';
  }
};

const invoiceLabel = (value?: string | null) => {
  switch (value) {
    case 'ISSUED':
      return 'Fatura hazır';
    case 'PROCESSING':
      return 'Fatura işleniyor';
    case 'PENDING':
      return 'Fatura sırada';
    case 'FAILED':
      return 'Fatura hata';
    default:
      return 'Fatura yok';
  }
};

const invoiceTone = (value?: string | null) => {
  switch (value) {
    case 'ISSUED':
      return 'emerald';
    case 'FAILED':
      return 'rose';
    case 'PROCESSING':
    case 'PENDING':
      return 'amber';
    default:
      return 'slate';
  }
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

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString('tr-TR');
  } catch {
    return value;
  }
}

function formatAddress(address: OrderAddress | null) {
  if (!address) return null;
  const line2 = address.line2 ? `, ${address.line2}` : '';
  const cityLine = `${address.city || '-'}${address.state ? ` / ${address.state}` : ''} ${address.postalCode || ''}`.trim();
  const country = address.country || '';
  return {
    title: address.label || 'Adres',
    fullName: address.fullName || '-',
    line1: `${address.line1 || '-'}${line2}`,
    city: `${cityLine} ${country}`.trim(),
    phone: address.phone || '-',
  };
}

export default function OrdersAdminManager() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [invoicingId, setInvoicingId] = useState<string | null>(null);
  const [batchInvoicing, setBatchInvoicing] = useState(false);
  const [draftStatus, setDraftStatus] = useState<Record<string, string>>({});
  const [draftTracking, setDraftTracking] = useState<Record<string, { carrier: string; number: string; url: string }>>(
    {},
  );
  const [cancelDialogId, setCancelDialogId] = useState<string | null>(null);
  const [cancelReasonDraft, setCancelReasonDraft] = useState<Record<string, string>>({});
  const [cancelReasonError, setCancelReasonError] = useState<Record<string, string>>({});
  const [cancelPrevStatus, setCancelPrevStatus] = useState<Record<string, string>>({});
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'RECEIVED' | 'IN_TRANSIT' | 'SHIPPED' | 'DELIVERED' | 'CANCELED'>('ALL');

  const totalOrders = useMemo(() => orders.length, [orders.length]);
  const latestOrder = useMemo(() => {
    if (!orders.length) return null;
    return orders.reduce((latest, order) =>
      new Date(order.createdAt).getTime() > new Date(latest.createdAt).getTime() ? order : latest,
    );
  }, [orders]);
  const statusCounts = useMemo(() => {
    return orders.reduce<Record<string, number>>((acc, order) => {
      const normalized = normalizeStatus(order.status);
      acc[normalized] = (acc[normalized] || 0) + 1;
      return acc;
    }, {});
  }, [orders]);
  const queuedInvoiceCount = useMemo(() => {
    return orders.reduce((acc, order) => {
      const status = order.invoice?.status;
      if (status === 'PENDING' || status === 'FAILED') return acc + 1;
      return acc;
    }, 0);
  }, [orders]);
  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return orders.filter((order) => {
      const normalized = normalizeStatus(order.status);
      const matchesStatus = statusFilter === 'ALL' || normalized === statusFilter;
      if (!matchesStatus) return false;
      if (!query) return true;
      const idMatch = order.id.toLowerCase().includes(query);
      const nameMatch = (order.user?.name || '').toLowerCase().includes(query);
      const emailMatch = (order.user?.email || '').toLowerCase().includes(query);
      const itemMatch = order.items.some((item) => item.name.toLowerCase().includes(query));
      return idMatch || nameMatch || emailMatch || itemMatch;
    });
  }, [orders, searchQuery, statusFilter]);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    const initial = searchParams?.get('q') || '';
    if (initial) {
      setSearchQuery(initial);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 4500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  async function loadOrders(options?: { expandId?: string }) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Siparişler yüklenemedi');
      const list = (data.items || []) as AdminOrder[];
      setOrders(list);
      const initialExpand = options?.expandId || list[0]?.id || '';
      setExpandedIds(new Set(initialExpand ? [initialExpand] : []));
      setDraftStatus(
        list.reduce<Record<string, string>>((acc, item) => {
          acc[item.id] = normalizeStatus(item.status);
          return acc;
        }, {}),
      );
      setDraftTracking(
        list.reduce<Record<string, { carrier: string; number: string; url: string }>>((acc, item) => {
          acc[item.id] = {
            carrier: item.shippingCarrier || '',
            number: item.trackingNumber || '',
            url: item.trackingUrl || '',
          };
          return acc;
        }, {}),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Siparişler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  async function generateInvoice(orderId: string) {
    if (invoicingId) return;
    setInvoicingId(orderId);
    setError('');
    setNotice('');

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ processNow: false }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Fatura oluşturulamadı');
      }
      setNotice(data?.item?.status === 'ISSUED' ? 'Fatura oluşturuldu.' : 'Fatura sıraya alındı.');
      await loadOrders({ expandId: orderId });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Fatura oluşturulamadı';
      setError(message);
    } finally {
      setInvoicingId(null);
    }
  }

  async function generateQueuedInvoices() {
    if (batchInvoicing) return;
    if (queuedInvoiceCount === 0) {
      setNotice('Sırada fatura yok.');
      return;
    }

    const limit = Math.min(25, Math.max(1, queuedInvoiceCount));
    const ok = window.confirm(
      `Sıradaki ${limit} proforma faturayı oluşturup müşterilerin e-posta adresine göndereyim mi?`,
    );
    if (!ok) return;

    setBatchInvoicing(true);
    setError('');
    setNotice('');

    try {
      const res = await fetch('/api/admin/invoices/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Faturalar oluşturulamadı');
      }

      const issued = Number(data?.issuedCount || 0);
      const emailed = Number(data?.emailedCount || 0);
      const errorCount = Number(data?.errorCount || 0);

      setNotice(
        [`${issued} fatura oluşturuldu`, `${emailed} e-posta gönderildi`, errorCount ? `${errorCount} hata` : null]
          .filter(Boolean)
          .join(' â€¢ '),
      );

      await loadOrders();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Faturalar oluşturulamadı';
      setError(message);
    } finally {
      setBatchInvoicing(false);
    }
  }

  async function saveStatus(orderId: string, cancelReason?: string) {
    const nextStatus = draftStatus[orderId];
    if (!nextStatus) return;
    setSavingId(orderId);
    setError('');
    try {
      const tracking = draftTracking[orderId] || { carrier: '', number: '', url: '' };
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatus,
          shippingCarrier: tracking.carrier,
          trackingNumber: tracking.number,
          trackingUrl: tracking.url,
          cancelReason: cancelReason || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Durum güncellenemedi');
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: nextStatus,
                shippingCarrier: tracking.carrier || null,
                trackingNumber: tracking.number || null,
                trackingUrl: tracking.url || null,
              }
            : order,
        ),
      );
      setCancelDialogId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Durum güncellenemedi');
    } finally {
      setSavingId(null);
    }
  }

  const openCancelDialog = (orderId: string) => {
    setCancelDialogId(orderId);
    setCancelReasonError((prev) => ({ ...prev, [orderId]: '' }));
  };

  const confirmCancel = (orderId: string) => {
    const reason = cancelReasonDraft[orderId]?.trim();
    if (!reason) {
      setCancelReasonError((prev) => ({
        ...prev,
        [orderId]: 'İptal nedeni yazılması gerekiyor.',
      }));
      return;
    }
    saveStatus(orderId, reason);
  };

  const closeCancelDialog = (orderId: string) => {
    setCancelDialogId(null);
    setCancelReasonError((prev) => ({ ...prev, [orderId]: '' }));
    if (cancelPrevStatus[orderId]) {
      setDraftStatus((prev) => ({
        ...prev,
        [orderId]: cancelPrevStatus[orderId],
      }));
    }
  };

  const cancelOrder = orders.find((order) => order.id === cancelDialogId) || null;
  const toggleExpanded = (orderId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-[var(--admin-shadow)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--admin-muted)]">Sipariş yönetimi</p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--admin-text)]">Operasyon merkezi</h2>
            <p className="mt-1 text-sm text-[var(--admin-muted)]">Tüm siparişleri tek ekrandan takip et.</p>
          </div>
          <div className="flex items-center gap-2">
            <AdminButton onClick={() => loadOrders()} tone="slate" variant="outline">
              Yenile
            </AdminButton>
            <AdminButton
              onClick={generateQueuedInvoices}
              tone="indigo"
              disabled={batchInvoicing || queuedInvoiceCount === 0}
            >
              {batchInvoicing ? 'Oluşturuluyorâ€¦' : 'Faturaları oluştur'}
            </AdminButton>
            <AdminBadge tone="slate">{totalOrders} sipariş</AdminBadge>
          </div>
        </div>
        <div className="mt-5 grid gap-3 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-muted)] px-4 py-4 md:grid-cols-[1.2fr_2fr]">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--admin-muted)]">Hızlı arama</div>
            <div className="mt-2 flex items-center gap-2 rounded-full border border-[var(--admin-border)] bg-[var(--admin-card)] px-3 py-2 shadow-sm">
              <svg
                viewBox="0 0 20 20"
                className="h-4 w-4 text-[var(--admin-muted)]"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Sipariş no, müşteri, e-posta veya ürün ara"
                className="w-full bg-transparent text-sm text-[var(--admin-text)] placeholder:text-[var(--admin-muted)] focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="rounded-full border border-[var(--admin-border)] bg-[var(--admin-card-muted)] px-3 py-1 text-[11px] font-semibold text-[var(--admin-muted)] transition hover:text-[var(--admin-text)]"
                >
                  Temizle
                </button>
              )}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--admin-muted)]">Durum filtre</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                { value: 'ALL', label: 'Hepsi' },
                { value: 'RECEIVED', label: 'Alındı' },
                { value: 'IN_TRANSIT', label: 'Hazırlanıyor' },
                { value: 'SHIPPED', label: 'Kargoda' },
                { value: 'DELIVERED', label: 'Teslim' },
                { value: 'CANCELED', label: 'İptal' },
              ].map((item) => (
                <AdminRadioCard
                  key={item.value}
                  active={statusFilter === item.value}
                  onClick={() => setStatusFilter(item.value as typeof statusFilter)}
                >
                  {item.label}
                </AdminRadioCard>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-muted)] px-4 py-4">
            <div className="text-xs uppercase tracking-[0.3em] text-[var(--admin-muted)]">Toplam</div>
            <div className="mt-2 text-2xl font-semibold text-[var(--admin-text)]">{totalOrders}</div>
          </div>
          <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-muted)] px-4 py-4">
            <div className="text-xs uppercase tracking-[0.3em] text-[var(--admin-muted)]">Alındı</div>
            <div className="mt-2 text-2xl font-semibold text-[var(--admin-text)]">{statusCounts.RECEIVED || 0}</div>
          </div>
          <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-muted)] px-4 py-4">
            <div className="text-xs uppercase tracking-[0.3em] text-[var(--admin-muted)]">Hazırlanıyor</div>
            <div className="mt-2 text-2xl font-semibold text-[var(--admin-text)]">{statusCounts.IN_TRANSIT || 0}</div>
          </div>
          <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-muted)] px-4 py-4">
            <div className="text-xs uppercase tracking-[0.3em] text-[var(--admin-muted)]">Kargoda</div>
            <div className="mt-2 text-2xl font-semibold text-[var(--admin-text)]">{statusCounts.SHIPPED || 0}</div>
          </div>
          <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-muted)] px-4 py-4">
            <div className="text-xs uppercase tracking-[0.3em] text-[var(--admin-muted)]">Teslim</div>
            <div className="mt-2 text-2xl font-semibold text-[var(--admin-text)]">{statusCounts.DELIVERED || 0}</div>
          </div>
          <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-muted)] px-4 py-4">
            <div className="text-xs uppercase tracking-[0.3em] text-[var(--admin-muted)]">İptal</div>
            <div className="mt-2 text-2xl font-semibold text-[var(--admin-text)]">{statusCounts.CANCELED || 0}</div>
          </div>
        </div>
        {latestOrder && (
          <div className="mt-4 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-3 text-xs text-[var(--admin-muted)] shadow-sm">
            Son sipariş: <span className="font-semibold text-[var(--admin-text)]">#{latestOrder.id.slice(0, 8)}</span> -{' '}
            {formatDate(latestOrder.createdAt)}
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-[var(--admin-shadow)]">
        {loading && <div className="mt-6 text-sm text-[var(--admin-muted)]">Yükleniyor...</div>}
        {error && (
          <div className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}
        {notice && (
          <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
            {notice}
          </div>
        )}

        {!loading && filteredOrders.length === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-4 text-sm text-[var(--admin-muted)] shadow-sm">
            Filtreye uygun sipariş yok.
          </div>
        )}

        {!loading && filteredOrders.length > 0 && (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-sm">
              <div className="hidden items-center gap-4 border-b border-[var(--admin-border)] bg-[var(--admin-card-muted)] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--admin-muted)] md:grid md:grid-cols-[1.1fr_1.2fr_0.8fr_0.7fr]">
                <div>Sipariş</div>
                <div>Müşteri</div>
                <div>Durum</div>
                <div className="text-right">Tutar</div>
              </div>
              <div className="divide-y divide-[var(--admin-border)]">
                {filteredOrders.map((order, index) => {
                  const displayStatus = normalizeStatus(order.status);
                  const rowTone = index % 2 === 0 ? 'bg-[var(--admin-surface)]' : 'bg-[var(--admin-card-muted)]';
                  return (
                    <div key={order.id} className={`${rowTone} ${statusAccent(displayStatus)} border-l-4`}>
                      <button
                        type="button"
                        onClick={() => toggleExpanded(order.id)}
                        aria-expanded={expandedIds.has(order.id)}
                        className="grid w-full gap-4 px-6 py-4 text-left transition hover:bg-[var(--admin-card-muted)] md:grid-cols-[1.1fr_1.2fr_0.8fr_0.7fr]"
                      >
                        <div className="min-w-0">
                          <div className="text-lg font-semibold text-[var(--admin-text)]">#{order.id.slice(0, 8)}</div>
                          <div className="mt-1 text-xs text-[var(--admin-muted)]">{formatDate(order.createdAt)}</div>
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-[var(--admin-text)]">
                            {order.user?.name || order.user?.email || 'Misafir'}
                          </div>
                          <div className="mt-1 truncate text-xs text-[var(--admin-muted)]">{order.user?.email || '-'}</div>
                        </div>
                        <div className="flex flex-col items-start gap-2 md:items-center">
                          <AdminBadge tone={statusTone(displayStatus)}>
                            {statusLabel[displayStatus] || displayStatus}
                          </AdminBadge>
                          <AdminBadge tone={invoiceTone(order.invoice?.status)}>{invoiceLabel(order.invoice?.status)}</AdminBadge>
                        </div>
                        <div className="flex items-center justify-between gap-3 md:flex-col md:items-end md:justify-center">
                          <div className="text-lg font-semibold text-[var(--admin-text)]">{formatPriceTry(order.totalCents)}</div>
                          <div className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--admin-muted)]">
                            Detay
                            <svg
                              viewBox="0 0 20 20"
                              className={`h-4 w-4 transition-transform ${expandedIds.has(order.id) ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M6 8l4 4 4-4" />
                            </svg>
                          </div>
                        </div>
                      </button>

                      {expandedIds.has(order.id) && (
                        <div className="grid gap-6 border-t border-[var(--admin-border)] bg-[var(--admin-surface-muted)] px-6 py-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-muted)] text-[var(--admin-accent)]">
                            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20 21a8 8 0 10-16 0" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
                              Müşteri
                            </div>
                            <div className="mt-2 truncate text-sm font-semibold text-[var(--admin-text)]">
                              {order.user?.name || order.user?.email || 'Misafir'}
                            </div>
                            <div className="mt-1 truncate text-xs text-[var(--admin-muted)]">{order.user?.email || '-'}</div>
                            {order.user?.email && (
                              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                                <a
                                  href={`mailto:${order.user.email}`}
                                  className="rounded-full border border-[var(--admin-border)] bg-[var(--admin-card)] px-3 py-1 text-[var(--admin-muted)] transition hover:bg-[var(--admin-card-muted)] hover:text-[var(--admin-text)]"
                                >
                                  E-posta gönder
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-muted)] text-[var(--admin-accent)]">
                            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 21s7-4.35 7-10a7 7 0 10-14 0c0 5.65 7 10 7 10z" />
                              <circle cx="12" cy="11" r="2.5" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
                              Teslimat adresi
                            </div>
                            {(() => {
                              const view = formatAddress(order.shippingAddress);
                              if (!view) {
                                return <div className="mt-2 text-xs text-[var(--admin-muted)]">Adres bilgisi yok</div>;
                              }
                              return (
                                <div className="mt-2 space-y-1 text-xs text-[var(--admin-muted)]">
                                  <div className="text-sm font-semibold text-[var(--admin-text)]">{view.fullName}</div>
                                  <div>{view.line1}</div>
                                  <div>{view.city}</div>
                                  <div>{view.phone}</div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-muted)] text-[var(--admin-accent)]">
                            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                              <path d="M14 2v6h6" />
                              <path d="M16 13H8" />
                              <path d="M16 17H8" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
                              Fatura adresi
                            </div>
                            {(() => {
                              const view = formatAddress(order.billingAddress);
                              if (!view) {
                                return <div className="mt-2 text-xs text-[var(--admin-muted)]">Adres bilgisi yok</div>;
                              }
                              return (
                                <div className="mt-2 space-y-1 text-xs text-[var(--admin-muted)]">
                                  <div className="text-sm font-semibold text-[var(--admin-text)]">{view.fullName}</div>
                                  <div>{view.line1}</div>
                                  <div>{view.city}</div>
                                  <div>{view.phone}</div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-muted)] text-[var(--admin-accent)]">
                            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                              <path d="M14 2v6h6" />
                              <path d="M9 13h6" />
                              <path d="M9 17h6" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
                                Fatura
                              </div>
                              <AdminBadge tone={invoiceTone(order.invoice?.status)}>{invoiceLabel(order.invoice?.status)}</AdminBadge>
                            </div>

                            {order.invoice?.invoiceNumber && (
                              <div className="mt-2 text-xs text-[var(--admin-muted)]">
                                No: <span className="font-semibold text-[var(--admin-text)]">{order.invoice.invoiceNumber}</span>
                              </div>
                            )}
                            {order.invoice?.issuedAt && (
                              <div className="mt-1 text-xs text-[var(--admin-muted)]">Tarih: {formatDate(order.invoice.issuedAt)}</div>
                            )}
                            {order.invoice?.ettn && (
                              <div className="mt-1 truncate font-mono text-[11px] text-[var(--admin-muted)]">
                                ETTN: {order.invoice.ettn}
                              </div>
                            )}
                            {order.invoice?.status === 'FAILED' && order.invoice.errorMessage && (
                              <div className="mt-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-700">
                                {order.invoice.errorMessage}
                              </div>
                            )}

                            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                              <AdminButton
                                tone="indigo"
                                onClick={() => generateInvoice(order.id)}
                                disabled={invoicingId === order.id}
                              >
                                {invoicingId === order.id ? 'İşleniyor' : 'Fatura oluştur'}
                              </AdminButton>

                              {order.invoice?.status === 'ISSUED' ? (
                                <>
                                  <a
                                    href={`/api/invoices/${order.invoice.id}/download?file=pdf`}
                                    className="rounded-full border border-[var(--admin-border)] bg-[var(--admin-card)] px-3 py-1 text-[var(--admin-muted)] transition hover:bg-[var(--admin-card-muted)] hover:text-[var(--admin-text)]"
                                  >
                                    PDF indir
                                  </a>
                                  <a
                                    href={`/api/invoices/${order.invoice.id}/download?file=xml`}
                                    className="rounded-full border border-[var(--admin-border)] bg-[var(--admin-card)] px-3 py-1 text-[var(--admin-muted)] transition hover:bg-[var(--admin-card-muted)] hover:text-[var(--admin-text)]"
                                  >
                                    XML indir
                                  </a>
                                </>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-4 shadow-sm sm:col-span-2">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-muted)] text-[var(--admin-accent)]">
                            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20 7h-3V4H7v3H4v13h16V7z" />
                              <path d="M7 4h10" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
                              Ürünler
                            </div>
                            <div className="mt-3 space-y-2">
                              {order.items.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center justify-between gap-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-card-muted)] px-3 py-2 text-xs"
                                >
                                  <div className="flex min-w-0 items-center gap-2">
                                    <div className="h-9 w-9 overflow-hidden rounded-lg border border-[var(--admin-border)] bg-[var(--admin-card)]">
                                      {item.imageUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                      ) : (
                                        <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-[var(--admin-muted)]">
                                          Ürün
                                        </div>
                                      )}
                                    </div>
                                    <span className="truncate font-semibold text-[var(--admin-text)]">{item.name}</span>
                                  </div>
                                  <div className="flex items-center gap-3 text-[var(--admin-muted)]">
                                    <span>{item.quantity}x</span>
                                    <span className="font-semibold text-[var(--admin-text)]">
                                      {formatPriceTry(item.priceCents * item.quantity)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-4 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
                            Durum güncelle
                          </div>
                          <AdminBadge tone={statusTone(displayStatus)}>{statusLabel[displayStatus] || displayStatus}</AdminBadge>
                        </div>

                        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
                          <select
                            className="w-full rounded-xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-3 py-2 text-xs font-semibold text-[var(--admin-text)] shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/30"
                            value={draftStatus[order.id] || order.status}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value !== 'CANCELED' && cancelDialogId === order.id) {
                                setCancelDialogId(null);
                              }
                              if (value === 'CANCELED') {
                                setCancelPrevStatus((prev) => ({
                                  ...prev,
                                  [order.id]: draftStatus[order.id] || order.status,
                                }));
                                openCancelDialog(order.id);
                              }
                              setDraftStatus((prev) => ({
                                ...prev,
                                [order.id]: value,
                              }));
                            }}
                          >
                            {statusOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <AdminButton onClick={() => saveStatus(order.id)} disabled={savingId === order.id} className="px-6">
                            {savingId === order.id ? 'Kaydediliyor' : 'Durumu kaydet'}
                          </AdminButton>
                        </div>

                        <div className="mt-2 text-xs text-[var(--admin-muted)]">
                          Mevcut: {statusLabel[displayStatus] || displayStatus}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-4 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-muted)] text-[var(--admin-accent)]">
                              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 7h13l3 4v6H3z" />
                                <circle cx="7.5" cy="17" r="2" />
                                <circle cx="16.5" cy="17" r="2" />
                              </svg>
                            </div>
                            <div>
                              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
                                Kargo bilgisi
                              </div>
                              <div className="text-xs text-[var(--admin-muted)]">Taşıma detaylarını tamamla.</div>
                            </div>
                          </div>
                          <AdminButton
                            tone="slate"
                            variant="outline"
                            onClick={() => saveStatus(order.id)}
                            disabled={savingId === order.id}
                            className="px-5"
                          >
                            {savingId === order.id ? 'Kaydediliyor' : 'Kargoyu kaydet'}
                          </AdminButton>
                        </div>

                        <div className="mt-4 space-y-3">
                          <div>
                            <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
                              Kargo firması
                            </label>
                            <input
                              className="mt-2 w-full rounded-xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-3 py-2 text-xs font-semibold text-[var(--admin-text)] shadow-sm placeholder:text-[var(--admin-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/30"
                              value={draftTracking[order.id]?.carrier || ''}
                              onChange={(e) =>
                                setDraftTracking((prev) => ({
                                  ...prev,
                                  [order.id]: {
                                    carrier: e.target.value,
                                    number: prev[order.id]?.number || '',
                                    url: prev[order.id]?.url || '',
                                  },
                                }))
                              }
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
                              Takip no
                            </label>
                            <input
                              className="mt-2 w-full rounded-xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-3 py-2 text-xs font-semibold text-[var(--admin-text)] shadow-sm placeholder:text-[var(--admin-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/30"
                              value={draftTracking[order.id]?.number || ''}
                              onChange={(e) =>
                                setDraftTracking((prev) => ({
                                  ...prev,
                                  [order.id]: {
                                    carrier: prev[order.id]?.carrier || '',
                                    number: e.target.value,
                                    url: prev[order.id]?.url || '',
                                  },
                                }))
                              }
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
                              Takip linki
                            </label>
                            <input
                              className="mt-2 w-full rounded-xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-3 py-2 text-xs font-semibold text-[var(--admin-text)] shadow-sm placeholder:text-[var(--admin-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/30"
                              value={draftTracking[order.id]?.url || ''}
                              onChange={(e) =>
                                setDraftTracking((prev) => ({
                                  ...prev,
                                  [order.id]: {
                                    carrier: prev[order.id]?.carrier || '',
                                    number: prev[order.id]?.number || '',
                                    url: e.target.value,
                                  },
                                }))
                              }
                            />
                          </div>
                        </div>

                        <div className="mt-3 text-[11px] text-[var(--admin-muted)]">
                          Kargo bilgisi kaydedildiğinde müşteriye e-posta gider ve sipariş detayında görünür.
                        </div>

                        {(draftTracking[order.id]?.carrier ||
                          draftTracking[order.id]?.number ||
                          draftTracking[order.id]?.url) && (
                          <div className="mt-4 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-muted)] px-3 py-3 text-xs text-[var(--admin-muted)]">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
                              Kargo özeti
                            </div>
                            <div className="mt-2 space-y-1">
                              {draftTracking[order.id]?.carrier && <div>Firma: {draftTracking[order.id].carrier}</div>}
                              {draftTracking[order.id]?.number && <div>Takip no: {draftTracking[order.id].number}</div>}
                              {draftTracking[order.id]?.url && (
                                <a
                                  href={draftTracking[order.id].url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 font-semibold text-indigo-700 hover:text-indigo-800"
                                >
                                  Takip linkini aç <span>-&gt;</span>
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                      </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>

      <div className="sticky bottom-4 z-30">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)]/90 px-4 py-3 text-xs text-[var(--admin-muted)] shadow-lg backdrop-blur">
          <div className="flex items-center gap-2">
            <AdminBadge tone="slate">{filteredOrders.length} kayıt</AdminBadge>
            <span>Filtre: {statusFilter === 'ALL' ? 'Tüm siparişler' : statusLabel[statusFilter]}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <AdminButton tone="slate" variant="outline" onClick={() => loadOrders()}>
              Yenile
            </AdminButton>
            <AdminButton tone="slate" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              En üst
            </AdminButton>
          </div>
        </div>
      </div>

      {cancelDialogId && cancelOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.18),_transparent_55%),linear-gradient(160deg,_rgba(15,23,42,0.96),_rgba(2,6,23,0.98))] p-6 text-white shadow-[0_30px_80px_-40px_rgba(15,23,42,0.9)]">
            <div className="absolute -right-16 top-10 h-32 w-32 rounded-full bg-rose-500/20 blur-[80px]" />
            <div className="absolute -left-10 bottom-10 h-32 w-32 rounded-full bg-indigo-400/10 blur-[90px]" />
            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-rose-400/30 bg-rose-500/15 text-rose-200">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 9v4m0 4h.01" />
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.35em] text-rose-300">
                    Sipariş iptali
                  </div>
                  <div className="mt-1 text-lg font-semibold">
                    #{cancelOrder.id.slice(0, 8)} siparişini iptal et
                  </div>
                </div>
              </div>

              <p className="mt-3 text-sm text-slate-300">
                İptal işlemi için müşteriye gidecek nedeni yazman gerekiyor.
              </p>

              <div className="mt-5">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  İptal nedeni
                </label>
                <textarea
                  rows={4}
                  value={cancelReasonDraft[cancelDialogId] || ''}
                  onChange={(e) =>
                    setCancelReasonDraft((prev) => ({
                      ...prev,
                      [cancelDialogId]: e.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-rose-400/60 focus:outline-none focus:ring-2 focus:ring-rose-400/30"
                  placeholder="Örn: Üretim stok sorunu nedeniyle iptal edildi."
                />
                {cancelReasonError[cancelDialogId] && (
                  <div className="mt-2 text-xs text-rose-300">{cancelReasonError[cancelDialogId]}</div>
                )}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => closeCancelDialog(cancelDialogId)}
                  className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-white/30 hover:text-white"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={() => confirmCancel(cancelDialogId)}
                  disabled={savingId === cancelDialogId}
                  className="rounded-full bg-rose-500 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:bg-rose-400 disabled:opacity-60"
                >
                  İptali onayla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


