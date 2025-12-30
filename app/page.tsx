'use client';

import Image from "next/image";
import Link from "next/link";
import { Manrope } from "next/font/google";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const services = [
  {
    title: "Lazer Kesim",
    description: "Sac, boru ve profil hatlari icin yuksek hassasiyetli kesim.",
    image: "/images/1.jpg",
    accent: true,
  },
  {
    title: "CNC Isleme",
    description: "Kompleks parcalar icin hizli ve stabil isleme akislar.",
    badge: "CNC",
  },
  {
    title: "Metal Imalat",
    description: "Ozel projeler icin mukemmel montaj ve yuzey bitirme.",
    badge: "FAB",
  },
  {
    title: "Teknik Servis",
    description: "Kurulum, egitim ve surekli performans destegi.",
    badge: "CARE",
  },
];

const reasons = [
  {
    title: "Hizli Termin",
    text: "Teklif, kurulum ve devreye alma sureci ivedi planlanir.",
  },
  {
    title: "Dogru Cozum",
    text: "Uretim hattina uygun makine ve otomasyon belirlenir.",
  },
  {
    title: "Kalite Guvence",
    text: "Her teslimat oncesi detayli performans testleri.",
  },
  {
    title: "Saha Destegi",
    text: "Servis agi ve yedek parca tedarigi ile tam destek.",
  },
];

const pricing = [
  {
    name: "Basic",
    price: "69",
    desc: "Baslangic projeleri icin",
    features: ["Lazer kesim", "Teknik destek", "Standart termin"],
  },
  {
    name: "Standard",
    price: "149",
    desc: "En cok tercih edilen",
    features: ["Lazer + CNC", "Oncelikli servis", "Hizli termin"],
    featured: true,
  },
  {
    name: "Advance",
    price: "279",
    desc: "Yuksek kapasite",
    features: ["Ozel hatt", "Otomasyon", "Raporlama"],
  },
  {
    name: "Enterprise",
    price: "899",
    desc: "Kurumsal cozum",
    features: ["Tasarim ekibi", "Saha kurulumu", "24/7 destek"],
  },
];

const faqs = [
  {
    q: "Teklif sureci ne kadar surer?",
    a: "Talep ve teknik bilgiye gore ayni gun icinde on teklif iletilir.",
  },
  {
    q: "Kurulum ve egitim sagliyor musunuz?",
    a: "Evet, kurulum ve operator egitimi tek paket halinde sunulur.",
  },
  {
    q: "Yedek parca tedarigi nasil?",
    a: "Stoklu parcalar ayni gun kargoya verilir.",
  },
  {
    q: "Teknik servis bolgenizde var mi?",
    a: "Turkiye genelinde servis agi ve uzaktan destek veriyoruz.",
  },
];

const blogs = [
  {
    category: "Teknoloji",
    date: "16 Feb",
    title: "Lazer kesimde hiz ve hassasiyet nasil artar?",
    desc: "Uretim verimliligini artiran uc kritik iyilestirme.",
    image: "/images/2.jpg",
  },
  {
    category: "Otomasyon",
    date: "22 Feb",
    title: "CNC ve lazer hatlarini entegre etmek",
    desc: "Is akisini hizlandiran otomasyon yaklasimi.",
    image: "/images/3.jpg",
  },
  {
    category: "Servis",
    date: "28 Feb",
    title: "Bakim planlamasi ile duruslari azaltin",
    desc: "Maliyeti dusuren proaktif servis stratejisi.",
    image: "/images/4.jpg",
  },
];

const counters = [
  { label: "Yil Deneyim", value: 10 },
  { label: "Proje", value: 5467 },
  { label: "Memnuniyet", value: 98 },
  { label: "Servis Noktasi", value: 24 },
];

const logos = ["LOGO", "LOGO", "LOGO", "LOGO", "LOGO"];

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || startedRef.current) return;
        startedRef.current = true;
        const start = performance.now();

        const step = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const next = Math.round(target * progress);
          setValue(next);
          if (progress < 1) requestAnimationFrame(step);
        };

        requestAnimationFrame(step);
      },
      { threshold: 0.3 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [duration, target]);

  return { value, ref };
}

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

