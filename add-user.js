/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = 'guohonglasersite@gmail.com';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Bu e-posta ile kullanıcı zaten mevcut:', existing.email);
    return;
  }

  const hashedPassword = await bcrypt.hash('Guohong2025.', 12);
  const user = await prisma.user.create({
    data: {
      email,
      name: 'Guohong Admin',
      hashedPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  });
  console.log('Admin kullanıcısı oluşturuldu:', user.email, '| Rol:', user.role);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
