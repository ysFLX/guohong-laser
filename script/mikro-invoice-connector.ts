import 'dotenv/config';

import crypto from 'crypto';

import type { InvoiceSnapshot } from '../lib/invoicing/types';

type LeasedInvoice = {
  invoice: {
    id: string;
    orderId: string;
    snapshot: InvoiceSnapshot | null;
  };
  lockToken: string;
};

type MikroConnectorEnv = {
  appBaseUrl: string;
  invoiceCronSecret: string;
  mikroBaseUrl: string;
  mikroApiKey: string;
  mikroCalismaYili: number;
  mikroFirmaKodu: string;
  mikroKullaniciKodu: string;
  mikroSifrePlain: string;
  mikroCariKod: string;
  mikroFaturaSeri: string;
  mikroDepoNo: number;
  mikroSubeNo: number;
  kdvRate: number;
  sendEinvoice: boolean;
};

function requiredEnv(name: string) {
  const value = process.env[name] || '';
  if (!value) throw new Error(`${name} env eksik`);
  return value;
}

function parseNumber(raw: string | undefined, fallback: number) {
  if (!raw) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

function getEnv(): MikroConnectorEnv {
  return {
    appBaseUrl: requiredEnv('APP_BASE_URL').replace(/\/+$/, ''),
    invoiceCronSecret: requiredEnv('INVOICE_CRON_SECRET'),
    mikroBaseUrl: (process.env.MIKRO_API_BASE_URL || 'https://localhost:8094').replace(/\/+$/, ''),
    mikroApiKey: requiredEnv('MIKRO_API_KEY'),
    mikroCalismaYili: parseInt(requiredEnv('MIKRO_CALISMA_YILI'), 10),
    mikroFirmaKodu: requiredEnv('MIKRO_FIRMA_KODU'),
    mikroKullaniciKodu: requiredEnv('MIKRO_KULLANICI_KODU'),
    mikroSifrePlain: requiredEnv('MIKRO_SIFRE'),
    mikroCariKod: requiredEnv('MIKRO_CARI_KOD'),
    mikroFaturaSeri: process.env.MIKRO_FATURA_SERI || 'WEB',
    mikroDepoNo: parseInt(process.env.MIKRO_DEPO_NO || '1', 10),
    mikroSubeNo: parseInt(process.env.MIKRO_SUBE_NO || '0', 10),
    kdvRate: parseNumber(process.env.MIKRO_KDV_RATE, 0.2),
    sendEinvoice: (process.env.MIKRO_SEND_EINVOICE || '1') === '1',
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getIstanbulDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    yyyy: lookup.year,
    mm: lookup.month,
    dd: lookup.day,
  };
}

function formatMikroDate(date = new Date()) {
  const { dd, mm, yyyy } = getIstanbulDateParts(date);
  return `${dd}.${mm}.${yyyy}`;
}

function hashMikroPassword(plainPassword: string, date = new Date()) {
  const { yyyy, mm, dd } = getIstanbulDateParts(date);
  const input = `${yyyy}-${mm}-${dd} ${plainPassword}`;
  return crypto.createHash('md5').update(input, 'utf8').digest('hex');
}

function round2(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function unwrapMikroResponse(json: any) {
  if (json?.success === false) {
    throw new Error(json?.message || 'Mikro hatası');
  }

  const result = json?.result;
  if (Array.isArray(result) && result.length > 0) {
    const first = result[0];
    if (first?.IsError) {
      throw new Error(first?.ErrorMessage || 'Mikro hatası');
    }
    return first?.Data;
  }

  return json;
}

function extractFirstGuid(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === 'string') {
    const guidRegex =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return guidRegex.test(value) ? value : null;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = extractFirstGuid(item);
      if (found) return found;
    }
    return null;
  }
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    for (const [key, val] of Object.entries(obj)) {
      if (key.toLowerCase().includes('guid') || key.toLowerCase().includes('uuid') || key.toLowerCase().includes('ettn')) {
        const found = extractFirstGuid(val);
        if (found) return found;
      }
    }
    for (const val of Object.values(obj)) {
      const found = extractFirstGuid(val);
      if (found) return found;
    }
  }
  return null;
}

function extractFirstString(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = extractFirstString(item);
      if (found) return found;
    }
    return null;
  }
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    for (const val of Object.values(obj)) {
      const found = extractFirstString(val);
      if (found) return found;
    }
  }
  return null;
}

async function mikroPost(env: MikroConnectorEnv, path: string, extraMikroFields: Record<string, unknown>) {
  const url = new URL(path, env.mikroBaseUrl).toString();

  const payload = {
    Mikro: {
      ApiKey: env.mikroApiKey,
      CalismaYili: env.mikroCalismaYili,
      FirmaKodu: env.mikroFirmaKodu,
      KullaniciKodu: env.mikroKullaniciKodu,
      Sifre: hashMikroPassword(env.mikroSifrePlain),
      ...extraMikroFields,
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`MikroAPI geçersiz JSON döndü (${res.status})`);
  }

  if (!res.ok) {
    const message = json?.message || json?.error || `MikroAPI hata (${res.status})`;
    throw new Error(message);
  }

  return unwrapMikroResponse(json);
}

