import 'dotenv/config';

function requiredEnv(name: string) {
  const value = process.env[name] || '';
  if (!value) throw new Error(`${name} env eksik`);
  return value;
}

function escapePdfText(input: string) {
  return input.replaceAll('\\', '\\\\').replaceAll('(', '\\(').replaceAll(')', '\\)');
}

function createMinimalPdf(text: string) {
  const chunks: string[] = [];
  const offsets: number[] = [];
  let offset = 0;

  const push = (value: string) => {
    chunks.push(value);
    offset += Buffer.byteLength(value, 'utf8');
  };

  push('%PDF-1.4\n');

  offsets[1] = offset;
  push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  offsets[2] = offset;
  push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');

  offsets[3] = offset;
  push(
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>\nendobj\n',
  );

  const content = `BT\n/F1 24 Tf\n72 720 Td\n(${escapePdfText(text)}) Tj\nET\n`;
  offsets[4] = offset;
  push(`4 0 obj\n<< /Length ${Buffer.byteLength(content, 'utf8')} >>\nstream\n${content}endstream\nendobj\n`);

  offsets[5] = offset;
  push('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n');

  const xrefOffset = offset;
  push('xref\n0 6\n0000000000 65535 f \n');
  for (let i = 1; i <= 5; i += 1) {
    const pos = String(offsets[i] || 0).padStart(10, '0');
    push(`${pos} 00000 n \n`);
  }
  push(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`);

  return Buffer.from(chunks.join(''), 'utf8');
}

type LeasedInvoice = {
  invoice: { id: string; orderId: string };
  lockToken: string;
};

async function fetchJson(url: string, init: RequestInit) {
  const res = await fetch(url, init);
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = data?.error || `İstek başarısız (${res.status})`;
    throw new Error(message);
  }
  return data as any;
}

async function run() {
  const appBaseUrl = requiredEnv('APP_BASE_URL').replace(/\/+$/, '');
  const invoiceCronSecret = requiredEnv('INVOICE_CRON_SECRET');

  const leaseUrl = new URL('/api/cron/invoices/lease', appBaseUrl);
  leaseUrl.searchParams.set('limit', '1');

  const leasedRes = await fetchJson(leaseUrl.toString(), {
    method: 'GET',
    headers: { authorization: `Bearer ${invoiceCronSecret}` },
  });

  const leased = (leasedRes?.items || []) as LeasedInvoice[];
  if (!leased.length) {
    console.log('[mock-connector] Kuyrukta fatura yok (PENDING/FAILED).');
    return;
  }

  const { invoice, lockToken } = leased[0];

  const pdf = createMinimalPdf(`TEST INVOICE ${invoice.orderId.slice(0, 8)}`);
  const xml = Buffer.from(
    `<?xml version="1.0" encoding="UTF-8"?><InvoiceTest orderId="${invoice.orderId}" issuedAt="${new Date().toISOString()}" />`,
    'utf8',
  );

  const completeUrl = new URL('/api/cron/invoices/complete', appBaseUrl);

  await fetchJson(completeUrl.toString(), {
    method: 'POST',
    headers: {
      authorization: `Bearer ${invoiceCronSecret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      invoiceId: invoice.id,
      lockToken,
      invoiceNumber: `TEST-${invoice.orderId.slice(0, 8)}`,
      ettn: `TEST-${invoice.id}`,
      pdfBase64: pdf.toString('base64'),
      xmlBase64: xml.toString('base64'),
      providerPayload: { mock: true },
    }),
  });

  console.log('[mock-connector] Tamamlandı:', { invoiceId: invoice.id, orderId: invoice.orderId });
}

run().catch((error) => {
  console.error('[mock-connector] Hata:', error);
  process.exitCode = 1;
});

