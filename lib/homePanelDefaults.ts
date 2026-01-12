export type CapacitySlot = {
  title: string;
  status: string;
  detail: string;
  window: string;
};

export type ProcurementStep = {
  title: string;
  description: string;
};

export type HomePanelConfig = {
  capacitySchedule: CapacitySlot[];
  priceAlertSteps: string[];
  procurementFlow: ProcurementStep[];
};

export const homePanelDefaults: HomePanelConfig = {
  capacitySchedule: [
    {
      title: 'Bu hafta',
      status: '%78 dolu',
      detail: '2 uygun kesif slotu',
      window: '12-14 Ocak',
    },
    {
      title: 'Gelecek hafta',
      status: '%52 dolu',
      detail: 'Yeni kurulum planlari',
      window: '19-23 Ocak',
    },
    {
      title: 'On rezervasyon',
      status: 'Kurumsal',
      detail: 'Oncelikli proje takvimi',
      window: 'Planli',
    },
  ],
  priceAlertSteps: ['Urunu favorilere ekle', 'Fiyat esigi belirle', 'Dususte e-posta bildirimi al'],
  procurementFlow: [
    {
      title: 'Teklif',
      description: 'Teklif detaylari ve teslim plani olusturulur.',
    },
    {
      title: 'Onay',
      description: 'Teknik ve finans onaylari tek panelde toparlanir.',
    },
    {
      title: 'Sozlesme',
      description: 'Maddeler ve garanti kosullari imzaya hazir.',
    },
    {
      title: 'Teslim',
      description: 'Kurulum takvimi ve kargo takibi netlesir.',
    },
  ],
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
        }))
        .filter((item) => item.title && item.status)
    : homePanelDefaults.capacitySchedule;

  const priceAlertSteps = Array.isArray(value.priceAlertSteps)
    ? value.priceAlertSteps.filter((step) => typeof step === 'string' && step.trim().length > 0)
    : homePanelDefaults.priceAlertSteps;

  const procurementFlow = Array.isArray(value.procurementFlow)
    ? value.procurementFlow
        .filter(isRecord)
        .map((item) => ({
          title: typeof item.title === 'string' ? item.title : '',
          description: typeof item.description === 'string' ? item.description : '',
        }))
        .filter((item) => item.title && item.description)
    : homePanelDefaults.procurementFlow;

  return {
    capacitySchedule: capacitySchedule.length > 0 ? capacitySchedule : homePanelDefaults.capacitySchedule,
    priceAlertSteps: priceAlertSteps.length > 0 ? priceAlertSteps : homePanelDefaults.priceAlertSteps,
    procurementFlow: procurementFlow.length > 0 ? procurementFlow : homePanelDefaults.procurementFlow,
  };
}
