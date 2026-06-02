import 'dotenv/config';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  if (process.env.CONFIRM_CLEAR_ORDERS !== '1') {
    throw new Error('CONFIRM_CLEAR_ORDERS=1 olmadan siparis temizligi calismaz.');
  }

  const result = await prisma.$transaction(async (tx) => {
    const orderNotifications = await tx.userNotification.deleteMany({
      where: {
        orderId: {
          not: null,
        },
      },
    });

    const orders = await tx.order.deleteMany();

    return {
      orders: orders.count,
      orderNotifications: orderNotifications.count,
    };
  });

  console.log('Siparis temizligi tamamlandi:');
  console.table(result);
}

main()
  .catch((error) => {
    console.error('Siparis temizligi basarisiz:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
