import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Space_Grotesk } from 'next/font/google';

import AddToCartButton from '@/components/cart/AddToCartButton';
import Reveal from '@/components/home/Reveal';
import { getUsdTryExchangeRate, resolveDisplayedCurrency, resolveDisplayedPriceCents } from '@/lib/exchangeRates';
import { prisma } from '@/lib/prisma';
import { isSparePartDirectPurchaseEnabled, isSparePartPriceVisible } from '@/lib/sparePartSales';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'Guohong Lazer | Fiber Lazer Kesim Makinesi, Yedek Parca ve Teknik Servis',
  description:
    'Guohong Lazer; fiber lazer kesim makineleri, yedek parca tedariği ve teknik servis hizmetlerini tek noktada sunar.',
  alternates: {
    canonical: siteUrl,
  },
};

const space = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const serviceCards = [
  {
    title: 'Makine Cozumleri',
    description: 'Sac, boru ve profil kesim ihtiyacina uygun fiber lazer makine secenekleri.',
    href: '/products',
    cta: 'Makineleri incele',
  },
  {
    title: 'Yedek Parca Tedariği',
    description: 'Lazer kafasi, nozul, lens ve sarf urunler icin stok ve tedarik destegi.',
    href: '/spare-parts',
    cta: 'Yedek parcaya git',
  },
  {
    title: 'Teknik Servis',
    description: 'Kurulum, bakim, ariza ve uzaktan destek sureclerinde teknik ekip destegi.',
    href: '/contact?subject=Teknik+Destek',
    cta: 'Teknik destek al',
  },
];

const workflow = [
  {
    title: 'Ihtiyac analizi',
    description: 'Makine, kapasite ve kullanim senaryosu birlikte degerlendirilir.',
  },
  {
    title: 'Tekliflendirme',
    description: 'Urun, teslimat ve sartlara gore net bir teklif hazirlanir.',
  },
  {
    title: 'Kurulum ve devreye alma',
    description: 'Kurulum tamamlanir ve temel kullanici egitimi verilir.',
  },
  {
    title: 'Satis sonrasi destek',
    description: 'Yedek parca, bakim ve teknik sorular icin surekli destek saglanir.',
  },
];

const trustLinks = [
  { title: 'Odeme Guvenligi', href: '/payment-security' },
  { title: 'Mesafeli Satis Sozlesmesi', href: '/distance-sales' },
  { title: 'Iade ve Garanti', href: '/returns' },
  { title: 'Kargo ve Teslimat', href: '/shipping' },
  { title: 'Gizlilik Politikasi', href: '/privacy' },
  { title: 'KVKK Aydinlatma', href: '/kvkk' },
];

const faq = [
  {
    q: 'Makine secim surecinde nasil ilerliyorsunuz?',
    a: 'Uretim tipinize ve kullanim yogunluguna gore uygun model alternatifleri sunuyoruz.',
  },
  {
    q: 'Yedek parca siparisi nasil verilir?',
    a: 'Urun kodu veya model bilgisi ile teklif alabilir ya da uygun urunleri dogrudan siparis verebilirsiniz.',
  },
  {
    q: 'Teknik servis talebi nasil olusturulur?',
    a: 'Iletisim sayfasindan servis kaydi acabilir, ekipten geri donus alabilirsiniz.',
  },
  {
    q: 'Kurulum sonrasi destek veriliyor mu?',
    a: 'Evet, kurulum sonrasi kullanim ve teknik surecler icin destek saglaniyor.',
  },
];

const formatPrice = (value: number, currency = 'TRY') =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value);

const shortText = (value: string, max = 90) => (value.length > max ? `${value.slice(0, max - 1)}...` : value);

type HomePartCard = {
  id: string;
  name: string;
  description: string;
  image: string;
  imageUrl: string | null;
  categoryName: string;
  inStock: boolean;
  priceCents: number;
  displayedPrice: string;
  href: string;
};

