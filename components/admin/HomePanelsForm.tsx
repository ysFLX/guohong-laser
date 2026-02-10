'use client';

import { useState } from 'react';

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

const iconOptions = [
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
  { value: 'clock', label: 'Saat (eski)' },
  { value: 'shield', label: 'Kalkan (eski)' },
  { value: 'heart', label: 'Favori (eski)' },
  { value: 'bell', label: 'Bildirim (eski)' },
  { value: 'file', label: 'Dosya (eski)' },
  { value: 'check', label: 'Onay (eski)' },
];

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
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Kaydedilemedi');
      setStatus({ type: 'success', message: 'Paneller güncellendi.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Kaydedilemedi';
      setStatus({ type: 'error', message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-muted)] p-5">
        <div className="text-[11px] font-semibold tracking-[0.22em] text-[var(--admin-accent)]">Hızlı düzenleme</div>
        <h2 className="mt-2 text-lg font-semibold text-[var(--admin-text)]">Anasayfa panel ayarları</h2>
        <p className="mt-2 text-sm text-[var(--admin-muted)]">Aşağıdan bir panel seç, düzenle ve kaydet.</p>
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
            <div className="mt-1 text-sm font-semibold text-[var(--admin-text)]">Canlı kapasite takvimi</div>
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
        <div className="mt-4 text-xs text-[var(--admin-muted)]">
          İpucu: Kaydet butonu sayfanın altında sabit. Kayıtları düzenlemek için satırdaki alanları değiştirebilirsin.
        </div>
      </section>

      <section
        className={`rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-[var(--admin-shadow)] ${activePanel !== 'capacity' ? 'hidden' : ''}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center rounded-full border border-[var(--admin-border)] bg-[var(--admin-card-muted)] px-3 py-1 text-[11px] font-semibold text-[var(--admin-muted)]">
              1. Panel
            </div>
            <div className="mt-3 text-[11px] font-semibold tracking-[0.22em] text-[var(--admin-accent)]">Canlı kapasite takvimi</div>
            <h2 className="mt-2 text-lg font-semibold text-[var(--admin-text)]">Servis ve keşif slotları</h2>
            <p className="mt-1 text-sm text-[var(--admin-muted)]">Ana sayfadaki kapasite kartları burada girdiğin bilgilerle görünür.</p>
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
        <div className="mt-4 space-y-4">
          <div className="hidden md:grid md:grid-cols-5 gap-3 px-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            <div>Başlık</div>
            <div>Durum</div>
            <div>Detay</div>
            <div>İkon</div>
            <div>Tarih</div>
          </div>
          {capacitySchedule.map((slot, index) => (
            <div key={slot._id} className="grid gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-5">
              <input
                className="form-input"
                value={slot.title}
                onChange={(e) => {
                  const next = [...capacitySchedule];
                  next[index] = { ...next[index], title: e.target.value };
                  setCapacitySchedule(next);
                }}
                placeholder="Örn: Bu hafta"
              />
              <input
                className="form-input"
                value={slot.status}
                onChange={(e) => {
                  const next = [...capacitySchedule];
                  next[index] = { ...next[index], status: e.target.value };
                  setCapacitySchedule(next);
                }}
                placeholder="Örn: %78 dolu"
              />
              <input
                className="form-input"
                value={slot.detail}
                onChange={(e) => {
                  const next = [...capacitySchedule];
                  next[index] = { ...next[index], detail: e.target.value };
                  setCapacitySchedule(next);
                }}
                placeholder="Örn: 2 uygun keşif slotu"
              />
              <select
                className="form-input"
                value={slot.icon || ''}
                onChange={(e) => {
                  const next = [...capacitySchedule];
                  next[index] = { ...next[index], icon: e.target.value || undefined };
                  setCapacitySchedule(next);
                }}
              >
                <option value="">İkon seç</option>
                {iconOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <input
                  className="form-input flex-1"
                  value={slot.window}
                  onChange={(e) => {
                    const next = [...capacitySchedule];
                    next[index] = { ...next[index], window: e.target.value };
                    setCapacitySchedule(next);
                  }}
                  placeholder="Örn: 12–14 Ocak"
                />
                <AdminButton
                  type="button"
                  tone="rose"
                  variant="outline"
                  onClick={() => setCapacitySchedule((prev) => prev.filter((_, idx) => idx !== index))}
                >
                  Sil
                </AdminButton>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        className={`rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-[var(--admin-shadow)] ${activePanel !== 'price' ? 'hidden' : ''}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-700">
              2. Panel
            </div>
            <div className="mt-3 text-xs uppercase tracking-[0.3em] text-indigo-600">Fiyat düşüş alarmı</div>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">Müşteri yolculuğu adımları</h2>
            <p className="mt-1 text-sm text-slate-600">Kullanıcıya gösterilen alarm adımlarını bu listeden yönetirsin.</p>
          </div>
          <AdminButton
            type="button"
            variant="outline"
            onClick={() => setPriceAlertSteps((prev) => [...prev, { _id: makeId(), text: 'Yeni adım', icon: undefined }])}
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
        <div className="mt-4 space-y-3">
          <div className="hidden sm:flex items-center gap-3 px-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            <div className="flex-1">Metin</div>
            <div className="w-40">İkon</div>
            <div className="w-20 text-right">İşlem</div>
          </div>
          {priceAlertSteps.map((step, index) => (
            <div key={step._id} className="flex items-center gap-3">
              <input
                className="form-input flex-1"
                value={step.text}
                onChange={(e) => {
                  const next = [...priceAlertSteps];
                  next[index] = { ...next[index], text: e.target.value };
                  setPriceAlertSteps(next);
                }}
                placeholder="Örn: Ürünü kaydet"
              />
              <select
                className="form-input w-40"
                value={step.icon || ''}
                onChange={(e) => {
                  const next = [...priceAlertSteps];
                  next[index] = { ...next[index], icon: e.target.value || undefined };
                  setPriceAlertSteps(next);
                }}
              >
                <option value="">İkon seç</option>
                {iconOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <AdminButton
                type="button"
                tone="rose"
                variant="outline"
                onClick={() => setPriceAlertSteps((prev) => prev.filter((_, idx) => idx !== index))}
              >
                Sil
              </AdminButton>
            </div>
          ))}
        </div>
      </section>

      <section
        className={`rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-[var(--admin-shadow)] ${activePanel !== 'procurement' ? 'hidden' : ''}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-700">
              3. Panel
            </div>
            <div className="mt-3 text-xs uppercase tracking-[0.3em] text-indigo-600">Kurumsal satın alma</div>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">Süreç kartları</h2>
            <p className="mt-1 text-sm text-slate-600">
              Teklif ve satın alma adımlarını ziyaretçiye anlatan kartlardır.
            </p>
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
            Yeni adım
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
        <div className="mt-4 space-y-4">
          <div className="hidden md:grid md:grid-cols-[1fr_2fr_160px_auto] gap-3 px-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            <div>Başlık</div>
            <div>Açıklama</div>
            <div>İkon</div>
            <div className="text-right">İşlem</div>
          </div>
          {procurementFlow.map((step, index) => (
            <div
              key={step._id}
              className="grid items-start gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-[1fr_2fr_160px_auto]"
            >
              <input
                className="form-input"
                value={step.title}
                onChange={(e) => {
                  const next = [...procurementFlow];
                  next[index] = { ...next[index], title: e.target.value };
                  setProcurementFlow(next);
                }}
                placeholder="Örn: Teklif"
              />
              <textarea
                className="form-input min-h-[44px] resize-y"
                value={step.description}
                onChange={(e) => {
                  const next = [...procurementFlow];
                  next[index] = { ...next[index], description: e.target.value };
                  setProcurementFlow(next);
                }}
                placeholder="Örn: Teklif detayları ve teslim planı oluşturulur."
              />
              <select
                className="form-input"
                value={step.icon || ''}
                onChange={(e) => {
                  const next = [...procurementFlow];
                  next[index] = { ...next[index], icon: e.target.value || undefined };
                  setProcurementFlow(next);
                }}
              >
                <option value="">İkon seç</option>
                {iconOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <AdminButton
                type="button"
                tone="rose"
                variant="outline"
                onClick={() => setProcurementFlow((prev) => prev.filter((_, idx) => idx !== index))}
              >
                Sil
              </AdminButton>
            </div>
          ))}
        </div>
      </section>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)]/90 p-4 shadow-[var(--admin-shadow)] backdrop-blur">
        <div className="flex flex-wrap gap-3">
          <AdminButton type="button" disabled={isSaving} onClick={saveConfig}>
            {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri kaydet'}
          </AdminButton>
          <AdminButton
            type="button"
            variant="outline"
            onClick={() => {
              const ok = window.confirm('Tüm paneller varsayılan ayarlara dönecek. Emin misin?');
              if (!ok) return;
              setCapacitySchedule(homePanelDefaults.capacitySchedule.map((slot) => ({ _id: makeId(), ...slot })));
              setPriceAlertSteps(homePanelDefaults.priceAlertSteps.map((step) => ({ _id: makeId(), ...step })));
              setProcurementFlow(homePanelDefaults.procurementFlow.map((step) => ({ _id: makeId(), ...step })));
              setCapacityImageUrl(homePanelDefaults.capacityImageUrl || '');
              setPriceAlertImageUrl(homePanelDefaults.priceAlertImageUrl || '');
              setProcurementImageUrl(homePanelDefaults.procurementImageUrl || '');
              setStatus(null);
            }}
          >
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
