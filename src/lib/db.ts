import { PrismaClient } from "@/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { env } from "@/lib/env";

/**
 * Lazy Prisma 7 singleton on the Neon serverless driver adapter.
 *
 * Nothing is constructed at import time. The first property access builds the
 * client, so importing this module - and running `next build` - works with an
 * empty DATABASE_URL. Only an actual query fails, and it fails with a sentence
 * you can act on.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  if (!env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Add a Neon connection string to .env before running anything that reads or writes the database.",
    );
  }
  const adapter = new PrismaNeon({ connectionString: env.DATABASE_URL });
  return new PrismaClient({
    adapter,
    log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

function client(): PrismaClient {
  const existing = globalForPrisma.prisma;
  if (existing) return existing;
  const created = createClient();
  if (env.NODE_ENV !== "production") globalForPrisma.prisma = created;
  return created;
}

/**
 * Property names that are introspection, not queries: Better Auth reads
 * `_runtimeDataModel` when it registers its schema check, and `await` probes
 * `then`. With no DATABASE_URL these answer "nothing here" rather than
 * constructing a client, so importing the module stays free of side effects.
 */
function isProbe(prop: string | symbol): boolean {
  return typeof prop === "symbol" || prop.startsWith("_") || prop === "then";
}

export const db: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!env.DATABASE_URL && isProbe(prop)) return undefined;
    const instance = client();
    const value = Reflect.get(instance, prop) as unknown;
    return typeof value === "function" ? value.bind(instance) : value;
  },
  set(_target, prop, value) {
    return Reflect.set(client(), prop, value);
  },
  has(_target, prop) {
    return prop in client();
  },
});
