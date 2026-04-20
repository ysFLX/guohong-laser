import type { InvoiceIssueResult, InvoiceProvider, InvoiceSnapshot } from '@/lib/invoicing/types';

import { issueInvoiceWithMikroEportal } from '@/lib/invoicing/providers/mikroEportal';

export async function issueInvoiceWithProvider(params: {
  provider: InvoiceProvider;
  snapshot: InvoiceSnapshot;
}): Promise<InvoiceIssueResult> {
  if (params.provider === 'MIKRO_EPORTAL') {
    return issueInvoiceWithMikroEportal(params.snapshot);
  }

  const neverProvider: never = params.provider;
  throw new Error(`Desteklenmeyen fatura sağlayıcısı: ${neverProvider}`);
}


