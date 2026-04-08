import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Test verileri temizleniyor...');

  const result = await prisma.$transaction(async (tx) => {
    const inquiries = await tx.inquiry.deleteMany();
    const returnRequests = await tx.returnRequest.deleteMany();
    const cartReminders = await tx.cartReminder.deleteMany();
    const notifications = await tx.userNotification.deleteMany();
    const invoices = await tx.invoice.deleteMany();
    const orders = await tx.order.deleteMany();
    const inquiryOtps = await tx.inquiryOtp.deleteMany();
    const passwordResetTokens = await tx.passwordResetToken.deleteMany();
    const emailVerifications = await tx.emailVerification.deleteMany();

    return {
      inquiries: inquiries.count,
      returnRequests: returnRequests.count,
      cartReminders: cartReminders.count,
      notifications: notifications.count,
      invoices: invoices.count,
      orders: orders.count,
      inquiryOtps: inquiryOtps.count,
      passwordResetTokens: passwordResetTokens.count,
      emailVerifications: emailVerifications.count,
    };
  });

  console.log('Temizlik tamamlandi:');
  console.table(result);
}

main()
  .catch((error) => {
    console.error('Temizlik basarisiz:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
