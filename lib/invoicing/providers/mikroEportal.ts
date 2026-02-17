import type { InvoiceIssueResult, InvoiceSnapshot } from '@/lib/invoicing/types';

export async function issueInvoiceWithMikroEportal(_snapshot: InvoiceSnapshot): Promise<InvoiceIssueResult> {
  // Mikro e-Portal/MikroAPI entegrasyonu çoğu kurulumda yerel ağda (örn. https://localhost:8094) çalışır.
  // Vercel/Serverless ortamından bu adrese erişim mümkün olmayacağı için bu projede "connector" yaklaşımı kullanıyoruz:
  // - Vercel: invoice kaydını PENDING olarak kuyruklar.
  // - Ofiste/ERP'ye erişebilen bir makine: `script/mikro-invoice-connector.ts` ile faturayı MikroAPI üzerinden keser,
  //   PDF/XML çıktısını tekrar bu uygulamaya yükler.
  //
  // Hedef davranış:
  // - snapshot'tan UBL-TR e-Fatura / e-Arşiv verisini oluştur (veya Mikro'nun beklediği JSON)
  // - Mikro e-Portal API ile "belge oluştur" çağrısı yap
  // - Dönen ETTN / belge no gibi metaları kaydet
  // - PDF ve XML çıktısını alıp döndür
  //
  // Şimdilik, server-side direkt entegrasyon yok (connector kullanılmalı).
  throw new Error('Mikro otomatik fatura için connector gerekli: `script/mikro-invoice-connector.ts`');
}
