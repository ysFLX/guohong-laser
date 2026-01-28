'use client';

import { useState } from 'react';

import type { CapacitySlot, HomePanelConfig, PriceAlertStep, ProcurementStep } from '@/lib/homePanelDefaults';
import { homePanelDefaults } from '@/lib/homePanelDefaults';
import AdminAssetUpload from '@/components/admin/AdminAssetUpload';
import { AdminButton } from '@/components/admin/AdminUi';

type Props = {
  initialConfig: HomePanelConfig;
};

export default function HomePanelsForm({ initialConfig }: Props) {
  const [capacitySchedule, setCapacitySchedule] = useState<CapacitySlot[]>(initialConfig.capacitySchedule);
  const [priceAlertSteps, setPriceAlertSteps] = useState<PriceAlertStep[]>(initialConfig.priceAlertSteps);
  const [procurementFlow, setProcurementFlow] = useState<ProcurementStep[]>(initialConfig.procurementFlow);
  const [capacityImageUrl, setCapacityImageUrl] = useState(initialConfig.capacityImageUrl || '');
  const [priceAlertImageUrl, setPriceAlertImageUrl] = useState(initialConfig.priceAlertImageUrl || '');
  const [procurementImageUrl, setProcurementImageUrl] = useState(initialConfig.procurementImageUrl || '');
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const iconOptions = [
    { value: 'building', label: 'Kurumsal' },
    { value: 'calendar', label: 'Takvim' },
    { value: 'shield-check', label: 'Guvenlik' },
    { value: 'chart-up', label: 'Performans' },
    { value: 'briefcase', label: 'Is sureci' },
    { value: 'document', label: 'Dokuman' },
    { value: 'badge-check', label: 'Onay' },
    { value: 'signature', label: 'Imza' },
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
      setStatus({ type: 'success', message: 'Paneller guncellendi.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Kaydedilemedi';
      setStatus({ type: 'error', message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {status && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            status.type === 'success'
              ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
              : 'border-rose-200 bg-rose-50 text-rose-600'
          }`}
        >
          {status.message}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-indigo-600">Canli kapasite takvimi</div>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">Servis ve kesif slotlari</h2>
          </div>
          <AdminButton
            type="button"
            variant="outline"
            onClick={() =>
              setCapacitySchedule((prev) => [
                ...prev,
                { title: 'Yeni slot', status: '%0 dolu', detail: 'Detay ekle', window: 'Tarih araligi', icon: '' },
              ])
            }
          >
            Slot ekle
          </AdminButton>
        </div>
        <div className="mt-4">
          <AdminAssetUpload
            label="Panel gorseli"
            helper="Opsiyonel: premium gorunum icin tek gorsel ekleyebilirsin."
            value={capacityImageUrl}
            onChange={setCapacityImageUrl}
          />
        </div>
        <div className="mt-4 space-y-4">
          {capacitySchedule.map((slot, index) => (
            <div key={`${slot.title}-${index}`} className="grid gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-5">
              <input
                className="form-input"
                value={slot.title}
                onChange={(e) => {
                  const next = [...capacitySchedule];
                  next[index] = { ...next[index], title: e.target.value };
                  setCapacitySchedule(next);
                }}
                placeholder="Baslik"
              />
              <input
                className="form-input"
                value={slot.status}
                onChange={(e) => {
                  const next = [...capacitySchedule];
                  next[index] = { ...next[index], status: e.target.value };
                  setCapacitySchedule(next);
                }}
                placeholder="% doluluk"
              />
              <input
                className="form-input"
                value={slot.detail}
                onChange={(e) => {
                  const next = [...capacitySchedule];
                  next[index] = { ...next[index], detail: e.target.value };
                  setCapacitySchedule(next);
                }}
                placeholder="Detay"
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
                <option value="">Ikon sec</option>
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
                  placeholder="Tarih araligi"
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

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-indigo-600">Fiyat dusus alarmi</div>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">Musteri yolculugu adimlari</h2>
          </div>
          <AdminButton
            type="button"
            variant="outline"
            onClick={() => setPriceAlertSteps((prev) => [...prev, { text: 'Yeni adim', icon: '' }])}
          >
            Adim ekle
          </AdminButton>
        </div>
        <div className="mt-4">
          <AdminAssetUpload
            label="Panel gorseli"
            helper="Opsiyonel: fiyat alarmi paneline arka plan gorseli."
            value={priceAlertImageUrl}
            onChange={setPriceAlertImageUrl}
          />
        </div>
        <div className="mt-4 space-y-3">
          {priceAlertSteps.map((step, index) => (
            <div key={`${step.text}-${index}`} className="flex items-center gap-3">
              <input
                className="form-input flex-1"
                value={step.text}
                onChange={(e) => {
                  const next = [...priceAlertSteps];
                  next[index] = { ...next[index], text: e.target.value };
                  setPriceAlertSteps(next);
                }}
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
                <option value="">Ikon sec</option>
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

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-indigo-600">Kurumsal satin alma</div>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">Surec kartlari</h2>
          </div>
          <AdminButton
            type="button"
            variant="outline"
            onClick={() =>
              setProcurementFlow((prev) => [...prev, { title: 'Yeni adim', description: 'Aciklama ekle', icon: '' }])
            }
          >
            Adim ekle
          </AdminButton>
        </div>
        <div className="mt-4">
          <AdminAssetUpload
            label="Panel gorseli"
            helper="Opsiyonel: satin alma paneli icin kurumsal gorsel."
            value={procurementImageUrl}
            onChange={setProcurementImageUrl}
          />
        </div>
        <div className="mt-4 space-y-4">
          {procurementFlow.map((step, index) => (
            <div key={`${step.title}-${index}`} className="grid gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-[1fr_2fr_160px_auto]">
              <input
                className="form-input"
                value={step.title}
                onChange={(e) => {
                  const next = [...procurementFlow];
                  next[index] = { ...next[index], title: e.target.value };
                  setProcurementFlow(next);
                }}
                placeholder="Baslik"
              />
              <input
                className="form-input"
                value={step.description}
                onChange={(e) => {
                  const next = [...procurementFlow];
                  next[index] = { ...next[index], description: e.target.value };
                  setProcurementFlow(next);
                }}
                placeholder="Aciklama"
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
                <option value="">Ikon sec</option>
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

      <div className="flex flex-wrap gap-3">
        <AdminButton type="button" disabled={isSaving} onClick={saveConfig}>
          {isSaving ? 'Kaydediliyor...' : 'Degisiklikleri kaydet'}
        </AdminButton>
        <AdminButton
          type="button"
          variant="outline"
          onClick={() => {
            setCapacitySchedule(homePanelDefaults.capacitySchedule);
            setPriceAlertSteps(homePanelDefaults.priceAlertSteps);
            setProcurementFlow(homePanelDefaults.procurementFlow);
            setCapacityImageUrl(homePanelDefaults.capacityImageUrl || '');
            setPriceAlertImageUrl(homePanelDefaults.priceAlertImageUrl || '');
            setProcurementImageUrl(homePanelDefaults.procurementImageUrl || '');
            setStatus(null);
          }}
        >
          Varsayilana don
        </AdminButton>
      </div>
    </div>
  );
}

