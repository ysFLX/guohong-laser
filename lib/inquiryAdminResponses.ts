export type InquiryAdminResponseEntry = {
  text: string;
  at: string;
  senderName?: string | null;
  senderUserId?: string | null;
};

const HISTORY_PREFIX = '__INQUIRY_RESPONSE_HISTORY_V1__';

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isEntry(value: unknown): value is InquiryAdminResponseEntry {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<InquiryAdminResponseEntry>;
  return typeof candidate.text === 'string' && typeof candidate.at === 'string';
}

function normalizeEntries(entries: unknown): InquiryAdminResponseEntry[] {
  if (!Array.isArray(entries)) return [];
  return entries
    .filter(isEntry)
    .map((entry) => ({
      text: entry.text.trim(),
      at: entry.at,
      senderName: typeof entry.senderName === 'string' ? entry.senderName : null,
      senderUserId: typeof entry.senderUserId === 'string' ? entry.senderUserId : null,
    }))
    .filter((entry) => entry.text.length > 0);
}

export function parseInquiryAdminResponse(raw: string | null | undefined): InquiryAdminResponseEntry[] {
  if (!raw) return [];

  const trimmed = raw.trim();
  if (!trimmed) return [];

  if (trimmed.startsWith(HISTORY_PREFIX)) {
    try {
      const parsed = JSON.parse(trimmed.slice(HISTORY_PREFIX.length));
      return normalizeEntries(parsed);
    } catch {
      return [];
    }
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (isStringArray(parsed)) {
      return parsed
        .map((text) => text.trim())
        .filter(Boolean)
        .map((text, index) => ({
          text,
          at: new Date(Date.now() + index).toISOString(),
          senderName: null,
          senderUserId: null,
        }));
    }
    const normalized = normalizeEntries(parsed);
    if (normalized.length > 0) return normalized;
  } catch {
    // Fall through to legacy plain-text handling.
  }

  return [
    {
      text: trimmed,
      at: new Date(0).toISOString(),
      senderName: null,
      senderUserId: null,
    },
  ];
}

export function getLatestInquiryAdminResponse(raw: string | null | undefined) {
  const entries = parseInquiryAdminResponse(raw);
  return entries.at(-1)?.text ?? null;
}

export function appendInquiryAdminResponse(
  raw: string | null | undefined,
  text: string,
  meta?: { senderName?: string | null; senderUserId?: string | null; at?: Date },
) {
  const trimmed = text.trim();
  if (!trimmed) {
    return raw?.trim() ? raw.trim() : null;
  }

  const entries = parseInquiryAdminResponse(raw);
  entries.push({
    text: trimmed,
    at: (meta?.at ?? new Date()).toISOString(),
    senderName: meta?.senderName ?? null,
    senderUserId: meta?.senderUserId ?? null,
  });

  return `${HISTORY_PREFIX}${JSON.stringify(entries)}`;
}
