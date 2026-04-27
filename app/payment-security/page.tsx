import Link from 'next/link';

import PolicyCard from '@/components/legal/PolicyCard';
import PolicyPageLayout from '@/components/legal/PolicyPageLayout';
import { getPaymentProviderName, isPaymentProviderActive } from '@/lib/paymentProviderStatus';

export default function PaymentSecurityPage() {
  const providerName = getPaymentProviderName();
  const providerActive = isPaymentProviderActive();

  return (
    <PolicyPageLayout
      eyebrow="Güven Merkezi"
      title="Ödeme Güvenliği"
      description="Ödeme altyapısı güvenlik standartlarına uygundur. Kart bilgileri sistemimizde tutulmaz. İşlem adımları güvenli ödeme sağlayıcısı üzerinden yürütülür."
      tags={['SSL Koruma', 'PCI-DSS Uyumlu', '3D Secure']}
      sidebar={
        <>
          <PolicyCard title="Hızlı bağlantılar">
            <div className="grid gap-2">
              <Link
                href="/returns"
                className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] px-4 py-2 text-[var(--foreground)] transition hover:bg-[var(--surface)]"
              >
                İade ve Garanti
              </Link>
              <Link
                href="/shipping"
                className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] px-4 py-2 text-[var(--foreground)] transition hover:bg-[var(--surface)]"
              >
                Kargo ve Teslimat
              </Link>
              <Link
                href="/privacy"
                className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] px-4 py-2 text-[var(--foreground)] transition hover:bg-[var(--surface)]"
              >
                Gizlilik Politikası
              </Link>
            </div>
          </PolicyCard>

          <PolicyCard title="Güvenli ödeme adımları">
            <ol className="space-y-2">
              <li>1. Sipariş detaylarını onayla.</li>
              <li>2. 3D Secure doğrulamasını tamamla.</li>
              <li>3. Ödeme durumunu sipariş ekranından takip et.</li>
            </ol>
            <Link
              href="/contact?subject=Odeme+Sorusu"
              className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-slate-800"
            >
              Ödeme desteği al
            </Link>
          </PolicyCard>
        </>
      }
    >
      <PolicyCard title="Güvenli altyapı">
        <ul className="list-disc space-y-2 pl-5">
          <li>SSL ile şifrelenmiş bağlantı kullanılır.</li>
          <li>Ödeme sağlayıcısı PCI-DSS standartlarına uygun işlemler yapar.</li>
          <li>Kart bilgileri şirket sistemlerine kaydedilmez.</li>
        </ul>
      </PolicyCard>

      <PolicyCard title="3D Secure ve doğrulama">
        <ul className="list-disc space-y-2 pl-5">
          <li>Bankanızın 3D Secure doğrulama adımı gerekebilir.</li>
          <li>Şüpheli işlemler güvenlik nedeni ile reddedilebilir.</li>
        </ul>
      </PolicyCard>

      <PolicyCard title="Sahtekarlık önleme">
        <ul className="list-disc space-y-2 pl-5">
          <li>Olağandışı işlemler risk kontrolünden geçirilebilir.</li>
          <li>Gerekli görülürse ek doğrulama veya belgeler istenebilir.</li>
        </ul>
      </PolicyCard>

      <div className="card-surface p-6">
        <div className="text-sm font-semibold text-[var(--foreground)]">Güven rozetleri</div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-[var(--foreground)]">
          <span className="rounded-full border border-[var(--surface-border)] bg-[var(--surface-muted)] px-3 py-1">
            SSL
          </span>
          <span className="rounded-full border border-[var(--surface-border)] bg-[var(--surface-muted)] px-3 py-1">
            PCI-DSS
          </span>
          <span className="rounded-full border border-[var(--surface-border)] bg-[var(--surface-muted)] px-3 py-1">
            3D Secure
          </span>
          <span className="rounded-full border border-[var(--surface-border)] bg-[var(--surface-muted)] px-3 py-1">
            Banka onaylı ödeme
          </span>
          <span className="rounded-full border border-[var(--surface-border)] bg-[var(--surface-muted)] px-3 py-1">
            İade garantisi
          </span>
        </div>
        <p className="mt-3 text-sm text-[var(--gray-500)]">
          Ödeme işlemleri güvenli altyapı üzerinden gerçekleşir ve kart bilgileri sistemimizde tutulmaz.
        </p>
      </div>

      <PolicyCard title="Ödeme sağlayıcı durumu">
        <p className="text-sm text-[var(--gray-500)]">
          {providerActive
            ? `${providerName} güvenli ödeme altyapısı aktiftir. Kartlı ödeme işlemleri PayTR sayfasında tamamlanır.`
            : `${providerName} aktivasyon süreci devam ediyor. Kartlı ödeme aktivasyonu tamamlandığında bu alan güncellenecektir.`}
        </p>
        <div className="mt-4 rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] px-4 py-3">
          {/* SVG logo is intentionally rendered with a plain img tag to avoid next/image optimization issues. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/paytrlogolar/paytr-logo-color.svg" alt="PayTR" className="h-8 w-auto" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-[var(--foreground)]">
          <span className="rounded-full border border-[var(--surface-border)] bg-[var(--surface-muted)] px-3 py-1">
            {providerName}
          </span>
          <span className="rounded-full border border-[var(--surface-border)] bg-[var(--surface-muted)] px-3 py-1">
            Visa
          </span>
          <span className="rounded-full border border-[var(--surface-border)] bg-[var(--surface-muted)] px-3 py-1">
            Mastercard
          </span>
          <span className="rounded-full border border-[var(--surface-border)] bg-[var(--surface-muted)] px-3 py-1">
            Troy
          </span>
          <span className="rounded-full border border-[var(--surface-border)] bg-[var(--surface-muted)] px-3 py-1">
            3D Secure
          </span>
        </div>
      </PolicyCard>
    </PolicyPageLayout>
  );
}

