'use client';

import { useState, type ReactNode } from 'react';

import type { CapacitySlot, HomePanelConfig, PriceAlertStep, ProcurementStep } from '@/lib/homePanelDefaults';
import { homePanelDefaults } from '@/lib/homePanelDefaults';
import AdminAssetUpload from '@/components/admin/AdminAssetUpload';
import { AdminButton } from '@/components/admin/AdminUi';

type Props = {
  initialConfig: HomePanelConfig;
};

type CapacitySlotUi = CapacitySlot & { _id: string };
type PriceAlertStepUi = PriceAlertStep & { _id: string };
type ProcurementStepUi = ProcurementStep & { _id: string };

const makeId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;

function moveArrayItem<T>(items: T[], fromIndex: number, toIndex: number) {
  if (fromIndex === toIndex) return items;
  if (fromIndex < 0 || toIndex < 0) return items;
  if (fromIndex >= items.length || toIndex >= items.length) return items;

  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  if (!moved) return items;
  next.splice(toIndex, 0, moved);
  return next;
}

const iconOptionsRecommended = [
  { value: 'building', label: 'Kurumsal' },
  { value: 'calendar', label: 'Takvim' },
  { value: 'shield-check', label: 'Güvenlik' },
  { value: 'chart-up', label: 'Performans' },
  { value: 'briefcase', label: 'İş süreci' },
  { value: 'document', label: 'Doküman' },
  { value: 'badge-check', label: 'Onay' },
  { value: 'signature', label: 'İmza' },
  { value: 'truck', label: 'Teslimat' },
  { value: 'mail', label: 'E-posta' },
  { value: 'bookmark', label: 'Kaydet' },
  { value: 'target', label: 'Hedef' },
];

const iconOptionsLegacy = [
  { value: 'clock', label: 'Saat (eski)' },
  { value: 'shield', label: 'Kalkan (eski)' },
  { value: 'heart', label: 'Favori (eski)' },
  { value: 'bell', label: 'Bildirim (eski)' },
  { value: 'file', label: 'Dosya (eski)' },
  { value: 'check', label: 'Onay (eski)' },
];

const iconOptionGroups = [
  { label: 'Önerilen', options: iconOptionsRecommended },
  { label: 'Eski', options: iconOptionsLegacy },
];

const SECTION_CLASS =
  'rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-[var(--admin-shadow)]';
const CARD_CLASS = 'rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4 shadow-sm';

