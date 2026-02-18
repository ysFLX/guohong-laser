import Image from 'next/image';
import Link from 'next/link';
import { Space_Grotesk } from 'next/font/google';

import Reveal from '@/components/home/Reveal';
import VideoSlider from '@/components/home/VideoSlider';
import AddToCartButton from '@/components/cart/AddToCartButton';
import { normalizeHomePanelConfig } from '@/lib/homePanelDefaults';
import { prisma } from '@/lib/prisma';

const space = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const heroStats = [
  { label: 'Hat verimliliÄŸi', value: '%98' },
  { label: 'Kurulum sÃ¼resi', value: '7-12 gÃ¼n' },
  { label: 'Servis noktasÄ±', value: '24' },
];

const heroVideos = [
  {
    src: 'https://res.cloudinary.com/dar9ughwx/video/upload/v1766584816/sackesim_m6icrx.mp4',
    title: 'Lazer Sac Kesimi',
  },
  {
    src: 'https://res.cloudinary.com/dar9ughwx/video/upload/v1766584806/borukesim_dd8a5f.mp4',
    title: 'Lazer Boru Kesimi',
  },
  {
    src: 'https://res.cloudinary.com/dar9ughwx/video/upload/v1766584837/demirkesim_kbwzy2.mp4',
    title: 'Lazer Demir Kesimi',
  },
];

const liveStatus = [
  { label: 'Stok durumu', value: 'Stokta', tone: 'text-amber-300' },
  { label: 'Teslimat', value: '2-3 gÃ¼n', tone: 'text-amber-200' },
  { label: 'Son gÃ¼ncelleme', value: '5 dk Ã¶nce', tone: 'text-slate-200' },
];

const panelIcon = (name?: string) => {
  switch (name) {
    case 'building':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M3 21h18" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 21V3h12v18" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 7h2M9 11h2M9 15h2M13 7h2M13 11h2M13 15h2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'calendar':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M8 2v4M16 2v4M3 10h18M5 6h14a2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'shield-check':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M12 3l8 4v5c0 5-3.5 9-8 9s-8-4-8-9V7l8-4z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'chart-up':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M4 19V5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 19h16" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 15l4-4 3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'briefcase':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M9 6V4h6v2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 8h16a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2v-7a2 2 0 012-2z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 12h16" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'document':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 2v6h6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'badge-check':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8.5 12l2.5 2.5 4.5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'mail':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M4 6h16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M22 8l-10 6L2 8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'bookmark':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M6 4h12a1 1 0 011 1v16l-7-4-7 4V5a1 1 0 011-1z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'shield':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M12 3l8 4v5c0 5-3.5 9-8 9s-8-4-8-9V7l8-4z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'heart':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M20.8 7.6a4.5 4.5 0 00-6.4 0L12 10l-2.4-2.4a4.5 4.5 0 00-6.4 6.4L12 22l8.8-8a4.5 4.5 0 000-6.4z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'target':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'bell':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M15 17h5l-1.4-1.4A2 2 0 0118 14V11a6 6 0 10-12 0v3a2 2 0 01-.6 1.4L4 17h5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 17a3 3 0 006 0" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'file':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 2v6h6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'check':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'signature':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M4 12c4 0 4-6 8-6s4 6 8 6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'truck':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="7" cy="17" r="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="18" cy="17" r="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M12 8v4l2 2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 22a10 10 0 100-20 10 10 0 000 20z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
};

const commerceTiles = [
  {
    title: 'Lazer Makineleri',
    description: 'Sac, boru ve kombine hatlar iÃ§in profesyonel Ã§Ã¶zÃ¼mler.',
    href: '/products',
  },
  {
    title: 'Yedek ParÃ§a',
    description: 'Stoklu sarf ve kritik parÃ§a tedariki.',
    href: '/spare-parts',
  },
  {
    title: 'Teknik Destek',
    description: 'BakÄ±m planlama, arÄ±za ve uzaktan destek sÃ¼reci.',
    href: '/contact?subject=Teknik+Destek',
  },
];

const spotlight = {
  title: 'AÃ§Ä±k Ã‡ift TablalÄ± Sac Kesim Makinesi',
  description:
    'YÃ¼ksek gÃ¼Ã§ seÃ§enekleri, otomatik tabla ve stabil kesim kalitesiyle Ã¼retim hattÄ±nÄ±zÄ± hÄ±zlandÄ±rÄ±r.',
  image: '/images/1.jpg',
  specs: [
    { label: 'GÃ¼Ã§', value: '6-12 kW' },
    { label: 'Tabla', value: '1500x3000' },
    { label: 'Otomasyon', value: 'Ã‡ift tabla' },
    { label: 'Teslim', value: '3-5 hafta' },
  ],
};

const supportGrid = [
  {
    title: 'Destek kaydÄ± aÃ§',
    description: 'ArÄ±za, performans dÃ¼ÅŸÃ¼ÅŸÃ¼ veya kurulum talebi iÃ§in.',
    href: '/contact?subject=Destek+Kaydi',
  },
  {
    title: 'BakÄ±m planla',
    description: 'Periyodik bakÄ±m ile duruÅŸ riskini azalt.',
    href: '/quote?type=Bakim',
  },
  {
    title: 'Uyumluluk sor',
    description: 'Model - ParÃ§a uyumu iÃ§in hÄ±zlÄ± kontrol.',
    href: '/contact?subject=Uyumluluk',
  },
  {
    title: 'Uzaktan destek',
    description: 'Teknik ekip ile uzaktan baÄŸlantÄ± ve teÅŸhis.',
    href: '/contact?subject=Uzaktan+Destek',
  },
];

const trustLinks = [
  {
    title: 'Ä°ade ve Garanti',
    description: 'Garanti kapsamÄ±, iade koÅŸullarÄ± ve servis akÄ±ÅŸÄ±.',
    href: '/returns',
  },
  {
    title: 'Mesafeli SatÄ±ÅŸ',
    description: 'SipariÅŸ onayÄ±, teslimat ve cayma hakkÄ± Ã¶zeti.',
    href: '/distance-sales',
  },
  {
    title: 'Kargo ve Teslimat',
    description: 'HazÄ±rlama sÃ¼releri ve kargo takip bilgileri.',
    href: '/shipping',
  },
  {
    title: 'Ã–deme GÃ¼venliÄŸi',
    description: 'SSL, 3D Secure ve gÃ¼venli Ã¶deme adÄ±mlarÄ±.',
    href: '/payment-security',
  },
  {
    title: 'Gizlilik PolitikasÄ±',
    description: 'KVKK, veri iÅŸleme ve iletiÅŸim bilgileri.',
    href: '/privacy',
  },
  {
    title: 'KVKK AydÄ±nlatma',
    description: 'Veri iÅŸleme amaÃ§larÄ± ve baÅŸvuru haklarÄ±.',
    href: '/kvkk',
  },
  {
    title: 'Ã‡erez PolitikasÄ±',
    description: 'Ã‡erez tÃ¼rleri ve tercih yÃ¶netimi.',
    href: '/cookies',
  },
];

const quickShowcaseFallback = [
  {
    title: 'FSCUT',
    description: 'Kesim hattÄ±nÄ±z iÃ§in kontrol yazÄ±lÄ±mÄ±. HÄ±zlÄ± kurulum.',
    price: 'TL 1.900,90',
    tag: 'YazÄ±lÄ±m',
    href: '/spare-parts',
    image: '/images/1.jpg',
  },
  {
    title: 'Seramik Conta (Halka)',
    description: 'YÃ¼ksek dayanÄ±mlÄ± yedek parÃ§a. Stoktan teslim.',
    price: 'TL 199,99',
    tag: 'Conta',
    href: '/spare-parts',
    image: '/images/2.jpg',
  },
  {
    title: 'WSX NC30E',
    description: 'Lazer kafa parÃ§alarÄ± iÃ§in hÄ±zlÄ± tedarik.',
    price: 'TL 1.199,99',
    tag: 'Lazer KafasÄ±',
    href: '/spare-parts',
    image: '/images/3.jpg',
  },
];

const formatPrice = (value: number, currency = 'TRY') =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value);

