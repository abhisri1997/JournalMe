import express from "express";
import cors from "cors";
import journalRouter from "./routes/journal";
import authRouter from "./routes/auth";
import userRouter from "./routes/user";
import { authenticate } from "./middleware/auth";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));
// auth routes (login)
app.use("/api/auth", authRouter);
// user profile routes
app.use("/api/users", userRouter);
// protect journal routes
app.use("/api/journals", authenticate, journalRouter);
// serve uploaded audio files
import serverStatic from "./serverStatic";
app.use("/", serverStatic);

const PORT = parseInt(process.env.PORT || "4000", 10);
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on port ${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`Network: http://0.0.0.0:${PORT}`);
});