function Section({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.section
      className={className}
      variants={reveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </motion.section>
  );
}

export default function Home() {
  return (
    <div className={`${manrope.className} space-y-0`}>
      <Section className="relative overflow-hidden bg-gradient-to-b from-[var(--navy-950)] via-[var(--navy-900)] to-[var(--navy-850)] text-white">
        <div className="topo-bg absolute inset-0 opacity-30" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative max-w-screen-2xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <motion.div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.div variants={reveal}>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1 text-xs uppercase tracking-[0.3em] text-white/70">
                Industrial Laser Solutions
              </div>
              <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
                Precision <span className="text-[var(--brand-yellow)]">Laser</span> Cutting
                <span className="block">Engineering for Every Industry</span>
              </h1>
              <p className="mt-4 max-w-xl text-base text-white/70 sm:text-lg">
                Hizli teklif, guvenilir uretim ve saha destegi ile uretim hattinizi yeni seviyeye tasiyin.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/quote"
                  className="inline-flex items-center justify-center rounded-full bg-[var(--brand-blue)] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-110"
                >
                  Teklif Al
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white/80 transition hover:-translate-y-0.5 hover:border-white"
                >
                  Iletisime Gec
                </Link>
              </div>
            </motion.div>

            <motion.div variants={reveal} className="flex flex-col gap-6">
              <div className="flex items-center gap-5 rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur">
                <button className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                  <span className="absolute inset-0 rounded-full border border-white/40 opacity-70 group-hover:animate-ping" />
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[var(--navy-950)]">
                    ?
                  </span>
                </button>
                <div>
                  <div className="text-3xl font-semibold">98%</div>
                  <div className="text-sm text-white/70">Satisfying Clients</div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="text-xs uppercase tracking-[0.3em] text-white/60">KPI</div>
                <div className="mt-3 grid grid-cols-2 gap-4 text-sm text-white/80">
                  <div>
                    <div className="text-xl font-semibold text-white">24h</div>
                    <div>Teklif sureci</div>
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-white">500+</div>
                    <div>Mutlu musteri</div>
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-white">10+</div>
                    <div>Yil deneyim</div>
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-white">7/24</div>
                    <div>Destek</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </Section>

      <Section className="bg-slate-50 text-slate-900">
        <div className="max-w-screen-2xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex rounded-full border border-slate-200 px-4 py-1 text-xs uppercase tracking-[0.3em] text-slate-500">What We Do</div>
              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                Accurate <span className="text-[var(--brand-yellow)]">Laser</span> Cutting Services
                <span className="block">Tailored To Your Needs</span>
              </h2>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-full bg-[var(--brand-blue)] px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            >
              Tum Hizmetler 
            </Link>
          </div>

          <motion.div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {services.map((item) => (
              <motion.div
                key={item.title}
                variants={reveal}
                className={`group relative overflow-hidden rounded-[28px] p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 ${
                  item.accent ? "bg-slate-900 text-white" : "bg-slate-100"
                }`}
              >
                {item.image && (
                  <div className="relative h-44 overflow-hidden rounded-2xl">
                    <Image src={item.image} alt={item.title} fill className="object-cover transition group-hover:scale-[1.03]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent" />
                    <div className="absolute bottom-4 left-4 text-sm font-semibold">{item.title}</div>
                  </div>
                )}
                {!item.image && (
                  <div className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-yellow)] text-slate-900 font-semibold">
                    {item.badge}
                  </div>
                )}
                <div className="mt-6 space-y-2">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className={`text-sm ${item.accent ? "text-white/70" : "text-slate-600"}`}>{item.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      <Section className="relative bg-[var(--navy-900)] text-white">
        <div className="topo-bg absolute inset-0 opacity-25" />
        <div className="relative max-w-screen-2xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
            <div className="relative overflow-hidden rounded-[32px]">
              <Image src="/images/about-showcase.jpg" alt="Factory" width={720} height={520} className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="inline-flex rounded-full border border-white/20 px-4 py-1 text-xs uppercase tracking-[0.3em] text-white/70">Why Choose Us</div>
              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                We give precision <span className="text-[var(--brand-yellow)]">efficiency</span> and excellence.
              </h2>
              <div className="mt-6 rounded-[28px] border border-white/10 bg-white/5 p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  {reasons.map((reason) => (
                    <div key={reason.title} className="flex gap-3">
                      <span className="mt-1 text-[var(--brand-yellow)]">?</span>
                      <div>
                        <div className="text-sm font-semibold text-white">{reason.title}</div>
                        <div className="text-xs text-white/70">{reason.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-6 text-white/60">
                {logos.map((logo) => (
                  <div key={logo} className="text-xs uppercase tracking-[0.3em]">{logo}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section className="bg-slate-50 text-slate-900">
        <div className="max-w-screen-2xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex rounded-full border border-slate-200 px-4 py-1 text-xs uppercase tracking-[0.3em] text-slate-500">Transparent Package</div>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
              Affordable & <span className="text-[var(--brand-yellow)]">Transparent</span> Pricing
            </h2>
            <p className="mt-2 text-sm text-slate-600">Ihtiyaca gore esnek paketler.</p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {pricing.map((plan) => (
              <div
                key={plan.name}
                className={`relative overflow-hidden rounded-[28px] border p-6 shadow-[0_14px_45px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 ${
                  plan.featured
                    ? "border-slate-900 bg-[var(--navy-900)] text-white"
                    : "border-slate-200 bg-white"
                }`}
              >
                {plan.featured && (
                  <span className="absolute right-6 top-6 rounded-full bg-[var(--brand-yellow)] px-3 py-1 text-xs font-semibold text-slate-900">Popular</span>
                )}
                <div className="text-lg font-semibold">{plan.name}</div>
                <div className="mt-2 text-sm opacity-80">{plan.desc}</div>
                <div className="mt-5 inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-xl font-semibold">
                  ${plan.price}
                  <span className="ml-2 text-xs opacity-70">/ work</span>
                </div>
                <ul className="mt-5 space-y-2 text-sm">
                  {plan.features.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="text-[var(--brand-yellow)]">?</span>
                      <span className="opacity-90">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section className="relative bg-[var(--navy-950)] text-white">
        <div className="topo-bg absolute inset-0 opacity-25" />
        <div className="relative max-w-screen-2xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-[36px] border border-white/10 bg-white/5 p-6">
            <div className="relative h-72 overflow-hidden rounded-[28px]">
              <Image src="/images/5.jpg" alt="Video" fill className="object-cover" />
              <div className="absolute inset-0 bg-black/40" />
              <button className="group absolute inset-0 flex items-center justify-center">
                <span className="absolute h-20 w-20 rounded-full border border-white/50 group-hover:animate-ping" />
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-[var(--navy-950)] text-2xl">?</span>
              </button>
            </div>
          </div>
        </div>
      </Section>

      <Section className="bg-slate-50 text-slate-900">
        <div className="max-w-screen-2xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex rounded-full border border-slate-200 px-4 py-1 text-xs uppercase tracking-[0.3em] text-slate-500">Usually Asked</div>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
              Discover Our <span className="text-[var(--brand-yellow)]">FAQ</span>
            </h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {faqs.map((item) => (
              <details key={item.q} className="group rounded-[24px] border border-slate-200 bg-white p-5">
                <summary className="cursor-pointer text-sm font-semibold text-slate-900">
                  {item.q}
                </summary>
                <p className="mt-3 text-sm text-slate-600">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </Section>

      <Section className="bg-[var(--navy-950)] text-white">
        <div className="topo-bg absolute inset-0 opacity-25" />
        <div className="relative max-w-screen-2xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <h2 className="text-3xl font-bold">Numbers that prove impact</h2>
            <Link href="/contact" className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white/80 hover:border-white">
              Proje Baslat
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {counters.map((item) => {
              const { value, ref } = useCountUp(item.value);
              return (
                <div key={item.label} ref={ref} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <div className="text-3xl font-semibold text-[var(--brand-yellow)]">{value}+</div>
                  <div className="text-xs uppercase tracking-[0.3em] text-white/60">{item.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      <Section className="bg-slate-50 text-slate-900">
        <div className="max-w-screen-2xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex rounded-full border border-slate-200 px-4 py-1 text-xs uppercase tracking-[0.3em] text-slate-500">Our Blog</div>
              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Latest insights and updates</h2>
            </div>
            <Link href="/" className="inline-flex items-center justify-center rounded-full bg-[var(--brand-blue)] px-5 py-2 text-sm font-semibold text-white">
              See All 
            </Link>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {blogs.map((post) => (
              <div key={post.title} className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1">
                <div className="relative h-44">
                  <Image src={post.image} alt={post.title} fill className="object-cover transition group-hover:scale-[1.03]" />
                  <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-600">{post.category}</div>
                  <div className="absolute left-4 bottom-4 rounded-xl bg-[var(--brand-yellow)] px-3 py-1 text-xs font-semibold text-slate-900">{post.date}</div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold">{post.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{post.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}
