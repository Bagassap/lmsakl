/**
 * Local dev helper — creates/updates a single ADMIN user for testing.
 *   npx tsx scripts/create-local-admin.ts <email> <password> [nama]
 */
import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const [email, password, nama] = process.argv.slice(2);
  if (!email || !password) {
    console.error('Usage: npx tsx scripts/create-local-admin.ts <email> <password> [nama]');
    process.exit(1);
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hashed, role: 'ADMIN', isActive: true },
    create: {
      email,
      password: hashed,
      nama: nama || 'Admin Lokal',
      role: 'ADMIN',
      isActive: true,
      mustChangePassword: false,
      profileCompleted: true,
    },
  });

  console.log(`Admin siap: ${user.email} (id: ${user.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
