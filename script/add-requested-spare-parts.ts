import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type RequestedSparePart = {
  name: string;
  dimensions: string;
  category: string;
};

const PRICE_CENTS = 100_00;
const STOCK_ON_HAND = 20;

const requestedSpareParts: RequestedSparePart[] = [
  { name: 'Yansıtma Lens', dimensions: '30*14T2', category: 'Lens' },
  { name: 'Odak Lens', dimensions: 'D03010006', category: 'Lens' },
  { name: 'Üst Koruma Lens Çekmecesi', dimensions: 'Q0207AA', category: 'Lens' },
  { name: 'Odak Lens', dimensions: 'D03010014', category: 'Lens' },
  { name: 'Odak Lens', dimensions: 'D02010009', category: 'Lens' },
  { name: 'Koruma Lens', dimensions: 'D18T2 260423', category: 'Lens' },
  { name: 'Koruma Lens', dimensions: 'D18T2 260420', category: 'Lens' },
  { name: 'Koruma Lens', dimensions: 'D24.9T1.5 251101', category: 'Lens' },
  { name: 'Koruma Lens', dimensions: 'D37T7 10kW', category: 'Lens' },
  { name: 'Sızdırmaz Conta', dimensions: 'D340T5', category: 'Conta' },
  { name: 'Çarpışma Koruma Modülü', dimensions: 'Q0210AA', category: 'Lazer Kafası' },
  { name: 'Koruma Lens', dimensions: 'D01020009', category: 'Lens' },
  { name: 'Sızdırmaz Conta', dimensions: '21*15*2.7', category: 'Conta' },
  { name: 'Çarpışma Önleyici', dimensions: 'Q0210AA', category: 'Lazer Kafası' },
  { name: 'Koruma Lens', dimensions: 'D25T42P', category: 'Lens' },
  { name: 'Koruma Lens', dimensions: 'D340T52P 8kW', category: 'Lens' },
  { name: 'Alt Koruma Lens', dimensions: 'D340T52S 8kW', category: 'Lens' },
  { name: 'Koruma Lens', dimensions: 'D27.9*4.1 251116', category: 'Lens' },
  { name: 'Odak Lens Set', dimensions: 'D37F200', category: 'Lens' },
  { name: 'Odak Çekmece Ünitesi', dimensions: 'Q0247AA', category: 'Lens' },
];

function slugify(input: string) {
  return input
    .toLocaleLowerCase('tr-TR')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function skuFor(item: RequestedSparePart) {
  const base = slugify(`${item.name}-${item.dimensions}`).slice(0, 44);
  return `REQ-${base}`.toUpperCase();
}

async function getCategoryId(name: string) {
  const existing = await prisma.sparePartCategory.findFirst({
    where: { name },
    select: { id: true },
  });

  if (existing) return existing.id;

  const slug = slugify(name);
  const category = await prisma.sparePartCategory.upsert({
    where: { slug },
    create: { name, slug, isActive: true },
    update: { name, isActive: true },
    select: { id: true },
  });

  return category.id;
}

async function main() {
  const categoryIdByName = new Map<string, string>();
  let created = 0;
  let updated = 0;

  for (const item of requestedSpareParts) {
    if (!categoryIdByName.has(item.category)) {
      categoryIdByName.set(item.category, await getCategoryId(item.category));
    }

    const categoryId = categoryIdByName.get(item.category);
    if (!categoryId) throw new Error(`Kategori bulunamadı: ${item.category}`);

    const sku = skuFor(item);
    const existing = await prisma.sparePart.findUnique({
      where: { sku },
      select: { id: true },
    });

    const sparePart = await prisma.sparePart.upsert({
      where: { sku },
      create: {
        sku,
        name: item.name,
        description: `${item.name} (${item.dimensions}) için yedek parça.`,
        dimensions: item.dimensions,
        hasSizeOptions: false,
        sizeOptions: [],
        sizeOptionPrices: {},
        sizeOptionImages: {},
        priceCents: PRICE_CENTS,
        currency: 'TRY',
        imageUrl: null,
        isFeatured: false,
        isActive: true,
        stockOnHand: STOCK_ON_HAND,
        categoryId,
      },
      update: {
        name: item.name,
        description: `${item.name} (${item.dimensions}) için yedek parça.`,
        dimensions: item.dimensions,
        hasSizeOptions: false,
        sizeOptions: [],
        sizeOptionPrices: {},
        sizeOptionImages: {},
        priceCents: PRICE_CENTS,
        currency: 'TRY',
        isActive: true,
        stockOnHand: STOCK_ON_HAND,
        categoryId,
      },
      select: { id: true },
    });

    const initialStock = await prisma.stockMovement.findFirst({
      where: {
        sparePartId: sparePart.id,
        reason: 'INITIAL',
        note: 'requested-spare-parts',
      },
      select: { id: true, delta: true },
    });

    if (!initialStock) {
      await prisma.stockMovement.create({
        data: {
          sparePartId: sparePart.id,
          delta: STOCK_ON_HAND,
          reason: 'INITIAL',
          note: 'requested-spare-parts',
        },
      });
    } else if (initialStock.delta !== STOCK_ON_HAND) {
      await prisma.stockMovement.update({
        where: { id: initialStock.id },
        data: { delta: STOCK_ON_HAND },
      });
    }

    if (existing) {
      updated += 1;
    } else {
      created += 1;
    }
  }

  console.log(`Requested spare parts synced. created=${created} updated=${updated} total=${requestedSpareParts.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
