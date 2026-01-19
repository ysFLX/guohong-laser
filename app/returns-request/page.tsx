import ReturnsRequestClient from './returns-request-client';

type ReturnsRequestPageProps = {
  searchParams?: { orderId?: string; itemName?: string };
};

export const dynamic = 'force-dynamic';

export default function ReturnsRequestPage({ searchParams }: ReturnsRequestPageProps) {
  const orderIdParam = typeof searchParams?.orderId === 'string' ? searchParams.orderId : '';
  const itemNameParam = typeof searchParams?.itemName === 'string' ? searchParams.itemName : '';

  return <ReturnsRequestClient orderIdParam={orderIdParam} itemNameParam={itemNameParam} />;
}
