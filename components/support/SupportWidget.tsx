'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

type LiveMessage = {
  id: string;
  role: 'user' | 'agent';
  text: string;
  at: string;
  status?: string;
};

type LivePayload = {
  authenticated?: boolean;
  messages?: LiveMessage[];
  supportAgentName?: string;
  supportOnline?: boolean;
  waitingReply?: boolean;
  agentTyping?: boolean;
};

const fallbackFaqs = [
  {
    q: 'Teslimat ne kadar sürüyor?',
    a: 'Stoklu ürünlerde 2-3 iş günü, özel siparişlerde 7-10 gün.',
  },
  {
    q: 'Garanti nasıl işliyor?',
    a: 'Resmi servis garantisi ve fatura ile destek sağlanıyor.',
  },
  {
    q: 'Uyumluluk teyidi alabilir miyim?',
    a: 'Model bilgisini paylaşırsan teknik ekip teyit eder.',
  },
];

function TypingDots() {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-2">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500 [animation-delay:-0.2s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500 [animation-delay:-0.1s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500" />
    </div>
  );
}

export default function SupportWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [sending, setSending] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [input, setInput] = useState('');
  const [supportAgentName, setSupportAgentName] = useState('Guohong Destek');
  const [supportOnline, setSupportOnline] = useState(true);
  const [waitingReply, setWaitingReply] = useState(false);
  const [agentTyping, setAgentTyping] = useState(false);
  const [loginHref, setLoginHref] = useState(`/login?next=${encodeURIComponent(pathname || '/')}`);
  const [whatsAppHref, setWhatsAppHref] = useState('https://wa.me/905368316787');

  useEffect(() => {
    const next =
      typeof window !== 'undefined'
        ? `${window.location.pathname}${window.location.search}${window.location.hash}`
        : pathname || '/';
    setLoginHref(`/login?next=${encodeURIComponent(next || '/')}`);

    const pageUrl =
      typeof window !== 'undefined'
        ? window.location.href
        : pathname
          ? `${pathname}`
          : '';

    const message = pageUrl
      ? `Merhaba, Guohong Lazer sitesinden yazıyorum. Şu sayfa hakkında destek rica ediyorum:\n${pageUrl}`
      : 'Merhaba, Guohong Lazer sitesinden yazıyorum. Destek rica ediyorum.';

    setWhatsAppHref(`https://wa.me/905368316787?text=${encodeURIComponent(message)}`);
  }, [pathname]);

  const hasMessages = messages.length > 0;

  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()),
    [messages],
  );

  async function loadMessages(showLoader = false) {
    if (showLoader) setLoading(true);
    try {
      const response = await fetch('/api/support/live', { cache: 'no-store' });
      const data = (await response.json().catch(() => ({}))) as LivePayload;

      // Keep last valid state to prevent message flicker during transient responses.
      if (typeof data.authenticated === 'boolean') {
        setAuthenticated(data.authenticated);
      }
      if (Array.isArray(data.messages)) {
        setMessages(data.messages);
      }
      setSupportAgentName(data.supportAgentName || 'Guohong Destek');
      setSupportOnline(data.supportOnline !== false);
      setWaitingReply(Boolean(data.waitingReply));
      setAgentTyping(Boolean(data.agentTyping));
      setInitialized(true);
    } finally {
      if (showLoader) setLoading(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    loadMessages(!initialized);
  }, [open]);

  useEffect(() => {
    if (!open || !authenticated) return;

    const timer = setInterval(() => {
      loadMessages(false);
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

      const data = (await response.json().catch(() => ({}))) as { message?: LiveMessage };

      if (!response.ok) {
        return;
      }

      if (data.message) {
        setMessages((prev) => [...prev, data.message as LiveMessage]);
      }
      setInput('');
      loadMessages(false);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-6 z-40">
      {open && (
        <div className="mb-3 w-[370px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
          <div className="bg-gradient-to-r from-indigo-700 to-indigo-600 px-5 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-[0.3em] text-indigo-100">Canlı Destek</div>
              <span className="rounded-full bg-white/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em]">
                {supportOnline ? 'Çevrimiçi' : 'Meşgul'}
              </span>
            </div>
            <div className="mt-2 text-sm font-semibold">{supportAgentName}</div>
            <p className="mt-1 text-xs text-indigo-100">
              Gerçek zamanlı destek için mesajını bırak, ekip panelde anında görür.
            </p>
          </div>

          <div className="max-h-[360px] space-y-3 overflow-y-auto bg-slate-50 px-5 py-4 text-sm">
            {loading && !hasMessages && <div className="text-xs text-slate-500">Yükleniyor...</div>}

            {authenticated && !hasMessages && !loading && (
              <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                Henüz mesaj yok. Aşağıdan ilk mesajını gönderebilirsin.
              </div>
            )}

            {authenticated && hasMessages && (
              <div className="space-y-2">
                {sortedMessages.map((item) => (
                  <div key={item.id} className={item.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                    <div
                      className={
                        item.role === 'user'
                          ? 'max-w-[85%] rounded-2xl rounded-br-md bg-indigo-600 px-3 py-2 text-xs text-white shadow-sm'
                          : 'max-w-[85%] rounded-2xl rounded-bl-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm'
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
                  </div>
                ))}

                {agentTyping && (
                  <div className="flex items-center gap-2">
                    <TypingDots />
                    <span className="text-[10px] font-medium text-slate-500">{supportAgentName} yazıyor...</span>
                  </div>
                )}

                {waitingReply && !agentTyping && (
                  <div className="text-[11px] text-slate-500">
                    Destek ekibi mesajını görüyor, kısa sürede yanıtlanır.
                  </div>
                )}
              </div>
            )}

            {!authenticated && !loading && (
              <div className="space-y-3">
                {fallbackFaqs.map((item) => (
                  <div key={item.q} className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{item.q}</div>
                    <div className="mt-1 text-xs text-slate-600">{item.a}</div>
                  </div>
                ))}
                <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
                  Anlık sohbet için önce hesaba giriş yap.
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
                  placeholder="Mesajınızı yazın..."
                  className="h-10 w-full rounded-full border border-slate-200 bg-white px-4 text-xs text-slate-700 outline-none focus:border-indigo-400"
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={sending || !input.trim()}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-indigo-600 px-4 text-xs font-semibold text-white disabled:opacity-60"
                >
                  {sending ? '...' : 'Gönder'}
                </button>
              </div>
            ) : (
              <Link
                href={loginHref}
                className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white"
              >
                Giriş yap
              </Link>
            )}

            <a
              href={whatsAppHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-indigo-200 px-4 py-2 text-xs font-semibold text-indigo-700"
            >
              WhatsApp canlı hat
            </a>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl transition hover:scale-[1.03]"
        aria-label="Canlı destek penceresini aç"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
          <path d="M2 12a10 10 0 1118.22 5.56L22 22l-4.7-1.57A10 10 0 012 12zm6.5-1.25a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5zm3.5 0a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5zm3.5 0a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5z" />
        </svg>
      </button>
    </div>
  );
}