async function issueInvoiceViaMikro(env: MikroConnectorEnv, snapshot: InvoiceSnapshot) {
  if (!snapshot.billingAddress) {
    throw new Error('Fatura adresi yok (billingAddress).');
  }

  const dateStr = formatMikroDate(new Date(snapshot.order.createdAt));

  const items = snapshot.items || [];
  if (!items.length) {
    throw new Error('Sipariş satırı yok.');
  }

  const missingSku = items.find((item) => !item.sku);
  if (missingSku) {
    throw new Error('Sipariş satırlarında SKU yok. Mikro stok kodu için SKU gerekli.');
  }

  const kdvRate = env.kdvRate;
  const itemsSubtotalCents = items.reduce((acc, item) => acc + item.priceCents * item.quantity, 0);
  const itemsAreNet = snapshot.order.totalCents > itemsSubtotalCents;
  const lineTotals = items.map((item) => {
    if (itemsAreNet) {
      const net = round2((item.priceCents / 100) * item.quantity);
      const vat = round2(net * kdvRate);
      return { net, vat };
    }

    const gross = (item.priceCents / 100) * item.quantity;
    const net = round2(gross / (1 + kdvRate));
    const vat = round2(gross - net);
    return { net, vat };
  });

  const subtotal = round2(lineTotals.reduce((acc, item) => acc + item.net, 0));

  const billing = snapshot.billingAddress;
  const fullName = billing.fullName || snapshot.customer.name || '';
  const email = snapshot.customer.email || '';
  const phone = billing.phone || snapshot.customer.phone || '';
  const city = billing.city || '';
  const country = billing.country || '';
  const taxId =
    billing.invoiceType === 'COMPANY' ? (billing.taxNumber || '') : (billing.identityNumber || billing.taxNumber || '');

  const evrak = {
    cha_tip: 0,
    cha_cinsi: 7,
    cha_evrak_tip: 63,
    cha_evrakno_seri: env.mikroFaturaSeri,
    cha_evrakno_sira: 0,
    cha_tarihi: dateStr,
    cha_subeno: env.mikroSubeNo,
    cha_kod: env.mikroCariKod,
    cha_cari_cins: 0,
    cha_d_cins: 0,
    cha_d_kur: 1,
    cha_normal_Iade: 0,
    cha_vade: 0,
    cha_ft_iskonto1: 0,
    cha_isk_mas1: '0',
    cha_kasa_hizkod: '',
    cha_kasa_hizmet: 0,
    cha_miktari: String(items.reduce((acc, item) => acc + item.quantity, 0) || 1),
    cha_vergipntr: 0,
    cha_aratoplam: subtotal,
    cha_aciklama: `WEB ${snapshot.order.id.slice(0, 8)} - ${fullName}`,
    cha_EArsiv_unvani_ad: billing.invoiceType === 'COMPANY' ? (billing.companyName || fullName) : fullName,
    cha_EArsiv_unvani_soyad: billing.invoiceType === 'COMPANY' ? '' : '',
    cha_EArsiv_daire_adi: billing.taxOffice || '',
    cha_EArsiv_Vkn: taxId,
    cha_EArsiv_ulke: country,
    cha_EArsiv_Il: city,
    cha_EArsiv_tel_ulke_kod: '',
    cha_EArsiv_tel_bolge_kod: '',
    cha_EArsiv_tel_no: phone,
    cha_EArsiv_mail: email,
    detay: items.map((item, idx) => ({
      sth_aciklama: item.name,
      sth_birim_pntr: 1,
      sth_cari_cinsi: 0,
      sth_cari_kodu: env.mikroCariKod,
      sth_cari_srm_merkezi: '',
      sth_cikis_depo_no: env.mikroDepoNo,
      sth_cins: 0,
      sth_evrakno_seri: env.mikroFaturaSeri,
      sth_evraktip: 4,
      sth_giris_depo_no: env.mikroDepoNo,
      sth_miktar: item.quantity,
      sth_normal_iade: 0,
      sth_stok_kod: item.sku,
      sth_stok_srm_merkezi: '',
      sth_subeno: env.mikroSubeNo,
      sth_tarih: dateStr,
      sth_tip: 1,
      sth_tutar: lineTotals[idx]?.net ?? 0,
      sth_vergi: lineTotals[idx]?.vat ?? 0,
    })),
  };

  const createData = await mikroPost(env, '/api/APIMethods/FaturaKaydetV2', { evraklar: [evrak] });

  const faturaGuid = extractFirstGuid(createData);
  const invoiceNumberMaybe = (() => {
    if (!createData || typeof createData !== 'object') return null;
    const obj = createData as Record<string, unknown>;
    const seri = (obj.cha_evrakno_seri || obj.evrakno_seri || obj.Seri) as string | undefined;
    const sira = (obj.cha_evrakno_sira || obj.evrakno_sira || obj.Sira) as number | undefined;
    if (typeof seri === 'string' && (typeof sira === 'number' || typeof sira === 'string')) {
      return `${seri}${String(sira)}`;
    }
    return null;
  })();

  let ettn: string | null = null;
  if (env.sendEinvoice && createData) {
    try {
      const seri = (createData as any)?.cha_evrakno_seri || env.mikroFaturaSeri;
      const sira = (createData as any)?.cha_evrakno_sira || 0;
      const toEinvoice = await mikroPost(env, '/Api/apiMethods/FaturaToEFaturaV2', {
        evraklar: [{ cha_evrakno_seri: seri, cha_evrakno_sira: sira, IslemTipi: 1 }],
      });
      ettn = extractFirstGuid(toEinvoice);
    } catch (err) {
      console.warn('[mikro] FaturaToEFaturaV2 başarısız:', err instanceof Error ? err.message : err);
    }
  }

  let pdfBase64: string | null = null;
  if (faturaGuid) {
    const pdfData = await mikroPost(env, '/API/APIMethods/FaturaPdfV2', { Fatura_Guid: faturaGuid });
    pdfBase64 = extractFirstString(pdfData);
  }

  let xmlBase64: string | null = null;
  if (ettn) {
    try {
      const xmlData = await mikroPost(env, '/API/APIMethods/EBelgeXMLV2', {
        EBelge: { EFaturaTipi: 0, EBelgeTipi: 0, UUID: ettn },
      });
      xmlBase64 = extractFirstString(xmlData);
    } catch (err) {
      console.warn('[mikro] EBelgeXMLV2 başarısız:', err instanceof Error ? err.message : err);
    }
  }

  return {
    invoiceNumber: invoiceNumberMaybe,
    ettn,
    pdfBase64,
    xmlBase64,
    providerPayload: { createData, faturaGuid },
  };
}

