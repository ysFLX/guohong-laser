export type CapacitySlot = {
  title: string;
  status: string;
  detail: string;
  window: string;
  icon?: string;
};

export type PriceAlertStep = {
  text: string;
  icon?: string;
};

export type ProcurementStep = {
  title: string;
  description: string;
  icon?: string;
};

export type HomePanelConfig = {
  capacitySchedule: CapacitySlot[];
  priceAlertSteps: PriceAlertStep[];
  procurementFlow: ProcurementStep[];
  capacityImageUrl?: string;
  priceAlertImageUrl?: string;
  procurementImageUrl?: string;
};

export const homePanelDefaults: HomePanelConfig = {
  capacitySchedule: [
    {
      title: 'Bu hafta',
      status: '%78 dolu',
      detail: '2 uygun keşif slotu',
      window: '12-14 Ocak',
      icon: 'building',
    },
    {
      title: 'Gelecek hafta',
      status: '%52 dolu',
      detail: 'Yeni kurulum planları',
      window: '19-23 Ocak',
      icon: 'calendar',
    },
    {
      title: 'Ön rezervasyon',
      status: 'Kurumsal',
      detail: 'Öncelikli proje takvimi',
      window: 'Planlı',
      icon: 'shield-check',
    },
  ],
  priceAlertSteps: [
    { text: 'Ürünü kaydet', icon: 'bookmark' },
    { text: 'Fiyat eşiğini belirle', icon: 'target' },
    { text: 'Düşüste e-posta bildirimi al', icon: 'mail' },
  ],
  procurementFlow: [
    {
      title: 'Teklif',
      description: 'Teklif detayları ve teslim planı oluşturulur.',
      icon: 'document',
    },
    {
      title: 'Onay',
      description: 'Teknik ve finans onayları tek panelde toparlanır.',
      icon: 'badge-check',
    },
    {
      title: 'Sözleşme',
      description: 'Maddeler ve garanti koşulları imzaya hazır.',
      icon: 'signature',
    },
    {
      title: 'Teslim',
      description: 'Kurulum takvimi ve kargo takibi netleşir.',
      icon: 'truck',
    },
  ],
  capacityImageUrl: '',
  priceAlertImageUrl: '',
  procurementImageUrl: '',
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export function normalizeHomePanelConfig(value: unknown): HomePanelConfig {
  if (!isRecord(value)) {
    return homePanelDefaults;
  }

  const capacitySchedule = Array.isArray(value.capacitySchedule)
    ? value.capacitySchedule
        .filter(isRecord)
        .map((item) => ({
          title: typeof item.title === 'string' ? item.title : '',
          status: typeof item.status === 'string' ? item.status : '',
          detail: typeof item.detail === 'string' ? item.detail : '',
          window: typeof item.window === 'string' ? item.window : '',
          icon: typeof item.icon === 'string' ? item.icon : undefined,
        }))
        .filter((item) => item.title && item.status)
    : homePanelDefaults.capacitySchedule;

  const priceAlertSteps = Array.isArray(value.priceAlertSteps)
    ? value.priceAlertSteps
        .map((step) => {
          if (typeof step === 'string') {
            return { text: step, icon: 'bell' };
          }
          if (isRecord(step)) {
            const text = typeof step.text === 'string' ? step.text : '';
            return { text, icon: typeof step.icon === 'string' ? step.icon : undefined };
          }
          return { text: '', icon: undefined };
        })
        .filter((step) => step.text.trim().length > 0)
    : homePanelDefaults.priceAlertSteps;

  const procurementFlow = Array.isArray(value.procurementFlow)
    ? value.procurementFlow
        .filter(isRecord)
        .map((item) => ({
          title: typeof item.title === 'string' ? item.title : '',
          description: typeof item.description === 'string' ? item.description : '',
          icon: typeof item.icon === 'string' ? item.icon : undefined,
        }))
        .filter((item) => item.title && item.description)
    : homePanelDefaults.procurementFlow;

  return {
    capacitySchedule: capacitySchedule.length > 0 ? capacitySchedule : homePanelDefaults.capacitySchedule,
    priceAlertSteps: priceAlertSteps.length > 0 ? priceAlertSteps : homePanelDefaults.priceAlertSteps,
    procurementFlow: procurementFlow.length > 0 ? procurementFlow : homePanelDefaults.procurementFlow,
    capacityImageUrl: typeof value.capacityImageUrl === 'string' ? value.capacityImageUrl : homePanelDefaults.capacityImageUrl,
    priceAlertImageUrl: typeof value.priceAlertImageUrl === 'string' ? value.priceAlertImageUrl : homePanelDefaults.priceAlertImageUrl,
    procurementImageUrl: typeof value.procurementImageUrl === 'string' ? value.procurementImageUrl : homePanelDefaults.procurementImageUrl,
  };
}

