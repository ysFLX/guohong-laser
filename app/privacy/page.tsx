import Link from 'next/link';

import PolicyCard from '@/components/legal/PolicyCard';
import PolicyPageLayout from '@/components/legal/PolicyPageLayout';

export default function PrivacyPage() {
  return (
    <PolicyPageLayout
      eyebrow="Güven Merkezi"
      title="Gizlilik Politikası"
      description="Guohong Lazer olarak kişisel verilerinizi güvenle işler, yalnızca hizmetin gerektirdiği kadarını saklarız. Bu sayfada verilerin hangi amaçlarla toplandığı ve nasıl korunduğu özetlenir."
      tags={['Veri Güvenliği', 'İşlem Amaçları', 'Paylaşım']}
      sidebar={
        <>
          <PolicyCard title="Hızlı bağlantılar">
            <div className="grid gap-2">
              <Link
                href="/kvkk"
                className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] px-4 py-2 text-[var(--foreground)] transition hover:bg-[var(--surface)]"
              >
                KVKK Aydınlatma
              </Link>
              <Link
                href="/cookies"
                className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] px-4 py-2 text-[var(--foreground)] transition hover:bg-[var(--surface)]"
              >
                Çerez Politikası
              </Link>
              <Link
                href="/distance-sales"
                className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] px-4 py-2 text-[var(--foreground)] transition hover:bg-[var(--surface)]"
              >
                Mesafeli Satış Sözleşmesi
              </Link>
              <Link
                href="/returns"
                className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] px-4 py-2 text-[var(--foreground)] transition hover:bg-[var(--surface)]"
              >
                İade ve Garanti
              </Link>
            </div>
          </PolicyCard>

          <PolicyCard title="Veri talebi">
            <p>Verilerinizle ilgili taleplerinizi veya güncelleme isteklerinizi destek ekibimize iletebilirsiniz.</p>
            <Link
              href="/contact?subject=Gizlilik+Talebi"
              className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-slate-800"
            >
              Talep oluştur
            </Link>
          </PolicyCard>
        </>
      }
    >
      <PolicyCard title="Toplanan veriler">
        <ul className="list-disc space-y-2 pl-5">
          <li>İletişim bilgileri (ad, e-posta, telefon).</li>
          <li>Sipariş ve teslimat bilgileri (adres, fatura, ürün).</li>
          <li>İşlem güvenliği (IP, cihaz, oturum kayıtları).</li>
        </ul>
      </PolicyCard>

      <PolicyCard title="Kullanım amaçları">
        <ul className="list-disc space-y-2 pl-5">
          <li>Teklif, sipariş ve teslimat süreçlerini yürütmek.</li>
          <li>Garanti, iade ve destek taleplerini yönetmek.</li>
          <li>Yasal yükümlülükleri yerine getirmek ve suistimali önlemek.</li>
        </ul>
      </PolicyCard>

      <PolicyCard title="Veri paylaşımı">
        <p>
          Veriler, sipariş ve teslimat süreci için zorunlu olan kargo, ödeme ve teknik servis sağlayıcılarıyla
          paylaşılabilir. Bu paylaşımlar, sadece hizmetin sunumu için gereklidir.
        </p>
      </PolicyCard>
    </PolicyPageLayout>
  );
}

