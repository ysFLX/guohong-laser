'use client';

import { useEffect, useMemo, useState } from 'react';

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
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [replyTargetInquiryId, setReplyTargetInquiryId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const selectedThreadInfo = useMemo(
    () => threads.find((x) => x.key === selectedThread) || null,
    [threads, selectedThread],
  );

  async function load(showLoader = false, threadParam?: string | null) {
    if (showLoader) setLoading(true);
    setError(null);
    try {
      const thread = threadParam ?? selectedThread;
      const query = thread ? `?thread=${encodeURIComponent(thread)}` : '';
      const res = await fetch(`/api/admin/support/live${query}`, { cache: 'no-store' });
      const data = (await res.json().catch(() => ({}))) as LiveSupportPayload;

      if (!res.ok) {
        setError(data.error || 'Canli destek verisi alinamadi.');
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
        setError((data as { error?: string }).error || 'Yanit gonderilemedi.');
        return;
      }

      setInput('');
      await load(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-5 py-4 shadow-sm">
        <div className="text-[11px] uppercase tracking-[0.24em] text-[var(--admin-muted)]">Canli destek</div>
        <h1 className="mt-1 text-2xl font-semibold text-[var(--admin-text)]">Mesaj merkezi</h1>
        <p className="mt-1 text-sm text-[var(--admin-muted)]">
          Kullanici mesajlarini gercek zamanli izle, tek ekrandan yanitla.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[340px_1fr]">
        <section className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] shadow-sm">
          <div className="border-b border-[var(--admin-border)] px-4 py-3 text-sm font-semibold text-[var(--admin-text)]">
            Konusmalar ({threads.length})
          </div>
          <div className="max-h-[68vh] space-y-1 overflow-y-auto p-2">
            {loading && <div className="px-3 py-2 text-sm text-[var(--admin-muted)]">Yukleniyor...</div>}
            {!loading && threads.length === 0 && (
              <div className="px-3 py-2 text-sm text-[var(--admin-muted)]">Henuz canli destek mesaji yok.</div>
            )}
            {threads.map((thread) => {
              const active = selectedThread === thread.key;
              return (
                <button
                  key={thread.key}
                  type="button"
                  onClick={() => load(false, thread.key)}
                  className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                    active
                      ? 'border-[var(--admin-primary)] bg-[var(--admin-primary-soft)]'
                      : 'border-[var(--admin-border)] hover:bg-[var(--admin-card-muted)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-sm font-semibold text-[var(--admin-text)]">{thread.name}</div>
                    {thread.unreadCount > 0 && (
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                        {thread.unreadCount}
                      </span>
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
            <div className="text-sm font-semibold text-[var(--admin-text)]">
              {selectedThreadInfo ? `${selectedThreadInfo.name} ile sohbet` : 'Sohbet sec'}
            </div>
            {selectedThreadInfo && (
              <div className="text-xs text-[var(--admin-muted)]">
                {selectedThreadInfo.email}
              </div>
            )}
          </div>

          <div className="max-h-[56vh] min-h-[360px] space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="text-sm text-[var(--admin-muted)]">Bu sohbette mesaj yok.</div>
            )}
            {messages.map((item) => (
              <div key={item.id} className={item.role === 'user' ? 'flex justify-start' : 'flex justify-end'}>
                <div
                  className={
                    item.role === 'user'
                      ? 'max-w-[80%] rounded-2xl rounded-bl-md border border-[var(--admin-border)] bg-[var(--admin-card-muted)] px-3 py-2'
                      : 'max-w-[80%] rounded-2xl rounded-br-md bg-[var(--admin-primary)] px-3 py-2 text-white'
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
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleSend();
                }}
                placeholder={replyTargetInquiryId ? 'Yanit yaz...' : 'Yanitlanacak mesaj yok'}
                disabled={!replyTargetInquiryId || saving}
                className="h-11 w-full rounded-xl border border-[var(--admin-border)] bg-[var(--admin-card-muted)] px-3 text-sm text-[var(--admin-text)] outline-none focus:border-[var(--admin-primary)] disabled:opacity-60"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!replyTargetInquiryId || !input.trim() || saving}
                className="h-11 rounded-xl bg-[var(--admin-primary)] px-4 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? 'Gonderiliyor...' : 'Gonder'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