const trimText = (value: string, max = 90) => (value.length > max ? `${value.slice(0, max - 1)}...` : value);
const normalizeWhitespace = (value: string) => value.replace(/\s+/g, ' ').trim();

const getInitials = (value: string) => {
  const words = value.trim().split(/\s+/).filter(Boolean);
  const initials = words
    .slice(0, 2)
    .map((word) => (word[0] ?? '').toUpperCase())
    .join('');

  return initials || 'M';
};

type QuickShowcaseItem = {
  title: string;
  description: string;
  price: string;
  tag: string;
  href: string;
  image: string;
  id?: string;
  priceCents?: number;
  currency?: string;
  imageUrl?: string | null;
  stockOnHand?: number;
  inStock?: boolean;
  ratingAverage?: number;
  ratingCount?: number;
};

type HomeTestimonial = {
  id: string;
  name: string;
  role: string;
  quote: string;
  image?: string | null;
  rating?: number;
  productLabel?: string;
  href?: string;
};

const getDisplayName = (user: { name: string | null; firstName: string | null; lastName: string | null }) => {
  if (user.name) return user.name;
  const composed = [user.firstName, user.lastName].filter(Boolean).join(' ');
  return composed || 'MÃ¼ÅŸteri';
};

const maskName = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed || trimmed === 'MÃ¼ÅŸteri' || trimmed === 'Musteri') return 'Gizli MÃ¼ÅŸteri';
  const parts = trimmed.split(/\s+/).filter(Boolean);
  const masked = parts
    .map((part) => {
      if (!part.length) return '';
      const stars = '*'.repeat(Math.max(part.length - 1, 1));
      return `${part[0]}${stars}`;
    })
    .join(' ');
  return masked || 'Gizli MÃ¼ÅŸteri';
};

const getReviewName = (review: {
  isAnonymous: boolean;
  user: { name: string | null; firstName: string | null; lastName: string | null };
}) => {
  const displayName = getDisplayName(review.user);
  if (review.isAnonymous) return maskName(displayName);
  return displayName;
};

