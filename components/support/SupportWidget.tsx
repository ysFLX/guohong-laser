'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

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

const quickPrompts = [
  'Teslimat süresini öğrenmek istiyorum',
  'Modelime uygun parça konusunda destek',
  'Fiyat ve teklif sürecini öğrenmek istiyorum',
];

function TypingDots() {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-2 dark:bg-slate-800/60">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500 [animation-delay:-0.2s] dark:bg-slate-200" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500 [animation-delay:-0.1s] dark:bg-slate-200" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500 dark:bg-slate-200" />
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
  const [supportOnline, setSupportOnline] = useState(true);
  const [waitingReply, setWaitingReply] = useState(false);
  const [agentTyping, setAgentTyping] = useState(false);
  const [supportAgentName, setSupportAgentName] = useState('Müşteri Hizmetleri');
  const [sendError, setSendError] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);
  const [loginHref, setLoginHref] = useState(`/login?next=${encodeURIComponent(pathname || '/')}`);
  const [whatsAppHref, setWhatsAppHref] = useState('https://wa.me/905368316787');
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const next =
      typeof window !== 'undefined'
        ? `${window.location.pathname}${window.location.search}${window.location.hash}`
        : pathname || '/';
    setLoginHref(`/login?next=${encodeURIComponent(next || '/')}`);

    const pageUrl = typeof window !== 'undefined' ? window.location.href : pathname ? `${pathname}` : '';

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

      if (typeof data.authenticated === 'boolean') {
        setAuthenticated(data.authenticated);
      }
      if (Array.isArray(data.messages)) {
        setMessages(data.messages);
      }
      if (typeof data.supportAgentName === 'string' && data.supportAgentName.trim()) {
        setSupportAgentName(data.supportAgentName.trim());
      }

      setSupportOnline(data.supportOnline !== false);
      setWaitingReply(Boolean(data.waitingReply));
      setAgentTyping(Boolean(data.agentTyping));
      setInitialized(true);
    } catch {
      setSupportOnline(false);
      setWaitingReply(false);
      setAgentTyping(false);
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
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open || !authenticated) return;

    const timer = setInterval(() => {
      loadMessages(false);
    }, 5000);

    return () => clearInterval(timer);
  }, [open, authenticated]);

  useEffect(() => {
    if (!open) return;

    const isMobile = window.matchMedia('(max-width: 640px)').matches;
    if (!isMobile) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const el = scrollAreaRef.current;
    if (!el) return;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const isNearBottom = distanceFromBottom < 140;

    if (isNearBottom) {
      el.scrollTop = el.scrollHeight;
    }
  }, [open, sortedMessages.length, agentTyping]);

  useEffect(() => {
    if (!open || !authenticated) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open, authenticated]);

  async function sendMessage() {
    const message = input.trim();
    if (!message || sending) return;

    setSending(true);
    setSendError(null);

    try {
      const response = await fetch('/api/support/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      const data = (await response.json().catch(() => ({}))) as { message?: LiveMessage; error?: string };

      if (!response.ok) {
        setSendError(data.error || 'Mesaj gönderilemedi. Lütfen tekrar dene.');
        return;
      }

      if (data.message) {
        setMessages((prev) => [...prev, data.message as LiveMessage]);
      }

      setInput('');
      loadMessages(false);
    } catch {
      setSendError('Bağlantı sorunu nedeniyle mesaj gönderilemedi.');
    } finally {
      setSending(false);
    }
  }

  async function closeConversation() {
    if (closing) return;

    setClosing(true);
    setSendError(null);
    try {
      const response = await fetch('/api/support/live', { method: 'DELETE' });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setSendError(data.error || 'Sohbet kapatilamadi. Lutfen tekrar deneyin.');
        return;
      }
      setInput('');
      setMessages([]);
      setWaitingReply(false);
      setAgentTyping(false);
      await loadMessages(false);
    } catch {
      setSendError('Baglanti sorunu nedeniyle sohbet kapatilamadi.');
    } finally {
      setClosing(false);
    }
  }

  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+14px)] right-4 z-[140] sm:bottom-4 sm:right-6">
      {open && (
        <>
          <button
            type="button"
            aria-label="Canlı destek panelini kapat"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[130] bg-slate-950/55 backdrop-blur-[1px]"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Canlı destek"
            className="relative z-[140] mb-3 flex h-[min(80dvh,660px)] w-[min(92vw,390px)] flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.24)] backdrop-blur dark:border-slate-800/60 dark:bg-slate-950/90 max-sm:fixed max-sm:inset-x-0 max-sm:bottom-0 max-sm:mb-0 max-sm:h-[85dvh] max-sm:w-full max-sm:rounded-b-none max-sm:rounded-t-3xl"
          >
            <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 px-5 py-4 text-white">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs uppercase tracking-[0.3em] text-indigo-100">Canlı Destek</div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em]">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        initialized ? (supportOnline ? 'bg-emerald-300' : 'bg-amber-300') : 'bg-white/60'
                      }`}
                      aria-hidden="true"
                    />
                    {supportOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                    aria-label="Kapat"
                  >
                    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="mt-2 text-sm font-semibold">{supportAgentName}</div>
              <p className="mt-1 text-xs text-indigo-100">Mesaj bırak, ekip en kısa sürede dönüş yapsın.</p>
            </div>

            <div className="border-b border-slate-100 bg-white/80 px-5 py-3 dark:border-slate-900/70 dark:bg-slate-950/70">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => {
                      setInput(prompt);
                      setSendError(null);
                      window.setTimeout(() => inputRef.current?.focus(), 0);
                    }}
                    className="shrink-0 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[11px] font-medium text-indigo-700 transition hover:border-indigo-300 dark:border-indigo-400/30 dark:bg-indigo-500/10 dark:text-indigo-200"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div
              ref={scrollAreaRef}
              className="flex-1 space-y-3 overflow-y-auto bg-slate-50/70 px-5 py-4 text-sm dark:bg-slate-950/40"
            >
              {loading && !hasMessages && <div className="text-xs text-slate-500">Yükleniyor...</div>}

              {authenticated && !hasMessages && !loading && (
                <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-200">
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
                            ? 'max-w-[85%] rounded-2xl rounded-br-md bg-gradient-to-br from-indigo-600 to-violet-600 px-3 py-2 text-xs text-white shadow-[0_10px_25px_rgba(79,70,229,0.25)]'
                            : 'max-w-[85%] rounded-2xl rounded-bl-md border border-slate-200/80 bg-white/95 px-3 py-2 text-xs text-slate-700 shadow-sm dark:border-slate-800/70 dark:bg-slate-950/70 dark:text-slate-200'
                        }
                      >
                        <div>{item.text}</div>
                        <div
                          className={
                            item.role === 'user'
                              ? 'mt-1 text-[10px] text-indigo-100'
                              : 'mt-1 text-[10px] text-slate-400 dark:text-slate-500'
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
                    <div className="text-[11px] text-slate-500">Destek ekibi mesajını görüyor, kısa sürede yanıtlanır.</div>
                  )}
                </div>
              )}

              {!authenticated && !loading && (
                <div className="space-y-3">
                  {fallbackFaqs.map((item) => (
                    <div
                      key={item.q}
                      className="rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950/70"
                    >
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{item.q}</div>
                      <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">{item.a}</div>
                    </div>
                  ))}
                  <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs text-indigo-700 dark:border-indigo-400/30 dark:bg-indigo-500/10 dark:text-indigo-200">
                    Anlık sohbet için önce hesaba giriş yap.
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-2 border-t border-slate-100 px-5 py-4 dark:border-slate-900/70">
              {sendError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-700 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-200">
                  {sendError}
                </div>
              )}

              {authenticated ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={(event) => {
                        setInput(event.target.value);
                        if (sendError) setSendError(null);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') sendMessage();
                      }}
                      placeholder="Mesajınızı yazın..."
                      className="h-10 w-full rounded-full border border-slate-200/80 bg-white/95 px-4 text-xs text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800/70 dark:bg-slate-950/70 dark:text-slate-200"
                    />
                    <button
                      type="button"
                      onClick={sendMessage}
                      disabled={sending || !input.trim()}
                      className="inline-flex h-10 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-4 text-xs font-semibold text-white shadow-[0_12px_30px_rgba(79,70,229,0.25)] transition hover:opacity-95 disabled:opacity-60"
                    >
                      {sending ? '...' : 'Gönder'}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={closeConversation}
                    disabled={closing}
                    className="inline-flex h-9 items-center justify-center rounded-full border border-slate-300 px-4 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800/60"
                  >
                    {closing ? 'Kapatiliyor...' : 'Sohbeti Bitir'}
                  </button>
                </div>
              ) : (
                <Link
                  href={loginHref}
                  className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
                >
                  Giriş yap
                </Link>
              )}

              <a
                href={whatsAppHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-indigo-200 px-4 py-2 text-xs font-semibold text-indigo-700 transition hover:border-indigo-300 dark:border-indigo-400/30 dark:text-indigo-200 dark:hover:bg-indigo-500/10"
              >
                WhatsApp canlı hat
              </a>
            </div>
          </div>
        </>
      )}

      <div className="flex items-center justify-end gap-2">
        {!open && (
          <div className="hidden rounded-full border border-indigo-200/70 bg-white/90 px-3 py-2 text-[11px] font-semibold text-indigo-700 shadow-sm backdrop-blur sm:block dark:border-indigo-400/20 dark:bg-slate-950/80 dark:text-indigo-200">
            Canlı Destek
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-[0_18px_55px_rgba(79,70,229,0.35)] ring-1 ring-white/20 transition hover:scale-[1.03] hover:opacity-95 sm:h-14 sm:w-14"
          aria-label={open ? 'Canlı destek penceresini kapat' : 'Canlı destek penceresini aç'}
        >
          <span
            className={`absolute right-2 top-2 h-2.5 w-2.5 rounded-full ring-2 ring-white/50 ${
              initialized ? (supportOnline ? 'bg-emerald-400' : 'bg-amber-400') : 'bg-white/70'
            }`}
            aria-hidden="true"
          />
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
            <path d="M2 12a10 10 0 1118.22 5.56L22 22l-4.7-1.57A10 10 0 012 12zm6.5-1.25a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5zm3.5 0a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5zm3.5 0a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
