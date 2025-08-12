/*
  Warnings:

  - The primary key for the `question_tags` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `tags` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "public"."question_tags" DROP CONSTRAINT "question_tags_tagId_fkey";

-- AlterTable
ALTER TABLE "public"."question_tags" DROP CONSTRAINT "question_tags_pkey",
ALTER COLUMN "tagId" SET DATA TYPE TEXT,
ADD CONSTRAINT "question_tags_pkey" PRIMARY KEY ("questionId", "tagId");

-- AlterTable
ALTER TABLE "public"."tags" DROP CONSTRAINT "tags_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "tags_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "tags_id_seq";

-- AddForeignKey
ALTER TABLE "public"."question_tags" ADD CONSTRAINT "question_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "public"."tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
