/*
  Warnings:

  - Changed the type of `actionId` on the `votes` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."votes" DROP COLUMN "actionId",
ADD COLUMN     "actionId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "votes_authorId_actionId_actionType_key" ON "public"."votes"("authorId", "actionId", "actionType");
