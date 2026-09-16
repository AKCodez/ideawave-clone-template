import "dotenv/config";
import { demoPersona, demoSnippetsWithDates } from "../src/content/demo";
import { DEMO_LOGIN } from "../src/design/types";
import { auth } from "../src/lib/auth";
import { db } from "../src/lib/db";

/**
 * Seeds the demo account and the rows behind every screenshot.
 *
 * The content comes from `src/content/demo.ts`, which the landing page reads
 * too, so the marketing page and the signed-in dashboard show the same thing.
 * No model is called here: every summary and tag is already written out.
 *
 * Safe to run twice. The demo user is created once through Better Auth so the
 * password is hashed its way, and each row is matched on (owner, title) and
 * updated rather than duplicated - including its `createdAt`, so re-seeding an
 * old preview slides the dates forward instead of leaving it looking dead.
 */
async function main(): Promise<void> {
  const existing = await db.user.findUnique({ where: { email: DEMO_LOGIN.email } });

  if (!existing) {
    await auth.api.signUpEmail({
      body: { email: DEMO_LOGIN.email, password: DEMO_LOGIN.password, name: demoPersona.name },
    });
    console.log(`Created demo user ${DEMO_LOGIN.email}`);
  } else {
    console.log(`Demo user ${DEMO_LOGIN.email} already exists`);
  }

  const user = await db.user.findUniqueOrThrow({ where: { email: DEMO_LOGIN.email } });

  let created = 0;
  let updated = 0;

  for (const snippet of demoSnippetsWithDates()) {
    const fields = {
      source: snippet.source,
      summary: snippet.summary,
      tags: snippet.tags,
      status: snippet.status,
      createdAt: snippet.createdAt,
    };

    const found = await db.snippet.findFirst({
      where: { userId: user.id, title: snippet.title },
      select: { id: true },
    });

    if (found) {
      await db.snippet.update({ where: { id: found.id }, data: fields });
      updated += 1;
    } else {
      await db.snippet.create({ data: { userId: user.id, title: snippet.title, ...fields } });
      created += 1;
    }
  }

  console.log(
    `Seeded ${demoPersona.workspaceName}: ${created} row(s) created, ${updated} refreshed`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    void db.$disconnect();
  });
