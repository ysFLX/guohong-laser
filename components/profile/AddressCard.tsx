'use client';

import React from 'react';

type Address = {
  id: string;
  label?: string | null;
  fullName?: string | null;
  phone?: string | null;
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  isDefault?: boolean;
};

type Props = {
  address: Address;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onMakeDefault: (id: string) => void;
};

export default function AddressCard({ address, onEdit, onDelete, onMakeDefault }: Props) {
  return (
    <article className="p-4 bg-white dark:bg-gray-800 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-600 text-white flex items-center justify-center font-medium">{(address.label || 'A').slice(0,1)}</div>
            <div>
              <div className="text-base font-semibold text-gray-900 dark:text-white">{address.label || 'Adres'}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{address.fullName}</div>
            </div>
            {address.isDefault && (
              <span className="ml-2 inline-block text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Varsayılan</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            title="Düzenle"
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => onEdit(address.id)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-600 dark:text-gray-300">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" stroke="currentColor" strokeWidth="0" fill="currentColor" />
              <path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" stroke="currentColor" strokeWidth="0" fill="currentColor" />
            </svg>
          </button>

          <button
            title="Varsayılan Yap"
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => onMakeDefault(address.id)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`text-${address.isDefault ? 'yellow' : 'gray'}-600`}>
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" stroke="currentColor" strokeWidth="0" fill="currentColor" />
            </svg>
          </button>

          <button
            title="Sil"
            className="p-2 rounded hover:bg-red-50 dark:hover:bg-red-900"
            onClick={() => onDelete(address.id)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-red-600">
              <path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" stroke="currentColor" strokeWidth="0" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-3 text-sm text-gray-700 dark:text-gray-200 space-y-1">
        {address.line1 && <div>{address.line1}</div>}
        {address.line2 && <div>{address.line2}</div>}
        <div>{address.city} {address.postalCode}</div>
        {address.phone && <div className="text-sm text-gray-600 dark:text-gray-300">{address.phone}</div>}
      </div>
    </article>
  );
}







