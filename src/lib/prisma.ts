import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

/**
 * Prisma 7 Singleton Pattern for Next.js
 * * 1. Setup the Database Pool and Adapter (Mandatory in v7)
 * 2. Prevent "Too many connections" errors during development hot-reloading.
 */

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('[Prisma] DATABASE_URL is not defined. Database operations will fail.');
}

// Global type to store the Prisma instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Function to create the client with the required Prisma 7 adapter
const prismaClientSingleton = () => {
  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  
  return new PrismaClient({
    adapter, // Required in Prisma 7 for direct database access
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

// Export the singleton instance
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

// In development, save the instance to globalThis to persist across hot-reloads
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;