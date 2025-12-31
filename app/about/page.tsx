'use client';

import Image from 'next/image';
import Link from 'next/link';

const teamMembers = [
  {
    name: 'Fatih Turgut Polat',
    role: 'Satis Muduru',
    image: 'https://randomuser.me/api/portraits/men/1.jpg',
  },
  {
    name: 'Arafat Uygur',
    role: 'Satis Muduru',
    image: 'https://randomuser.me/api/portraits/men/2.jpg',
  },
  {
    name: 'Yusuf Can Gordebil',
    role: 'Satis Pazarlama',
    image: 'https://randomuser.me/api/portraits/men/3.jpg',
  },
  {
    name: 'Yusuf Kucuktongarlak',
    role: 'Sosyal Medya Yoneticisi',
    image: 'https://randomuser.me/api/portraits/men/4.jpg',
  },
];

const values = [
  {
    title: 'Vizyon',
    description:
      'Lazer teknolojilerinde dunya capinda bilinen, yenilikci ve surekli gelisen bir marka olmak.',
  },
  {
    title: 'Misyon',
    description:
      'Musterilerimize yuksek performansli lazer makineleri ve kesintisiz servis destegi saglamak.',
  },
  {
    title: 'Yaklasim',
    description:
      'Uretim sahasinda olculen verilerle karar alan, sonucu takip eden bir ekip olmak.',
  },
];

const stats = [
  { label: 'Yillik deneyim', value: '10+' },
  { label: 'Kurulum projesi', value: '1000+' },
  { label: 'Mutlu musteri', value: '500+' },
  { label: 'Servis noktasi', value: '24' },
];

const milestones = [
  {
    year: '2014',
    title: 'Ilk saha kurulumlari',
    description: 'Yerli uretim hatlariyla ilk anahtar teslim projeler tamamlandi.',
  },
  {
    year: '2017',
    title: 'Servis agi genisledi',
    description: 'Teknik servis ve yedek parca operasyonlari tek merkezde birlestirildi.',
  },
  {
    year: '2020',
    title: 'Akilli hat entegrasyonu',
    description: 'Veri izleme ve performans raporlama sistemleri sahaya alindi.',
  },
  {
    year: '2024',
    title: 'Global tedarik gucu',
    description: 'Kritik parca tedarigi icin uluslararasi lojistik altyapi kuruldu.',
  },
];

const capabilities = [
  {
    title: 'Kesim hatlari planlama',
    description: 'Uretim hedeflerine gore hat kapasitesi ve malzeme akisi tasarimlari.',
  },
  {
    title: 'Kurulum ve devreye alma',
    description: 'Saha hazirligi, kurulum, test ve operator egitimi tek ekip tarafindan yapilir.',
  },
  {
    title: 'Sarf ve yedek parca',
    description: 'Kritik yedek parca ve sarf malzeme stoklari hizli temin edilir.',
  },
  {
    title: 'Performans takibi',
    description: 'Hiz, fire ve enerji takibiyle verimlilik raporlari hazirlanir.',
  },
];

const facility = [
  'Uretim planlama ve kesim simulasyonu',
  'Kritik parca stok yonetimi',
  'Kalibrasyon ve kalite kontrol',
  'Uzaktan destek ve saha servis',
];

const services = [
  {
    title: 'Makine secimi ve hat analizi',
    description: 'Uretim hedeflerine gore uygun lazer sistemi ve hat dizilimi belirlenir.',
  },
  {
    title: 'Kurulum ve egitim',
    description: 'Saha kurulumlari tamamlanir, operator ve bakim ekibi egitilir.',
  },
  {
    title: 'Sarf ve yedek parca',
    description: 'Kritik sarf kalemleri ve yedek parca tedarigi planli sekilde yonetilir.',
  },
  {
    title: 'Periyodik bakim',
    description: 'Duruslari azaltan bakim takvimiyle hat performansi korunur.',
  },
  {
    title: 'Uzaktan izleme',
    description: 'Hiz, enerji ve fire verileri raporlanir, iyilestirme planlari cikarilir.',
  },
  {
    title: '7/24 saha destegi',
    description: 'Kritik durumlarda hizli yonlendirme ile servis sureci baslatilir.',
  },
];

const sectors = [
  'Metal isleme ve sac sekillendirme',
  'Otomotiv yan sanayi',
  'Boru profil uretimi',
  'Makine imalat ve fason kesim',
  'Reklam ve dekoratif metal',
  'Endustriyel mutfak ekipmanlari',
];

const timeline = [
  { title: 'Analiz ve planlama', detail: 'Ihtiyaclar netlestirilir, teklif ve plan cikartilir.' },
  { title: 'Uretim ve lojistik', detail: 'Sistem hazirlanir, saha teslim takvimi belirlenir.' },
  { title: 'Kurulum ve test', detail: 'Kurulum yapilir, ornek kesimlerle performans dogrulanir.' },
  { title: 'Egitim ve devralma', detail: 'Operator egitimi ve teslim tutanaklari tamamlanir.' },
];

