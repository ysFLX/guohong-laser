import nodemailer from 'nodemailer';

import { buildEmailHtml } from '@/lib/emailTemplate';
import { prisma } from '@/lib/prisma';
import { VAT_PERCENTAGE, calculateVatTotals } from '@/lib/vat';

type AddressBlock = {
  fullName: string | null;
  phone: string | null;
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  invoiceType?: 'INDIVIDUAL' | 'COMPANY' | null;
  companyName?: string | null;
  taxOffice?: string | null;
  taxNumber?: string | null;
  identityNumber?: string | null;
} | null;

function formatPriceTry(priceCents: number) {
  try {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 2,
    }).format(priceCents / 100);
  } catch {
    return `${(priceCents / 100).toFixed(2)} TL`;
  }
}

function formatAddressBlock(address: AddressBlock) {
  if (!address) {
    return {
      text: 'Adres bilgisi bulunamadı.',
      html: '<span style="color:#64748b;">Adres bilgisi bulunamadı.</span>',
    };
  }

  const text = [
    address.fullName,
    address.line1,
    address.line2,
    `${address.city || ''}${address.state ? ` / ${address.state}` : ''}`,
    address.postalCode,
    address.country,
    address.phone,
  ]
    .filter(Boolean)
    .join('\n');

  return {
    text,
    html: text.replace(/\n/g, '<br />'),
  };
}

function formatInvoiceBlock(address: AddressBlock) {
  if (!address) {
    return {
      text: 'Fatura bilgisi bulunamadı.',
      html: '<span style="color:#64748b;">Fatura bilgisi bulunamadı.</span>',
    };
  }

  const isCompany = address.invoiceType === 'COMPANY';
  const lines = isCompany
    ? [
        'Fatura tipi: Kurumsal',
        `Firma ünvanı: ${address.companyName || '-'}`,
        `Vergi numarası: ${address.taxNumber || '-'}`,
        `Vergi dairesi: ${address.taxOffice || '-'}`,
      ]
    : ['Fatura tipi: Bireysel', `TC Kimlik No: ${address.identityNumber || '-'}`];

  const addressLines = [
    `Ad Soyad: ${address.fullName || '-'}`,
    `Telefon: ${address.phone || '-'}`,
    `Adres: ${[address.line1, address.line2].filter(Boolean).join(', ') || '-'}`,
    `İl / İlçe: ${[address.city, address.state].filter(Boolean).join(' / ') || '-'}`,
    `Posta Kodu: ${address.postalCode || '-'}`,
    `Ülke: ${address.country || '-'}`,
  ];

  const text = [...lines, ...addressLines].join('\n');

  return {
    text,
    html: text.replace(/\n/g, '<br />'),
  };
}

export async function notifyOrderStatus(params: {
  userId: string;
  orderId: string | null;
  status: string;
  title: string;
  message: string;
}) {
  try {
    await prisma.userNotification.create({
      data: {
        userId: params.userId,
        type: 'ORDER_STATUS',
        title: params.title,
        message: params.message,
        orderId: params.orderId,
        status: params.status,
      },
    });
  } catch (error) {
    console.error('[orders] status notification failed:', error);
  }
}

