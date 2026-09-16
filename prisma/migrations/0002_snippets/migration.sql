-- CreateEnum
CREATE TYPE "SnippetStatus" AS ENUM ('DRAFT', 'READY');

-- DropForeignKey
ALTER TABLE "core_object" DROP CONSTRAINT "core_object_userId_fkey";

-- DropTable
DROP TABLE "core_object";

-- CreateTable
CREATE TABLE "snippet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "summary" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "SnippetStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "snippet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "snippet_userId_createdAt_idx" ON "snippet"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "snippet" ADD CONSTRAINT "snippet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
