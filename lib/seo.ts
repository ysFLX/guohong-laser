export const productionSiteUrl = 'https://guohonglaser.com.tr';

export const siteName = 'Guohong Lazer';
export const legalName = 'GUOHONG MAKİNA EKİPMANLARI İMALAT LİMİTED ŞİRKETİ';

export const brandAliases = [
  'Guohong',
  'Guohong Lazer',
  'Guohong Laser',
  'Guohong Laser Turkey',
  'Guohong Makina',
  'Guohong Konya',
] as const;

export const brandKeywords = [
  'guohong',
  'guohong lazer',
  'guohong laser',
  'guohong laser turkey',
  'guohong lazer konya',
  'guohong makina',
  'guohong yedek parca',
  'guohonglaser.com.tr',
  'fiber lazer kesim makinesi',
  'lazer kesim makinesi',
  'lazer yedek parca',
  'lazer teknik servis',
] as const;

export const defaultTitle = 'Guohong Lazer | Fiber Lazer Kesim Makinesi ve Yedek Parça';
export const defaultDescription =
  'Guohong Lazer Konya merkezli fiber lazer kesim makinesi, yedek parça, teknik servis ve endüstriyel lazer çözümleri sunar. Türkiye geneli satış ve destek.';

const readConfiguredSiteUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXTAUTH_URL ||
  productionSiteUrl;

export function getSiteUrl() {
  const rawUrl = readConfiguredSiteUrl().trim().replace(/\/+$/, '');

  try {
    return new URL(rawUrl).origin;
  } catch {
    return productionSiteUrl;
  }
}

export function getSiteHost() {
  return new URL(getSiteUrl()).hostname;
}

export function getAbsoluteUrl(path = '/') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(normalizedPath, `${getSiteUrl()}/`).toString();

  return normalizedPath === '/' ? url.replace(/\/$/, '') : url.replace(/\/$/, '');
}
