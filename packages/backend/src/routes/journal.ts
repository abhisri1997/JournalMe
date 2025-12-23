import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { AuthRequest } from "../middleware/auth";

const router = express.Router();

// Use local disk storage for now
const uploadsDir = path.resolve(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (
    _req: express.Request,
    _file: Express.Multer.File,
    cb: (err: Error | null, destination: string) => void
  ) => cb(null, uploadsDir),
  filename: (
    _req: express.Request,
    file: Express.Multer.File,
    cb: (err: Error | null, filename: string) => void
  ) => cb(null, `${Date.now()}-${uuidv4()}-${file.originalname}`),
});
const upload = multer({ storage });

import prisma from "../db";

// Prisma-backed JournalEntry model (see prisma/schema.prisma)

router.post(
  "/",
  upload.single("audio"),
  async (req: AuthRequest, res: express.Response) => {
    try {
      const { text, isPublic: isPublicRaw } = req.body || {};
      const reqWithFile = req as AuthRequest & {
        file?: Express.Multer.File;
      };

      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      console.log("POST /journals - Received request");
      console.log("Text:", text);
      console.log("File received:", !!reqWithFile.file);
      if (reqWithFile.file) {
        console.log("File details:", {
          fieldname: reqWithFile.file.fieldname,
          originalname: reqWithFile.file.originalname,
          encoding: reqWithFile.file.encoding,
          mimetype: reqWithFile.file.mimetype,
          size: reqWithFile.file.size,
          destination: reqWithFile.file.destination,
          filename: reqWithFile.file.filename,
        });
      }

      const isPublic =
        isPublicRaw === true ||
        isPublicRaw === "true" ||
        isPublicRaw === "1" ||
        isPublicRaw === 1;

      const audioFilename = reqWithFile.file?.filename;
      const created = await prisma.journalEntry.create({
        data: {
          userId: req.user.id,
          text: text ?? "",
          audioPath: audioFilename,
          isPublic,
        },
      });

      console.log("Entry created:", created);
      return res.status(201).json(created);
    } catch (err) {
      console.error("Error creating entry:", err);
      return res.status(500).json({ error: "Failed to create entry" });
    }
  }
);

router.get("/", async (req: AuthRequest, res: express.Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const data = await prisma.journalEntry.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
  });
  return res.json(data);
});

router.get("/:id", async (req: AuthRequest, res: express.Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const entry = await prisma.journalEntry.findUnique({
    where: { id: req.params.id },
  });
  if (!entry) return res.status(404).json({ error: "Not found" });
  if (entry.userId !== req.user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }
  return res.json(entry);
});

router.delete("/:id", async (req: AuthRequest, res: express.Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const entry = await prisma.journalEntry.findUnique({
    where: { id: req.params.id },
  });
  if (!entry) return res.status(404).json({ error: "Not found" });
  if (entry.userId !== req.user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }
  // remove audio file if it exists
  if (entry.audioPath) {
    const p = path.join(uploadsDir, entry.audioPath);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
  await prisma.journalEntry.delete({ where: { id: req.params.id } });
  return res.status(204).send();
});

export default router;
