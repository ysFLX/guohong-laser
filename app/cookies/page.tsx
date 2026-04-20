import Link from 'next/link';

import PolicyCard from '@/components/legal/PolicyCard';
import PolicyPageLayout from '@/components/legal/PolicyPageLayout';

export default function CookiesPage() {
  return (
    <PolicyPageLayout
      eyebrow="Güven Merkezi"
      title="Çerez Politikası"
      description="Çerezler, site deneyimini iyileştirmek ve servisleri güvenli çalıştırmak için kullanılır. Bu sayfada çerez türleri ve kontrol seçenekleri özetlenir."
      tags={['Performans', 'İşlevsellik', 'Analitik']}
      sidebar={
        <>
          <PolicyCard title="Hızlı bağlantılar">
            <div className="grid gap-2">
              <Link
                href="/privacy"
                className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] px-4 py-2 text-[var(--foreground)] transition hover:bg-[var(--surface)]"
              >
                Gizlilik Politikası
              </Link>
              <Link
                href="/kvkk"
                className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] px-4 py-2 text-[var(--foreground)] transition hover:bg-[var(--surface)]"
              >
                KVKK Aydınlatma
              </Link>
              <Link
                href="/payment-security"
                className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] px-4 py-2 text-[var(--foreground)] transition hover:bg-[var(--surface)]"
              >
                Ödeme Güvenliği
              </Link>
            </div>
          </PolicyCard>

          <PolicyCard title="Tercih yardımı">
            <p>Çerez tercihleriyle ilgili soruların için destek ekibimiz yardımcı olur.</p>
            <Link
              href="/contact?subject=Cerez+Tercihleri"
              className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-slate-800"
            >
              Destek al
            </Link>
          </PolicyCard>
        </>
      }
    >
      <PolicyCard title="Kullandığımız çerez türleri">
        <ul className="list-disc space-y-2 pl-5">
          <li>Zorunlu çerezler: Oturum ve güvenlik için gereklidir.</li>
          <li>Performans çerezleri: Site hızını ve deneyimini iyileştirir.</li>
          <li>Analitik çerezler: Trafik ve içerik performansını ölçer.</li>
        </ul>
      </PolicyCard>

      <PolicyCard title="Çerez yönetimi">
        <ul className="list-disc space-y-2 pl-5">
          <li>Tarayıcı ayarlarınızdan çerezleri silebilir veya engelleyebilirsiniz.</li>
          <li>Bazı çerezler devre dışı kalırsa site özellikleri etkilenebilir.</li>
          <li>Tercihlerinizde değişiklik yaptığınızda yenileme gerekebilir.</li>
        </ul>
      </PolicyCard>

      <PolicyCard title="Üçüncü taraf servisler">
        <ul className="list-disc space-y-2 pl-5">
          <li>Ödeme ve kargo servisleri, teknik olarak zorunlu çerezler kullanabilir.</li>
          <li>Analitik servisler anonim veriler üzerinden raporlama yapar.</li>
        </ul>
      </PolicyCard>
    </PolicyPageLayout>
  );
}

