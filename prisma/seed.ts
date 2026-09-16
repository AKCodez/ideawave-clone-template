import "dotenv/config";
import { auth } from "../src/lib/auth";
import { db } from "../src/lib/db";

const DEMO_EMAIL = "demo@example.com";
const DEMO_PASSWORD = "demo-pass-1234";

const samples = [
  {
    title: "Kickoff call with Northwind",
    source:
      "They run four warehouses and still reconcile stock by hand every Friday. The ops lead said the spreadsheet is the product and everyone is afraid of it.",
  },
  {
    title: "Support thread: exports",
    source:
      "Three customers asked for CSV export in the same week. Two of them are exporting to send to an accountant, one is building a dashboard.",
  },
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
    const found = await db.snippet.findFirst({
      where: { userId: user.id, title: sample.title },
      select: { id: true },
    });
    if (found) continue;
    await db.snippet.create({ data: { userId: user.id, title: sample.title, source: sample.source } });
    console.log(`Created snippet "${sample.title}"`);
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
