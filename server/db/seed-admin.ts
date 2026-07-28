import { config } from "dotenv";
config();

import { auth } from "../auth";
import { db } from "./index";
import { authUser } from "./schema";
import { eq } from "drizzle-orm";

async function seedAdmin() {
  const email = "admin@kimia.com";
  const password = "admin123";
  const name = "Admin";

  const existing = await db.query.authUser.findFirst({
    where: (u, { eq }) => eq(u.email, email),
  });

  if (existing) {
    console.log(`Admin user already exists: ${email}`);
    process.exit(0);
  }

  await auth.api.signUpEmail({
    body: { email, password, name },
  });

  await db.update(authUser).set({ role: "admin" }).where(eq(authUser.email, email));

  console.log(`✓ Admin user created: ${email} / ${password}`);
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
