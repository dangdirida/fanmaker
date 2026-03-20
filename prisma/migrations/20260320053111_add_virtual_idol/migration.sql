-- CreateTable
CREATE TABLE "VirtualIdol" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '미설정',
    "concept" TEXT,
    "personality" TEXT,
    "voiceType" TEXT NOT NULL DEFAULT 'clear',
    "voiceDesc" TEXT,
    "positions" TEXT[],
    "genres" TEXT[],
    "gender" TEXT NOT NULL DEFAULT 'female',
    "stylePreset" TEXT NOT NULL DEFAULT 'idol',
    "hairColor" TEXT NOT NULL DEFAULT '#1a1a1a',
    "hairLength" TEXT NOT NULL DEFAULT 'medium',
    "skinTone" TEXT NOT NULL DEFAULT '#F5C5A3',
    "eyeColor" TEXT NOT NULL DEFAULT '#4a3728',
    "outfitStyle" TEXT NOT NULL DEFAULT 'stage',
    "accessories" TEXT[],
    "baseModel" TEXT NOT NULL DEFAULT 'sample1',
    "thumbnailUrl" TEXT,
    "vrmFileUrl" TEXT,
    "isDraft" BOOLEAN NOT NULL DEFAULT true,
    "postId" TEXT,
    "step" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VirtualIdol_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VirtualIdol_postId_key" ON "VirtualIdol"("postId");

-- AddForeignKey
ALTER TABLE "VirtualIdol" ADD CONSTRAINT "VirtualIdol_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VirtualIdol" ADD CONSTRAINT "VirtualIdol_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
