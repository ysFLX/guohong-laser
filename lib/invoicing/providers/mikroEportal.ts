import type { InvoiceIssueResult, InvoiceSnapshot } from '@/lib/invoicing/types';

export async function issueInvoiceWithMikroEportal(snapshot: InvoiceSnapshot): Promise<InvoiceIssueResult> {
  void snapshot;
  // Mikro e-Portal/MikroAPI entegrasyonu cogu kurulumda yerel agda (orn. https://localhost:8094) calisir.
  // Vercel/Serverless ortamindan bu adrese erisim mumkun olmayacagi icin bu projede connector yaklasimi kullaniliyor.
  throw new Error('Mikro otomatik fatura icin connector gerekli: `script/mikro-invoice-connector.ts`');
}
