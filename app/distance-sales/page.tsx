import Link from 'next/link';

import PolicyCard from '@/components/legal/PolicyCard';
import PolicyPageLayout from '@/components/legal/PolicyPageLayout';

export default function DistanceSalesPage() {
  return (
    <PolicyPageLayout
      eyebrow="Güven Merkezi"
      title="Mesafeli Satış Sözleşmesi"
      description="Bu sayfa bilgilendirme amaçlıdır. Satışa konu ürün, teslimat ve cayma hakkı koşulları sipariş öncesi onay adımında özetlenir."
      tags={['Sipariş onayı', 'Cayma hakkı', 'Teslimat şartları']}
      sidebar={
        <>
          <PolicyCard title="Hızlı bağlantılar">
            <div className="grid gap-2">
              <Link href="/returns" className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] px-4 py-2 text-[var(--foreground)] transition hover:bg-[var(--surface)]">
                Ä°ade ve garanti
              </Link>
              <Link href="/shipping" className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] px-4 py-2 text-[var(--foreground)] transition hover:bg-[var(--surface)]">
                Kargo ve teslimat
              </Link>
              <Link href="/payment-security" className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] px-4 py-2 text-[var(--foreground)] transition hover:bg-[var(--surface)]">
                Ödeme güvenliği
              </Link>
              <Link href="/privacy" className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] px-4 py-2 text-[var(--foreground)] transition hover:bg-[var(--surface)]">
                Gizlilik politikası
              </Link>
            </div>
          </PolicyCard>

          <PolicyCard title="Destek ihtiyacı">
            <p>Sözleşmelerle ilgili soruların için destek hattımız yardımcı olur.</p>
            <Link href="/contact?subject=Mesafeli+Satis" className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-slate-800">
              Ä°letişim kur
            </Link>
          </PolicyCard>
        </>
      }
    >
      <PolicyCard title="Taraflar ve konu">
        <ul className="list-disc space-y-2 pl-5">
          <li>Satıcı: Guohong Lazer - sipariş öncesi iletişim bilgilerimiz sürekli görüntülenir.</li>
          <li>Alıcı: Sipariş esnasında beyan ettiğiniz kullanıcı ve teslimat bilgileri esas alınır.</li>
          <li>Konu: Ürünlerin satışı, teslimatı ve satış sonrası yükümlülükler.</li>
        </ul>
      </PolicyCard>

      <PolicyCard title="Teslimat ve ödeme">
        <ul className="list-disc space-y-2 pl-5">
          <li>Teslimat süresi stok ve kargo durumu ile sipariş öncesi bildirilir.</li>
          <li>Ödeme, güvenli altyapı ile alınır ve ödeme onayı ardından sipariş hazırlanır.</li>
          <li>Fatura bilgileri sipariş sırasında talep edilir ve e-posta ile paylaşılır.</li>
        </ul>
      </PolicyCard>

      <PolicyCard title="Cayma hakkı ve iade">
        <ul className="list-disc space-y-2 pl-5">
          <li>Cayma hakkı kapsamındaki iade koşulları ürün grubuna göre değişebilir.</li>
          <li>Özel üretim, kişiselleştirilmiş veya kurulumlu ürünlerde farklı koşullar uygulanır.</li>
          <li>Ä°ade süreci için destek ekibimizle iletişime geçilmelidir.</li>
        </ul>
      </PolicyCard>
    </PolicyPageLayout>
  );
}

