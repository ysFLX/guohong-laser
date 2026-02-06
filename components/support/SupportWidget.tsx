'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type LiveMessage = {
  id: string;
  role: 'user' | 'agent';
  text: string;
  at: string;
  status?: string;
};

const fallbackFaqs = [
  {
    q: 'Teslimat ne kadar suruyor?',
    a: 'Stoklu urunlerde 2-3 is gunu, ozel siparislerde 7-10 gun.',
  },
  {
    q: 'Garanti nasil isliyor?',
    a: 'Resmi servis garantisi ve fatura ile destek saglaniyor.',
  },
  {
    q: 'Uyumluluk teyidi alabilir miyim?',
    a: 'Model bilgisini paylasirsan teknik ekip teyit eder.',
  },
];

export default function SupportWidget() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [input, setInput] = useState('');

  const hasMessages = messages.length > 0;

  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()),
    [messages],
  );

  async function loadMessages() {
    setLoading(true);
    try {
      const response = await fetch('/api/support/live', { cache: 'no-store' });
      const data = (await response.json().catch(() => ({}))) as {
        authenticated?: boolean;
        messages?: LiveMessage[];
      };

      setAuthenticated(Boolean(data.authenticated));
      setMessages(Array.isArray(data.messages) ? data.messages : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    loadMessages();
  }, [open]);

  useEffect(() => {
    if (!open || !authenticated) return;

    const timer = setInterval(() => {
      loadMessages();
    }, 5000);

    return () => clearInterval(timer);
  }, [open, authenticated]);

  async function sendMessage() {
    const message = input.trim();
    if (!message || sending) return;

    setSending(true);
    try {
      const response = await fetch('/api/support/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      const data = (await response.json().catch(() => ({}))) as { message?: LiveMessage; error?: string };

      if (!response.ok) {
        return;
      }

      if (data.message) {
        setMessages((prev) => [...prev, data.message as LiveMessage]);
      }
      setInput('');
      loadMessages();
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-6 z-40">
      {open && (
        <div className="mb-3 w-[360px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
          <div className="bg-slate-900 px-5 py-4 text-white">
            <div className="text-xs uppercase tracking-[0.3em] text-indigo-300">Canli Destek</div>
            <div className="mt-1 text-lg font-semibold">Anlik sohbet</div>
            <p className="mt-1 text-xs text-slate-300">Teknik ekibe direkt mesaj birak, cevabi burada gor.</p>
          </div>

          <div className="max-h-[360px] space-y-3 overflow-y-auto px-5 py-4 text-sm">
            {loading && <div className="text-xs text-slate-500">Yukleniyor...</div>}

            {!loading && authenticated && !hasMessages && (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                Henuz mesaj yok. Asagidan ilk mesajini gonderebilirsin.
              </div>
            )}

            {!loading && authenticated && hasMessages && (
              <div className="space-y-2">
                {sortedMessages.map((item) => (
                  <div
                    key={item.id}
                    className={
                      item.role === 'user'
                        ? 'ml-auto max-w-[85%] rounded-2xl bg-indigo-600 px-3 py-2 text-xs text-white'
                        : 'mr-auto max-w-[85%] rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700'
                    }
                  >
                    <div>{item.text}</div>
                    <div
                      className={
                        item.role === 'user' ? 'mt-1 text-[10px] text-indigo-100' : 'mt-1 text-[10px] text-slate-400'
                      }
                    >
                      {new Date(item.at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && !authenticated && (
              <div className="space-y-3">
                {fallbackFaqs.map((item) => (
                  <div key={item.q} className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{item.q}</div>
                    <div className="mt-1 text-xs text-slate-600">{item.a}</div>
                  </div>
                ))}
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
                  Anlik sohbet icin once hesaba giris yap.
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-2 border-t border-slate-100 px-5 py-4">
            {authenticated ? (
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') sendMessage();
                  }}
                  placeholder="Mesajinizi yazin..."
                  className="h-10 w-full rounded-full border border-slate-200 px-4 text-xs text-slate-700 outline-none focus:border-indigo-400"
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={sending || !input.trim()}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-slate-900 px-4 text-xs font-semibold text-white disabled:opacity-60"
                >
                  {sending ? '...' : 'Gonder'}
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
              >
                Giris yap
              </Link>
            )}

            <a
              href="https://wa.me/905368316787"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-indigo-200 px-4 py-2 text-xs font-semibold text-indigo-700"
            >
              WhatsApp canli hat
            </a>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl transition hover:scale-[1.03]"
        aria-label="Canli destek penceresini ac"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
          <path d="M2 12a10 10 0 1118.22 5.56L22 22l-4.7-1.57A10 10 0 012 12zm6.5-1.25a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5zm3.5 0a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5zm3.5 0a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5z" />
        </svg>
      </button>
    </div>
  );
}
