-- CreateTable
CREATE TABLE "Tipster" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tipster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tip" (
    "id" TEXT NOT NULL,
    "tipsterId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "prediction" TEXT NOT NULL,
    "odds" DOUBLE PRECISION NOT NULL,
    "explanation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tip_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Tip" ADD CONSTRAINT "Tip_tipsterId_fkey" FOREIGN KEY ("tipsterId") REFERENCES "Tipster"("id") ON DELETE CASCADE ON UPDATE CASCADE;
