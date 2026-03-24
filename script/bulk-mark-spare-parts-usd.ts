import { prisma } from '@/lib/prisma';

type SparePartRow = {
  id: string;
  name: string;
  currency: string;
  priceCents: number;
};

async function main() {
  const isDryRun = process.argv.includes('--dry-run');

  const spareParts = (await prisma.sparePart.findMany({
    select: {
      id: true,
      name: true,
      currency: true,
      priceCents: true,
    },
    orderBy: { createdAt: 'asc' },
  })) as SparePartRow[];

  const targets = spareParts.filter((part) => {
    const currency = (part.currency || '').trim().toUpperCase();
    return currency === '' || currency === 'TRY';
  });

  console.log(`[bulk-mark-spare-parts-usd] total=${spareParts.length} target=${targets.length} dryRun=${isDryRun}`);

  if (targets.length === 0) {
    console.log('[bulk-mark-spare-parts-usd] Guncellenecek urun yok.');
    return;
  }

  for (const part of targets.slice(0, 10)) {
    console.log(
      `[preview] ${part.id} | ${part.name} | ${part.currency || 'EMPTY'} -> USD | ${(part.priceCents / 100).toFixed(2)}`,
    );
  }

  if (targets.length > 10) {
    console.log(`[preview] ... ve ${targets.length - 10} urun daha`);
  }

  if (isDryRun) {
    return;
  }

  const result = await prisma.sparePart.updateMany({
    where: {
      OR: [{ currency: 'TRY' }, { currency: '' }],
    },
    data: {
      currency: 'USD',
    },
  });

  console.log(`[bulk-mark-spare-parts-usd] updated=${result.count}`);
}

main()
  .catch((error) => {
    console.error('[bulk-mark-spare-parts-usd] failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
