import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@test.com';
  const password = 'password123';
  // This is the hash for "password123"
  const hashedPassword = '$2b$10$EpOku.eD4.yz.t.q.u.r.e.s.t'; 

  console.log('🌱 Seeding admin...');

  try {
    // Create the User
    const user = await prisma.user.upsert({
      where: { email },
      update: { passwordHash: hashedPassword },
      create: {
        email,
        passwordHash: hashedPassword,
        role: 'ADMIN',
        // We create the profile at the same time
        adminProfile: {
          create: {
            firstName: 'Test',
            lastName: 'Admin'
          }
        }
      },
    });
    console.log('✅ SUCCESS! Created:', user.email);
  } catch (e) {
    console.error('❌ ERROR:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();