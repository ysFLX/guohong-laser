import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

import { VAT_PERCENTAGE, calculateVatCents } from '@/lib/vat';

type AddressInvoiceType = 'INDIVIDUAL' | 'COMPANY';

export type ProformaAddress = {
  label: string | null;
  fullName: string | null;
  phone: string | null;
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  invoiceType: AddressInvoiceType;
  companyName: string | null;
  taxOffice: string | null;
  taxNumber: string | null;
  identityNumber: string | null;
};

export type ProformaOrder = {
  id: string;
  status?: string | null;
  createdAt: Date;
  totalCents: number;
  currency: string;
  user: { name: string | null; email: string | null } | null;
  items: Array<{ name: string; quantity: number; priceCents: number }>;
  billingAddress: ProformaAddress | null;
  shippingAddress: ProformaAddress | null;
};

type CreateProformaPdfParams = {
  order: ProformaOrder;
  invoiceNumber: string;
  issuedAtIso: string;
  documentTitle?: string;
  watermark?: string;
  footerNote?: string;
  infoTitlePrefix?: string;
};

const COLORS = {
  ink: '#0f172a',
  muted: '#475569',
  subtle: '#94a3b8',
  border: '#e2e8f0',
  surface: '#ffffff',
  surfaceMuted: '#f8fafc',
  accent: '#163e75',
  header: '#07152e',
};

function tryFormatMoney(cents: number, currency: string) {
  try {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency, maximumFractionDigits: 2 }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
}

function tryFormatDate(value: Date) {
  try {
    return value.toLocaleString('tr-TR');
  } catch {
    return value.toISOString();
  }
}

function compactOrderId(orderId: string) {
  return orderId.length > 8 ? orderId.slice(0, 8) : orderId;
}

function formatOrderStatusTr(status: string) {
  switch (status) {
    case 'PENDING':
      return 'Beklemede';
    case 'PAID':
      return 'Ödeme alındı';
    case 'RECEIVED':
      return 'Sipariş alındı';
    case 'IN_TRANSIT':
      return 'Hazırlanıyor';
    case 'SHIPPED':
      return 'Kargoya verildi';
    case 'DELIVERED':
      return 'Teslim edildi';
    case 'FAILED':
      return 'Ödeme başarısız';
    case 'CANCELED':
      return 'İptal';
    default:
      return status;
  }
}

function safeLine(value: string | null | undefined) {
  const normalized = (value || '').trim();
  return normalized ? normalized : null;
}

function formatAddressLines(address: ProformaAddress | null) {
  if (!address) return [] as string[];

  const lines: string[] = [];

  const label = safeLine(address.label);
  const fullName = safeLine(address.fullName);
  const phone = safeLine(address.phone);

  const line1 = safeLine(address.line1);
  const line2 = safeLine(address.line2);
  const city = safeLine(address.city);
  const state = safeLine(address.state);
  const postal = safeLine(address.postalCode);
  const country = safeLine(address.country);

  if (label) lines.push(label);
  if (fullName) lines.push(fullName);

  const street = [line1, line2].filter(Boolean).join(', ');
  if (street) lines.push(street);

  const cityLine = [postal, city, state].filter(Boolean).join(' ');
  if (cityLine) lines.push(cityLine);
  if (country) lines.push(country);
  if (phone) lines.push(`Tel: ${phone}`);

  const invoiceType = address.invoiceType;
  const companyName = safeLine(address.companyName);
  const taxOffice = safeLine(address.taxOffice);
  const taxNumber = safeLine(address.taxNumber);
  const identityNumber = safeLine(address.identityNumber);

  if (invoiceType === 'COMPANY' && (companyName || taxNumber || taxOffice)) {
    if (companyName) lines.push(`Firma: ${companyName}`);
    if (taxOffice) lines.push(`Vergi dairesi: ${taxOffice}`);
    if (taxNumber) lines.push(`VKN: ${taxNumber}`);
  }

  if (invoiceType === 'INDIVIDUAL' && identityNumber) {
    lines.push(`TCKN: ${identityNumber}`);
  }

  return lines;
}

function getFontPaths() {
  const regularPath = path.join(/*turbopackIgnore: true*/ process.cwd(), 'assets', 'fonts', 'NotoSans-Regular.ttf');
  const boldPath = path.join(/*turbopackIgnore: true*/ process.cwd(), 'assets', 'fonts', 'NotoSans-Bold.ttf');
  return { regularPath, boldPath };
}

function getLogoPath() {
  return path.join(/*turbopackIgnore: true*/ process.cwd(), 'public', 'images', 'logoacik.png');
}