const process = [
  {
    title: 'KeÅŸif ve Analiz',
    description: 'Saha ihtiyaÃ§larÄ± ve kapasite hedefleri netleÅŸir.',
  },
  {
    title: 'Teknik Teklif',
    description: 'Uygun makine konfigÃ¼rasyonu ve plan paylaÅŸÄ±lÄ±r.',
  },
  {
    title: 'Kurulum ve EÄŸitim',
    description: 'Kurulum, test, operatÃ¶r ve bakÄ±m eÄŸitimi tamamlanÄ±r.',
  },
  {
    title: 'SÃ¼rekli Destek',
    description: 'Raporlama, uzaktan takip ve servis sÃ¼reci devrede olur.',
  },
];

const staticTestimonials: HomeTestimonial[] = [
  {
    id: 'static-1',
    name: 'Ahmet YÄ±lmaz',
    role: 'Ãœretim MÃ¼dÃ¼rÃ¼',
    quote:
      'Kurulum sÃ¼reci net planlandÄ±, kesim kalitesi ve servis hÄ±zÄ± beklentimizin Ã¼stÃ¼nde.',
    image: '/images/avatar1.jpg',
  },
  {
    id: 'static-2',
    name: 'AyÅŸe Kaya',
    role: 'Ä°ÅŸletme sahibi',
    quote:
      'Yedek parÃ§a hÄ±zÄ± sayesinde duruÅŸ sÃ¼releri ciddi ÅŸekilde azaldÄ±.',
    image: '/images/avatar2.jpg',
  },
];

const faq = [
  {
    q: 'Makine seÃ§iminde nasÄ±l ilerliyorsunuz?',
    a: 'Ãœcretsiz keÅŸif ve hat analizi ile uygun konfigurasyon belirliyoruz.',
  },
  {
    q: 'Servis sÃ¼reci ne kadar hÄ±zlÄ±?',
    a: 'Uzaktan destekle hÄ±zlÄ± teÅŸhis, gerekirse saha ekibi yÃ¶nlendirme saÄŸlanÄ±yor.',
  },
  {
    q: 'Yedek parÃ§a stoklarÄ± hazÄ±r mÄ±?',
    a: 'Kritik parÃ§alar stoklu, diÄŸerleri iÃ§in hÄ±zlÄ± tedarik hattÄ± mevcut.',
  },
  {
    q: 'EÄŸitim veriliyor mu?',
    a: 'Kurulum sonrasÄ± operator ve bakÄ±m ekibine kapsamlÄ± eÄŸitim verilir.',
  },
];

