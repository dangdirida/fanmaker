-- CreateTable
CREATE TABLE "IdolGameSave" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slotIndex" INTEGER NOT NULL DEFAULT 0,
    "groupName" TEXT NOT NULL,
    "groupType" TEXT NOT NULL,
    "concept" TEXT NOT NULL,
    "membersJson" JSONB NOT NULL,
    "statsJson" JSONB NOT NULL,
    "stage" TEXT NOT NULL DEFAULT '연습생',
    "week" INTEGER NOT NULL DEFAULT 1,
    "energy" INTEGER NOT NULL DEFAULT 5,
    "energyResetAt" TIMESTAMP(3),
    "currentSceneId" TEXT NOT NULL DEFAULT 'ch1_intro',
    "flagsJson" JSONB NOT NULL DEFAULT '{}',
    "choiceHistory" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "conceptBoardJson" JSONB NOT NULL DEFAULT '{}',
    "playtimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IdolGameSave_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IdolGameSave_userId_key" ON "IdolGameSave"("userId");

-- AddForeignKey
ALTER TABLE "IdolGameSave" ADD CONSTRAINT "IdolGameSave_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
