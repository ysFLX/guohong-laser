import Link from 'next/link';

import PolicyCard from '@/components/legal/PolicyCard';
import PolicyPageLayout from '@/components/legal/PolicyPageLayout';

export default function KvkkPage() {
  return (
    <PolicyPageLayout
      eyebrow="Güven Merkezi"
      title="KVKK Aydınlatma Metni"
      description="Kişisel verilerinizin işlenmesi, saklanması ve haklarınızla ilgili özet bilgilendirme. Detaylar için destek hattımızla görüşebilirsiniz."
      tags={['Veri Ä°şleme', 'Aydınlatma', 'Haklar']}
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
                href="/cookies"
                className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] px-4 py-2 text-[var(--foreground)] transition hover:bg-[var(--surface)]"
              >
                Çerez Politikası
              </Link>
              <Link
                href="/payment-security"
                className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] px-4 py-2 text-[var(--foreground)] transition hover:bg-[var(--surface)]"
              >
                Ödeme Güvenliği
              </Link>
            </div>
          </PolicyCard>

          <PolicyCard title="Başvuru">
            <p>KVKK kapsamında talep ve başvurularınızı destek hattı üzerinden iletebilirsiniz.</p>
            <Link
              href="/contact?subject=KVKK+Basvuru"
              className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-slate-800"
            >
              Başvuru yap
            </Link>
          </PolicyCard>
        </>
      }
    >
      <PolicyCard title="Ä°şlenen veri kategorileri">
        <ul className="list-disc space-y-2 pl-5">
          <li>Kimlik ve iletişim bilgileri (ad, e-posta, telefon).</li>
          <li>Sipariş ve teslimat bilgileri (adres, ürün, fatura).</li>
          <li>Ä°şlem güvenliği kayıtları (oturum, log, teknik kayıtlar).</li>
        </ul>
      </PolicyCard>

      <PolicyCard title="Ä°şleme amaçları">
        <ul className="list-disc space-y-2 pl-5">
          <li>Siparişin oluşturulması, ödeme ve teslimat sürecinin yürütülmesi.</li>
          <li>Garanti, iade ve teknik destek süreçlerinin yürütülmesi.</li>
          <li>Yasal yükümlülüklerin yerine getirilmesi ve dolandırıcılık önleme.</li>
        </ul>
      </PolicyCard>

      <PolicyCard title="Haklarınız">
        <ul className="list-disc space-y-2 pl-5">
          <li>Kişisel verilerin işlenip işlenmediğini öğrenme.</li>
          <li>Eksik veya yanlış işlenen verilerin düzeltilmesini talep etme.</li>
          <li>Mevzuata uygun ise silinmesini veya anonimleştirilmesini isteme.</li>
        </ul>
      </PolicyCard>
    </PolicyPageLayout>
  );
}

