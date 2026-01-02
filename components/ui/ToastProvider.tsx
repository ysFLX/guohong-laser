'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type ToastAction = {
  label: string;
  onClick: () => void;
};

type ToastItem = {
  id: string;
  message: string;
  actions?: ToastAction[];
};

type ToastContextValue = {
  show: (message: string, actions?: ToastAction[]) => string;
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
    (message: string, actions?: ToastAction[]) => {
      const id = createId();
      const toast: ToastItem = { id, message, actions };
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
            className="pointer-events-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
          >
            <div className="text-sm font-semibold text-slate-900">{toast.message}</div>
            {toast.actions && toast.actions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {toast.actions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={action.onClick}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
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
