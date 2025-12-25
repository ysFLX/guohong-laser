const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 12);
  await prisma.user.create({
    data: {
      email: 'asdasd@gmail.com',
      name: 'Test Kullanıcı',
      hashedPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  });
  console.log('Kullanıcı oluşturuldu!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());