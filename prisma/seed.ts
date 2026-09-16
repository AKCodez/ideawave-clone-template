import "dotenv/config";
import { auth } from "../src/lib/auth";
import { db } from "../src/lib/db";

const DEMO_EMAIL = "demo@example.com";
const DEMO_PASSWORD = "demo-pass-1234";

const samples = [
  { title: "First record from the seed", data: { source: "seed", order: 1 } },
  { title: "Second record from the seed", data: { source: "seed", order: 2 } },
];

/** Idempotent: safe to run against a database that has already been seeded. */
async function main(): Promise<void> {
  const existing = await db.user.findUnique({ where: { email: DEMO_EMAIL } });

  if (!existing) {
    // Sign-up goes through Better Auth so the password is hashed its way.
    await auth.api.signUpEmail({
      body: { email: DEMO_EMAIL, password: DEMO_PASSWORD, name: "Demo" },
    });
    console.log(`Created demo user ${DEMO_EMAIL}`);
  } else {
    console.log(`Demo user ${DEMO_EMAIL} already exists`);
  }

  const user = await db.user.findUniqueOrThrow({ where: { email: DEMO_EMAIL } });

  for (const sample of samples) {
    const found = await db.coreObject.findFirst({
      where: { userId: user.id, title: sample.title },
      select: { id: true },
    });
    if (found) continue;
    await db.coreObject.create({
      data: { userId: user.id, title: sample.title, data: sample.data },
    });
    console.log(`Created record "${sample.title}"`);
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    void db.$disconnect();
  });
