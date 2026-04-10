'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import AddToCartButton from '@/components/cart/AddToCartButton';
import QuickBuyButton from '@/components/cart/QuickBuyButton';
import Reveal from '@/components/home/Reveal';
import StatsOverview from '@/components/home/StatsOverview';
import VideoSlider from '@/components/home/VideoSlider';

type ShowcaseItem = {
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

type ProductCategory = {
  id: string;
  label: string;
  cards: Array<{
    title: string;
    date: string;
    description: string;
    image: string;
    href: string;
  }>;
};

const heroSlides = [
  {
    id: 'slide-1',
    image: '/images/about-showcase.jpg',
    eyebrow: 'Profesyonel uretim ve hizmet saglayicilari',
    title: 'Guohong Laser Group metal lazer kesim teknolojilerinde kuresel cozum ortagidir.',
    description:
      'Ar-Ge, uretim ve satis sureclerini tek cati altinda toplayan yapi ile sac, boru, kaynak ve temizleme cozumlerini kurulumdan satis sonrasina kadar uctan uca sunuyoruz.',
  },
  {
    id: 'slide-2',
    image: '/images/7.jpg',
    eyebrow: 'Akilli fabrika ve uygulama sahasi',
    title: '1 kW ile 60 kW arasindaki guc secenekleri farkli uretim hatlarina hizla uyarlanir.',
    description:
      'Yuksek guclu fiber lazer sistemleri; metal isleme, otomotiv, celik yapi ve reklam sektorlerinde hassas, hizli ve istikrarli kesim performansi saglar.',
  },
];

const productCategories: ProductCategory[] = [
  {
    id: 'sheet',
    label: 'Plaka Lazer Kesim Makinesi',
    cards: [
      {
        title: 'Guohong CNC Fiber Lazer Kesim Makinesi Koruma Kapakli',
        date: '2024-11-25',
        description: 'Koruma kapakli yapi, yuksek hassasiyet ve farkli tabla olculeri ile yogun sac kesim hatlari icin tasarlandi.',
        image: '/images/1.jpg',
        href: '/products',
      },
      {
        title: 'GH-F Serisi Metal Lazer Kesici',
        date: '2024-11-25',
        description: 'Mutfak ekipmanlari, dolap uretimi ve genel metal isleme icin klasik ve guvenilir seri.',
        image: '/images/2.jpg',
        href: '/products',
      },
      {
        title: 'Yuksek Guclu CNC Sac Kesim Makinesi',
        date: '2024-11-25',
        description: '1000W ile 6000W arasinda ekonomik ve guclu sac kesim cozumu sunar.',
        image: '/images/3.jpg',
        href: '/products',
      },
    ],
  },
  {
    id: 'tube',
    label: 'Tup Lazer Kesim Makinesi',
    cards: [
      {
        title: 'GH-T Serisi Yan Montajli Fiber Lazer Boru Kesme Makinesi',
        date: '2024-11-26',
        description: 'Yuvarlak, kare ve ozel profillerde yuksek hassasiyetli boru kesimi icin gelistirildi.',
        image: '/images/4.jpg',
        href: '/products',
      },
      {
        title: 'Tup Fiber Lazer Kesim Makinesi',
        date: '2024-11-26',
        description: 'Spor ekipmanlari, boru hatlari ve metal profil uygulamalarinda verimliligi artirir.',
        image: '/images/5.jpg',
        href: '/products',
      },
      {
        title: 'Uc Mandrenli Boru Fiber Lazer Kesim Makinesi',
        date: '2024-11-26',
        description: 'Sifir kuyruk yaklasimi ve uc nokta destek ile uzun borularda daha stabil kesim saglar.',
        image: '/images/6.jpg',
        href: '/products',
      },
    ],
  },
  {
    id: 'combo',
    label: 'Plaka ve Boru Lazer Kesim Makinesi',
    cards: [
      {
        title: 'Metal icin Plaka ve Boru Fiber Lazer Kesim Makinesi',
        date: '2024-11-27',
        description: 'Tek makinede iki farkli malzeme formunu keserek yatirim maliyetini optimize eder.',
        image: '/images/8.jpg',
        href: '/products',
      },
      {
        title: 'Plaka ve Boru Lazer Kesim Makinesi',
        date: '2024-11-27',
        description: 'Profesyonel CNC sistemi ve kolay bakim yapisi ile yogun uretim senaryolarina uygundur.',
        image: '/images/9.jpg',
        href: '/products',
      },
      {
        title: 'Tam Koruma Metal Sac ve Boru Fiber Lazer Kesim Makinesi',
        date: '2024-11-27',
        description: 'Kapali govde ve birinci sinif bilesenlerle guvenlik ve hassasiyet dengesini kurar.',
        image: '/images/10.jpg',
        href: '/products',
      },
    ],
  },
  {
    id: 'weld',
    label: 'El Tipi Lazer Kaynak Makinesi',
    cards: [
      {
        title: "Temizleme ve Kesme Fonksiyonlu 3'u 1 Arada Lazer Kaynak Makinesi",
        date: '2024-11-27',
        description: 'Kaynak, temizleme ve kesme islevlerini tek govdede birlestirerek esnek kullanim sunar.',
        image: '/images/11.jpg',
        href: '/products',
      },
      {
        title: 'Kompakt El Tipi Kaynak Platformu',
        date: '2024-11-27',
        description: 'Dusuk isletme maliyeti ve yuksek proses temizligi ile atelye ici mobil kullanim icin ideal.',
        image: '/images/12.jpg',
        href: '/products',
      },
      {
        title: '360 Derece Manevra Kabiliyetli Fiber Kaynak Sistemi',
        date: '2024-11-27',
        description: 'Uzun kaynak dikislerinde kararlilik ve daha yuksek uygulama hizi saglar.',
        image: '/images/7.jpg',
        href: '/products',
      },
    ],
  },
];

const solutionHighlights = [
  { label: '4', description: 'Modern uretim tesisi' },
  { label: '10+', description: 'Yil mekanik Ar-Ge ve uretim deneyimi' },
  { label: '120000 m2', description: 'Toplam fabrika alani' },
  { label: '100+', description: 'Ulke ve bolgeye sevkiyat' },
];

const applicationAreas = [
  'Metal Isleme',
  'Celik Yapi Muhendisligi',
  'Ev Aletleri',
  'Otomotiv Sanayi',
  'Mutfak Esyalari ve Banyo',
  'Insaat Makinalari',
  'Sahne Malzemeleri',
  'Fitness Ekipmanlari',
  'Sac Metal Isleme',
  'Bakir',
  'Aluminyum',
  'Reklam ve Tabela',
];

const newsItems = [
  {
    title: 'Lazer kesicinin maliyeti ne kadardir?',
    excerpt: 'Kucuk ve buyuk isletmeler icin fiber lazer yatiriminda toplam maliyeti etkileyen basliklari derledik.',
    href: '/about',
  },
  {
    title: 'Fiber lazer kesim makinesi hangi markayi uretir?',
    excerpt: 'Marka seciminde servis altyapisi, govde kalitesi ve guc optimizasyonu neden belirleyicidir?',
    href: '/about',
  },
  {
    title: 'Reklam tabela endustrisinde fiber lazer kullanimi',
    excerpt: 'Ince sac, harf kesimi ve hizli teslimat baskisi altinda fiber lazerin sagladigi avantajlar.',
    href: '/about',
  },
  {
    title: 'Yuvarlak delik keserken nelere dikkat edilmelidir?',
    excerpt: 'Cap, hiz, gaz ve isi yonetimi gibi detaylarin kesim kalitesine etkisini ozetledik.',
    href: '/about',
  },
];

const statsOverview = [
  { value: 4, label: 'Uretim Tesisi' },
  { value: 10, suffix: '+', label: 'Yil Mekanik Ar-Ge ve Uretim Deneyimi' },
  { value: 120000, suffix: ' m2', label: 'Fabrika Alani' },
  { value: 100, suffix: '+', label: 'Ulke ve Bolge' },
] as const;

const homeVideos = [
  {
    src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    poster: '/images/8.jpg',
    title: 'Saha kurulumu ve uretim hatti',
  },
  {
    src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    poster: '/images/9.jpg',
    title: 'Kesim performansi ve makine akisi',
  },
  {
    src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    poster: '/images/10.jpg',
    title: 'Teslimat sonrasi kullanim goruntuleri',
  },
] as const;

function ShowcaseCard({
  item,
  index,
  sparePartPriceVisible,
  sparePartDirectPurchaseEnabled,
}: {
  item: ShowcaseItem;
  index: number;
  sparePartPriceVisible: boolean;
  sparePartDirectPurchaseEnabled: boolean;
}) {
  return (
    <article className="group h-full overflow-hidden rounded-[28px] border border-white/10 bg-white/6 transition hover:-translate-y-1 hover:border-[#ff6a0d]/55">
      <Link href={item.href} className="block">
        <div className="relative h-64 overflow-hidden">
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="absolute left-5 top-5 rounded-full bg-[#ff6a0d] px-3 py-1 text-xs font-semibold text-[#15148c]">
            {String(index + 1).padStart(2, '0')}
          </div>
        </div>
      </Link>
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">{item.categoryName}</p>
        <h3 className="mt-3 text-xl font-semibold text-white">{item.name}</h3>
        <p className="mt-3 text-sm leading-7 text-white/72">{item.description}</p>
        <div className="mt-4 flex items-center justify-between gap-3 text-sm">
          <span className={item.inStock ? 'text-emerald-300' : 'text-amber-200'}>
            {item.inStock ? 'Stokta' : 'Siparis ile tedarik'}
          </span>
          <span className="font-semibold text-[#ff6a0d]">
            {sparePartPriceVisible ? item.displayedPrice : 'Teklif ile fiyatlanir'}
          </span>
        </div>

        <div className="mt-5 grid gap-2">
          {item.inStock && sparePartDirectPurchaseEnabled ? (
            <>
              <QuickBuyButton
                item={{
                  id: item.id,
                  name: item.name,
                  priceCents: item.priceCents,
                  imageUrl: item.imageUrl,
                }}
                label="Satin Al"
              />
              <AddToCartButton
                id={item.id}
                name={item.name}
                priceCents={item.priceCents}
                imageUrl={item.imageUrl}
                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-transparent px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/8"
              />
            </>
          ) : (
            <Link
              href={`/quote?product=${encodeURIComponent(item.name)}&id=${encodeURIComponent(item.id)}`}
              className="inline-flex items-center justify-center rounded-xl bg-[#ff6a0d] px-4 py-3 text-sm font-semibold text-[#15148c]"
            >
              Teklif Al
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export default function ReferenceHomeClient({
  showcase,
  activePartCount,
  sparePartPriceVisible,
  sparePartDirectPurchaseEnabled,
}: {
  showcase: ShowcaseItem[];
  activePartCount: number;
  sparePartPriceVisible: boolean;
  sparePartDirectPurchaseEnabled: boolean;
}) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeCategory, setActiveCategory] = useState(productCategories[0]?.id ?? 'sheet');
  const [showcaseIndex, setShowcaseIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5600);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const syncCardsPerView = () => {
      if (window.innerWidth >= 1280) {
        setCardsPerView(3);
        return;
      }
      if (window.innerWidth >= 768) {
        setCardsPerView(2);
        return;
      }
      setCardsPerView(1);
    };

    syncCardsPerView();
    window.addEventListener('resize', syncCardsPerView);
    return () => window.removeEventListener('resize', syncCardsPerView);
  }, []);

  const selectedCategory = useMemo(
    () => productCategories.find((category) => category.id === activeCategory) ?? productCategories[0],
    [activeCategory],
  );

  const maxShowcaseIndex = Math.max(showcase.length - cardsPerView, 0);

  useEffect(() => {
    setShowcaseIndex((current) => Math.min(current, maxShowcaseIndex));
  }, [maxShowcaseIndex]);

  useEffect(() => {
    if (showcase.length <= cardsPerView) return;
    const timer = window.setInterval(() => {
      setShowcaseIndex((prev) => (prev >= maxShowcaseIndex ? 0 : prev + 1));
    }, 4200);

    return () => window.clearInterval(timer);
  }, [cardsPerView, maxShowcaseIndex, showcase.length]);

  return (
    <div className="space-y-14 pb-16 text-white">
      <Reveal as="section" className="hero-contrast relative overflow-hidden rounded-[36px] border border-white/10 bg-[#15148c] shadow-[0_40px_120px_-60px_rgba(5,0,92,0.95)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,106,13,0.28),_transparent_28%),linear-gradient(135deg,_rgba(5,0,92,0.18),_rgba(5,0,92,0.88))]" />
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ${index === activeSlide ? 'opacity-100' : 'opacity-0'}`}
          >
            <Image src={slide.image} alt={slide.title} fill priority={index === 0} sizes="100vw" className="object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,_rgba(5,0,92,0.9)_0%,_rgba(5,0,92,0.62)_46%,_rgba(5,0,92,0.82)_100%)]" />
          </div>
        ))}

        <div className="relative grid min-h-[560px] gap-8 px-6 py-12 sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-14 lg:py-16">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.38em] text-[#d8e2ff]">
              {heroSlides[activeSlide]?.eyebrow}
            </p>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
              {heroSlides[activeSlide]?.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/80">
              {heroSlides[activeSlide]?.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-full bg-[#15327f] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#0d2260]"
              >
                Daha Fazlasini Gor
              </Link>
              <Link
                href="/quote"
                className="inline-flex items-center justify-center rounded-full border border-white/25 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Teklif Al
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-3 text-sm text-white/70">
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setActiveSlide(index)}
                  className={`inline-flex items-center gap-2 ${index === activeSlide ? 'text-white' : 'text-white/45'}`}
                >
                  <span className={`h-[2px] w-9 ${index === activeSlide ? 'bg-[#ff6a0d]' : 'bg-white/25'}`} />
                  {String(index + 1).padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>

          <div className="grid content-end gap-4 lg:pl-8">
            <div className="rounded-[30px] border border-white/12 bg-white/95 p-6 text-[#333333] shadow-[0_24px_50px_rgba(5,0,92,0.18)]">
              <p className="text-xs uppercase tracking-[0.34em] text-[#6e7896]">One cikan veri</p>
              <div className="mt-4 text-5xl font-semibold text-[#15327f]">{activePartCount}+</div>
              <p className="mt-2 text-sm text-[#333333]/82">Aktif urun ve yedek parca vitrini ile tek ekranda teklif, satin alma ve destek akisi.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {solutionHighlights.map((item) => (
                <div key={item.description} className="rounded-[24px] border border-white/12 bg-white/95 p-4 text-[#333333] shadow-[0_18px_40px_rgba(5,0,92,0.14)]">
                  <div className="text-2xl font-semibold text-[#15327f]">{item.label}</div>
                  <p className="mt-2 text-sm leading-6 text-[#333333]/76">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="grid gap-8 rounded-[34px] border border-white/10 bg-[#15148c] px-6 py-8 shadow-[0_30px_90px_-70px_rgba(5,0,92,0.95)] lg:grid-cols-[0.92fr_1.08fr] lg:px-10">
        <div className="relative min-h-[320px] overflow-hidden rounded-[28px] border border-white/10">
          <Image src="/images/8.jpg" alt="Guohong Laser tesis gorunumu" fill sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(5,0,92,0.08),_rgba(5,0,92,0.55))]" />
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-sm font-semibold uppercase tracking-[0.36em] text-[#ff6a0d]">Profesyonel uretim ve hizmet saglayicilari</p>
          <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Guohong Laser Group, Ar-Ge, uretim ve satisi birlestiren metal lazer kesim makinesi ureticisidir.</h2>
          <p className="mt-5 text-base leading-8 text-white/76">
            Cinde toplam 100.000 metrekareyi asan modern uretim altyapisi ile sac, boru, plaka-boru kombine, kaynak ve temizleme ekipmanlari gelistiriyoruz.
          </p>
          <p className="mt-4 text-base leading-8 text-white/70">
            Yuksek kaliteli plaka lazer kesim makineleri, lazer boru kesim makineleri, uc aynali boru kesim makineleri ve tam otomatik yuklemeli sistemler icin kurulumdan egitime kadar butunsel destek veriyoruz.
          </p>

          <div className="mt-6">
            <Link href="/about" className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/8">
              Daha Fazlasini Gor
            </Link>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="rounded-[34px] border border-white/10 bg-[#15148c] px-6 py-8 shadow-[0_30px_90px_-70px_rgba(5,0,92,0.95)] sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[#ff6a0d]">Urunler</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Sektorumuzde bircok urun cesidi vardir</h2>
          </div>
          <Link href="/products" className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ff6a0d]">
            Daha Fazlasini Gor
          </Link>
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          {productCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveCategory(category.id)}
              className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                category.id === activeCategory
                  ? 'bg-[#ff6a0d] text-[#15148c]'
                  : 'border border-white/15 bg-white/6 text-white/82 hover:bg-white/10'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {selectedCategory.cards.map((card, index) => (
            <article key={card.title} className="group overflow-hidden rounded-[28px] border border-white/10 bg-white/6 transition hover:-translate-y-1 hover:border-[#ff6a0d]/55">
              <div className="relative h-64 overflow-hidden">
                <Image src={card.image} alt={card.title} fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute left-5 top-5 rounded-full bg-[#ff6a0d] px-3 py-1 text-xs font-semibold text-[#15148c]">
                  {String(index + 1).padStart(2, '0')}
                </div>
              </div>
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">{card.date}</p>
                <h3 className="mt-3 text-xl font-semibold text-white">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/72">{card.description}</p>
                <Link href={card.href} className="mt-5 inline-flex text-sm font-semibold uppercase tracking-[0.2em] text-[#ff6a0d]">
                  Ayrintiyi Goruntule
                </Link>
              </div>
            </article>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="grid gap-8 rounded-[34px] border border-white/10 bg-[#15148c] px-6 py-8 shadow-[0_30px_90px_-70px_rgba(5,0,92,0.95)] lg:grid-cols-[1fr_0.95fr]">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[#ff6a0d]">Toplam cozum</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Tasarim ve uretimden satis sonrasi hizmete kadar eksiksiz teknik cozumler sunuyoruz.</h2>
          <p className="mt-5 text-base leading-8 text-white/74">
            Urun tasarimi, urun montaji, kullanici egitimi, bakim plani ve uzun donemli yedek parca erisimi ile yatirimin tum yasam dongusunu yonetiyoruz.
          </p>
          <div className="mt-7">
            <Link href="/contact" className="inline-flex items-center justify-center rounded-full bg-[#ff6a0d] px-6 py-3 text-sm font-semibold text-[#15148c]">
              Daha Fazlasini Gor
            </Link>
          </div>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5">
          <StatsOverview items={statsOverview} />
        </div>
      </Reveal>

      <Reveal as="section" className="rounded-[34px] border border-white/10 bg-[#15148c] px-6 py-8 shadow-[0_30px_90px_-70px_rgba(5,0,92,0.95)]">
        <div className="max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[#ff6a0d]">Uygulama alanlari</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Urunlerimiz cesitli endustrilerde uygulanmaktadir</h2>
          <p className="mt-4 text-base leading-8 text-white/74">
            Sac metal, otomotiv, metal aksesuarlar, mutfak ekipmanlari, tekstil, reklam ve yapi endustrileri icin olceklenebilir lazer isleme altyapisi sagliyoruz.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {applicationAreas.map((area, index) => (
            <div key={area} className="rounded-[24px] border border-white/10 bg-white/6 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ff6a0d]">
                {String(index + 1).padStart(2, '0')}
              </div>
              <div className="mt-3 text-lg font-semibold text-white">{area}</div>
              <div className="mt-2 text-sm text-white/60">daha fazlasini goruntule</div>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="rounded-[34px] border border-white/10 bg-[#15148c] px-6 py-8 shadow-[0_30px_90px_-70px_rgba(5,0,92,0.95)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[#ff6a0d]">Populer urunler</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Yedek parcalar artik yatay kayan vitrin olarak gosteriliyor</h2>
            <p className="mt-3 max-w-3xl text-base leading-8 text-white/74">
              Sadece asagi kaydirma animasyonu yerine, belirli tempoda kendi kendine kayan ve oklarla kontrol edilen bir slider ekledim.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <div className="flex gap-2">
            {showcase.map((item, index) => (
              <button
                key={`${item.id}-dot`}
                type="button"
                onClick={() => setShowcaseIndex(Math.min(index, maxShowcaseIndex))}
                className={`h-2.5 rounded-full transition ${index === showcaseIndex ? 'w-9 bg-[#ff6a0d]' : 'w-2.5 bg-white/30'}`}
                aria-label={`${item.name} kartina git`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowcaseIndex((prev) => (prev <= 0 ? maxShowcaseIndex : prev - 1))}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/6 text-white transition hover:bg-white/12"
              aria-label="Onceki urunler"
            >
              {'<'}
            </button>
            <button
              type="button"
              onClick={() => setShowcaseIndex((prev) => (prev >= maxShowcaseIndex ? 0 : prev + 1))}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/6 text-white transition hover:bg-white/12"
              aria-label="Sonraki urunler"
            >
              {'>'}
            </button>
          </div>
        </div>

        <div className="mt-8 overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${showcaseIndex * (100 / cardsPerView)}%)` }}
          >
            {showcase.map((item, index) => (
              <div key={item.id} className="w-full shrink-0 px-2 md:w-1/2 xl:w-1/3">
                <ShowcaseCard
                  item={item}
                  index={index}
                  sparePartPriceVisible={sparePartPriceVisible}
                  sparePartDirectPurchaseEnabled={sparePartDirectPurchaseEnabled}
                />
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="rounded-[34px] border border-white/10 bg-[#15148c] px-6 py-8 shadow-[0_30px_90px_-70px_rgba(5,0,92,0.95)]">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[#ff6a0d]">Saha videolari</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Eski 3 videolu alan geri geldi</h2>
            <p className="mt-3 max-w-3xl text-base leading-8 text-white/74">
              Kaydirdikca animasyonlara ek olarak, artik anasayfada kendi icinde kayan video slider da var.
            </p>
          </div>
        </div>

        <VideoSlider items={homeVideos.map((item) => ({ ...item }))} autoAdvanceMs={7200} />
      </Reveal>

      <Reveal as="section" className="rounded-[34px] border border-white/10 bg-[#15148c] px-6 py-8 shadow-[0_30px_90px_-70px_rgba(5,0,92,0.95)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[#ff6a0d]">Sektor trendleri</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Her an en son sektor trendlerimizden haberdar olun</h2>
          </div>
          <Link href="/about" className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ff6a0d]">
            Daha Fazlasini Gor
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {newsItems.map((item) => (
            <article key={item.title} className="rounded-[24px] border border-white/10 bg-white/6 p-5">
              <h3 className="text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-4 text-sm leading-7 text-white/72">{item.excerpt}</p>
              <Link href={item.href} className="mt-5 inline-flex text-sm font-semibold uppercase tracking-[0.2em] text-[#ff6a0d]">
                Daha Fazlasini Gor
              </Link>
            </article>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,_rgba(255,106,13,0.96),_rgba(255,106,13,0.76))] px-6 py-10 shadow-[0_30px_90px_-70px_rgba(255,106,13,0.95)]">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[#15148c]/65">Sorusturma gonder</p>
            <h2 className="mt-3 text-3xl font-semibold text-[#15148c]">Sonucu gormekten daha iyi bir sey yoktur.</h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[#15148c]/78">
              Makine yatirimi, yedek parca tedariği veya teknik servis plani icin ekibimizle hemen iletisime gecin ve size ozel cozum akisina baslayalim.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/quote" className="inline-flex items-center justify-center rounded-full bg-[#15148c] px-6 py-3 text-sm font-semibold text-white">
              Sorgulama Icin Tiklayiniz
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center rounded-full border border-[#15148c]/20 px-6 py-3 text-sm font-semibold text-[#15148c]">
              Bize Ulasin
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
