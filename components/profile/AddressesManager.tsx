"use client";

import { useEffect, useState } from "react";

type Address = {
  id: string;
  label: string | null;
  fullName: string | null;
  phone: string | null;
  line1: string | null;
  line2: string | null;
  city: string | null;
  postalCode: string | null;
  country: string | null;
  isDefault: boolean;
};

type Toast = {
  type: "success" | "error";
  message: string;
};

type ModalProps = {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

function Modal({ title, open, onClose, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
            aria-label="Kapat"
          >
            x
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const emptyForm = {
  label: "Ev",
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  postalCode: "",
  country: "Turkiye",
  isDefault: false,
};

export default function AddressesManager() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [editingid, setEditingid] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      setAddresses(data.user?.addresses || []);
    } catch {
      setToast({ type: "error", message: "Adresler yuklenemedi" });
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingid(null);
    setForm({ ...emptyForm });
    setShowForm(true);
  }

  function openEdit(address: Address) {
    setEditingid(address.id);
    setForm({
      label: address.label ?? "",
      fullName: address.fullName ?? "",
      phone: address.phone ?? "",
      line1: address.line1 ?? "",
      line2: address.line2 ?? "",
      city: address.city ?? "",
      postalCode: address.postalCode ?? "",
      country: address.country ?? "Turkiye",
      isDefault: address.isDefault ?? false,
    });
    setShowForm(true);
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (!form.fullName.trim() || !form.phone.trim() || !form.line1.trim() || !form.city.trim()) {
        throw new Error("isim, telefon, adres ve il zorunludur");
      }

      const payload = {
        label: form.label.trim() || "Ev",
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        line1: form.line1.trim(),
        line2: form.line2.trim() || null,
        city: form.city.trim(),
        postalCode: form.postalCode.trim() || null,
        country: form.country.trim() || "Turkiye",
        isDefault: form.isDefault,
      };

      const res = await fetch(
        editingid ? `/api/profile/addresses/${editingid}` : "/api/profile/addresses",
        {
          method: editingid ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "islem basarisiz");

      setAddresses(data.addresses || []);
      setShowForm(false);
      setEditingid(null);
      setForm({ ...emptyForm });
      setToast({ type: "success", message: editingid ? "Adres guncellendi" : "Adres eklendi" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "islem basarisiz";
      setToast({ type: "error", message });
    } finally {
      setLoading(false);
    }
  }

  async function makeDefault(id: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/profile/addresses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Guncelleme hatasi");

      setAddresses(data.addresses || []);
      setToast({ type: "success", message: "Varsayilan adres ayarlandi" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Guncelleme hatasi";
      setToast({ type: "error", message });
    } finally {
      setLoading(false);
    }
  }

  async function removeAddress(id: string) {
    if (!confirm("Adresi silmek istiyor musun?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/profile/addresses/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Silme hatasi");

      setAddresses(data.addresses || []);
      setToast({ type: "success", message: "Adres silindi" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Silme hatasi";
      setToast({ type: "error", message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Adresler</h2>
          <p className="text-sm text-gray-500 mt-1">Teslimat ve fatura adreslerinizi yonetin</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
        >
          + Yeni Adres
        </button>
      </div>

      {addresses.length === 0 && !loading && (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-sm text-gray-600">
          Henuz adres yok. Yeni adres ekleyebilirsin.
        </div>
      )}

      <div className="space-y-4">
        {addresses.map((a) => (
          <div
            key={a.id}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-gray-900">{a.label || "Adres"}</h3>
                {a.isDefault && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-50 text-indigo-700">
                    Varsayilan
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-700">{a.fullName || "-"}</p>

              <p className="text-sm text-gray-500 leading-relaxed">
                {a.line1 || "-"}
                {a.line2 ? `, ${a.line2}` : ""}
                <br />
                {a.city || "-"} {a.postalCode || ""} {a.country || ""}
              </p>

              <p className="text-sm text-gray-500">{a.phone || "-"}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm">
              <button
                type="button"
                onClick={() => openEdit(a)}
                className="font-medium text-gray-700 hover:text-gray-900"
              >
                Duzenle
              </button>

              {!a.isDefault && (
                <button
                  type="button"
                  onClick={() => makeDefault(a.id)}
                  className="font-medium text-indigo-600 hover:text-indigo-800"
                >
                  Varsayilan Yap
                </button>
              )}

              <button
                type="button"
                onClick={() => removeAddress(a.id)}
                className="font-medium text-red-600 hover:text-red-700"
              >
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        title={editingid ? "Adres Duzenle" : "Yeni Adres Ekle"}
        open={showForm}
        onClose={() => setShowForm(false)}
      >
        <form onSubmit={submitForm} className="grid grid-cols-1 md:grid-cols-2 text-black gap-4">
          <input
            className="border rounded-lg px-3 py-2 text-sm"
            placeholder="Etiket (Ev, is)"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
          />

          <input
            className="border rounded-lg px-3 py-2 text-sm"
            placeholder="isim Soyisim"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />

          <input
            className="border rounded-lg px-3 py-2 text-sm"
            placeholder="Telefon"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <input
            className="border rounded-lg px-3 py-2 text-sm md:col-span-2"
            placeholder="Adres"
            value={form.line1}
            onChange={(e) => setForm({ ...form, line1: e.target.value })}
          />

          <input
            className="border rounded-lg px-3 py-2 text-sm"
            placeholder="il"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />

          <input
            className="border rounded-lg px-3 py-2 text-sm"
            placeholder="Posta Kodu"
            value={form.postalCode}
            onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
          />

          <input
            className="border rounded-lg px-3 py-2 text-sm md:col-span-2"
            placeholder="Daire / Not (opsiyonel)"
            value={form.line2}
            onChange={(e) => setForm({ ...form, line2: e.target.value })}
          />

          <input
            className="border rounded-lg px-3 py-2 text-sm md:col-span-2"
            placeholder="Ulke"
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
          />

          <label className="md:col-span-2 inline-flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
            />
            Varsayilan adres yap
          </label>

          <div className="md:col-span-2 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm rounded-md border border-gray-200 text-gray-700"
            >
              iptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm rounded-md bg-indigo-600 text-white disabled:opacity-50"
            >
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </form>
      </Modal>

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-2 rounded-lg shadow text-sm text-white ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

