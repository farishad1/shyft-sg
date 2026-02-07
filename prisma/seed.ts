import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';
import { AUTH_CONFIG } from '../src/lib/constants';

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Starting seed...');

    // Admin Credentials (from Prompt)
    // User: abeerfaris
    const adminEmail = 'abeerfaris@shyft.sg'; // Assuming email format
    // Password: v%£T9LZrE3£cS:*E0 (Must be hashed)
    const rawPassword = 'v%£T9LZrE3£cS:*E0';

    const passwordHash = await bcrypt.hash(rawPassword, AUTH_CONFIG.BCRYPT_SALT_ROUNDS);

    // Check if admin exists
    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
    });

    if (!existingAdmin) {
        console.log('Creating Admin User: abeerfaris...');

        await prisma.user.create({
            data: {
                email: adminEmail,
                passwordHash,
                role: 'ADMIN',
                adminProfile: {
                    create: {
                        firstName: 'Abeer',
                        lastName: 'Faris',
                        canVerifyUsers: true,
                        canBanUsers: true,
                        canViewFinancials: true,
                    },
                },
            },
        });
        console.log('✅ Admin created successfully.');
    } else {
        console.log('ℹ️ Admin user already exists. Skipping creation.');
    }

    // Seeding Test Data (Optional - useful for dev)
    // Add some test storage if needed

    console.log('🏁 Seed completed.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
