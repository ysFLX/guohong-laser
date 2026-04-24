export type OrderFulfillmentType = 'SHIPPING' | 'PICKUP';

export function normalizeFulfillmentType(value: string | null | undefined): OrderFulfillmentType {
  return value === 'PICKUP' ? 'PICKUP' : 'SHIPPING';
}

export function formatFulfillmentTypeTr(value: string | null | undefined) {
  return normalizeFulfillmentType(value) === 'PICKUP' ? 'Gel Al' : 'Kargo';
}

export function getOrderStatusLabelTr(status: string, fulfillmentType: string | null | undefined) {
  const type = normalizeFulfillmentType(fulfillmentType);
  if (type === 'PICKUP') {
    switch (status) {
      case 'RECEIVED':
      case 'PAID':
      case 'PENDING':
      case 'FAILED':
        return 'Sipariş alındı';
      case 'IN_TRANSIT':
        return 'Hazırlanıyor';
      case 'SHIPPED':
        return 'Gel al hazır';
      case 'DELIVERED':
        return 'Teslim alındı';
      case 'CANCELED':
        return 'İptal';
      default:
        return status;
    }
  }

  switch (status) {
    case 'RECEIVED':
    case 'PAID':
    case 'PENDING':
    case 'FAILED':
      return 'Sipariş alındı';
    case 'IN_TRANSIT':
      return 'Sipariş hazırlanıyor';
    case 'SHIPPED':
      return 'Kargoya verildi';
    case 'DELIVERED':
      return 'Teslim edildi';
    case 'CANCELED':
      return 'İptal';
    default:
      return status;
  }
}

export function getOrderProgressStepsTr(fulfillmentType: string | null | undefined) {
  if (normalizeFulfillmentType(fulfillmentType) === 'PICKUP') {
    return [
      { key: 'RECEIVED', label: 'Siparişiniz alındı' },
      { key: 'IN_TRANSIT', label: 'Siparişiniz hazırlanıyor' },
      { key: 'SHIPPED', label: 'Gel al hazır' },
      { key: 'DELIVERED', label: 'Teslim alındı' },
    ];
  }

  return [
    { key: 'RECEIVED', label: 'Siparişiniz alındı' },
    { key: 'IN_TRANSIT', label: 'Siparişiniz hazırlanıyor' },
    { key: 'SHIPPED', label: 'Kargoya verildi' },
    { key: 'DELIVERED', label: 'Teslim edildi' },
  ];
}