function drawCard(params: {
  doc: PDFKit.PDFDocument;
  x: number;
  y: number;
  width: number;
  title: string;
  lines: string[];
  fontRegular: string;
  fontBold: string;
}) {
  const { doc, x, y, width, title, lines, fontRegular, fontBold } = params;
  const paddingX = 12;
  const paddingY = 12;

  doc.save();
  doc.font(fontRegular).fontSize(9);
  const body = lines.filter(Boolean).join('\n') || '-';
  const bodyHeight = doc.heightOfString(body, { width: width - paddingX * 2, lineGap: 3 });
  const height = paddingY + 14 + 8 + bodyHeight + paddingY;

  doc.roundedRect(x, y, width, height, 10).fillAndStroke(COLORS.surface, COLORS.border);

  doc.fillColor(COLORS.muted);
  doc.font(fontBold).fontSize(8);
  doc.text(title.toUpperCase(), x + paddingX, y + paddingY, {
    width: width - paddingX * 2,
    characterSpacing: 0.8,
  });

  doc.fillColor(COLORS.ink);
  doc.font(fontRegular).fontSize(9);
  doc.text(body, x + paddingX, y + paddingY + 18, {
    width: width - paddingX * 2,
    lineGap: 3,
  });

  doc.restore();
  return y + height;
}

function addWatermark(doc: PDFKit.PDFDocument, text: string, fontBold: string) {
  const pageW = doc.page.width;
  const pageH = doc.page.height;
  doc.save();
  doc.rotate(-22, { origin: [pageW / 2, pageH / 2] });
  doc.opacity(0.035);
  doc.fillColor(COLORS.accent);
  doc.font(fontBold).fontSize(text.length > 9 ? 92 : 116);
  doc.text(text, 0, pageH / 2 - 80, { width: pageW, align: 'center' });
  doc.opacity(1);
  doc.restore();
}

function addTableHeader(params: {
  doc: PDFKit.PDFDocument;
  x: number;
  y: number;
  widths: number[];
  labels: string[];
  fontBold: string;
}) {
  const { doc, x, y, widths, labels, fontBold } = params;
  const height = 28;

  doc.save();
  doc.roundedRect(x, y, widths.reduce((a, b) => a + b, 0), height, 8).fill(COLORS.surfaceMuted);
  doc.lineWidth(1).strokeColor(COLORS.border).roundedRect(x, y, widths.reduce((a, b) => a + b, 0), height, 8).stroke();
  doc.fillColor(COLORS.muted);
  doc.font(fontBold).fontSize(8);

  let cx = x;
  for (let i = 0; i < labels.length; i += 1) {
    doc.text(labels[i], cx + 8, y + 9, { width: widths[i] - 16, align: i === 0 ? 'left' : 'right' });
    cx += widths[i];
  }

  doc.restore();
  return y + height;
}

function ensureSpace(doc: PDFKit.PDFDocument, y: number, needed: number) {
  const bottom = doc.page.height - doc.page.margins.bottom;
  if (y + needed <= bottom) return y;
  doc.addPage();
  return doc.page.margins.top;
}

