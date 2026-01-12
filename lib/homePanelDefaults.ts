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
      detail: '2 uygun kesif slotu',
      window: '12-14 Ocak',
      icon: 'clock',
    },
    {
      title: 'Gelecek hafta',
      status: '%52 dolu',
      detail: 'Yeni kurulum planlari',
      window: '19-23 Ocak',
      icon: 'calendar',
    },
    {
      title: 'On rezervasyon',
      status: 'Kurumsal',
      detail: 'Oncelikli proje takvimi',
      window: 'Planli',
      icon: 'shield',
    },
  ],
  priceAlertSteps: [
    { text: 'Urunu favorilere ekle', icon: 'heart' },
    { text: 'Fiyat esigi belirle', icon: 'target' },
    { text: 'Dususte e-posta bildirimi al', icon: 'bell' },
  ],
  procurementFlow: [
    {
      title: 'Teklif',
      description: 'Teklif detaylari ve teslim plani olusturulur.',
      icon: 'file',
    },
    {
      title: 'Onay',
      description: 'Teknik ve finans onaylari tek panelde toparlanir.',
      icon: 'check',
    },
    {
      title: 'Sozlesme',
      description: 'Maddeler ve garanti kosullari imzaya hazir.',
      icon: 'signature',
    },
    {
      title: 'Teslim',
      description: 'Kurulum takvimi ve kargo takibi netlesir.',
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
