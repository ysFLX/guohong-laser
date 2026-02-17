export type AddressInvoiceType = 'INDIVIDUAL' | 'COMPANY';

export type InvoiceProvider = 'MIKRO_EPORTAL';

export type InvoiceStatus = 'PENDING' | 'PROCESSING' | 'ISSUED' | 'FAILED';

export type InvoiceSnapshot = {
  order: {
    id: string;
    createdAt: string;
    status: string;
    totalCents: number;
    currency: string;
  };
  customer: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
  };
  items: Array<{
    sku: string | null;
    name: string;
    quantity: number;
    priceCents: number;
  }>;
  shippingAddress: {
    label: string | null;
    fullName: string | null;
    phone: string | null;
    line1: string | null;
    line2: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    country: string | null;
  } | null;
  billingAddress: {
    label: string | null;
    fullName: string | null;
    phone: string | null;
    line1: string | null;
    line2: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    country: string | null;
    invoiceType: AddressInvoiceType;
    companyName: string | null;
    taxOffice: string | null;
    taxNumber: string | null;
    identityNumber: string | null;
  } | null;
};

export type InvoiceIssueResult = {
  invoiceNumber?: string | null;
  ettn?: string | null;
  pdfBuffer?: Buffer | null;
  xmlBuffer?: Buffer | null;
  providerPayload?: unknown;
};
