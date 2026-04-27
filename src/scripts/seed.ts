import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../lib/prisma";

async function main(): Promise<void> {
  const filePath = path.join(__dirname, "../../data/profiles.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(raw);
  const profiles = parsed.profiles;

  if (!Array.isArray(profiles)) {
    throw new Error(`Expected profiles array, got: ${typeof profiles}`);
  }

  console.log(`Seeding ${profiles.length} profiles...`);

  const profilesWithIds = profiles.map((profile: any) => ({
    ...profile,
    id: uuidv4(),
  }));

  const result = await prisma.profile.createMany({
    data: profilesWithIds,
    skipDuplicates: true,
  });

  console.log(`Seeded ${result.count} new profiles.`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
