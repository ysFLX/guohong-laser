'use client';

import Image from 'next/image';
import Link from 'next/link';

const teamMembers = [
  {
    name: 'Merdan Karaşehir',
    role: 'Tekniker',
  },
  {
    name: 'Li Chang Hao',
    role: 'Tekniker',
  },
  {
    name: 'Yusuf Can Gördebil',
    role: 'Yazılım Geliştirici',
  },
  {
    name: 'Yusuf Küçüktongarlak',
    role: 'Sosyal Medya Yöneticisi',
  },
];

const values = [
  {
    title: 'Vizyon',
    description:
      'Lazer teknolojilerinde dünya çapında bilinen, yenilikçi ve sürekli gelişen bir marka olmak.',
  },
  {
    title: 'Misyon',
    description:
      'Musterilerimize yüksek performanslı lazer makineleri ve kesintisiz servis desteği sağlamak.',
  },
  {
    title: 'Yaklaşım',
    description:
      'Üretim sahasında ölçülen verilerle karar alan, sonucu takip eden bir ekip olmak.',
  },
];

const stats = [
  { label: 'Yıllık deneyim', value: '10+' },
  { label: 'Kurulum projesi', value: '1000+' },
  { label: 'Mutlu müşteri', value: '500+' },
  { label: 'Servis noktası', value: '24' },
];

const milestones = [
  {
    year: '2014',
    title: 'İlk saha kurulumları',
    description: 'Yerli üretim hatlarıyla ilk anahtar teslim projeler tamamlandı.',
  },
  {
    year: '2017',
    title: 'Servis ağı genişledi',
    description: 'Teknik servis ve yedek parça operasyonları tek merkezde birleştirildi.',
  },
  {
    year: '2020',
    title: 'Akıllı hat entegrasyonu',
    description: 'Veri izleme ve performans raporlama sistemleri sahaya alındı.',
  },
  {
    year: '2024',
    title: 'Global tedarik gücü',
    description: 'Kritik parça tedariği için uluslararası lojistik altyapı kuruldu.',
  },
];

const capabilities = [
  {
    title: 'Kesim hatları planlama',
    description: 'Üretim hedeflerine göre hat kapasitesi ve malzeme akışı tasarımları.',
  },
  {
    title: 'Kurulum ve devreye alma',
    description: 'Saha hazırlığı, kurulum, test ve operator egitimi tek ekip tarafındaı yapılır.',
  },
  {
    title: 'Sarf ve yedek parça',
    description: 'Kritik yedek parça ve sarf malzeme stokları hızlı temin edilir.',
  },
  {
    title: 'Performans takibi',
    description: 'Hız, fire ve enerji takibiyle verimlilik raporları hazırlanır.',
  },
];

const facility = [
  'Üretim planlama ve kesim simulasyonu',
  'Kritik parça stok yönetimi',
  'Kalibrasyon ve kalite kontrol',
  'Uzaktan destek ve saha servis',
];

const services = [
  {
    title: 'Makine seçimi ve hat analizi',
    description: 'Üretim hedeflerine göre uygun lazer sistemi ve hat dizilimi belirlenir.',
  },
  {
    title: 'Kurulum ve eğitim',
    description: 'Saha kurulumları tamamlanır, operator ve bakım ekibi eğitilir.',
  },
  {
    title: 'Sarf ve yedek parça',
    description: 'Kritik sarf kalemleri ve yedek parça tedariği planlı şekilde yönetilir.',
  },
  {
    title: 'Periyodik bakım',
    description: 'Duruşları azaltan bakım takvimiyle hat performansı korunur.',
  },
  {
    title: 'Uzaktan izleme',
    description: 'Hız, enerji ve fire verileri raporlanır, iyileştirme planları çıkarılır.',
  },
  {
    title: '7/24 saha desteği',
    description: 'Kritik durumlarda hızlı yönlendirme ile servis süreci başlatılır.',
  },
];

const sectors = [
  'Metal işleme ve sac şekillendirme',
  'Otomotiv yan sanayi',
  'Boru profil üretimi',
  'Makine imalat ve fason kesim',
  'Reklam ve dekoratif metal',
  'Endüstriyel mutfak ekipmanları',
];

