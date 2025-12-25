import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
type SeedSparePartCategoryDelegate = {
  upsert: (args: unknown) => Promise<{ id: string }>;
};

type SeedSparePartDelegate = {
  upsert: (args: unknown) => Promise<{ id: string }>;
};

type SeedStockMovement = { id: string; delta: number };

type SeedStockMovementDelegate = {
  findFirst: (args: unknown) => Promise<SeedStockMovement | null>;
  create: (args: unknown) => Promise<unknown>;
  update: (args: unknown) => Promise<unknown>;
};

const prismaSeed = prisma as unknown as {
  sparePartCategory: SeedSparePartCategoryDelegate;
  sparePart: SeedSparePartDelegate;
  stockMovement: SeedStockMovementDelegate;
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function priceToCents(price: number) {
  return Math.round(price * 100);
}

function seedSku(name: string, index?: number) {
  const base = slugify(name).slice(0, 40) || "item";
  return `SEED-${base}${typeof index === "number" ? `-${index}` : ""}`.toUpperCase();
}

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (email && password) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
      const hashedPassword = await bcrypt.hash(password, 12);

      await prisma.user.create({
        data: {
          email,
          name: "Admin",
          hashedPassword,
          role: "ADMIN",
          emailVerified: new Date(),
        },
      });
    }
  }

  const categories = [
    "Conta",
    "Nozul",
    "Lens",
    "Yazılım",
    "Kumanda",
    "Lazer Kafası",
    "Vida",
  ];

  const categoryIdByName = new Map<string, string>();
  for (const name of categories) {
    const slug = slugify(name);
    const cat = await prismaSeed.sparePartCategory.upsert({
      where: { slug },
      create: { name, slug, isActive: true },
      update: { name, isActive: true },
    });
    categoryIdByName.set(name, cat.id);
  }

  const baseItems: Array<{
    name: string;
    variants: number;
    category: string;
    price: number;
    stock: number;
    featuredVariants: number;
  }> = [
    { name: "Seramik Conta (Halka)", variants: 4, category: "Conta", price: 499.99, stock: 50, featuredVariants: 1 },
    { name: "Seramik Conta", variants: 2, category: "Conta", price: 399.99, stock: 50, featuredVariants: 1 },
    { name: "Lazer Nozul", variants: 2, category: "Nozul", price: 799.99, stock: 50, featuredVariants: 1 },
    { name: "BOCI BLT310", variants: 1, category: "Conta", price: 699.99, stock: 50, featuredVariants: 1 },
    { name: "Seramik M16 1", variants: 1, category: "Conta", price: 299.99, stock: 50, featuredVariants: 1 },
    { name: "Koruma Lens", variants: 1, category: "Lens", price: 1299.99, stock: 20, featuredVariants: 1 },
    { name: "BOCHU 2D NESTING", variants: 1, category: "Yazılım", price: 1299.99, stock: 20, featuredVariants: 1 },
    { name: "Uzaktan Kumanda", variants: 1, category: "Kumanda", price: 1699.99, stock: 20, featuredVariants: 1 },
    { name: "Üst Düzey Lens Temizleme Kağıdı", variants: 1, category: "Lens", price: 999.99, stock: 20, featuredVariants: 1 },
    { name: "NSX NC30E", variants: 1, category: "Lazer Kafası", price: 1199.99, stock: 20, featuredVariants: 1 },
    { name: "Çarpmaya Dayanıklı Vida", variants: 1, category: "Vida", price: 299.99, stock: 20, featuredVariants: 1 },
  ];

  for (const item of baseItems) {
    const categoryId = categoryIdByName.get(item.category);
    if (!categoryId) {
      throw new Error(`Kategori bulunamadı: ${item.category}`);
    }

    for (let i = 1; i <= item.variants; i++) {
      const isFeatured = i <= item.featuredVariants;
      const variantName = item.variants === 1 ? item.name : `${item.name} - Varyant ${i}`;
      const sku = seedSku(item.name, item.variants === 1 ? undefined : i);

      const sparePart = await prismaSeed.sparePart.upsert({
        where: { sku },
        create: {
          sku,
          name: variantName,
          description: `${item.name} için yedek parça. Uyum/ölçü bilgisi için bizimle iletişime geçebilirsiniz.`,
          dimensions: null,
          priceCents: priceToCents(item.price),
          currency: "TRY",
          imageUrl: null,
          isFeatured,
          isActive: true,
          stockOnHand: item.stock,
          categoryId,
        },
        update: {
          name: variantName,
          priceCents: priceToCents(item.price),
          currency: "TRY",
          imageUrl: null,
          isFeatured,
          isActive: true,
          stockOnHand: item.stock,
          categoryId,
        },
      });

      const existingInitial = await prismaSeed.stockMovement.findFirst({
        where: {
          sparePartId: sparePart.id,
          reason: "INITIAL",
          note: "seed-initial",
        },
      });

      if (!existingInitial) {
        await prismaSeed.stockMovement.create({
          data: {
            sparePartId: sparePart.id,
            delta: item.stock,
            reason: "INITIAL",
            note: "seed-initial",
          },
        });
      } else if (existingInitial.delta !== item.stock) {
        await prismaSeed.stockMovement.update({
          where: { id: existingInitial.id },
          data: { delta: item.stock },
        });
      }
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
