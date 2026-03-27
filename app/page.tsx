import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Space_Grotesk } from 'next/font/google';

import AddToCartButton from '@/components/cart/AddToCartButton';
import Reveal from '@/components/home/Reveal';
import VideoSlider from '@/components/home/VideoSlider';
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
    title: 'Lazer Profil Kesimi',
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
    <div className={`${space.className} bg-[#142862] text-[#fdf9f6]`}>
      <Reveal as="section" className="mx-auto w-full px-0 pb-8 pt-10">
        <div className="overflow-hidden rounded-[30px] border border-[#fe9c79]/35 bg-[#142862]">
          <div className="grid gap-8 px-6 py-8 md:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-12 lg:py-12">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[#fe9c79]">Guohong Lazer</p>
              <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
                Fiber lazer kesim, yedek parca ve teknik servis
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#fdf9f6]/85 sm:text-base">
                Makine satin alma sureci, yedek parca tedariği ve teknik destek operasyonunu tek bir merkezden
                yonetmenizi saglayan kurumsal hizmet yapisi.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center rounded-xl bg-[#fe9c79] px-6 py-3 text-sm font-semibold text-[#142862] hover:bg-[#fe9c79]/90"
                >
                  Urunleri incele
                </Link>
                <Link
                  href="/quote"
                  className="inline-flex items-center justify-center rounded-xl border border-[#fe9c79]/45 px-6 py-3 text-sm font-semibold text-[#fdf9f6] hover:border-[#fe9c79]/80"
                >
                  Teklif talep et
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <div className="rounded-xl border border-[#fe9c79]/35 bg-[#142862]/70 px-4 py-2 text-sm text-[#fdf9f6]/85">
                  Aktif yedek parca urunu: <span className="font-semibold text-[#fe9c79]">{activePartCount}</span>
                </div>
              </div>
            </div>
            <div className="relative min-h-[320px] overflow-hidden rounded-[24px] border border-[#fe9c79]/35 bg-[#142862]/70">
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
        <div className="rounded-[28px] border border-[#fe9c79]/35 bg-[#142862]/75 p-5">
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.26em] text-[#fe9c79]">Saha Goruntuleri</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#fdf9f6]">Uygulama ornekleri</h2>
          </div>
          <VideoSlider items={heroVideos} />
        </div>
      </Reveal>

      <Reveal as="section" className="mx-auto mt-8 w-full px-0">
        <div className="grid gap-4 rounded-[28px] border border-[#fe9c79]/35 bg-[#142862]/75 p-5 md:grid-cols-3">
          {serviceCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="rounded-[20px] border border-[#fe9c79]/35 bg-[#142862]/80 p-5 transition hover:border-[#fe9c79]/70"
            >
              <h2 className="text-lg font-semibold text-[#fdf9f6]">{card.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#fdf9f6]/80">{card.description}</p>
              <span className="mt-5 inline-flex text-xs font-semibold uppercase tracking-[0.14em] text-[#fe9c79]">
                {card.cta}
              </span>
            </Link>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="mx-auto mt-12 w-full px-0">
        <div className="rounded-[30px] border border-[#fe9c79]/35 bg-[#142862]/75 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-[#fe9c79]">Yedek Parca</p>
              <h2 className="mt-2 text-2xl font-semibold text-[#fdf9f6]">Guncel urun vitrini</h2>
            </div>
            <Link
              href="/spare-parts"
              className="rounded-full border border-[#fe9c79]/45 px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#fdf9f6] hover:border-[#fe9c79]/80"
            >
              Tum urunleri gor
            </Link>
          </div>

          {showcase.length ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {showcase.map((item) => (
                <div key={item.id} className="rounded-[22px] border border-[#fe9c79]/35 bg-[#142862]/80 p-4">
                  <Link href={item.href} className="block">
                    <div className="relative h-40 w-full overflow-hidden rounded-xl">
                      <Image src={item.image} alt={item.name} fill className="object-cover" loading="lazy" />
                    </div>
                    <div className="mt-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#fe9c79]/90">{item.categoryName}</p>
                      <h3 className="mt-2 text-base font-semibold text-[#fdf9f6]">{item.name}</h3>
                      <p className="mt-2 text-sm text-[#fdf9f6]/80">{item.description}</p>
                    </div>
                  </Link>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-xs text-[#fdf9f6]/80">{item.inStock ? 'Stokta' : 'Siparisle tedarik'}</span>
                    <span className="text-sm font-semibold text-[#fe9c79]">
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
                        className="inline-flex items-center justify-center rounded-xl bg-[#fe9c79] px-4 py-2 text-sm font-semibold text-[#142862] hover:bg-[#fe9c79]/90"
                      />
                    ) : (
                      <Link
                        href={`/quote?product=${encodeURIComponent(item.name)}&id=${encodeURIComponent(item.id)}`}
                        className="inline-flex items-center justify-center rounded-xl border border-[#fe9c79]/60 bg-[#fdf9f6] px-4 py-2 text-sm font-semibold text-[#142862]"
                      >
                        Teklif iste
                      </Link>
                    )}
                    <Link
                      href={item.href}
                      className="inline-flex items-center justify-center rounded-xl border border-[#fe9c79]/45 px-4 py-2 text-sm font-semibold text-[#fdf9f6] hover:border-[#fe9c79]/80"
                    >
                      Urun detayina git
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-[#fe9c79]/35 bg-[#142862]/80 px-5 py-4 text-sm text-[#fdf9f6]/85">
              Vitrinde gosterilecek aktif urun bulunamadi. Tum urunler icin lutfen yedek parca sayfasina gidin.
            </div>
          )}
        </div>
      </Reveal>

      <Reveal as="section" className="mx-auto mt-12 w-full px-0">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-[#fe9c79]/35 bg-[#142862]/75 p-6">
            <p className="text-xs uppercase tracking-[0.26em] text-[#fe9c79]">Calisma Modeli</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#fdf9f6]">Tekliften teslimata surec</h2>
            <div className="mt-5 grid gap-3">
              {workflow.map((step, index) => (
                <div key={step.title} className="rounded-2xl border border-[#fe9c79]/35 bg-[#142862]/80 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#fe9c79]">Adim {index + 1}</p>
                  <p className="mt-1 text-sm font-semibold text-[#fdf9f6]">{step.title}</p>
                  <p className="mt-1 text-sm text-[#fdf9f6]/80">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-[#fe9c79]/35 bg-[#142862]/75 p-6">
            <p className="text-xs uppercase tracking-[0.26em] text-[#fe9c79]">Kurumsal Bilgiler</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#fdf9f6]">Guven ve yasal sayfalar</h2>
            <p className="mt-3 text-sm text-[#fdf9f6]/80">
              Siparis, odeme, teslimat ve veri guvenligi sureclerine ait tum temel bilgilere asagidaki sayfalardan
              ulasabilirsiniz.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {trustLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl border border-[#fe9c79]/35 bg-[#142862]/80 px-4 py-3 text-sm text-[#fdf9f6]/85 transition hover:border-[#fe9c79]/75"
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="mx-auto mt-12 w-full px-0">
        <div className="rounded-[28px] border border-[#fe9c79]/35 bg-[#142862]/75 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-[#fe9c79]">SSS</p>
              <h2 className="mt-2 text-2xl font-semibold text-[#fdf9f6]">Sikca sorulan sorular</h2>
            </div>
            <Link
              href="/contact"
              className="rounded-full border border-[#fe9c79]/45 px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#fdf9f6] hover:border-[#fe9c79]/80"
            >
              Iletisime gec
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {faq.map((item) => (
              <div key={item.q} className="rounded-2xl border border-[#fe9c79]/35 bg-[#142862]/80 px-4 py-4">
                <p className="text-sm font-semibold text-[#fdf9f6]">{item.q}</p>
                <p className="mt-2 text-sm text-[#fdf9f6]/80">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="mx-auto mt-12 w-full px-0 pb-14">
        <div className="rounded-[28px] border border-[#fe9c79]/35 bg-[#142862] p-7">
          <h2 className="text-2xl font-semibold text-[#fdf9f6]">Projeniz icin goruselim</h2>
          <p className="mt-2 max-w-2xl text-sm text-[#fdf9f6]/85">
            Makine secimi, yedek parca tedariği veya teknik servis sureci icin bize ulasin.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/quote"
              className="inline-flex items-center justify-center rounded-xl bg-[#fe9c79] px-6 py-3 text-sm font-semibold text-[#142862] hover:bg-[#fe9c79]/90"
            >
              Teklif talep et
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-xl border border-[#fe9c79]/45 px-6 py-3 text-sm font-semibold text-[#fdf9f6] hover:border-[#fe9c79]/80"
            >
              Iletisime gec
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
