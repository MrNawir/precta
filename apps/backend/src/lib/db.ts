/**
 * T036: Drizzle Database Client
 * Database connection and query client for the backend
 */

import { createDbClient, type DbClient } from '@precta/db';

let dbInstance: DbClient | null = null;

/**
 * Get or create the database client singleton
 */
export function getDb(): DbClient {
  if (!dbInstance) {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    dbInstance = createDbClient(databaseUrl);
  }
  
  return dbInstance;
}

/**
 * Close the database connection (for graceful shutdown)
 */
export async function closeDb(): Promise<void> {
  if (dbInstance) {
    // Drizzle with postgres.js doesn't need explicit close in most cases
    // but we set to null for cleanup
    dbInstance = null;
  }
}

// Export db for direct use
export const db = getDb();

export type { DbClient };