export async function createProformaPdf(params: CreateProformaPdfParams) {
  const { regularPath, boldPath } = getFontPaths();
  const hasFonts = fs.existsSync(regularPath) && fs.existsSync(boldPath);

  if (!hasFonts) {
    throw new Error(
      'Proforma font dosyaları bulunamadı. `assets/fonts/NotoSans-Regular.ttf` ve `assets/fonts/NotoSans-Bold.ttf` gerekli.',
    );
  }

  const documentTitle = params.documentTitle || 'PROFORMA';
  const watermark = params.watermark || documentTitle;
  const footerNote =
    params.footerNote || 'Not: Bu belge proforma / geçici belgedir. Resmi e-Fatura ayrıca iletilecektir.';
  const infoTitlePrefix = params.infoTitlePrefix || documentTitle;

  const doc = new PDFDocument({
    size: 'A4',
    margin: 48,
    font: regularPath,
    info: {
      Title: `${infoTitlePrefix} ${params.invoiceNumber}`,
      Author: 'Guohong Lazer',
      Subject: `Sipariş #${compactOrderId(params.order.id)}`,
    },
  });

  const chunks: Buffer[] = [];
  const result = new Promise<Buffer>((resolve, reject) => {
    doc.on('data', (chunk) => chunks.push(chunk as Buffer));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (err) => reject(err));
  });

  doc.registerFont('NotoRegular', regularPath);
  doc.registerFont('NotoBold', boldPath);
  const fontRegular = 'NotoRegular';
  const fontBold = 'NotoBold';

  addWatermark(doc, watermark, fontBold);

  const pageW = doc.page.width;
  const left = doc.page.margins.left;
  const right = pageW - doc.page.margins.right;
  const contentW = right - left;

  const headerH = 128;
  doc.rect(0, 0, pageW, headerH).fill(COLORS.header);

  const logoPath = getLogoPath();
  if (fs.existsSync(logoPath)) {
    try {
      doc.image(logoPath, left, 28, { width: 130 });
    } catch {
      // ignore
    }
  }

  const titleFontSize = documentTitle.length > 16 ? 18 : 22;
  doc.fillColor('white');
  doc.font(fontBold).fontSize(titleFontSize).text(documentTitle, right - 280, 28, {
    width: 280,
    align: 'right',
    lineGap: 2,
  });

  doc.font(fontRegular).fontSize(9).fillColor('#dbeafe');
  doc.text(`Belge No: ${params.invoiceNumber}`, right - 250, 68, { width: 250, align: 'right' });
  doc.text(`Sipariş: #${compactOrderId(params.order.id)}`, right - 250, 84, { width: 250, align: 'right' });
  doc.text(`Tarih: ${tryFormatDate(params.order.createdAt)}`, right - 250, 100, { width: 250, align: 'right' });
  if (params.order.status) {
    doc.text(`Durum: ${formatOrderStatusTr(params.order.status)}`, right - 250, 116, { width: 250, align: 'right' });
  }

  const siteUrl = process.env.NEXTAUTH_URL || 'https://guohong-laser.vercel.app';
  const siteHost = (() => {
    try {
      return new URL(siteUrl).host;
    } catch {
      return siteUrl;
    }
  })();

  doc.fillColor('white');
  doc.font(fontBold).fontSize(15).text('Guohong Lazer', left, 82, { width: 300 });
  doc.font(fontRegular).fontSize(8).fillColor('#dbeafe');
  doc.text(`Web: ${siteHost}  |  WhatsApp: +90 536 831 6787`, left, 104, { width: 370 });

  let y = headerH + 22;

  const gap = 14;
  const colW = (contentW - gap) / 2;

  const sellerLines = [
    'Guohong Lazer',
    `Web: ${siteHost}`,
    'WhatsApp: +90 536 831 6787',
    process.env.SMTP_USER ? `E-posta: ${process.env.SMTP_USER}` : null,
  ].filter(Boolean) as string[];

  const billing = params.order.billingAddress || params.order.shippingAddress;
  const customerName = safeLine(params.order.user?.name) || 'Müşteri';
  const customerEmail = safeLine(params.order.user?.email);
  const customerLines = [
    customerName,
    customerEmail ? `E-posta: ${customerEmail}` : null,
    ...formatAddressLines(billing),
  ].filter(Boolean) as string[];

  const nextYLeft = drawCard({ doc, x: left, y, width: colW, title: 'Satıcı', lines: sellerLines, fontRegular, fontBold });
  const nextYRight = drawCard({
    doc,
    x: left + colW + gap,
    y,
    width: colW,
    title: 'Müşteri / Fatura',
    lines: customerLines,
    fontRegular,
    fontBold,
  });
  y = Math.max(nextYLeft, nextYRight) + 14;

  const shippingLines = formatAddressLines(params.order.shippingAddress);
  if (shippingLines.length) {
    y = drawCard({
      doc,
      x: left,
      y,
      width: contentW,
      title: 'Teslimat adresi',
      lines: shippingLines,
      fontRegular,
      fontBold,
    });
    y += 16;
  }

  y = ensureSpace(doc, y, 220);

  doc.fillColor(COLORS.ink);
  doc.font(fontBold).fontSize(12).text('Ürün ve KDV Detayları', left, y, { width: contentW });
  y += 14;

  const tableWidths = [contentW * 0.4, contentW * 0.08, contentW * 0.18, contentW * 0.15, contentW * 0.19].map((x) =>
    Math.floor(x),
  );
  const widthDiff = contentW - tableWidths.reduce((a, b) => a + b, 0);
  tableWidths[0] += widthDiff;

  y = addTableHeader({
    doc,
    x: left,
    y,
    widths: tableWidths,
    labels: ['Ürün', 'Adet', 'Birim Net', 'KDV', 'Toplam'],
    fontBold,
  });

  y += 8;

  let itemsTotalCents = 0;

  for (let i = 0; i < params.order.items.length; i += 1) {
    const item = params.order.items[i];
    const lineTotalCents = item.priceCents * item.quantity;
    const lineVatCents = calculateVatCents(item.priceCents) * item.quantity;
    itemsTotalCents += lineTotalCents;

    const rowPaddingX = 8;
    const rowPaddingY = 8;

    doc.font(fontRegular).fontSize(9);
    const nameHeight = doc.heightOfString(item.name, { width: tableWidths[0] - rowPaddingX * 2 });
    const rowHeight = Math.max(18, nameHeight) + rowPaddingY * 2;

    y = ensureSpace(doc, y, rowHeight + 120);

    const rowX = left;
    const rowW = tableWidths.reduce((a, b) => a + b, 0);
    const isAlt = i % 2 === 1;

    doc.save();
    doc.roundedRect(rowX, y, rowW, rowHeight, 8).fill(isAlt ? COLORS.surfaceMuted : COLORS.surface);
    doc.strokeColor(COLORS.border).lineWidth(1).roundedRect(rowX, y, rowW, rowHeight, 8).stroke();

    let cx = rowX;
    doc.fillColor(COLORS.ink);
    doc.font(fontRegular).fontSize(9);
    doc.text(item.name, cx + rowPaddingX, y + rowPaddingY, { width: tableWidths[0] - rowPaddingX * 2 });
    cx += tableWidths[0];

    doc.fillColor(COLORS.muted);
    doc.font(fontRegular).fontSize(9);
    doc.text(String(item.quantity), cx + rowPaddingX, y + rowPaddingY, {
      width: tableWidths[1] - rowPaddingX * 2,
      align: 'right',
    });
    cx += tableWidths[1];

    doc.text(tryFormatMoney(item.priceCents, params.order.currency), cx + rowPaddingX, y + rowPaddingY, {
      width: tableWidths[2] - rowPaddingX * 2,
      align: 'right',
    });
    cx += tableWidths[2];

    doc.fillColor(COLORS.muted);
    doc.font(fontRegular).fontSize(9);
    doc.text(tryFormatMoney(lineVatCents, params.order.currency), cx + rowPaddingX, y + rowPaddingY, {
      width: tableWidths[3] - rowPaddingX * 2,
      align: 'right',
    });
    cx += tableWidths[3];

    doc.fillColor(COLORS.ink);
    doc.font(fontBold).fontSize(9);
    doc.text(tryFormatMoney(lineTotalCents + lineVatCents, params.order.currency), cx + rowPaddingX, y + rowPaddingY, {
      width: tableWidths[4] - rowPaddingX * 2,
      align: 'right',
    });

    doc.restore();
    y += rowHeight + 8;
  }

  const totalCents = params.order.totalCents ?? itemsTotalCents;
  const hasDiscountOrDiff = itemsTotalCents !== totalCents;
  y = ensureSpace(doc, y, 180);

  const totalsBoxW = Math.min(260, contentW);
  const totalsX = right - totalsBoxW;

  doc.save();
  doc.roundedRect(totalsX, y, totalsBoxW, hasDiscountOrDiff ? 110 : 80, 10).fillAndStroke(COLORS.surface, COLORS.border);
  doc.font(fontRegular).fontSize(9).fillColor(COLORS.muted);

  const lineHeight = 18;
  let ty = y + 16;

  const labelX = totalsX + 14;
  if (hasDiscountOrDiff) {
    doc.text('Ara toplam (KDV hariç)', labelX, ty, { width: totalsBoxW - 28 });
    doc.text(tryFormatMoney(itemsTotalCents, params.order.currency), labelX, ty, { width: totalsBoxW - 28, align: 'right' });
    ty += lineHeight;

    const diff = totalCents - itemsTotalCents;
    doc.text(diff < 0 ? 'İndirim' : `KDV (%${VAT_PERCENTAGE})`, labelX, ty, { width: totalsBoxW - 28 });
    doc.text(tryFormatMoney(diff, params.order.currency), labelX, ty, { width: totalsBoxW - 28, align: 'right' });
    ty += lineHeight;
  }

  doc.font(fontBold).fontSize(12).fillColor(COLORS.ink);
  doc.text('Genel toplam (KDV dahil)', labelX, ty, { width: totalsBoxW - 28 });
  doc.text(tryFormatMoney(totalCents, params.order.currency), labelX, ty, { width: totalsBoxW - 28, align: 'right' });
  ty += lineHeight;

  doc.font(fontRegular).fontSize(9).fillColor(COLORS.muted);
  doc.text(footerNote, labelX, ty + 6, {
    width: totalsBoxW - 28,
  });

  doc.restore();
  y += hasDiscountOrDiff ? 124 : 98;

  y = ensureSpace(doc, y, 120);

  const issuedLabel = (() => {
    try {
      return new Date(params.issuedAtIso).toLocaleString('tr-TR');
    } catch {
      return params.issuedAtIso;
    }
  })();

  doc.fillColor(COLORS.muted);
  doc.font(fontRegular).fontSize(9);
  doc.text(`Oluşturulma: ${issuedLabel}`, left, y, { width: contentW });
  doc.text('Bu çıktı bilgilendirme amaçlıdır.', left, y + 14, { width: contentW });

  doc.end();
  return result;
}


