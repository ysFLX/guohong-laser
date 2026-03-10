'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { AdminBadge, AdminButton, AdminRadioCard } from '@/components/admin/AdminUi';

type ThreadSummary = {
  key: string;
  userId: string | null;
  name: string;
  email: string;
  lastAt: string;
  lastPreview: string;
  unreadCount: number;
};

type ThreadMessage = {
  id: string;
  role: 'user' | 'agent';
  text: string;
  at: string;
  status: 'NEW' | 'READ' | 'CLOSED';
  senderName?: string;
};

type LiveSupportPayload = {
  threads: ThreadSummary[];
  activeThread: string | null;
  messages: ThreadMessage[];
  replyTargetInquiryId: string | null;
  error?: string;
};

export default function AdminLiveSupportPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingThread, setDeletingThread] = useState(false);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [replyTargetInquiryId, setReplyTargetInquiryId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [threadQuery, setThreadQuery] = useState('');
  const [threadFilter, setThreadFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const typingPingAtRef = useRef(0);

  const selectedThreadInfo = useMemo(
    () => threads.find((x) => x.key === selectedThread) || null,
    [threads, selectedThread],
  );

  async function pingTyping(inquiryId: string) {
    const now = Date.now();
    if (now - typingPingAtRef.current < 2500) return;
    typingPingAtRef.current = now;

    try {
      await fetch(`/api/admin/inquiries/${inquiryId}/reply`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'READ' }),
      });
    } catch {
      // no-op
    }
  }

  const filteredThreads = useMemo(() => {
    const query = threadQuery.trim().toLocaleLowerCase('tr-TR').replaceAll('ı', 'i');
    return threads.filter((thread) => {
      if (threadFilter === 'UNREAD' && thread.unreadCount <= 0) return false;
      if (!query) return true;
      const searchable = [thread.name, thread.email, thread.lastPreview]
        .join(' ')
        .toLocaleLowerCase('tr-TR')
        .replaceAll('ı', 'i');
      return searchable.includes(query);
    });
  }, [threads, threadQuery, threadFilter]);

  async function load(showLoader = false, threadParam?: string | null) {
    if (showLoader) setLoading(true);
    setError(null);
    try {
      const thread = threadParam ?? selectedThread;
      const query = thread ? `?thread=${encodeURIComponent(thread)}` : '';
      const res = await fetch(`/api/admin/support/live${query}`, { cache: 'no-store' });
      const data = (await res.json().catch(() => ({}))) as LiveSupportPayload;

      if (!res.ok) {
        setError(data.error || 'Canlı destek verisi alınamadı.');
        return;
      }

      setThreads(data.threads || []);
      setSelectedThread(data.activeThread || null);
      setMessages(data.messages || []);
      setReplyTargetInquiryId(data.replyTargetInquiryId || null);
    } finally {
      if (showLoader) setLoading(false);
    }
  }

  useEffect(() => {
    load(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      load(false);
    }, 5000);
    return () => clearInterval(timer);
  }, [selectedThread]);

  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    const timer = window.setTimeout(() => {
      el.scrollTop = el.scrollHeight;
    }, 0);
    return () => window.clearTimeout(timer);
  }, [selectedThread]);

  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const isNearBottom = distanceFromBottom < 180;
    if (isNearBottom) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages.length]);

  async function handleSend() {
    const adminResponse = input.trim();
    if (!adminResponse || !replyTargetInquiryId || saving) return;

    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/inquiries/${replyTargetInquiryId}/reply`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminResponse,
          status: 'READ',
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error || 'Yanıt gönderilemedi.');
        return;
      }

      setInput('');
      await load(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteThread() {
    if (!selectedThread || deletingThread) return;

    const selectedName = selectedThreadInfo?.name || 'bu kullanıcı';
    const approved = window.confirm(`${selectedName} konuşmasını kalıcı olarak silmek istiyor musun?`);
    if (!approved) return;

    setDeletingThread(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/support/live?thread=${encodeURIComponent(selectedThread)}`, {
        method: 'DELETE',
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        setError(data.error || 'Konuşma silinemedi.');
        return;
      }

      const remaining = threads.filter((thread) => thread.key !== selectedThread);
      const nextThread = remaining[0]?.key || null;

      if (nextThread) {
        await load(false, nextThread);
      } else {
        await load(false, '');
      }
    } finally {
      setDeletingThread(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-5 py-4 shadow-sm">
        <div className="text-[11px] uppercase tracking-[0.24em] text-[var(--admin-muted)]">Canlı destek</div>
        <h1 className="mt-1 text-2xl font-semibold text-[var(--admin-text)]">Mesaj merkezi</h1>
        <p className="mt-1 text-sm text-[var(--admin-muted)]">
          Kullanıcı mesajlarını gerçek zamanlı izle, tek ekrandan yanıtla.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[340px_1fr]">
        <section className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] shadow-sm">
          <div className="border-b border-[var(--admin-border)] px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-[var(--admin-text)]">Konuşmalar</div>
              <AdminBadge tone="slate">
                {filteredThreads.length}/{threads.length}
              </AdminBadge>
            </div>
            <div className="mt-3 space-y-3">
              <div className="flex items-center gap-2 rounded-full border border-[var(--admin-border)] bg-[var(--admin-card-muted)] px-3 py-2 shadow-sm">
                <svg viewBox="0 0 20 20" className="h-4 w-4 text-[var(--admin-muted)]" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
                <input
                  value={threadQuery}
                  onChange={(event) => setThreadQuery(event.target.value)}
                  placeholder="İsim veya e-posta ara"
                  className="w-full bg-transparent text-xs text-[var(--admin-text)] placeholder:text-[var(--admin-muted)] focus:outline-none"
                />
                {threadQuery ? (
                  <button
                    type="button"
                    onClick={() => setThreadQuery('')}
                    className="rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-1 text-[11px] font-semibold text-[var(--admin-muted)] transition hover:text-[var(--admin-text)]"
                  >
                    Temizle
                  </button>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <AdminRadioCard active={threadFilter === 'ALL'} onClick={() => setThreadFilter('ALL')}>
                  Hepsi
                </AdminRadioCard>
                <AdminRadioCard active={threadFilter === 'UNREAD'} onClick={() => setThreadFilter('UNREAD')}>
                  Bekleyen
                </AdminRadioCard>
              </div>
            </div>
          </div>
          <div className="max-h-[68vh] space-y-1 overflow-y-auto p-2">
            {loading && <div className="px-3 py-2 text-sm text-[var(--admin-muted)]">Yükleniyor...</div>}
            {!loading && threads.length === 0 && (
              <div className="px-3 py-2 text-sm text-[var(--admin-muted)]">Henüz canlı destek mesajı yok.</div>
            )}
            {filteredThreads.map((thread) => {
              const active = selectedThread === thread.key;
              return (
                <button
                  key={thread.key}
                  type="button"
                  onClick={() => load(false, thread.key)}
                  className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                    active
                      ? 'border-[var(--admin-accent)] bg-[var(--admin-sidebar-active)]'
                      : 'border-[var(--admin-border)] hover:bg-[var(--admin-card-muted)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-sm font-semibold text-[var(--admin-text)]">{thread.name}</div>
                    {thread.unreadCount > 0 && (
                      <AdminBadge tone="rose">{thread.unreadCount}</AdminBadge>
                    )}
                  </div>
                  <div className="truncate text-xs text-[var(--admin-muted)]">{thread.email}</div>
                  <div className="mt-1 truncate text-xs text-[var(--admin-muted)]">{thread.lastPreview}</div>
                  <div className="mt-1 text-[11px] text-[var(--admin-muted)]">
                    {new Date(thread.lastAt).toLocaleString('tr-TR')}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] shadow-sm">
          <div className="border-b border-[var(--admin-border)] px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-[var(--admin-text)]">
                {selectedThreadInfo ? `${selectedThreadInfo.name} ile sohbet` : 'Sohbet seç'}
              </div>
              {selectedThread ? (
                <AdminButton
                  type="button"
                  onClick={handleDeleteThread}
                  disabled={deletingThread}
                  tone="rose"
                  variant="outline"
                  className="h-9 px-3 text-xs"
                >
                  {deletingThread ? 'Siliniyor...' : 'Sohbeti Sil'}
                </AdminButton>
              ) : null}
            </div>
            {selectedThreadInfo && (
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--admin-muted)]">
                <span>{selectedThreadInfo.email}</span>
                {selectedThreadInfo.unreadCount > 0 ? (
                  <AdminBadge tone="amber">Bekleyen: {selectedThreadInfo.unreadCount}</AdminBadge>
                ) : (
                  <AdminBadge tone="emerald">Güncel</AdminBadge>
                )}
              </div>
            )}
          </div>

          <div ref={messagesRef} className="max-h-[56vh] min-h-[360px] space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="text-sm text-[var(--admin-muted)]">Bu sohbette mesaj yok.</div>
            )}
            {messages.map((item) => (
              <div key={item.id} className={item.role === 'user' ? 'flex justify-start' : 'flex justify-end'}>
                <div
                  className={
                    item.role === 'user'
                      ? 'max-w-[80%] rounded-2xl rounded-bl-md border border-[var(--admin-border)] bg-[var(--admin-card-muted)] px-3 py-2'
                      : 'max-w-[80%] rounded-2xl rounded-br-md bg-indigo-600 px-3 py-2 text-white shadow-sm'
                  }
                >
                  <div className="text-xs leading-6">{item.text}</div>
                  <div className={`mt-1 text-[10px] ${item.role === 'user' ? 'text-[var(--admin-muted)]' : 'text-white/80'}`}>
                    {new Date(item.at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    {item.senderName ? ` · ${item.senderName}` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-[var(--admin-border)] p-4">
            {error && <div className="mb-2 text-xs font-medium text-rose-600">{error}</div>}
            <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(event) => {
                    const next = event.target.value;
                    setInput(next);
                    if (!replyTargetInquiryId) return;
                    if (!next.trim()) return;
                    void pingTyping(replyTargetInquiryId);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') handleSend();
                  }}
                  placeholder={replyTargetInquiryId ? 'Yanıt yaz...' : 'Yanıtlanacak mesaj yok'}
                disabled={!replyTargetInquiryId || saving}
                className="h-11 w-full rounded-xl border border-[var(--admin-border)] bg-[var(--admin-card-muted)] px-3 text-sm text-[var(--admin-text)] outline-none focus:border-[var(--admin-accent)] disabled:opacity-60"
              />
              <AdminButton
                type="button"
                onClick={handleSend}
                disabled={!replyTargetInquiryId || !input.trim() || saving}
                className="h-11 px-5 text-sm"
              >
                {saving ? 'Gönderiliyor...' : 'Gönder'}
              </AdminButton>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
