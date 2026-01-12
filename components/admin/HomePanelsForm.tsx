'use client';

import { useState } from 'react';

import type { CapacitySlot, HomePanelConfig, ProcurementStep } from '@/lib/homePanelDefaults';
import { homePanelDefaults } from '@/lib/homePanelDefaults';

type Props = {
  initialConfig: HomePanelConfig;
};

export default function HomePanelsForm({ initialConfig }: Props) {
  const [capacitySchedule, setCapacitySchedule] = useState<CapacitySlot[]>(initialConfig.capacitySchedule);
  const [priceAlertSteps, setPriceAlertSteps] = useState<string[]>(initialConfig.priceAlertSteps);
  const [procurementFlow, setProcurementFlow] = useState<ProcurementStep[]>(initialConfig.procurementFlow);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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
        <div className={`form-alert ${status.type === 'success' ? 'form-alert--success' : 'form-alert--error'}`}>
          {status.message}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-teal-600">Canli kapasite takvimi</div>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">Servis ve kesif slotlari</h2>
          </div>
          <button
            type="button"
            onClick={() =>
              setCapacitySchedule((prev) => [
                ...prev,
                { title: 'Yeni slot', status: '%0 dolu', detail: 'Detay ekle', window: 'Tarih araligi' },
              ])
            }
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-slate-300"
          >
            Slot ekle
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {capacitySchedule.map((slot, index) => (
            <div key={`${slot.title}-${index}`} className="grid gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-4">
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
                <button
                  type="button"
                  onClick={() => setCapacitySchedule((prev) => prev.filter((_, idx) => idx !== index))}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 hover:border-slate-300"
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-teal-600">Fiyat dusus alarmi</div>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">Musteri yolculugu adimlari</h2>
          </div>
          <button
            type="button"
            onClick={() => setPriceAlertSteps((prev) => [...prev, 'Yeni adim'])}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-slate-300"
          >
            Adim ekle
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {priceAlertSteps.map((step, index) => (
            <div key={`${step}-${index}`} className="flex items-center gap-3">
              <input
                className="form-input flex-1"
                value={step}
                onChange={(e) => {
                  const next = [...priceAlertSteps];
                  next[index] = e.target.value;
                  setPriceAlertSteps(next);
                }}
              />
              <button
                type="button"
                onClick={() => setPriceAlertSteps((prev) => prev.filter((_, idx) => idx !== index))}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 hover:border-slate-300"
              >
                Sil
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-teal-600">Kurumsal satin alma</div>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">Surec kartlari</h2>
          </div>
          <button
            type="button"
            onClick={() =>
              setProcurementFlow((prev) => [...prev, { title: 'Yeni adim', description: 'Aciklama ekle' }])
            }
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-slate-300"
          >
            Adim ekle
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {procurementFlow.map((step, index) => (
            <div key={`${step.title}-${index}`} className="grid gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-[1fr_2fr_auto]">
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
              <button
                type="button"
                onClick={() => setProcurementFlow((prev) => prev.filter((_, idx) => idx !== index))}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 hover:border-slate-300"
              >
                Sil
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn-primary" disabled={isSaving} onClick={saveConfig}>
          {isSaving ? 'Kaydediliyor...' : 'Degisiklikleri kaydet'}
        </button>
        <button
          type="button"
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300"
          onClick={() => {
            setCapacitySchedule(homePanelDefaults.capacitySchedule);
            setPriceAlertSteps(homePanelDefaults.priceAlertSteps);
            setProcurementFlow(homePanelDefaults.procurementFlow);
            setStatus(null);
          }}
        >
          Varsayilana don
        </button>
      </div>
    </div>
  );
}
