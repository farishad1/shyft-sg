import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcrypt';
import { AUTH_CONFIG } from '../src/lib/constants';

// 1. Initialize the Driver Adapter (Mandatory for Prisma 7 standalone scripts)
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error('❌ DATABASE_URL is not set. Check your .env file.');
    process.exit(1);
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Starting seed...');
    console.log(`🔌 DB: ${connectionString.replace(/:[^@]+@/, ':****@').substring(0, 50)}...`);

    // -----------------------------------
    // 1. Admin User
    // -----------------------------------
    const adminEmail = 'abeerfaris@shyft.sg';
    const rawPassword = 'v%£T9LZrE3£cS:*E0';
    const passwordHash = await bcrypt.hash(rawPassword, AUTH_CONFIG?.BCRYPT_SALT_ROUNDS || 10);

    await prisma.user.upsert({
        where: { email: adminEmail },
        update: { passwordHash },
        create: {
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
    console.log('✅ Admin verified: abeerfaris@shyft.sg');

    // -----------------------------------
    // 2. Demo Hotels
    // -----------------------------------
    const demoHotels = [
        {
            email: 'warehouse@shyft.sg',
            name: 'The Warehouse Hotel',
            uen: '201700001A',
            location: '320 Havelock Road, Singapore',
            description: 'A meticulously restored heritage building in a former godown on the banks of the Singapore River.',
            tier: 'PLATINUM' as const,
            latitude: 1.2866,
            longitude: 103.8395,
        },
        {
            email: 'lloyds@shyft.sg',
            name: "Lloyd's Inn",
            uen: '201700002B',
            location: '2 Lloyd Road, Singapore',
            description: 'A raw and minimalist boutique hotel tucked away in a quiet corner of Orchard Road.',
            tier: 'GOLD' as const,
            latitude: 1.2963,
            longitude: 103.8396,
        },
        {
            email: 'kinn@shyft.sg',
            name: 'Kinn Capsule Hotel',
            uen: '201700003C',
            location: '39 South Bridge Road, Singapore',
            description: 'Experience futuristic living in the heart of Boat Quay.',
            tier: 'SILVER' as const,
            latitude: 1.2887,
            longitude: 103.8491,
        },
    ];

    console.log('🏨 Seeding Demo Hotels...');

    for (const hotel of demoHotels) {
        const user = await prisma.user.upsert({
            where: { email: hotel.email },
            update: { passwordHash },
            create: {
                email: hotel.email,
                passwordHash,
                role: 'HOTEL',
            },
        });

        const profile = await prisma.hotelProfile.upsert({
            where: { userId: user.id },
            update: {
                hotelName: hotel.name,
                location: hotel.location,
                description: hotel.description,
                verificationStatus: 'VERIFIED',
                tier: hotel.tier,
                latitude: hotel.latitude,
                longitude: hotel.longitude,
            },
            create: {
                userId: user.id,
                hotelName: hotel.name,
                uen: hotel.uen,
                location: hotel.location,
                description: hotel.description,
                verificationStatus: 'VERIFIED',
                tier: hotel.tier,
                latitude: hotel.latitude,
                longitude: hotel.longitude,
            },
        });

        console.log(`    ✅ ${hotel.name} (${hotel.tier})`);

        // Cleanup existing mock shifts to avoid duplicates
        await prisma.jobPosting.deleteMany({
            where: { hotelId: profile.id, shiftDate: { gt: new Date() } },
        });

        const positions = ['Front Desk Agent', 'Housekeeping', 'Barista', 'Night Audit', 'Bellhop', 'Concierge'];

        for (let i = 0; i < 4; i++) {
            const title = positions[Math.floor(Math.random() * positions.length)];
            const daysAhead = Math.floor(Math.random() * 14) + 1;
            const shiftDate = new Date();
            shiftDate.setDate(shiftDate.getDate() + daysAhead);
            shiftDate.setHours(0, 0, 0, 0);

            const startHour = 8 + Math.floor(Math.random() * 10);
            const startTime = new Date(shiftDate);
            startTime.setHours(startHour, 0, 0, 0);

            const endTime = new Date(startTime);
            endTime.setHours(startHour + 8, 0, 0, 0);

            await prisma.jobPosting.create({
                data: {
                    hotelId: profile.id,
                    title,
                    shiftDate,
                    startTime,
                    endTime,
                    totalHours: 8,
                    hourlyPay: 14 + Math.floor(Math.random() * 8),
                    location: hotel.location,
                    isActive: true,
                    isFilled: false,
                    slotsOpen: 1 + Math.floor(Math.random() * 3),
                    note: 'Uniform provided. Please bring black shoes.',
                },
            });
        }
    }

    console.log('✅ 12 Mock Shifts Generated.');
}

main()
    .then(async () => {
        console.log('🏁 Seed completed.');
        await prisma.$disconnect();
        await pool.end(); // Mandatory: Close the pool so the process can exit
    })
    .catch(async (e) => {
        console.error('❌ Seed failed:', e);
        await prisma.$disconnect();
        await pool.end();
        process.exit(1);
    });