export default async function Home() {
  const sparePartPriceVisible = isSparePartPriceVisible();
  const sparePartDirectPurchaseEnabled = isSparePartDirectPurchaseEnabled();
  const exchangeRate = await getUsdTryExchangeRate();

  const [featuredParts, activePartCount] = await Promise.all([
    prisma.sparePart.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      include: {
        category: { select: { name: true } },
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      },
      take: 6,
    }),
    prisma.sparePart.count({ where: { isActive: true } }),
  ]);

  const showcase: HomePartCard[] = featuredParts.map((part) => {
    const displayedPriceCents = resolveDisplayedPriceCents(part.priceCents, part.currency, exchangeRate.rate);
    const displayedCurrency = resolveDisplayedCurrency(part.currency);
    const imageUrl = part.imageUrl ?? part.images[0]?.url ?? null;

    return {
      id: part.id,
      name: part.name,
      description: shortText(part.description, 92),
      image: imageUrl ?? '/images/2.jpg',
      imageUrl,
      categoryName: part.category.name,
      inStock: part.stockOnHand > 0,
      priceCents: displayedPriceCents,
      displayedPrice: formatPrice(displayedPriceCents / 100, displayedCurrency),
      href: `/spare-parts/${part.id}`,
    };
  });

  return (
    <div className={`${space.className} bg-[#0b0b0b] text-amber-50`}>
      <Reveal as="section" className="mx-auto w-full px-0 pb-8 pt-10">
        <div className="overflow-hidden rounded-[30px] border border-amber-200/20 bg-[linear-gradient(165deg,#111111_0%,#171108_48%,#121212_100%)]">
          <div className="grid gap-8 px-6 py-8 md:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-12 lg:py-12">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-amber-300">Guohong Lazer</p>
              <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
                Fiber lazer kesim, yedek parca ve teknik servis
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-amber-100/75 sm:text-base">
                Makine satin alma sureci, yedek parca tedariği ve teknik destek operasyonunu tek bir merkezden
                yonetmenizi saglayan kurumsal hizmet yapisi.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center rounded-xl bg-amber-400 px-6 py-3 text-sm font-semibold text-black hover:bg-amber-300"
                >
                  Urunleri incele
                </Link>
                <Link
                  href="/quote"
                  className="inline-flex items-center justify-center rounded-xl border border-amber-200/35 px-6 py-3 text-sm font-semibold text-amber-100 hover:border-amber-300/60"
                >
                  Teklif talep et
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <div className="rounded-xl border border-amber-200/20 bg-black/20 px-4 py-2 text-sm text-amber-100/80">
                  Aktif yedek parca urunu: <span className="font-semibold text-amber-200">{activePartCount}</span>
                </div>
              </div>
            </div>
            <div className="relative min-h-[320px] overflow-hidden rounded-[24px] border border-amber-200/20 bg-black/20">
              <Image
                src="/images/about-showcase.jpg"
                alt="Guohong Lazer uretim ve servis alani"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="mx-auto mt-8 w-full px-0">
        <div className="grid gap-4 rounded-[28px] border border-amber-200/20 bg-[#111111] p-5 md:grid-cols-3">
          {serviceCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="rounded-[20px] border border-amber-200/20 bg-[#171717] p-5 transition hover:border-amber-300/45"
            >
              <h2 className="text-lg font-semibold text-amber-50">{card.title}</h2>
              <p className="mt-2 text-sm leading-6 text-amber-100/70">{card.description}</p>
              <span className="mt-5 inline-flex text-xs font-semibold uppercase tracking-[0.14em] text-amber-300">
                {card.cta}
              </span>
            </Link>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="mx-auto mt-12 w-full px-0">
        <div className="rounded-[30px] border border-amber-200/20 bg-[#111111] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-amber-300">Yedek Parca</p>
              <h2 className="mt-2 text-2xl font-semibold text-amber-50">Guncel urun vitrini</h2>
            </div>
            <Link
              href="/spare-parts"
              className="rounded-full border border-amber-200/30 px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-100 hover:border-amber-300/60"
            >
              Tum urunleri gor
            </Link>
          </div>

          {showcase.length ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {showcase.map((item) => (
                <div key={item.id} className="rounded-[22px] border border-amber-200/20 bg-[#171717] p-4">
                  <Link href={item.href} className="block">
                    <div className="relative h-40 w-full overflow-hidden rounded-xl">
                      <Image src={item.image} alt={item.name} fill className="object-cover" loading="lazy" />
                    </div>
                    <div className="mt-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-amber-300/80">{item.categoryName}</p>
                      <h3 className="mt-2 text-base font-semibold text-amber-50">{item.name}</h3>
                      <p className="mt-2 text-sm text-amber-100/70">{item.description}</p>
                    </div>
                  </Link>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-xs text-amber-100/70">{item.inStock ? 'Stokta' : 'Siparisle tedarik'}</span>
                    <span className="text-sm font-semibold text-amber-300">
                      {sparePartPriceVisible ? item.displayedPrice : 'Fiyat icin teklif isteyin'}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-2">
                    {item.inStock && sparePartDirectPurchaseEnabled ? (
                      <AddToCartButton
                        id={item.id}
                        name={item.name}
                        priceCents={item.priceCents}
                        imageUrl={item.imageUrl}
                        className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400"
                      />
                    ) : (
                      <Link
                        href={`/quote?product=${encodeURIComponent(item.name)}&id=${encodeURIComponent(item.id)}`}
                        className="inline-flex items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900"
                      >
                        Teklif iste
                      </Link>
                    )}
                    <Link
                      href={item.href}
                      className="inline-flex items-center justify-center rounded-xl border border-amber-200/30 px-4 py-2 text-sm font-semibold text-amber-100 hover:border-amber-300/60"
                    >
                      Urun detayina git
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-amber-200/20 bg-[#171717] px-5 py-4 text-sm text-amber-100/75">
              Vitrinde gosterilecek aktif urun bulunamadi. Tum urunler icin lutfen yedek parca sayfasina gidin.
            </div>
          )}
        </div>
      </Reveal>

      <Reveal as="section" className="mx-auto mt-12 w-full px-0">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-amber-200/20 bg-[#111111] p-6">
            <p className="text-xs uppercase tracking-[0.26em] text-amber-300">Calisma Modeli</p>
            <h2 className="mt-2 text-2xl font-semibold text-amber-50">Tekliften teslimata surec</h2>
            <div className="mt-5 grid gap-3">
              {workflow.map((step, index) => (
                <div key={step.title} className="rounded-2xl border border-amber-200/20 bg-[#171717] px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Adim {index + 1}</p>
                  <p className="mt-1 text-sm font-semibold text-amber-50">{step.title}</p>
                  <p className="mt-1 text-sm text-amber-100/70">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-amber-200/20 bg-[#111111] p-6">
            <p className="text-xs uppercase tracking-[0.26em] text-amber-300">Kurumsal Bilgiler</p>
            <h2 className="mt-2 text-2xl font-semibold text-amber-50">Guven ve yasal sayfalar</h2>
            <p className="mt-3 text-sm text-amber-100/70">
              Siparis, odeme, teslimat ve veri guvenligi sureclerine ait tum temel bilgilere asagidaki sayfalardan
              ulasabilirsiniz.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {trustLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl border border-amber-200/20 bg-[#171717] px-4 py-3 text-sm text-amber-100/80 transition hover:border-amber-300/50"
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="mx-auto mt-12 w-full px-0">
        <div className="rounded-[28px] border border-amber-200/20 bg-[#111111] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-amber-300">SSS</p>
              <h2 className="mt-2 text-2xl font-semibold text-amber-50">Sikca sorulan sorular</h2>
            </div>
            <Link
              href="/contact"
              className="rounded-full border border-amber-200/30 px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-100 hover:border-amber-300/60"
            >
              Iletisime gec
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {faq.map((item) => (
              <div key={item.q} className="rounded-2xl border border-amber-200/20 bg-[#171717] px-4 py-4">
                <p className="text-sm font-semibold text-amber-50">{item.q}</p>
                <p className="mt-2 text-sm text-amber-100/70">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="mx-auto mt-12 w-full px-0 pb-14">
        <div className="rounded-[28px] border border-amber-200/20 bg-[linear-gradient(165deg,#171108_0%,#111111_55%,#141414_100%)] p-7">
          <h2 className="text-2xl font-semibold text-amber-50">Projeniz icin goruselim</h2>
          <p className="mt-2 max-w-2xl text-sm text-amber-100/75">
            Makine secimi, yedek parca tedariği veya teknik servis sureci icin bize ulasin.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/quote"
              className="inline-flex items-center justify-center rounded-xl bg-amber-400 px-6 py-3 text-sm font-semibold text-black hover:bg-amber-300"
            >
              Teklif talep et
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-xl border border-amber-200/35 px-6 py-3 text-sm font-semibold text-amber-100 hover:border-amber-300/60"
            >
              Iletisime gec
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