export default async function Home() {
  const prismaHome = prisma as unknown as {
    homePanelConfig: {
      findUnique: (args: unknown) => Promise<{
        capacitySchedule?: unknown;
        priceAlertSteps?: unknown;
        procurementFlow?: unknown;
        capacityImageUrl?: string | null;
        priceAlertImageUrl?: string | null;
        procurementImageUrl?: string | null;
      } | null>;
    };
  };
  const config = await prismaHome.homePanelConfig.findUnique({
    where: { id: 'home' },
  });
  const {
    capacitySchedule,
    priceAlertSteps,
    procurementFlow,
    capacityImageUrl,
    priceAlertImageUrl,
    procurementImageUrl,
  } = normalizeHomePanelConfig(config ?? {});
  const spareParts = await prisma.sparePart.findMany({
    where: { isActive: true },
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    include: {
      category: true,
      images: { orderBy: { sortOrder: 'asc' }, take: 1 },
    },
    take: 24,
  });
  const byCategory = new Map<string, typeof spareParts[number]>();
  for (const part of spareParts) {
    const existing = byCategory.get(part.categoryId);
    if (!existing) {
      byCategory.set(part.categoryId, part);
      continue;
    }

    const existingInStock = existing.stockOnHand > 0;
    const partInStock = part.stockOnHand > 0;
    if (!existingInStock && partInStock) {
      byCategory.set(part.categoryId, part);
    }
  }
  const pickedParts = Array.from(byCategory.values()).slice(0, 3);
  const pickedPartIds = pickedParts.map((part) => part.id);
  const pickedRatings = pickedPartIds.length
    ? await prisma.sparePartReview.groupBy({
        by: ['sparePartId'],
        where: { sparePartId: { in: pickedPartIds }, isApproved: true },
        _avg: { rating: true },
        _count: { rating: true },
      })
    : [];
  const pickedRatingMap = new Map(
    pickedRatings.map((row) => [
      row.sparePartId,
      {
        average: Number(row._avg.rating ?? 0),
        count: row._count.rating,
      },
    ]),
  );
  const quickShowcase: QuickShowcaseItem[] = [
    ...pickedParts.map((part) => {
      const rating = pickedRatingMap.get(part.id) ?? { average: 0, count: 0 };
      return {
        title: part.name,
        description: trimText(part.description, 90),
        price: formatPrice(part.priceCents / 100, part.currency),
        tag: part.category.name,
        href: `/spare-parts/${part.id}`,
        image: part.imageUrl ?? part.images[0]?.url ?? '/images/2.jpg',
        id: part.id,
        priceCents: part.priceCents,
        currency: part.currency,
        imageUrl: part.imageUrl ?? part.images[0]?.url ?? null,
        stockOnHand: part.stockOnHand,
        inStock: part.stockOnHand > 0,
        ratingAverage: rating.average,
        ratingCount: rating.count,
      };
    }),
  ];
  if (quickShowcase.length < 3) {
    const existing = new Set(quickShowcase.map((item) => item.title));
    for (const fallback of quickShowcaseFallback) {
      if (quickShowcase.length >= 3) break;
      if (!existing.has(fallback.title)) {
        quickShowcase.push(fallback);
      }
    }
  }

  let testimonials: HomeTestimonial[] = staticTestimonials;
  try {
    const homepageReviews = await prisma.sparePartReview.findMany({
      where: {
        isApproved: true,
        rating: { gte: 4 },
        OR: [{ body: { not: null } }, { title: { not: null } }],
      },
      orderBy: { createdAt: 'desc' },
      take: 2,
      include: {
        user: { select: { name: true, firstName: true, lastName: true } },
        sparePart: { select: { id: true, name: true, category: { select: { name: true } } } },
      },
    });

    const fromReviews: HomeTestimonial[] = [];
    for (const review of homepageReviews) {
      const quoteSource = normalizeWhitespace(review.body ?? review.title ?? '');
      if (!quoteSource) continue;

      const productLabel = [review.sparePart.name, review.sparePart.category?.name].filter(Boolean).join(' â€¢ ');
      fromReviews.push({
        id: review.id,
        name: getReviewName(review),
        role: 'DoÄŸrulanmÄ±ÅŸ mÃ¼ÅŸteri',
        quote: trimText(quoteSource, 170),
        image: null,
        rating: review.rating,
        productLabel,
        href: `/spare-parts/${review.sparePart.id}#reviews`,
      });
    }

    if (fromReviews.length) {
      testimonials = [...fromReviews, ...staticTestimonials].slice(0, 2);
    }
  } catch (error) {
    console.error('home:testimonials', error);
  }

  return (
    <div className={`${space.className} bg-[#070707] text-amber-50`}>
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -left-24 top-20 h-64 w-64 rounded-full bg-amber-200/60 blur-[120px] dark:bg-amber-500/15 glow-drift"
          style={{ animationDelay: '0ms' }}
        />
        <div
          className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-amber-200/30 blur-[140px] dark:bg-amber-500/15 glow-drift"
          style={{ animationDelay: '200ms' }}
        />
        <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(120deg,rgba(15,23,42,0.08)_1px,transparent_1px),linear-gradient(0deg,rgba(15,23,42,0.08)_1px,transparent_1px)] [background-size:140px_140px] dark:opacity-20 dark:[background-image:linear-gradient(120deg,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(0deg,rgba(148,163,184,0.12)_1px,transparent_1px)]" />

        <Reveal as="section" className="relative mx-auto w-full px-0 pb-12 pt-12">
          <div className="relative overflow-hidden rounded-[44px] bg-gradient-to-br from-[#171108] via-[#0b0b0b] to-[#2a1d0f] text-white shadow-[0_50px_140px_rgba(0,0,0,0.6)]">
            <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-amber-500/25 blur-[140px]" />
            <div className="pointer-events-none absolute -right-32 top-0 h-80 w-80 rounded-full bg-amber-400/20 blur-[160px]" />
            <div className="relative grid gap-10 px-6 py-10 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-14 lg:py-14">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.4em] text-white/70">
                  Guohong Lazer
                </div>
                <h1 className="text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl">
                  Ãœretim hatlarÄ±nÄ±
                  <span className="block text-amber-300">tek panelde yÃ¶net</span>
                </h1>
                <p className="max-w-xl text-base text-white/70">
                  Makine, yedek parÃ§a ve teknik destek tek sistemde. HattÄ±nÄ± hÄ±zlandÄ±ran, servis akÄ±ÅŸÄ±nÄ± netleÅŸtiren
                  premium operasyon altyapÄ±sÄ±.
                </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/products"
                  className="inline-flex w-full items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-white/90 sm:w-auto"
                >
                  KataloÄŸu GÃ¶r
                </Link>
                <Link
                  href="/spare-parts"
                  className="inline-flex w-full items-center justify-center rounded-full bg-amber-400 px-7 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-500/25 transition hover:-translate-y-0.5 hover:bg-amber-300 sm:w-auto"
                >
                  Yedek parÃ§a al
                </Link>
                <Link
                  href="/quote"
                  className="inline-flex w-full items-center justify-center rounded-full border border-white/30 px-7 py-3 text-sm font-semibold text-white/80 transition hover:border-white/60 hover:text-white sm:w-auto"
                >
                  Teklif al
                </Link>
              </div>
                <div className="flex flex-wrap gap-3">
                  {heroStats.map((stat) => (
                    <div key={stat.label} className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
                      <p className="text-lg font-semibold text-white">{stat.value}</p>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-white/60">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-5">
                <div className="relative min-h-[360px] overflow-hidden rounded-[36px] border border-white/20 bg-white/10">
                  <Image
                    src="/images/about-showcase.jpg"
                    alt="Guohong Lazer Hat"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 48vw"
                    className="object-cover"
                    quality={85}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-950/70 via-slate-900/10 to-transparent" />
                  <div className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-800">
                    <span className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_12px_rgba(251,191,36,0.9)]" />
                    CanlÄ± Ä°zleme
                  </div>
                  <div className="absolute bottom-6 left-6 right-6 rounded-3xl border border-white/40 bg-white/90 px-5 py-4 text-sm text-slate-700 shadow-xl">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Anlik performans</div>
                    <div className="mt-2 flex items-center justify-between text-sm font-semibold">
                      <span>GÃ¼nlÃ¼k kesim raporu + uzaktan izleme</span>
                      <span className="text-slate-400">%98</span>
                    </div>
                  </div>
                </div>
                <div className="grid gap-3 rounded-3xl border border-white/15 bg-white/10 px-5 py-4 text-sm text-white/80">
                  {liveStatus.map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-[0.2em] text-white/50">{item.label}</span>
                      <span className={`text-sm font-semibold ${item.tone}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal as="section" className="mx-auto mt-12 w-full px-0">
        <div className="rounded-[32px] border border-amber-200/30 bg-[#121212] p-6 shadow-xl ambient-pulse gradient-shift bg-[linear-gradient(120deg,rgba(251,191,36,0.12),rgba(18,18,18,0.95),rgba(250,204,21,0.14))]">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Video galerisi</p>
              <h2 className="mt-2 text-2xl font-semibold text-amber-50">
                Sac, boru ve demir kesim hatlarÄ±
              </h2>
            </div>
            <Link
              href="/gallery"
              className="rounded-full border border-amber-200/40 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-100 hover:border-amber-300/60"
            >
              Galeriye Git
            </Link>
          </div>
          <VideoSlider items={heroVideos} />
        </div>
      </Reveal>

      <Reveal as="section" className="mx-auto w-full px-0">
        <div className="grid gap-4 rounded-[36px] border border-amber-200/20 bg-[#111111] p-6 shadow-[0_30px_80px_-50px_rgba(0,0,0,0.55)] md:grid-cols-3 gradient-shift">
          {commerceTiles.map((tile) => (
            <Link
              key={tile.title}
              href={tile.href}
              className="group relative overflow-hidden rounded-[26px] border border-amber-200/20 bg-[#171717] px-5 py-6 transition hover:-translate-y-1 hover:border-amber-300/50 hover:bg-[#1d1d1d] hover:shadow-xl"
            >
              <div className="absolute right-4 top-4 h-10 w-10 rounded-full bg-amber-100/80 dark:bg-amber-500/20" />
              <div className="mb-4 h-1 w-10 rounded-full bg-amber-500/70" />
              <h3 className="text-lg font-semibold text-amber-50">{tile.title}</h3>
              <p className="mt-2 text-sm text-amber-100/70">{tile.description}</p>
              <span className="mt-6 inline-flex items-center text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
                Incele
                <span className="ml-2 transition group-hover:translate-x-1">-&gt;</span>
              </span>
            </Link>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="mx-auto mt-16 w-full px-0">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[36px] border border-amber-200/20 bg-[#111111] p-8 shadow-[0_30px_90px_rgba(0,0,0,0.55)]">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-amber-300">KÄ±sa Ã¼rÃ¼n vitrini</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                  Hemen teslim yedek parÃ§alar
                </h2>
              </div>
              <Link
                href="/spare-parts"
                className="rounded-full border border-amber-200/30 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-100 hover:border-amber-300/60"
              >
                TÃ¼mÃ¼nÃ¼ GÃ¶r
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {quickShowcase.map((item) => {
                const isDbItem = typeof item.id === 'string';
                const inStock = Boolean(item.inStock);
                const stockLabel = isDbItem ? (inStock ? 'Stokta' : 'SipariÅŸle') : null;
                const stockRequestHref =
                  isDbItem && item.id
                    ? `/stock-request?product=${encodeURIComponent(item.title)}&id=${encodeURIComponent(item.id)}`
                    : '/stock-request';

                return (
                  <div
                    key={item.title}
                    className="group relative overflow-hidden rounded-[24px] border border-amber-200/20 bg-[#171717] px-4 pb-4 pt-3 transition hover:-translate-y-1 hover:border-amber-300/50 hover:shadow-[0_20px_50px_rgba(0,0,0,0.45)] glint"
                  >
                    <Link href={item.href} className="block">
                      <div className="relative h-32 w-full overflow-hidden rounded-xl">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover transition duration-500 group-hover:scale-105"
                          quality={75}
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-slate-900/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                            {item.tag}
                          </span>
                          {stockLabel && (
                            <span
                              className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                                inStock ? 'bg-amber-100 text-amber-900' : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {stockLabel}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                          <p className="mt-1 text-xs text-slate-500">{item.description}</p>
                          {typeof item.ratingCount === 'number' && item.ratingCount > 0 && (
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-600">
                              <span className="text-amber-600">â˜… {Number(item.ratingAverage ?? 0).toFixed(1)}</span>
                              <span className="text-slate-400">({item.ratingCount} yorum)</span>
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-amber-300">{item.price}</span>
                      </div>
                    </Link>

                    {isDbItem && item.id && typeof item.priceCents === 'number' && (
                      <div className="mt-4 grid gap-2">
                        {inStock ? (
                          <AddToCartButton
                            id={item.id}
                            name={item.title}
                            priceCents={item.priceCents}
                            imageUrl={item.imageUrl ?? null}
                            className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-400"
                          />
                        ) : (
                          <Link
                            href={stockRequestHref}
                            className="inline-flex items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:border-amber-300"
                          >
                            Stok gelince haber ver
                          </Link>
                        )}
                        <Link
                          href={item.href}
                          className="inline-flex items-center justify-center rounded-xl border border-amber-200/30 bg-[#0f0f0f] px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-[#1b1b1b]"
                        >
                          Detay gÃ¶r
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[36px] border border-amber-200/20 bg-gradient-to-br from-[#171108] via-[#0b0b0b] to-[#2a1d0f] p-8 text-white shadow-[0_30px_90px_rgba(0,0,0,0.6)]">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-200">HÄ±zlÄ± teklif</p>
            <h3 className="mt-3 text-2xl font-semibold">Teklifini 30 dakika iÃ§inde oluÅŸturalÄ±m</h3>
            <p className="mt-3 text-sm text-white/70">
              Ãœretim hedefini, parÃ§a modelini ve teslim aciliyetini ilet. Net fiyat ve plan aynÄ± gÃ¼n geri dÃ¶nsÃ¼n.
            </p>
            <div className="mt-5 space-y-3 text-sm text-white/80">
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">1. Model / parÃ§a bilgisi</div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">2. Adet ve teslim tarihi</div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">3. Ä°letiÅŸim e-posta adresi</div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/quote"
                className="inline-flex items-center justify-center rounded-full bg-amber-300 px-6 py-2.5 text-sm font-semibold text-black"
              >
                Teklif Al
              </Link>
              <Link
                href="/contact?subject=Hizli+Teklif"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-2.5 text-sm font-semibold text-white/80"
              >
                E-posta gÃ¶nder
              </Link>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="mx-auto mt-16 w-full px-0">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[32px] border border-amber-200/20 bg-[#111111] p-6 shadow-xl">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-300">ÃœrÃ¼n spotlight</p>
            <h2 className="mt-3 text-2xl font-semibold text-amber-50">{spotlight.title}</h2>
            <p className="mt-3 text-sm text-amber-100/70">{spotlight.description}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {spotlight.specs.map((spec) => (
                <div
                  key={spec.label}
                  className="rounded-2xl border border-amber-200/20 bg-[#171717] px-4 py-3"
                >
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    {spec.label}
                  </p>
                  <p className="mt-2 text-base font-semibold text-amber-50">{spec.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-full bg-amber-500 px-6 py-2.5 text-sm font-semibold text-black hover:bg-amber-400"
              >
                DetaylarÄ± GÃ¶r
              </Link>
              <Link
                href="/quote"
                className="inline-flex items-center justify-center rounded-full border border-amber-200/30 px-6 py-2.5 text-sm font-semibold text-amber-100 hover:border-amber-300/60"
              >
                Teklif Ä°ste
              </Link>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[32px] border border-amber-200/20 bg-[#171717] shadow-xl">
            <Image
              src={spotlight.image}
              alt={spotlight.title}
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
              loading="lazy"
              decoding="async"
              quality={70}
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/40 via-transparent to-transparent" />
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="mx-auto mt-16 w-full px-0">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative overflow-hidden rounded-[32px] border border-amber-200/20 bg-gradient-to-br from-[#171108] via-[#0b0b0b] to-[#2a1d0f] p-6 text-white shadow-2xl glint">
            {capacityImageUrl ? (
              <div className="pointer-events-none absolute inset-0">
                <Image
                  src={capacityImageUrl}
                  alt="Kapasite gorseli"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover opacity-25"
                  loading="lazy"
                  decoding="async"
                  quality={70}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/60 to-[#2a1d0f]/70" />
              </div>
            ) : null}
            <p className="text-xs uppercase tracking-[0.3em] text-amber-200">CanlÄ± kapasite takvimi</p>
            <h2 className="mt-2 text-2xl font-semibold">Ãœretim + servis randevu paneli</h2>
            <p className="mt-3 text-sm text-white/70">
              KeÅŸif, kurulum ve servis slotlarÄ±nÄ± canlÄ± takip et. Takvim doluluÄŸuna gÃ¶re otomatik Ã¶nceliklendirme al.
            </p>
            <div className="mt-6 grid gap-3">
              {capacitySchedule.map((slot) => (
                <div key={slot.title} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-amber-200">
                        {panelIcon(slot.icon)}
                      </span>
                      <span>{slot.title}</span>
                    </div>
                    <span className="text-amber-200">{slot.status}</span>
                  </div>
                  <p className="mt-1 text-sm text-white/70">{slot.detail}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/60">{slot.window}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact?subject=Kesif+Randevusu"
                className="inline-flex items-center justify-center rounded-full bg-amber-400 px-6 py-2.5 text-sm font-semibold text-slate-900"
              >
                KeÅŸif randevusu al
              </Link>
              <Link
                href="/quote"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-2.5 text-sm font-semibold text-white/80"
              >
                Teslim planÄ±nÄ± sor
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[32px] border border-amber-200/20 bg-[#111111] p-6 shadow-xl glint">
            {priceAlertImageUrl ? (
              <div className="pointer-events-none absolute inset-0">
                <Image
                  src={priceAlertImageUrl}
                  alt="Fiyat alarmi gorseli"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover opacity-10"
                  loading="lazy"
                  decoding="async"
                  quality={70}
                />
              </div>
            ) : null}
            <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Fiyat dÃ¼ÅŸÃ¼ÅŸ alarmÄ±</p>
            <h2 className="mt-2 text-2xl font-semibold text-amber-50">
              Fiyat dÃ¼ÅŸunce otomatik haber ver
            </h2>
            <p className="mt-3 text-sm text-amber-100/70">
              SeÃ§ili Ã¼rÃ¼nlerde fiyat dÃ¼ÅŸÃ¼ÅŸ ve stok giriÅŸi olduÄŸunda e-posta ile otomatik bilgilendirme al.
            </p>
            <div className="mt-5 space-y-3">
              {priceAlertSteps.map((step) => (
                <div
                  key={step.text}
                  className="rounded-2xl border border-amber-200/20 bg-[#171717] px-4 py-3 text-sm text-amber-100/80"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-300/10 text-amber-300">
                      {panelIcon(step.icon)}
                    </span>
                    <span>{step.text}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/spare-parts"
                className="inline-flex items-center justify-center rounded-full bg-amber-500 px-6 py-2.5 text-sm font-semibold text-black hover:bg-amber-400"
              >
                Alarm Kur
              </Link>
              <Link
                href="/stock-request"
                className="inline-flex items-center justify-center rounded-full border border-amber-200/30 px-6 py-2.5 text-sm font-semibold text-amber-100 hover:border-amber-300/60"
              >
                Stok Ä°ste
              </Link>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="mx-auto mt-16 w-full px-0">
        <div className="relative overflow-hidden rounded-[32px] border border-amber-200/20 bg-[#111111] p-6 shadow-xl glint">
          {procurementImageUrl ? (
            <div className="pointer-events-none absolute inset-0">
              <Image
                src={procurementImageUrl}
                alt="Satin alma gorseli"
                fill
                sizes="(max-width: 1024px) 100vw, 100vw"
                className="object-cover opacity-10"
                loading="lazy"
                decoding="async"
                quality={70}
              />
            </div>
          ) : null}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Kurumsal satin alma</p>
              <h2 className="mt-2 text-2xl font-semibold text-amber-50">
                Tekliften teslimata tek panel akÄ±ÅŸÄ±
              </h2>
            </div>
            <div className="flex gap-2 text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
              <span className="rounded-full border border-slate-200 px-3 py-1 dark:border-slate-700">Yetkili onay</span>
              <span className="rounded-full border border-slate-200 px-3 py-1 dark:border-slate-700">SLA takip</span>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {procurementFlow.map((step, index) => (
              <div
                key={step.title}
                className="rounded-2xl border border-amber-200/20 bg-[#171717] px-4 py-4"
              >
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-amber-300">
                  <span>AdÄ±m {index + 1}</span>
                  <span className="rounded-full bg-amber-300/10 px-2 py-1 text-[10px] font-semibold text-amber-200">
                    {step.title}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-300/10 text-amber-200">
                    {panelIcon(step.icon)}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-amber-50">{step.title}</p>
                    <p className="mt-1 text-sm text-amber-100/70">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/quote"
              className="inline-flex items-center justify-center rounded-full bg-amber-500 px-6 py-2.5 text-sm font-semibold text-black shadow-lg shadow-amber-500/25"
            >
              Kurumsal teklif baÅŸlat
            </Link>
            <Link
              href="/contact?subject=Kurumsal+Satin+Alma"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:text-slate-200"
            >
              SatÄ±n alma desteÄŸi
            </Link>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="mx-auto mt-16 w-full px-0">
        <div className="rounded-[32px] border border-amber-200/20 bg-[#111111] p-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Destek merkezi</p>
              <h2 className="mt-2 text-2xl font-semibold text-amber-50">
                E-ticaret + teknik destek tek sayfada
              </h2>
            </div>
            <Link
              href="/contact"
              className="rounded-full border border-amber-200/30 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-100 hover:border-amber-300/60"
            >
              Destek al
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {supportGrid.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-2xl border border-amber-200/20 bg-[#171717] px-4 py-4 transition hover:-translate-y-1 hover:border-amber-300/50 hover:shadow-lg"
              >
                <p className="text-sm font-semibold text-amber-50">{item.title}</p>
                <p className="mt-2 text-sm text-amber-100/70">{item.description}</p>
                <span className="mt-4 inline-flex items-center text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
                  Ac
                  <span className="ml-2 transition group-hover:translate-x-1">-&gt;</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="mx-auto mt-16 w-full px-0">
        <div className="rounded-[32px] border border-amber-200/20 bg-[#111111] p-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Guven merkezi</p>
              <h2 className="mt-2 text-2xl font-semibold text-amber-50">
                Garanti, teslimat ve gÃ¼venli Ã¶deme bilgileri
              </h2>
            </div>
            <Link
              href="/contact"
              className="rounded-full border border-slate-200 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200"
            >
              Destek iste
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {trustLinks.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-2xl border border-amber-200/20 bg-[#171717] px-4 py-4 transition hover:-translate-y-1 hover:border-amber-300/50 hover:shadow-lg"
              >
                <p className="text-sm font-semibold text-amber-50">{item.title}</p>
                <p className="mt-2 text-sm text-amber-100/70">{item.description}</p>
                <span className="mt-4 inline-flex items-center text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
                  Incele
                  <span className="ml-2 transition group-hover:translate-x-1">-&gt;</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="mx-auto mt-16 grid w-full gap-6 px-0 lg:grid-cols-2">
        <div className="rounded-[32px] border border-amber-200/20 bg-[#111111] p-6 shadow-xl">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Ä°ÅŸ akÄ±ÅŸÄ±</p>
          <h2 className="mt-2 text-2xl font-semibold text-amber-50">4 adÄ±mda devreye alma</h2>
          <div className="mt-6 space-y-4">
            {process.map((step, index) => (
              <div
                key={step.title}
                className="rounded-2xl border border-amber-200/20 bg-[#171717] px-4 py-4"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-xs font-semibold text-black">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-amber-50">{step.title}</p>
                    <p className="mt-1 text-sm text-amber-100/70">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[32px] border border-amber-200/20 bg-gradient-to-br from-[#171108] via-[#0b0b0b] to-[#2a1d0f] p-6 text-white shadow-xl">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-200">Uyumluluk ve gÃ¼ven</p>
          <h2 className="mt-2 text-2xl font-semibold">Model - ParÃ§a uyumu tek ekranda</h2>
          <p className="mt-3 text-sm text-white/70">
            Makine modeline gÃ¶re uyumlu yedek parÃ§alarÄ± anÄ±nda gÃ¶ster, stok ve teslim bilgisiyle karar ver.
          </p>
          <div className="mt-6 grid gap-3">
            {['Model seÃ§imi', 'Uyumlu parÃ§a listesi', 'HÄ±zlÄ± teslim bilgisi', 'Teknik onay'].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm">
                {item}
              </div>
            ))}
          </div>
          <Link
            href="/spare-parts"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-amber-400 px-6 py-2.5 text-sm font-semibold text-slate-900"
          >
            Yedek parÃ§a arat
          </Link>
        </div>
      </Reveal>

      <Reveal as="section" className="mx-auto mt-16 grid w-full gap-5 px-0 lg:grid-cols-2">
        {testimonials.map((item) => (
          <div
            key={item.id}
            className="rounded-[32px] border border-amber-200/20 bg-[#111111] p-6 shadow-xl"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                {item.image ? (
                  <Image src={item.image} alt={item.name} width={48} height={48} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-500/20 via-white/10 to-amber-500/20 text-xs font-semibold text-amber-100">
                    {getInitials(item.name)}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-amber-50">{item.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.role}</p>
                  </div>
                  {typeof item.rating === 'number' && (
                    <div className="shrink-0 text-xs font-semibold text-amber-600 dark:text-amber-300">
                      â˜… {item.rating}/5
                    </div>
                  )}
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-amber-100/70 line-clamp-4">"{item.quote}"</p>
            {item.href && item.productLabel && (
              <Link
                href={item.href}
                className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-amber-300 hover:text-amber-200"
              >
                <span className="line-clamp-1">{item.productLabel}</span>
                <span aria-hidden>â†’</span>
              </Link>
            )}
          </div>
        ))}
      </Reveal>

      <Reveal as="section" className="mx-auto mt-16 w-full px-0">
        <div className="rounded-[32px] border border-amber-200/20 bg-[#111111] p-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-300">SSS</p>
              <h2 className="mt-2 text-2xl font-semibold text-amber-50">
                Karar sÃ¼recini hÄ±zlandÄ±ran cevaplar
              </h2>
            </div>
            <Link
              href="/contact"
              className="rounded-full border border-amber-200/30 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-100 hover:border-amber-300/60"
            >
              Sorunuz mu var?
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {faq.map((item) => (
              <div
                key={item.q}
                className="rounded-2xl border border-amber-200/20 bg-[#171717] px-4 py-4"
              >
                <p className="text-sm font-semibold text-amber-50">{item.q}</p>
                <p className="mt-2 text-sm text-amber-100/70">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="mx-auto mt-16 w-full px-0 pb-16">
        <div className="grid gap-6 rounded-[36px] border border-amber-200/20 bg-gradient-to-r from-[#171108] via-[#0b0b0b] to-[#2a1d0f] p-8 text-white shadow-2xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/70">Hadi baslayalim</p>
              <h2 className="mt-2 text-2xl font-semibold">Makine ve yedek parca ihtiyacin icin plan hazirlayalim</h2>
              <p className="mt-2 text-sm text-white/70">Teklifini hizli hazirlayalim, kurulum takvimini netlestirelim.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/quote"
                className="inline-flex items-center justify-center rounded-full bg-amber-400 px-6 py-2.5 text-sm font-semibold text-slate-900"
              >
                Hemen teklif al
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-2.5 text-sm font-semibold text-white/80"
              >
                Ä°letiÅŸime GeÃ§
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