async function leaseFromApp(env: MikroConnectorEnv, limit = 1): Promise<LeasedInvoice[]> {
  const url = new URL('/api/cron/invoices/lease', env.appBaseUrl);
  url.searchParams.set('limit', String(limit));
  const res = await fetch(url.toString(), {
    headers: { authorization: `Bearer ${env.invoiceCronSecret}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Lease başarısız');
  return (data?.items || []) as LeasedInvoice[];
}

async function completeToApp(
  env: MikroConnectorEnv,
  payload: {
    invoiceId: string;
    lockToken: string;
    invoiceNumber?: string | null;
    ettn?: string | null;
    pdfBase64?: string | null;
    xmlBase64?: string | null;
    providerPayload?: unknown;
  },
) {
  const url = new URL('/api/cron/invoices/complete', env.appBaseUrl);
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.invoiceCronSecret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Complete başarısız');
}

async function failToApp(env: MikroConnectorEnv, payload: { invoiceId: string; lockToken: string; errorMessage: string }) {
  const url = new URL('/api/cron/invoices/fail', env.appBaseUrl);
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.invoiceCronSecret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Fail bildirimi başarısız');
}

async function run() {
  const env = getEnv();

  const args = new Set(process.argv.slice(2));
  const once = args.has('--once');
  const intervalMs = parseInt(process.env.CONNECTOR_POLL_MS || '5000', 10);

  console.log('[connector] started', { once, intervalMs, appBaseUrl: env.appBaseUrl, mikroBaseUrl: env.mikroBaseUrl });

  while (true) {
    const leased = await leaseFromApp(env, 1);
    if (!leased.length) {
      if (once) return;
      await sleep(intervalMs);
      continue;
    }

    for (const item of leased) {
      const invoiceId = item.invoice.id;
      const lockToken = item.lockToken;
      const orderId = item.invoice.orderId;

      try {
        if (!item.invoice.snapshot) {
          throw new Error('Invoice snapshot boş (migration uygulanmadıysa yeniden enqueue edin).');
        }

        console.log(`[connector] issuing invoice`, { invoiceId, orderId });
        const issued = await issueInvoiceViaMikro(env, item.invoice.snapshot);

        await completeToApp(env, {
          invoiceId,
          lockToken,
          invoiceNumber: issued.invoiceNumber,
          ettn: issued.ettn,
          pdfBase64: issued.pdfBase64,
          xmlBase64: issued.xmlBase64,
          providerPayload: issued.providerPayload,
        });

        console.log(`[connector] completed`, { invoiceId, orderId, invoiceNumber: issued.invoiceNumber });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('[connector] failed', { invoiceId, orderId, message });
        try {
          await failToApp(env, { invoiceId, lockToken, errorMessage: message });
        } catch (failErr) {
          console.error('[connector] fail endpoint error', failErr);
        }
      }
    }

    if (once) return;
  }
}

run().catch((error) => {
  console.error('[connector] fatal', error);
  process.exitCode = 1;
});
