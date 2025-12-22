import { config } from "dotenv";
import path from "path";
import { execSync } from "child_process";

// Load .env.test first; fall back to .env if present
config({ path: path.resolve(__dirname, ".env.test") });
config({ path: path.resolve(__dirname, ".env") });

// Run migrations before tests
try {
  console.log("Running Prisma migrations...");
  execSync("npx prisma migrate deploy", {
    cwd: path.resolve(__dirname, "../../"),
    stdio: "inherit",
  });
  console.log("Migrations completed");
} catch (err) {
  console.error("Failed to run migrations:", err);
  // Don't fail the setup, migrations might already be applied
}