export async function sendOrderConfirmationEmail(orderId: string) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    return;
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      totalCents: true,
      items: {
        select: {
          name: true,
          quantity: true,
          priceCents: true,
        },
      },
      shippingAddress: {
        select: {
          fullName: true,
          phone: true,
          line1: true,
          line2: true,
          city: true,
          state: true,
          postalCode: true,
          country: true,
        },
      },
      billingAddress: {
        select: {
          fullName: true,
          phone: true,
          line1: true,
          line2: true,
          city: true,
          state: true,
          postalCode: true,
          country: true,
          invoiceType: true,
          companyName: true,
          taxOffice: true,
          taxNumber: true,
          identityNumber: true,
        },
      },
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  const recipient = order?.user?.email || '';
  if (!order || !recipient) {
    return;
  }

  const appUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const orderUrl = `${appUrl}/profile/orders/${order.id}`;
  const returnsUrl = `${appUrl}/returns-request`;
  const shippingBlock = formatAddressBlock(order.shippingAddress);
  const billingBlock = formatAddressBlock(order.billingAddress);
  const invoiceBlock = formatInvoiceBlock(order.billingAddress);

  const lines = order.items
    .map((item) => `${item.name} x${item.quantity} ${formatPriceTry(item.priceCents * item.quantity)}`)
    .join('\n');
  const itemTotals = calculateVatTotals(order.items);
  const subtotalCents = itemTotals.subtotalCents;
  const vatCents = Math.max(0, order.totalCents - subtotalCents);

  const itemsHtml = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
            <div style="font-weight: 600; color: #0f172a;">${item.name}</div>
            <div style="font-size: 12px; color: #64748b;">Adet: ${item.quantity}</div>
          </td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 600; color: #0f172a;">
            ${formatPriceTry(item.priceCents * item.quantity)}
          </td>
        </tr>
      `,
    )
    .join('');

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  await transporter.sendMail({
    from: `Guohong Lazer <${smtpUser}>`,
    to: recipient,
    subject: `Siparişiniz alındı (#${order.id.slice(0, 8)})`,
    text: [
      'Siparişiniz alındı.',
      `Sipariş detayları: ${orderUrl}`,
      '',
      'Sipariş özeti:',
      lines,
      '',
      `Ara toplam (KDV hariç): ${formatPriceTry(subtotalCents)}`,
      `KDV (%${VAT_PERCENTAGE}): ${formatPriceTry(vatCents)}`,
      `Toplam: ${formatPriceTry(order.totalCents)}`,
      '',
      'Teslimat adresi:',
      shippingBlock.text,
      '',
      'Fatura / irsaliye adresi:',
      billingBlock.text,
      '',
      `İade/değişim talebi: ${returnsUrl}`,
    ].join('\n'),
    html: buildEmailHtml({
      title: 'Siparişiniz alındı',
      subtitle: `Sipariş #${order.id.slice(0, 8)}`,
      badge: 'Sipariş alındı',
      preheader: `Sipariş #${order.id.slice(0, 8)} alındı.`,
      bodyHtml: `
        <div style="margin-top: 2px; color:#475569;">Siparişiniz başarıyla alındı. Detayları hesabınızdan takip edebilirsiniz.</div>
        <div style="margin-top: 14px; padding: 14px; background: #f8fafc; border-radius: 12px;">
          <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.12em;">Sipariş numaranız</div>
          <div style="margin-top: 6px; font-size: 18px; font-weight: 700; color: #0f172a;">#${order.id.slice(0, 8)}</div>
        </div>
        <div style="margin-top: 18px;">
          <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.12em; font-weight: 700;">Sipariş özeti</div>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px;">
            <tbody>
              ${itemsHtml}
              <tr>
                <td style="padding: 12px 0 4px; text-align: right; color: #475569;">Ara toplam (KDV hariç)</td>
                <td style="padding: 12px 0 4px; text-align: right; font-weight: 600; color: #0f172a;">${formatPriceTry(subtotalCents)}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; text-align: right; color: #475569;">KDV (%${VAT_PERCENTAGE})</td>
                <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #0f172a;">${formatPriceTry(vatCents)}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; text-align: right; font-weight: 700; color: #0f172a;">Genel toplam</td>
                <td style="padding: 12px 0; text-align: right; font-weight: 700; color: #0f172a;">${formatPriceTry(order.totalCents)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style="margin-top: 18px; padding: 14px; background: #f8fafc; border-radius: 12px; font-size: 14px; color: #334155;">
          <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.12em; font-weight: 700;">Teslimat adresi</div>
          <div style="margin-top: 8px; line-height: 1.5;">${shippingBlock.html}</div>
        </div>
        <div style="margin-top: 18px; padding: 14px; background: #eef2f7; border-radius: 12px; font-size: 14px; color: #334155;">
          <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.12em; font-weight: 700;">Fatura / İrsaliye</div>
          <div style="margin-top: 8px; line-height: 1.5;">${billingBlock.html}</div>
        </div>
      `,
      primaryCta: { label: 'Sipariş detaylarını gör', href: orderUrl },
      secondaryCta: { label: 'İade / Değişim talebi', href: returnsUrl },
      footerNote: 'Bu e-posta otomatik olarak gönderilmiştir.',
    }),
  });

  const accountingEmail = (process.env.ACCOUNTING_EMAIL || '').trim();
  if (accountingEmail) {
    await transporter.sendMail({
      from: `Guohong Lazer <${smtpUser}>`,
      to: accountingEmail,
      subject: `Muhasebe fatura bilgisi (#${order.id.slice(0, 8)})`,
      text: [
        `Sipariş: #${order.id.slice(0, 8)}`,
        `Müşteri e-posta: ${recipient}`,
        `Toplam: ${formatPriceTry(order.totalCents)}`,
        '',
        'Ürünler:',
        lines,
        '',
        'Fatura bilgileri:',
        invoiceBlock.text,
      ].join('\n'),
      html: buildEmailHtml({
        title: 'Muhasebe fatura bilgisi',
        subtitle: `Sipariş #${order.id.slice(0, 8)}`,
        badge: order.billingAddress?.invoiceType === 'COMPANY' ? 'Kurumsal fatura' : 'Bireysel fatura',
        preheader: `Sipariş #${order.id.slice(0, 8)} fatura bilgileri`,
        bodyHtml: `
          <div style="margin-top: 14px; padding: 14px; background: #f8fafc; border-radius: 12px; font-size: 14px; color: #334155;">
            <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.12em; font-weight: 700;">Sipariş</div>
            <div style="margin-top: 8px; line-height: 1.6;">
              <strong>#${order.id.slice(0, 8)}</strong><br />
              Müşteri e-posta: ${recipient}<br />
              Toplam: ${formatPriceTry(order.totalCents)}
            </div>
          </div>
          <div style="margin-top: 18px; padding: 14px; background: #eef2f7; border-radius: 12px; font-size: 14px; color: #334155;">
            <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.12em; font-weight: 700;">Fatura bilgileri</div>
            <div style="margin-top: 8px; line-height: 1.6;">${invoiceBlock.html}</div>
          </div>
        `,
        primaryCta: { label: 'Siparişi aç', href: orderUrl },
        footerNote: 'Bu e-posta muhasebe bilgilendirmesi için otomatik gönderilmiştir.',
      }),
    });
  }
}
