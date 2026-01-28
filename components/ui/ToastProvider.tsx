'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type ToastAction = {
  label: string;
  onClick: () => void;
};

type ToastVariant = 'success' | 'error';

type ToastItem = {
  id: string;
  message: string;
  actions?: ToastAction[];
  variant: ToastVariant;
};

type ToastContextValue = {
  show: (message: string, actions?: ToastAction[], variant?: ToastVariant) => string;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function createId() {
  return Math.random().toString(36).slice(2, 10);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (message: string, actions?: ToastAction[], variant: ToastVariant = 'success') => {
      const id = createId();
      const toast: ToastItem = { id, message, actions, variant };
      setToasts((prev) => [toast, ...prev].slice(0, 3));
      window.setTimeout(() => dismiss(id), 5000);
      return id;
    },
    [dismiss],
  );

  const value = useMemo(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-6 top-6 z-50 flex w-[320px] flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast-enter pointer-events-auto rounded-2xl border p-4 text-white shadow-2xl ${
              toast.variant === 'error'
                ? 'border-rose-200/70 bg-gradient-to-br from-rose-500/95 via-rose-500/90 to-rose-600/90'
                : 'border-indigo-200/70 bg-gradient-to-br from-indigo-500/95 via-indigo-500/90 to-indigo-600/90'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.7)]" />
              <div className="text-sm font-semibold">{toast.message}</div>
            </div>
            {toast.actions && toast.actions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {toast.actions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={action.onClick}
                    className="rounded-lg border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

