import { config } from "dotenv";
import path from "path";

// Load .env.test first; fall back to .env if present
config({ path: path.resolve(__dirname, ".env.test") });
config({ path: path.resolve(__dirname, ".env") });