const faqs = [
  {
    q: 'Kurulum ne kadar surer?',
    a: 'Ortalama 7-10 gun icinde kurulum ve devreye alma tamamlanir.',
  },
  {
    q: 'Yedek parca temini nasil?',
    a: 'Kritik parcalar icin hizli stok ve kargo sistemi uygulanir.',
  },
  {
    q: 'Egitim veriliyor mu?',
    a: 'Ekipleriniz icin operator ve bakim egitimi saglaniyor.',
  },
  {
    q: 'Servis cagri sureci nasil ilerler?',
    a: 'Kayit alinip uzaktan destek verilir, gerekirse saha ekibi yonlendirilir.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen space-y-16">
      <section className="relative overflow-hidden rounded-[36px] bg-slate-950 px-6 py-12 text-white shadow-2xl sm:px-10 lg:px-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.4),_transparent_55%)] opacity-70" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(15,23,42,0.8),_rgba(15,23,42,0.2))]" />
        <div className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white/80">
              Guohong Lazer
            </p>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
              Lazer teknolojisinde
              <span className="block text-orange-300">guclu deneyim, net cozum</span>
            </h1>
            <p className="text-base text-white/70">
              10+ yillik saha deneyimimizle uretim hatlarinin ihtiyacina uygun lazer cozumleri sunuyoruz.
              Kurulum, egitim ve servis sureclerini tek ekip ile yonetiyoruz.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/quote"
                className="inline-flex items-center justify-center rounded-full bg-orange-400 px-6 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-orange-500/30 transition hover:-translate-y-0.5 hover:bg-orange-300"
              >
                Teklif al
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-2.5 text-sm font-semibold text-white/80 transition hover:border-white/60 hover:text-white"
              >
                Iletisime gec
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="relative min-h-[320px] overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                alt="Guohong Lazer saha"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/80 via-slate-900/20 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
          <p className="text-xs uppercase tracking-[0.3em] text-orange-600 dark:text-orange-200">Biz kimiz</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">
            Uretim hattina uygun cozum tasarlayan ekip
          </h2>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Guohong Lazer olarak lazer kesim makineleri, yedek parca tedarigi ve sahada kurulum
            hizmetlerini bir arada sunuyoruz. Amacimiz, uretimde surekliligi korumak ve verimliligi artirmak.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-4 text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                <p className="text-xl font-semibold">{stat.value}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-white/60">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
          <p className="text-xs uppercase tracking-[0.3em] text-orange-600 dark:text-orange-200">Degerler</p>
          <div className="mt-4 space-y-4">
            {values.map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="lg:max-w-xl">
            <p className="text-xs uppercase tracking-[0.3em] text-orange-600 dark:text-orange-200">Neler yapiyoruz</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">
              Uretim hatlarinizi uctan uca destekliyoruz
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Planlama, kurulum, servis ve performans takibini tek ekipte topluyoruz.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-semibold text-orange-700">
              Tek ekip
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600">
              Hizli devreye alma
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600">
              Olculen performans
            </span>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((item) => (
            <div key={item.title} className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-4 dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="lg:w-1/2">
            <p className="text-xs uppercase tracking-[0.3em] text-orange-600 dark:text-orange-200">Yol haritasi</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">Buyume adimlarimiz</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Saha tecrubesini her yil guclendiren sureclerle ilerliyoruz.
            </p>
          </div>
          <div className="lg:w-1/2 space-y-4">
            {milestones.map((item) => (
              <div key={item.year} className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-4 dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center gap-4">
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                    {item.year}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
          <p className="text-xs uppercase tracking-[0.3em] text-orange-600 dark:text-orange-200">Sektorler</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">
            Cozum sundugumuz alanlar
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Farkli uretim disiplinlerinde lazer kesim ihtiyaclarina uygun sistemler gelistiriyoruz.
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {sectors.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                <span className="mt-1 h-2 w-2 rounded-full bg-orange-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
          <p className="text-xs uppercase tracking-[0.3em] text-orange-600 dark:text-orange-200">Is akisi</p>
          <h3 className="mt-3 text-xl font-semibold text-slate-900 dark:text-white">4 adimda teslim</h3>
          <div className="mt-4 space-y-3">
            {timeline.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-4 dark:border-white/10 dark:bg-white/5">
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-xs font-semibold text-orange-700">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{step.title}</p>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{step.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
          <p className="text-xs uppercase tracking-[0.3em] text-orange-600 dark:text-orange-200">Yetkinlikler</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">
            Uretim ve servis sureclerini tek noktada toparliyoruz
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {capabilities.map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
          <p className="text-xs uppercase tracking-[0.3em] text-orange-600 dark:text-orange-200">Tesis ve operasyon</p>
          <h3 className="mt-3 text-xl font-semibold text-slate-900 dark:text-white">
            Sahadan merkeze entegre operasyon
          </h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Kurulumdan bakima kadar tum akislar tek merkezden takip edilir.
          </p>
          <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            {facility.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-orange-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-orange-600 dark:text-orange-200">Ekip</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            Sahada birlikte calisan uzman kadro
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-2">
          {teamMembers.map((member) => (
            <div
              key={member.name}
              className="group overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/90 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/5"
            >
              <div className="relative h-52 w-full">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.05]"
                />
              </div>
              <div className="p-4 text-center">
                <p className="text-base font-semibold text-slate-900 dark:text-white">{member.name}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-orange-600 dark:text-orange-200">
                  {member.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-orange-600 dark:text-orange-200">Sik sorulanlar</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">Saha ekiplerinden gelen sorular</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Kurulum, servis ve yedek parca sureclerinde merak edilenleri netlestiriyoruz.
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {faqs.map((item) => (
            <div key={item.q} className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-4 dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.q}</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 rounded-[32px] border border-white/10 bg-gradient-to-r from-orange-700 via-orange-600 to-orange-500 p-8 text-white lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-orange-100">Birlikte calisalim</p>
          <h2 className="mt-3 text-2xl font-semibold">Uretiminizi guclendirecek cozumleri birlikte planlayalim</h2>
          <p className="mt-2 text-sm text-orange-100">
            Kurulum ve servis sureclerini hizli planlamak icin bizimle iletisime gecin.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:justify-end">
          <Link
            href="/quote"
            className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-orange-700 shadow-lg shadow-orange-900/20 transition hover:-translate-y-0.5"
          >
            Teklif iste
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-full border border-white/70 px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:border-white"
          >
            Iletisim
          </Link>
        </div>
      </section>
    </div>
  );
}

