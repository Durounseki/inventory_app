-- CreateTable
CREATE TABLE "DanceEvent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "style" JSONB NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "venue" JSONB[],
    "description" JSONB NOT NULL,
    "sns" JSONB[],
    "flyer" JSONB NOT NULL,

    CONSTRAINT "DanceEvent_pkey" PRIMARY KEY ("id")
);
