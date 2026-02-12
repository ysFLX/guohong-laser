import Link from 'next/link';

import PolicyCard from '@/components/legal/PolicyCard';
import PolicyPageLayout from '@/components/legal/PolicyPageLayout';

const WHATSAPP_NUMBER = '905368316787';

export default function CompanyPage() {
  return (
    <PolicyPageLayout
      eyebrow="Kurumsal"
      title="Firma Bilgileri"
      description="Guohong Lazer resmi firma bilgileri ve iletişim detayları burada yer alır. Teklif, teknik destek ve servis talepleri için bu kanalları kullanabilirsiniz."
      tags={['Resmi bilgiler', 'İletişim', 'Kurumsal güven']}
      sidebar={
        <>
          <PolicyCard title="Hızlı işlemler">
            <div className="grid gap-2">
              <Link
                href="/quote"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Teklif al
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface)]"
              >
                İletişim
              </Link>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface)]"
              >
                WhatsApp
              </a>
            </div>
          </PolicyCard>

          <PolicyCard title="Yasal & güven">
            <div className="grid gap-2">
              <Link
                href="/legal"
                className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] px-4 py-2 text-[var(--foreground)] transition hover:bg-[var(--surface)]"
              >
                Yasal belgeler
              </Link>
              <Link
                href="/privacy"
                className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] px-4 py-2 text-[var(--foreground)] transition hover:bg-[var(--surface)]"
              >
                Gizlilik politikası
              </Link>
              <Link
                href="/payment-security"
                className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] px-4 py-2 text-[var(--foreground)] transition hover:bg-[var(--surface)]"
              >
                Ödeme güvenliği
              </Link>
            </div>
          </PolicyCard>
        </>
      }
    >
      <PolicyCard title="Ünvan">
        <p className="text-[var(--foreground)]">Guohong Lazer</p>
      </PolicyCard>

      <PolicyCard title="Adres">
        <p className="text-[var(--foreground)]">Fevziçakmak Mah. Aksaray Çevreyolu Caddesi Akasya Sanayi Sitesi</p>
        <p className="text-[var(--foreground)]">A Blok No:18T 42210 Konya, Türkiye</p>
      </PolicyCard>

      <PolicyCard title="İletişim">
        <div className="space-y-2 text-[var(--foreground)]">
          <div>
            Telefon:{' '}
            <a href="tel:+905368316787" className="font-semibold text-[var(--indigo-600)] hover:opacity-90">
              +90 536 831 67 87
            </a>
          </div>
          <div>
            E-posta:{' '}
            <a
              href="mailto:guohonglazerinfo@gmail.com"
              className="font-semibold text-[var(--indigo-600)] hover:opacity-90"
            >
              guohonglazerinfo@gmail.com
            </a>
          </div>
        </div>
      </PolicyCard>

      <PolicyCard title="Çalışma saatleri">
        <p className="text-[var(--foreground)]">Pazartesi - Cuma: 09:00 - 17:30</p>
      </PolicyCard>

      <PolicyCard title="Hizmet kapsamı">
        <p>
          Lazer makineleri, yedek parçaların tedariği, kurulum, eğitim ve teknik servis.
        </p>
      </PolicyCard>
    </PolicyPageLayout>
  );
}
