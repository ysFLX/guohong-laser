type EmailCta = {
  label: string;
  href: string;
};

type EmailMeta = {
  label: string;
  value: string;
};

type EmailTemplateParams = {
  title: string;
  subtitle?: string;
  badge?: string;
  preheader?: string;
  bodyHtml: string;
  meta?: EmailMeta[];
  primaryCta?: EmailCta;
  secondaryCta?: EmailCta;
  footerNote?: string;
};

const renderMeta = (meta: EmailMeta[]) => {
  if (!meta.length) return '';
  const rows = meta
    .map(
      (item) => `
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;">${item.label}</td>
          <td style="padding: 8px 0; color: #0f172a; font-weight: 600; text-align: right;">${item.value}</td>
        </tr>
      `
    )
    .join('');

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 16px 0; border-collapse: collapse;">
      <tbody>${rows}</tbody>
    </table>
  `;
};

const renderCtas = (primary?: EmailCta, secondary?: EmailCta) => {
  if (!primary && !secondary) return '';

  const primaryHtml = primary
    ? `<a href="${primary.href}" style="display: inline-block; padding: 12px 18px; background: #0f172a; color: #ffffff; border-radius: 10px; text-decoration: none; font-weight: 600;">${primary.label}</a>`
    : '';
  const secondaryHtml = secondary
    ? `<a href="${secondary.href}" style="display: inline-block; padding: 12px 18px; border: 1px solid #0f172a; color: #0f172a; border-radius: 10px; text-decoration: none; font-weight: 600; margin-left: 10px;">${secondary.label}</a>`
    : '';

  return `
    <div style="margin-top: 18px;">
      ${primaryHtml}
      ${secondaryHtml}
    </div>
  `;
};

export const buildEmailHtml = (params: EmailTemplateParams) => {
  const preheader = params.preheader
    ? `<span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;">${params.preheader}</span>`
    : '';
  const badge = params.badge
    ? `<span style="display:inline-block; padding: 6px 12px; border-radius: 999px; background:#e6fffb; color:#0b3b36; font-size:12px; font-weight:700;">${params.badge}</span>`
    : '';
  const subtitle = params.subtitle ? `<div style="margin-top: 6px; font-size: 14px; opacity: 0.85;">${params.subtitle}</div>` : '';
  const metaHtml = params.meta ? renderMeta(params.meta) : '';
  const ctaHtml = renderCtas(params.primaryCta, params.secondaryCta);
  const footerNote = params.footerNote
    ? `<div style="margin-top: 22px; padding-top: 16px; border-top: 1px solid #e2e8f0; color:#64748b; font-size: 12px;">${params.footerNote}</div>`
    : '';

  return `
    ${preheader}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b1120; padding: 0; margin: 0;">
      <tr>
        <td align="center" style="padding: 36px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 680px; background:#ffffff; border-radius: 22px; overflow: hidden; border: 1px solid #0f172a;">
            <tr>
              <td style="background: linear-gradient(135deg, #0b1120 0%, #0b3b36 100%); padding: 28px;">
                <div style="font-family: Arial, sans-serif; color:#ffffff;">
                  <div style="font-size: 12px; letter-spacing: 0.28em; text-transform: uppercase; opacity: 0.7;">Guohong Lazer</div>
                  <div style="margin-top: 10px; font-size: 24px; font-weight: 700;">${params.title}</div>
                  ${subtitle}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding: 26px 28px; font-family: Arial, sans-serif;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td>${badge}</td>
                  </tr>
                </table>
                <div style="margin-top: 14px; color:#0f172a; font-size: 15px; line-height: 1.65;">
                  ${params.bodyHtml}
                </div>
                ${metaHtml}
                ${ctaHtml}
                ${footerNote}
              </td>
            </tr>
          </table>
          <div style="margin-top: 14px; color:#94a3b8; font-size: 11px; font-family: Arial, sans-serif;">
            Guohong Lazer Kurumsal Ä°letişim
          </div>
        </td>
      </tr>
    </table>
  `;
};

