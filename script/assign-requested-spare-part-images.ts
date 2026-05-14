import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type Assignment = {
  productNames: string[];
  labels: string[];
  imageUrls: string[];
};

const IMAGE_BASE = '/images/spare-parts/requested';

const assignments: Assignment[] = [
  {
    productNames: ['Koruma Lens'],
    labels: ['D18T2 260423', 'D18*2', 'D18T2'],
    imageUrls: [`${IMAGE_BASE}/img_0130.jpg`],
  },
  {
    productNames: ['Koruma Lens'],
    labels: ['D18T2 260420', 'D18*2', 'D18T2'],
    imageUrls: [`${IMAGE_BASE}/img_0131.jpg`, `${IMAGE_BASE}/img_0132.jpg`],
  },
  {
    productNames: ['Koruma Lens'],
    labels: ['D24.9T1.5', 'D24.9*1.5', 'D24.9T1.5 251101'],
    imageUrls: [`${IMAGE_BASE}/img_0309.jpg`, `${IMAGE_BASE}/img_0315.jpg`],
  },
  {
    productNames: ['Koruma Lens'],
    labels: ['D27.9*4.1', 'D27.9T4.1', 'D27.9*4.1 251116'],
    imageUrls: [
      `${IMAGE_BASE}/img_0278.jpg`,
      `${IMAGE_BASE}/img_0279.jpg`,
      `${IMAGE_BASE}/img_0282.jpg`,
      `${IMAGE_BASE}/img_0300.jpg`,
      `${IMAGE_BASE}/img_0306.jpg`,
      `${IMAGE_BASE}/img_0307.jpg`,
    ],
  },
  {
    productNames: ['Koruma Lens', 'Sızdırmaz Conta', 'Alt Koruma Lens'],
    labels: ['D34*5', 'D34T5', 'D340T5', 'D340T52P', 'D340T52S', 'D34.0T5.2P', 'D34.0T5.2S'],
    imageUrls: [
      `${IMAGE_BASE}/img_0134.jpg`,
      `${IMAGE_BASE}/img_0136.jpg`,
      `${IMAGE_BASE}/img_0281.jpg`,
      `${IMAGE_BASE}/img_0283.jpg`,
      `${IMAGE_BASE}/img_0308.jpg`,
      `${IMAGE_BASE}/img_0313.jpg`,
      `${IMAGE_BASE}/img_0314.jpg`,
    ],
  },
  {
    productNames: ['Koruma Lens'],
    labels: ['D37T7', 'D37*7', 'D37T7 10kW'],
    imageUrls: [
      `${IMAGE_BASE}/37x720kw.jpg`,
      `${IMAGE_BASE}/img_0284.jpg`,
      `${IMAGE_BASE}/img_0299.jpg`,
      `${IMAGE_BASE}/img_0301.jpg`,
      `${IMAGE_BASE}/img_0310.jpg`,
      `${IMAGE_BASE}/img_0311.jpg`,
      `${IMAGE_BASE}/img_0312.jpg`,
    ],
  },
  {
    productNames: ['Koruma Lens'],
    labels: ['D30*5', 'D30T5'],
    imageUrls: [`${IMAGE_BASE}/img_0138.jpg`],
  },
  {
    productNames: ['Çarpışma Koruma Modülü', 'Çarpışma Önleyici'],
    labels: ['Q0210AA', 'DP.M.Q0210AA'],
    imageUrls: [
      `${IMAGE_BASE}/img_0229.jpg`,
      `${IMAGE_BASE}/img_0230.jpg`,
      `${IMAGE_BASE}/img_0231.jpg`,
      `${IMAGE_BASE}/img_0232.jpg`,
    ],
  },
];

function normalize(value: string) {
  return value
    .toLocaleLowerCase('tr-TR')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/kw/g, '')
    .replace(/[^a-z0-9]+/g, '');
}

function uniq(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function hasNameMatch(partName: string, productNames: string[]) {
  const normalizedPartName = normalize(partName);
  return productNames.some((name) => normalizedPartName.includes(normalize(name)));
}

function hasLabelMatch(value: string | null | undefined, labels: string[]) {
  if (!value) return false;
  const normalizedValue = normalize(value);
  return labels.some((label) => {
    const normalizedLabel = normalize(label);
    return normalizedValue.includes(normalizedLabel) || normalizedLabel.includes(normalizedValue);
  });
}

function normalizeImageMap(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {} as Record<string, string[]>;

  const result: Record<string, string[]> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    const urls = Array.isArray(raw) ? raw : typeof raw === 'string' ? [raw] : [];
    const cleanUrls = uniq(urls.filter((url): url is string => typeof url === 'string').map((url) => url.trim()));
    if (cleanUrls.length > 0) result[key] = cleanUrls;
  }
  return result;
}

async function syncGalleryImages(sparePartId: string, imageUrls: string[]) {
  const existing = await prisma.sparePartImage.findMany({
    where: { sparePartId },
    select: { url: true },
  });
  const existingUrls = new Set(existing.map((item) => item.url));

  let created = 0;
  for (const url of imageUrls) {
    if (existingUrls.has(url)) continue;
    await prisma.sparePartImage.create({
      data: { sparePartId, url },
    });
    created += 1;
  }
  return created;
}

async function main() {
  const parts = await prisma.sparePart.findMany({
    select: {
      id: true,
      name: true,
      dimensions: true,
      imageUrl: true,
      hasSizeOptions: true,
      sizeOptions: true,
      sizeOptionImages: true,
    },
    orderBy: { name: 'asc' },
  });

  let updatedParts = 0;
  let addedGalleryImages = 0;
  const missing: string[] = [];

  for (const assignment of assignments) {
    const candidates = parts.filter((part) => hasNameMatch(part.name, assignment.productNames));
    const matchedParts = candidates.filter((part) => {
      if (part.sizeOptions.some((option) => hasLabelMatch(option, assignment.labels))) return true;
      return hasLabelMatch(part.dimensions, assignment.labels);
    });

    if (matchedParts.length === 0) {
      missing.push(`${assignment.productNames.join(' / ')} (${assignment.labels[0]})`);
      continue;
    }

    for (const part of matchedParts) {
      const data: {
        imageUrl?: string;
        sizeOptionImages?: Record<string, string[]>;
      } = {};

      if (!part.imageUrl) {
        data.imageUrl = assignment.imageUrls[0];
      }

      if (part.sizeOptions.length > 0) {
        const nextImageMap = normalizeImageMap(part.sizeOptionImages);
        let touchedSize = false;

        for (const option of part.sizeOptions) {
          if (!hasLabelMatch(option, assignment.labels)) continue;
          nextImageMap[option] = uniq([...(nextImageMap[option] ?? []), ...assignment.imageUrls]);
          touchedSize = true;
        }

        if (touchedSize) {
          data.sizeOptionImages = nextImageMap;
        }
      }

      if (Object.keys(data).length > 0) {
        await prisma.sparePart.update({
          where: { id: part.id },
          data,
        });
        updatedParts += 1;
      }

      addedGalleryImages += await syncGalleryImages(part.id, assignment.imageUrls);
    }
  }

  console.log(`Spare part images synced. updatedParts=${updatedParts} addedGalleryImages=${addedGalleryImages}`);
  if (missing.length > 0) {
    console.log('No matching product/size found for:');
    for (const item of missing) console.log(`- ${item}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
