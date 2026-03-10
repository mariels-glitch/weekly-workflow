import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

const rawConnectionString = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

if (!rawConnectionString) {
  throw new Error("SUPABASE_DATABASE_URL or DATABASE_URL must be set");
}

function encodePasswordInUrl(url: string): string {
  const match = url.match(/^(postgresql:\/\/[^:]+:)([^@]+)(@.+)$/);
  if (match) {
    return match[1] + encodeURIComponent(match[2]) + match[3];
  }
  return url;
}

const connectionString = encodePasswordInUrl(rawConnectionString);

export const pool = new pg.Pool({
  connectionString,
});

export const db = drizzle(pool, { schema });
