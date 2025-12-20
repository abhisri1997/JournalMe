import express from "express";
import path from "path";
const router = express.Router();
const uploadsDir = path.resolve(__dirname, "./uploads");
router.use("/uploads", express.static(uploadsDir));
export default router;
