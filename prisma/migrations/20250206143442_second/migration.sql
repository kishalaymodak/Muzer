/*
  Warnings:

  - Added the required column `addedById` to the `Stream` table without a default value. This is not possible if the table is not empty.
  - Added the required column `playedTs` to the `Stream` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Stream" ADD COLUMN     "addedById" TEXT NOT NULL,
ADD COLUMN     "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "played" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "playedTs" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "CurrentStream" (
    "userId" TEXT NOT NULL,
    "streamId" TEXT,

    CONSTRAINT "CurrentStream_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "CurrentStream_streamId_key" ON "CurrentStream"("streamId");

-- AddForeignKey
ALTER TABLE "Stream" ADD CONSTRAINT "Stream_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrentStream" ADD CONSTRAINT "CurrentStream_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "Stream"("id") ON DELETE SET NULL ON UPDATE CASCADE;
