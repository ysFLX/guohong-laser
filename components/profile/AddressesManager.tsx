"use client";

import React, { useEffect, useState } from "react";

/* -------------------- TYPES -------------------- */
type Address = {
  id: string | number;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
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

/* -------------------- MODAL -------------------- */
function Modal({ title, open, onClose, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* -------------------- MAIN -------------------- */
export default function AddressesManager() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const [form, setForm] = useState({
    label: "Ev",
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    postalCode: "",
    country: "Türkiye",
  });

  /* -------------------- EFFECTS -------------------- */
  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  /* -------------------- API -------------------- */
  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      setAddresses(data.user?.addresses || []);
    } catch {
      setToast({ type: "error", message: "Adresler yüklenemedi" });
    } finally {
      setLoading(false);
    }
  }

  async function submitNew(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/profile/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Adres eklenemedi");

      setAddresses(data.addresses || []);
      setShowForm(false);
      setForm({
        label: "Ev",
        fullName: "",
        phone: "",
        line1: "",
        line2: "",
        city: "",
        postalCode: "",
        country: "Türkiye",
      });

      setToast({ type: "success", message: "Adres eklendi" });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Adres eklenemedi";
      setToast({ type: "error", message });
    } finally {
      setLoading(false);
    }
  }

  async function makeDefault(id: string | number) {
    setLoading(true);
    try {
      const res = await fetch(`/api/profile/addresses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Güncelleme hatası");

      setAddresses(data.addresses || []);
      setToast({ type: "success", message: "Varsayılan adres ayarlandı" });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Güncelleme hatası";
      setToast({ type: "error", message });
    } finally {
      setLoading(false);
    }
  }

  async function removeAddress(id: string | number) {
    if (!confirm("Adresi silmek istediğine emin misin?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/profile/addresses/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Silme hatası");

      setAddresses(data.addresses || []);
      setToast({ type: "success", message: "Adres silindi" });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Silme hatası";
      setToast({ type: "error", message });
    } finally {
      setLoading(false);
    }
  }

  /* -------------------- UI -------------------- */
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Adresler
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Teslimat ve fatura adreslerinizi yönetin
            </p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
          >
            + Yeni Adres
          </button>
        </div>

        {/* LIST */}
        <div className="space-y-5">
          {addresses.map((a) => (
            <div
              key={a.id}
              className="bg-white-500 rounded-2xl border border-gray-200 shadow-sm p-6 flex items-start justify-between"
            >
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-gray-900">
                    {a.label}
                  </h3>
                  {a.isDefault && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-50 text-indigo-700">
                      Varsayılan
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-700">{a.fullName}</p>

                <p className="text-sm text-gray-500 leading-relaxed">
                  {a.line1}
                  {a.line2 && `, ${a.line2}`}
                  <br />
                  {a.city} {a.postalCode} – {a.country}
                </p>

                <p className="text-sm text-gray-500">{a.phone}</p>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <button className="font-medium text-gray-600 hover:text-gray-900">
                  Düzenle
                </button>

                {!a.isDefault && (
                  <button
                    onClick={() => makeDefault(a.id)}
                    className="font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    Varsayılan Yap
                  </button>
                )}

                <button
                  onClick={() => removeAddress(a.id)}
                  className="font-medium text-red-600 hover:text-red-700"
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      <Modal
        title="Yeni Adres Ekle"
        open={showForm}
        onClose={() => setShowForm(false)}
      >
        <form
          onSubmit={submitNew}
          className="grid grid-cols-1 md:grid-cols-2 text-black gap-4"
        >
          <input
            className="border rounded-lg px-3 text-black py-2 text-sm"
            placeholder="İsim Soyisim"
            value={form.fullName}
            onChange={(e) =>
              setForm({ ...form, fullName: e.target.value })
            }
          />

          <input
            className="border rounded-lg px-3 text-black py-2 text-sm"
            placeholder="Telefon"
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
          />

          <input
            className="border rounded-lg px-3 py-2 text-black text-sm md:col-span-2"
            placeholder="Adres"
            value={form.line1}
            onChange={(e) =>
              setForm({ ...form, line1: e.target.value })
            }
          />

          <input
            className="border rounded-lg px-3 text-black py-2 text-sm"
            placeholder="İl / İlçe"
            value={form.city}
            onChange={(e) =>
              setForm({ ...form, city: e.target.value })
            }
          />

          <input
            className="border rounded-lg px-3 text-black py-2 text-sm"
            placeholder="Posta Kodu"
            value={form.postalCode}
            onChange={(e) =>
              setForm({ ...form, postalCode: e.target.value })
            }
          />

          <input
            className="border rounded-lg px-3 py-2 text-sm text-black md:col-span-2"
            placeholder="Daire / Not (opsiyonel)"
            value={form.line2}
            onChange={(e) =>
              setForm({ ...form, line2: e.target.value })
            }
          />

          <div className="md:col-span-2 flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm rounded-md bg-red-500 border"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm rounded-md bg-indigo-600 text-black disabled:opacity-50"
            >
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </form>
      </Modal>

      {/* TOAST */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-2 rounded-lg shadow text-sm text-black ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