export default function HomePanelsForm({ initialConfig }: Props) {
  const [capacitySchedule, setCapacitySchedule] = useState<CapacitySlotUi[]>(() =>
    initialConfig.capacitySchedule.map((slot) => ({ _id: makeId(), ...slot })),
  );
  const [priceAlertSteps, setPriceAlertSteps] = useState<PriceAlertStepUi[]>(() =>
    initialConfig.priceAlertSteps.map((step) => ({ _id: makeId(), ...step })),
  );
  const [procurementFlow, setProcurementFlow] = useState<ProcurementStepUi[]>(() =>
    initialConfig.procurementFlow.map((step) => ({ _id: makeId(), ...step })),
  );
  const [capacityImageUrl, setCapacityImageUrl] = useState(initialConfig.capacityImageUrl || '');
  const [priceAlertImageUrl, setPriceAlertImageUrl] = useState(initialConfig.priceAlertImageUrl || '');
  const [procurementImageUrl, setProcurementImageUrl] = useState(initialConfig.procurementImageUrl || '');
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activePanel, setActivePanel] = useState<'capacity' | 'price' | 'procurement'>('capacity');

  const Field = ({ label, children }: { label: string; children: ReactNode }) => (
    <label className="block space-y-1">
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">{label}</span>
      {children}
    </label>
  );

  const renderIconOptions = () => (
    <>
      <option value="">İkon seç</option>
      {iconOptionGroups.map((group) => (
        <optgroup key={group.label} label={group.label}>
          {group.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </optgroup>
      ))}
    </>
  );

  const updateCapacitySlot = (index: number, patch: Partial<CapacitySlotUi>) => {
    setCapacitySchedule((prev) => prev.map((slot, idx) => (idx === index ? { ...slot, ...patch } : slot)));
  };

  const updatePriceAlertStep = (index: number, patch: Partial<PriceAlertStepUi>) => {
    setPriceAlertSteps((prev) => prev.map((step, idx) => (idx === index ? { ...step, ...patch } : step)));
  };

  const updateProcurementStep = (index: number, patch: Partial<ProcurementStepUi>) => {
    setProcurementFlow((prev) => prev.map((step, idx) => (idx === index ? { ...step, ...patch } : step)));
  };

  const saveConfig = async () => {
    setIsSaving(true);
    setStatus(null);
    try {
      const res = await fetch('/api/admin/site-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          capacitySchedule,
          priceAlertSteps,
          procurementFlow,
          capacityImageUrl,
          priceAlertImageUrl,
          procurementImageUrl,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Kaydedilemedi');
      setStatus({ type: 'success', message: 'Paneller güncellendi.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Kaydedilemedi';
      setStatus({ type: 'error', message });
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = () => {
    const ok = window.confirm('Tüm paneller varsayılan ayarlara dönecek. Emin misin?');
    if (!ok) return;
    setCapacitySchedule(homePanelDefaults.capacitySchedule.map((slot) => ({ _id: makeId(), ...slot })));
    setPriceAlertSteps(homePanelDefaults.priceAlertSteps.map((step) => ({ _id: makeId(), ...step })));
    setProcurementFlow(homePanelDefaults.procurementFlow.map((step) => ({ _id: makeId(), ...step })));
    setCapacityImageUrl(homePanelDefaults.capacityImageUrl || '');
    setPriceAlertImageUrl(homePanelDefaults.priceAlertImageUrl || '');
    setProcurementImageUrl(homePanelDefaults.procurementImageUrl || '');
    setStatus(null);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-muted)] p-5">
        <div className="text-[11px] font-semibold tracking-[0.22em] text-[var(--admin-accent)]">Hızlı düzenleme</div>
        <h2 className="mt-2 text-lg font-semibold text-[var(--admin-text)]">Anasayfa panel ayarları</h2>
        <p className="mt-2 text-sm text-[var(--admin-muted)]">
          Panel seç → düzenle → kaydet. Sağda canlı önizleme var.
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => setActivePanel('capacity')}
            className={`rounded-xl border px-4 py-3 text-left transition ${
              activePanel === 'capacity'
                ? 'border-[var(--admin-accent)] bg-[var(--admin-surface)] shadow-sm'
                : 'border-[var(--admin-border)] bg-[var(--admin-card-muted)] hover:bg-[var(--admin-surface)]'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-[11px] font-semibold tracking-[0.22em] text-[var(--admin-muted)]">1. Panel</div>
              <div className="rounded-full bg-[var(--admin-surface)] px-2 py-0.5 text-[11px] font-semibold text-[var(--admin-muted)] ring-1 ring-[var(--admin-border)]">
                {capacitySchedule.length} slot
              </div>
            </div>
            <div className="mt-1 text-sm font-semibold text-[var(--admin-text)]">Canlı kapasite</div>
          </button>

          <button
            type="button"
            onClick={() => setActivePanel('price')}
            className={`rounded-xl border px-4 py-3 text-left transition ${
              activePanel === 'price'
                ? 'border-[var(--admin-accent)] bg-[var(--admin-surface)] shadow-sm'
                : 'border-[var(--admin-border)] bg-[var(--admin-card-muted)] hover:bg-[var(--admin-surface)]'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-[11px] font-semibold tracking-[0.22em] text-[var(--admin-muted)]">2. Panel</div>
              <div className="rounded-full bg-[var(--admin-surface)] px-2 py-0.5 text-[11px] font-semibold text-[var(--admin-muted)] ring-1 ring-[var(--admin-border)]">
                {priceAlertSteps.length} adım
              </div>
            </div>
            <div className="mt-1 text-sm font-semibold text-[var(--admin-text)]">Fiyat düşüş alarmı</div>
          </button>

          <button
            type="button"
            onClick={() => setActivePanel('procurement')}
            className={`rounded-xl border px-4 py-3 text-left transition ${
              activePanel === 'procurement'
                ? 'border-[var(--admin-accent)] bg-[var(--admin-surface)] shadow-sm'
                : 'border-[var(--admin-border)] bg-[var(--admin-card-muted)] hover:bg-[var(--admin-surface)]'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-[11px] font-semibold tracking-[0.22em] text-[var(--admin-muted)]">3. Panel</div>
              <div className="rounded-full bg-[var(--admin-surface)] px-2 py-0.5 text-[11px] font-semibold text-[var(--admin-muted)] ring-1 ring-[var(--admin-border)]">
                {procurementFlow.length} kart
              </div>
            </div>
            <div className="mt-1 text-sm font-semibold text-[var(--admin-text)]">Kurumsal satın alma</div>
          </button>
        </div>

        <div className="mt-4 text-xs text-[var(--admin-muted)]">İpucu: Kaydet butonu sayfanın altında sabit.</div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-start">
        <div className="space-y-6">
          {activePanel === 'capacity' && (
            <section className={SECTION_CLASS}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.22em] text-[var(--admin-accent)]">
                    1. Panel — Canlı kapasite
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-[var(--admin-text)]">Slotlar</h3>
                  <p className="mt-1 text-sm text-[var(--admin-muted)]">
                    Her kart ana sayfadaki bir kapasite kartıdır.
                  </p>
                </div>
                <AdminButton
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setCapacitySchedule((prev) => [
                      ...prev,
                      {
                        _id: makeId(),
                        title: 'Yeni slot',
                        status: '%0 dolu',
                        detail: 'Detay ekle',
                        window: 'Tarih aralığı',
                        icon: undefined,
                      },
                    ])
                  }
                >
                  Yeni slot
                </AdminButton>
              </div>

              <div className="mt-4">
                <AdminAssetUpload
                  label="Panel görseli"
                  helper="Opsiyonel: kapasite paneli için arka plan görseli."
                  value={capacityImageUrl}
                  onChange={setCapacityImageUrl}
                />
              </div>

              <div className="mt-5 space-y-4">
                {capacitySchedule.map((slot, index) => (
                  <div key={slot._id} className={CARD_CLASS}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--admin-muted)]">
                          Slot {index + 1}
                        </div>
                        <div className="mt-1 truncate text-sm font-semibold text-[var(--admin-text)]">
                          {slot.title?.trim() || 'Yeni slot'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <AdminButton
                          type="button"
                          variant="ghost"
                          className="px-2 py-2"
                          disabled={index === 0}
                          onClick={() => setCapacitySchedule((prev) => moveArrayItem(prev, index, index - 1))}
                          aria-label="Yukarı taşı"
                        >
                          ↑
                        </AdminButton>
                        <AdminButton
                          type="button"
                          variant="ghost"
                          className="px-2 py-2"
                          disabled={index === capacitySchedule.length - 1}
                          onClick={() => setCapacitySchedule((prev) => moveArrayItem(prev, index, index + 1))}
                          aria-label="Aşağı taşı"
                        >
                          ↓
                        </AdminButton>
                        <AdminButton
                          type="button"
                          tone="rose"
                          variant="outline"
                          className="px-3 py-2"
                          onClick={() => setCapacitySchedule((prev) => prev.filter((_, idx) => idx !== index))}
                        >
                          Sil
                        </AdminButton>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <Field label="Başlık">
                        <input
                          className="form-input"
                          value={slot.title}
                          onChange={(e) => updateCapacitySlot(index, { title: e.target.value })}
                          placeholder="Örn: Bu hafta"
                        />
                      </Field>
                      <Field label="Doluluk / durum">
                        <input
                          className="form-input"
                          value={slot.status}
                          onChange={(e) => updateCapacitySlot(index, { status: e.target.value })}
                          placeholder="Örn: %78 dolu"
                        />
                      </Field>
                      <Field label="Detay">
                        <input
                          className="form-input"
                          value={slot.detail}
                          onChange={(e) => updateCapacitySlot(index, { detail: e.target.value })}
                          placeholder="Örn: 2 uygun keşif slotu"
                        />
                      </Field>
                      <Field label="Tarih / pencere">
                        <input
                          className="form-input"
                          value={slot.window}
                          onChange={(e) => updateCapacitySlot(index, { window: e.target.value })}
                          placeholder="Örn: 12–14 Ocak"
                        />
                      </Field>
                      <div className="sm:col-span-2">
                        <Field label="İkon">
                          <select
                            className="form-input"
                            value={slot.icon || ''}
                            onChange={(e) => updateCapacitySlot(index, { icon: e.target.value || undefined })}
                          >
                            {renderIconOptions()}
                          </select>
                        </Field>
                      </div>
                    </div>
                  </div>
                ))}

                {capacitySchedule.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-[var(--admin-border)] bg-[var(--admin-card-muted)] p-4 text-sm text-[var(--admin-muted)]">
                    Henüz slot yok. “Yeni slot” ile ekleyebilirsin.
                  </div>
                )}
              </div>
            </section>
          )}

          {activePanel === 'price' && (
            <section className={SECTION_CLASS}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.22em] text-[var(--admin-accent)]">
                    2. Panel — Fiyat düşüş alarmı
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-[var(--admin-text)]">Adım listesi</h3>
                  <p className="mt-1 text-sm text-[var(--admin-muted)]">Bu liste ana sayfadaki adım akışını oluşturur.</p>
                </div>
                <AdminButton
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setPriceAlertSteps((prev) => [...prev, { _id: makeId(), text: 'Yeni adım', icon: undefined }])
                  }
                >
                  Yeni adım
                </AdminButton>
              </div>

              <div className="mt-4">
                <AdminAssetUpload
                  label="Panel görseli"
                  helper="Opsiyonel: fiyat düşüş alarmı paneline arka plan görseli."
                  value={priceAlertImageUrl}
                  onChange={setPriceAlertImageUrl}
                />
              </div>

              <div className="mt-5 space-y-4">
                {priceAlertSteps.map((step, index) => (
                  <div key={step._id} className={CARD_CLASS}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--admin-muted)]">
                          Adım {index + 1}
                        </div>
                        <div className="mt-1 truncate text-sm font-semibold text-[var(--admin-text)]">
                          {step.text?.trim() || 'Yeni adım'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <AdminButton
                          type="button"
                          variant="ghost"
                          className="px-2 py-2"
                          disabled={index === 0}
                          onClick={() => setPriceAlertSteps((prev) => moveArrayItem(prev, index, index - 1))}
                          aria-label="Yukarı taşı"
                        >
                          ↑
                        </AdminButton>
                        <AdminButton
                          type="button"
                          variant="ghost"
                          className="px-2 py-2"
                          disabled={index === priceAlertSteps.length - 1}
                          onClick={() => setPriceAlertSteps((prev) => moveArrayItem(prev, index, index + 1))}
                          aria-label="Aşağı taşı"
                        >
                          ↓
                        </AdminButton>
                        <AdminButton
                          type="button"
                          tone="rose"
                          variant="outline"
                          className="px-3 py-2"
                          onClick={() => setPriceAlertSteps((prev) => prev.filter((_, idx) => idx !== index))}
                        >
                          Sil
                        </AdminButton>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <Field label="Metin">
                        <input
                          className="form-input"
                          value={step.text}
                          onChange={(e) => updatePriceAlertStep(index, { text: e.target.value })}
                          placeholder="Örn: Ürünü kaydet"
                        />
                      </Field>
                      <Field label="İkon">
                        <select
                          className="form-input"
                          value={step.icon || ''}
                          onChange={(e) => updatePriceAlertStep(index, { icon: e.target.value || undefined })}
                        >
                          {renderIconOptions()}
                        </select>
                      </Field>
                    </div>
                  </div>
                ))}

                {priceAlertSteps.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-[var(--admin-border)] bg-[var(--admin-card-muted)] p-4 text-sm text-[var(--admin-muted)]">
                    Henüz adım yok. “Yeni adım” ile ekleyebilirsin.
                  </div>
                )}
              </div>
            </section>
          )}

          {activePanel === 'procurement' && (
            <section className={SECTION_CLASS}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.22em] text-[var(--admin-accent)]">
                    3. Panel — Kurumsal satın alma
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-[var(--admin-text)]">Kartlar</h3>
                  <p className="mt-1 text-sm text-[var(--admin-muted)]">Her kart bir süreç adımıdır.</p>
                </div>
                <AdminButton
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setProcurementFlow((prev) => [
                      ...prev,
                      { _id: makeId(), title: 'Yeni adım', description: 'Açıklama ekle', icon: undefined },
                    ])
                  }
                >
                  Yeni kart
                </AdminButton>
              </div>

              <div className="mt-4">
                <AdminAssetUpload
                  label="Panel görseli"
                  helper="Opsiyonel: satın alma paneli için kurumsal görsel."
                  value={procurementImageUrl}
                  onChange={setProcurementImageUrl}
                />
              </div>

              <div className="mt-5 space-y-4">
                {procurementFlow.map((step, index) => (
                  <div key={step._id} className={CARD_CLASS}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--admin-muted)]">
                          Kart {index + 1}
                        </div>
                        <div className="mt-1 truncate text-sm font-semibold text-[var(--admin-text)]">
                          {step.title?.trim() || 'Yeni kart'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <AdminButton
                          type="button"
                          variant="ghost"
                          className="px-2 py-2"
                          disabled={index === 0}
                          onClick={() => setProcurementFlow((prev) => moveArrayItem(prev, index, index - 1))}
                          aria-label="Yukarı taşı"
                        >
                          ↑
                        </AdminButton>
                        <AdminButton
                          type="button"
                          variant="ghost"
                          className="px-2 py-2"
                          disabled={index === procurementFlow.length - 1}
                          onClick={() => setProcurementFlow((prev) => moveArrayItem(prev, index, index + 1))}
                          aria-label="Aşağı taşı"
                        >
                          ↓
                        </AdminButton>
                        <AdminButton
                          type="button"
                          tone="rose"
                          variant="outline"
                          className="px-3 py-2"
                          onClick={() => setProcurementFlow((prev) => prev.filter((_, idx) => idx !== index))}
                        >
                          Sil
                        </AdminButton>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Başlık">
                          <input
                            className="form-input"
                            value={step.title}
                            onChange={(e) => updateProcurementStep(index, { title: e.target.value })}
                            placeholder="Örn: Teklif"
                          />
                        </Field>
                        <Field label="İkon">
                          <select
                            className="form-input"
                            value={step.icon || ''}
                            onChange={(e) => updateProcurementStep(index, { icon: e.target.value || undefined })}
                          >
                            {renderIconOptions()}
                          </select>
                        </Field>
                      </div>
                      <Field label="Açıklama">
                        <textarea
                          className="form-input min-h-[96px] resize-y"
                          value={step.description}
                          onChange={(e) => updateProcurementStep(index, { description: e.target.value })}
                          placeholder="Örn: Teklif detayları ve teslim planı oluşturulur."
                        />
                      </Field>
                    </div>
                  </div>
                ))}

                {procurementFlow.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-[var(--admin-border)] bg-[var(--admin-card-muted)] p-4 text-sm text-[var(--admin-muted)]">
                    Henüz kart yok. “Yeni kart” ile ekleyebilirsin.
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
        <aside className={`${SECTION_CLASS} lg:sticky lg:top-24`}>
          <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--admin-muted)]">Canlı önizleme</div>
          <div className="mt-2 text-sm font-semibold text-[var(--admin-text)]">
            {activePanel === 'capacity'
              ? 'Kapasite kartları'
              : activePanel === 'price'
                ? 'Alarm adımları'
                : 'Satın alma kartları'}
          </div>

          <div className="mt-4 space-y-4">
            {activePanel === 'capacity' && (
              <div className="space-y-3">
                {capacityImageUrl ? (
                  <div className="relative overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-muted)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={capacityImageUrl} alt="Kapasite panel görseli" className="h-28 w-full object-cover" />
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[var(--admin-border)] bg-[var(--admin-card-muted)] p-4 text-xs text-[var(--admin-muted)]">
                    Görsel yok (opsiyonel)
                  </div>
                )}

                <div className="space-y-3">
                  {capacitySchedule.slice(0, 4).map((slot) => (
                    <div
                      key={slot._id}
                      className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-muted)] p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 truncate text-sm font-semibold text-[var(--admin-text)]">{slot.title || 'Slot'}</div>
                        <span className="shrink-0 rounded-full bg-[var(--admin-surface)] px-2 py-0.5 text-[11px] font-semibold text-[var(--admin-muted)] ring-1 ring-[var(--admin-border)]">
                          {slot.status || '-'}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-[var(--admin-muted)]">{slot.detail || '-'}</div>
                      <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
                        {slot.window || '-'}
                      </div>
                    </div>
                  ))}
                  {capacitySchedule.length > 4 && (
                    <div className="text-xs text-[var(--admin-muted)]">+{capacitySchedule.length - 4} slot daha</div>
                  )}
                  {capacitySchedule.length === 0 && (
                    <div className="text-xs text-[var(--admin-muted)]">Önizleme için slot ekleyin.</div>
                  )}
                </div>
              </div>
            )}

            {activePanel === 'price' && (
              <div className="space-y-3">
                {priceAlertImageUrl ? (
                  <div className="relative overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-muted)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={priceAlertImageUrl} alt="Fiyat alarm panel görseli" className="h-28 w-full object-cover" />
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[var(--admin-border)] bg-[var(--admin-card-muted)] p-4 text-xs text-[var(--admin-muted)]">
                    Görsel yok (opsiyonel)
                  </div>
                )}

                <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-muted)] p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">Adım akışı</div>
                  <ol className="mt-3 space-y-2 text-sm text-[var(--admin-text)]">
                    {priceAlertSteps.slice(0, 6).map((step, idx) => (
                      <li key={step._id} className="flex items-start gap-3">
                        <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--admin-surface)] text-[11px] font-semibold text-[var(--admin-muted)] ring-1 ring-[var(--admin-border)]">
                          {idx + 1}
                        </span>
                        <span className="min-w-0 flex-1">{step.text || 'Adım'}</span>
                      </li>
                    ))}
                  </ol>
                  {priceAlertSteps.length > 6 && (
                    <div className="mt-3 text-xs text-[var(--admin-muted)]">+{priceAlertSteps.length - 6} adım daha</div>
                  )}
                  {priceAlertSteps.length === 0 && (
                    <div className="mt-3 text-xs text-[var(--admin-muted)]">Önizleme için adım ekleyin.</div>
                  )}
                </div>
              </div>
            )}

            {activePanel === 'procurement' && (
              <div className="space-y-3">
                {procurementImageUrl ? (
                  <div className="relative overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-muted)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={procurementImageUrl} alt="Satın alma panel görseli" className="h-28 w-full object-cover" />
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[var(--admin-border)] bg-[var(--admin-card-muted)] p-4 text-xs text-[var(--admin-muted)]">
                    Görsel yok (opsiyonel)
                  </div>
                )}

                <div className="space-y-3">
                  {procurementFlow.slice(0, 4).map((step, idx) => (
                    <div
                      key={step._id}
                      className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-muted)] p-4"
                    >
                      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
                        {idx + 1}. kart
                      </div>
                      <div className="mt-1 text-sm font-semibold text-[var(--admin-text)]">{step.title || 'Kart'}</div>
                      <div className="mt-2 text-xs text-[var(--admin-muted)]">{step.description || '-'}</div>
                    </div>
                  ))}
                  {procurementFlow.length > 4 && (
                    <div className="text-xs text-[var(--admin-muted)]">+{procurementFlow.length - 4} kart daha</div>
                  )}
                  {procurementFlow.length === 0 && (
                    <div className="text-xs text-[var(--admin-muted)]">Önizleme için kart ekleyin.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)]/90 p-4 shadow-[var(--admin-shadow)] backdrop-blur">
        <div className="flex flex-wrap gap-3">
          <AdminButton type="button" disabled={isSaving} onClick={saveConfig}>
            {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri kaydet'}
          </AdminButton>
          <AdminButton type="button" variant="outline" onClick={resetToDefaults}>
            Varsayılana dön
          </AdminButton>
        </div>

        {status ? (
          <div
            className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
              status.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-rose-200 bg-rose-50 text-rose-700'
            }`}
            role="status"
          >
            {status.message}
          </div>
        ) : (
          <div className="text-xs text-[var(--admin-muted)]">Kaydetmeden çıkarsan değişiklikler kaybolur.</div>
        )}
      </div>
    </div>
  );
}
