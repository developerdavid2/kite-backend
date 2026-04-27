-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "gender_probability" DOUBLE PRECISION NOT NULL,
    "age" INTEGER NOT NULL,
    "age_group" TEXT NOT NULL,
    "country_id" VARCHAR(2) NOT NULL,
    "country_name" TEXT NOT NULL,
    "country_probability" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_name_key" ON "profiles"("name");

-- CreateIndex
CREATE INDEX "profiles_gender_idx" ON "profiles"("gender");

-- CreateIndex
CREATE INDEX "profiles_age_idx" ON "profiles"("age");

-- CreateIndex
CREATE INDEX "profiles_age_group_idx" ON "profiles"("age_group");

-- CreateIndex
CREATE INDEX "profiles_country_id_idx" ON "profiles"("country_id");

-- CreateIndex
CREATE INDEX "profiles_created_at_idx" ON "profiles"("created_at");