const timeline = [
  { title: 'Analiz ve planlama', detail: 'İhtiyaçlar netleştirilir, teklif ve plan çıkartılır.' },
  { title: 'Üretim ve lojistik', detail: 'Sistem hazırlanır, saha teslim takvimi belirlenir.' },
  { title: 'Kurulum ve test', detail: 'Kurulum yapılır, örnek kesimlerle performans doğrulanır.' },
  { title: 'Eğitim ve devralma', detail: 'Operator eğitimi ve teslim tutanakları tamamlanır.' },
];

const faqs = [
  {
    q: 'Kurulum ne kadar sürer?',
    a: 'Ortalama 7-10 gün içinde kurulum ve devreye alma tamamlanır.',
  },
  {
    q: 'Yedek parça temini nasıl?',
    a: 'Kritik parçalar için hızlı stok ve kargo sistemi uygulanır.',
  },
  {
    q: 'Eğitim veriliyor mu?',
    a: 'Ekipleriniz için operator ve bakim eğitimi sağlanıyor.',
  },
  {
    q: 'Servis çağrısı süreci nasıl ilerler?',
    a: 'Kayıt alınıp uzaktan destek verilir, gerekirse saha ekibi yönlendirilir.',
  },
];

export default function AboutPage() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Guohong Lazer',
    url: baseUrl,
    logo: `${baseUrl}/images/logokoyu.png`,
    email: 'guohonglazerinfo@gmail.com',
    telephone: '+90 536 831 67 87',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Fevziçakmak Mah. Aksaray Çevreyolu Caddesi Akasya Sitesi A Blok No:18T',
      addressLocality: 'Konya',
      addressCountry: 'TR',
      postalCode: '42210',
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        telephone: '+90 536 831 67 87',
        email: 'guohonglazerinfo@gmail.com',
        areaServed: 'TR',
        availableLanguage: ['tr', 'en'],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50/80 px-4 py-10 sm:px-8 lg:px-12 dark:bg-slate-950 dark:text-slate-200 dark:[&_.bg-white]:bg-slate-900/70 dark:[&_[class*='border-slate-200/70']]:border-white/10 dark:[&_.text-slate-900]:text-white dark:[&_.text-slate-600]:text-slate-300 dark:[&_.text-slate-500]:text-slate-400 dark:[&_.text-indigo-600]:text-indigo-200">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="mx-auto w-full max-w-screen-2xl space-y-12">
      <section className="relative overflow-hidden rounded-[36px] bg-slate-950 px-6 py-12 text-white border border-slate-900/10 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.8)] sm:px-10 lg:px-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.4),_transparent_55%)] opacity-70" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(15,23,42,0.8),_rgba(15,23,42,0.2))]" />
        <div className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white/80">
              Guohong Lazer
            </p>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
              Lazer teknolojisinde
              <span className="block text-indigo-300">güçlü deneyim, net çözüm</span>
            </h1>
            <p className="text-base text-white/70">
              10+ yıllık saha deneyimimizle üretim hatlarının ihtiyacına uygun lazer çözümleri sunuyoruz.
              Kurulum, eğitim ve servis süreçlerini tek ekip ile yönetiyoruz.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/quote"
                className="inline-flex items-center justify-center rounded-full bg-indigo-400 px-6 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5 hover:bg-indigo-300"
              >
                Teklif al
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-2.5 text-sm font-semibold text-white/80 transition hover:border-white/60 hover:text-white"
              >
                İletişime geç
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="relative min-h-[320px] overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                alt="Guohong Lazer saha"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/80 via-slate-900/20 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)]">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-600">Biz kimiz</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">
            Üretim hattına uygun çözüm tasarlayan ekip
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            Guohong Lazer olarak lazer kesim makineleri, yedek parça tedariği ve sahada kurulum
            hizmetlerini bir arada sunuyoruz. Amacımız, üretimde sürekliliği korumak ve verimliliği artırmak.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200/70 bg-white px-4 py-4 text-slate-900  text-slate-900"
              >
                <p className="text-xl font-semibold">{stat.value}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 text-slate-900/60">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)]">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-600">Değerler</p>
          <div className="mt-4 space-y-4">
            {values.map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200/70 bg-white px-4 py-4 ">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="lg:max-w-xl">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-600">Neler yapıyoruz</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">
              Üretim hatlarınızı uçtan uca destekliyoruz
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Planlama, kurulum, servis ve performans takibini tek ekipte topluyoruz.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700">
              Tek ekip
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600">
              Hızlı devreye alma
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600">
              Ölçülen performans
            </span>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((item) => (
            <div key={item.title} className="rounded-2xl border border-slate-200/70 bg-white px-4 py-4 ">
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
              <p className="mt-2 text-sm text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="lg:w-1/2">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-600">Yol Haritası</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">Büyüme adımlarımız</h2>
            <p className="mt-2 text-sm text-slate-600">
              Saha tecrübesini her yıl güçlendiren süreçlerle ilerliyoruz.
            </p>
          </div>
          <div className="lg:w-1/2 space-y-4">
            {milestones.map((item) => (
              <div key={item.year} className="rounded-2xl border border-slate-200/70 bg-white px-4 py-4 ">
                <div className="flex items-center gap-4">
                  <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                    {item.year}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-600">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)]">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-600">Sektörler</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">
            Çözüm sunduğumuz alanlar
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Farklı üretim disiplinlerinde lazer kesim ihtiyaçlarına uygun sistemler geliştiriyoruz.
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {sectors.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)]">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-600">İş akışı</p>
          <h3 className="mt-3 text-xl font-semibold text-slate-900">4 adımda teslim</h3>
          <div className="mt-4 space-y-3">
            {timeline.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-slate-200/70 bg-white px-4 py-4 ">
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                    <p className="mt-1 text-xs text-slate-600">{step.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)]">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-600">Yetkinlikler</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">
            Üretim ve servis süreçlerini tek noktada toparlıyoruz
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {capabilities.map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200/70 bg-white px-4 py-4 ">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)]">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-600">Tesis ve operasyon</p>
          <h3 className="mt-3 text-xl font-semibold text-slate-900">
            Sahadan merkeze entegre operasyon
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Kurulumdan bakıma kadar tüm akışlar tek merkezden takip edilir.
          </p>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            {facility.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-600">Ekip</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">
            Sahada birlikte çalışan uzman kadro
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-2">
          {teamMembers.map((member) => (
            <div
              key={member.name}
              className="group overflow-hidden rounded-[24px] border border-slate-200/70 bg-white shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)] transition hover:-translate-y-1 hover:shadow-[0_20px_48px_-28px_rgba(15,23,42,0.45)]"
            >
              <div className="relative h-52 w-full overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.25),_transparent_55%)]">
                <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(255,255,255,0.35),_transparent)] dark:bg-[linear-gradient(120deg,_rgba(15,23,42,0.35),_transparent)]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="grid h-20 w-20 place-items-center rounded-3xl border border-slate-200/70 bg-white/80 text-3xl font-semibold text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-100">
                    {member.name
                      .split(' ')
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((part) => part[0]?.toUpperCase())
                      .join('')}
                  </div>
                </div>
              </div>
              <div className="p-4 text-center">
                <p className="text-base font-semibold text-slate-900">{member.name}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-indigo-600">
                  {member.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-600">Sık sorulanlar</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">Saha ekiplerinden gelen sorular</h2>
            <p className="mt-2 text-sm text-slate-600">
              Kurulum, servis ve yedek parça süreçlerinde merak edilenleri netleştiriyoruz.
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {faqs.map((item) => (
            <div key={item.q} className="rounded-2xl border border-slate-200/70 bg-white px-4 py-4 ">
              <p className="text-sm font-semibold text-slate-900">{item.q}</p>
              <p className="mt-2 text-sm text-slate-600">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 rounded-[32px] border border-white/10 bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-500 p-8 text-white lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-100">Birlikte çalışalım</p>
          <h2 className="mt-3 text-2xl font-semibold">Üretiminizi güçlendirecek çözümleri birlikte planlayalım</h2>
          <p className="mt-2 text-sm text-indigo-100">
            Kurulum ve servis süreçlerini hızlı planlamak için bizimle iletişime geçin.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:justify-end">
          <Link
            href="/quote"
            className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-indigo-700 shadow-lg shadow-indigo-900/20 transition hover:-translate-y-0.5"
          >
            Teklif iste
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-full border border-white/70 px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:border-white"
          >
            İletişim
          </Link>
        </div>
      </section>
      </div>
    </div>
  );
}



