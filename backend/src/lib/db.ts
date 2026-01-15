import { PrismaClient } from '@prisma/client';

/**
 * Centralized Prisma Client instance
 *
 * This follows Prisma's best practices:
 * - Single instance prevents connection pool exhaustion
 * - Reused across the application
 * - In development, prevents hot-reload from creating new instances
 */

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const db = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = db;
}
