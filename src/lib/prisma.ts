import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// Connection pool for PostgreSQL
const connectionString = process.env.DATABASE_URL;

// Create a PostgreSQL connection pool
const pool = connectionString ? new Pool({ connectionString }) : null;

// Create the Prisma adapter
const adapter = pool ? new PrismaPg(pool) : null;

// Global type for Prisma client caching
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

/**
 * Create Prisma Client based on environment
 * 
 * - In production/with DB: Uses the PostgreSQL adapter
 * - Without DB connection: Creates a mock-friendly instance
 */
function createPrismaClientBase(): PrismaClient | null {
    if (!adapter) {
        // No database connection - return null
        // Components should handle this gracefully
        console.warn('[Prisma] No DATABASE_URL configured. Database operations will fail.');
        return null;
    }

    return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
}

// Create and cache the client
export const prisma: PrismaClient | null = globalForPrisma.prisma ?? createPrismaClientBase();

if (process.env.NODE_ENV !== 'production' && prisma) {
    globalForPrisma.prisma = prisma;
}

export default prisma;
