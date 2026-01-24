import { ConvexHttpClient } from "convex/browser";
import projectsSeed from "../data/projects-seed.json";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;

if (!CONVEX_URL) {
  console.error("Error: NEXT_PUBLIC_CONVEX_URL or CONVEX_URL environment variable is required");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

async function seedAll() {
  console.log("Starting database seeding...");

  try {
    console.log("Seeding practice projects...");
    await client.mutation("practiceProjects:seedProjects", {
      projects: projectsSeed as any,
    });
    console.log("✓ Practice projects seeded successfully");

    console.log("\nSeeding complete!");
    console.log("You can now visit http://localhost:3000/practice");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedAll();
