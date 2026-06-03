import { config } from "dotenv";
config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import bcrypt from "bcryptjs";
import * as schema from "./schema";

const client = postgres(process.env.DIRECT_URL ?? process.env.DATABASE_URL!, {
  prepare: false,
});
const db = drizzle(client, { schema });

async function seed() {
  const email = process.env.ADMIN_EMAIL ?? "admin@bwajigroup.com";
  const password = process.env.ADMIN_PASSWORD ?? "admin123";

  const hashed = await bcrypt.hash(password, 12);

  await db
    .insert(schema.users)
    .values({ name: "Admin", email, password: hashed, role: "admin" })
    .onConflictDoNothing();

  console.log(`✓ Admin seeded: ${email}`);
  await client.end();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
