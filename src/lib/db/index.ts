import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Singleton pattern — reuse connection across hot reloads in dev and across invocations in serverless
const globalForDb = globalThis as unknown as { _pgClient?: ReturnType<typeof postgres> };

const client =
  globalForDb._pgClient ??
  postgres(process.env.DATABASE_URL!, {
    prepare: false,
    max: 3,
    idle_timeout: 20,
    connect_timeout: 10,
  });

if (process.env.NODE_ENV !== "production") globalForDb._pgClient = client;

export const db = drizzle(client, { schema });
