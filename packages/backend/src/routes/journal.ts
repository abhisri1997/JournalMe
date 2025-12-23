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
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  async (req: AuthRequest, res: express.Response) => {
    try {
      const { text, isPublic: isPublicRaw } = req.body || {};
      const reqWithFiles = req as AuthRequest & {
        files?: {
          [fieldname: string]: Express.Multer.File[];
        };
      };

      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      console.log("POST /journals - Received request");
      console.log("Text:", text);
      const logFile = (field: string) => {
        const file = reqWithFiles.files?.[field]?.[0];
        if (file) {
          console.log(`${field} file details:`, {
            fieldname: file.fieldname,
            originalname: file.originalname,
            encoding: file.encoding,
            mimetype: file.mimetype,
            size: file.size,
            destination: file.destination,
            filename: file.filename,
          });
        }
      };
      logFile("audio");
      logFile("image");
      logFile("video");

      const isPublic =
        isPublicRaw === true ||
        isPublicRaw === "true" ||
        isPublicRaw === "1" ||
        isPublicRaw === 1;

      const audioFilename = reqWithFiles.files?.audio?.[0]?.filename;
      const imageFilename = reqWithFiles.files?.image?.[0]?.filename;
      const videoFilename = reqWithFiles.files?.video?.[0]?.filename;
      const created = await prisma.journalEntry.create({
        data: {
          userId: req.user.id,
          text: text ?? "",
          audioPath: audioFilename,
          imagePath: imageFilename,
          videoPath: videoFilename,
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
  // remove media files if they exist
  [entry.audioPath, entry.imagePath, entry.videoPath]
    .filter(Boolean)
    .forEach((filename) => {
      const p = path.join(uploadsDir, filename as string);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    });
  await prisma.journalEntry.delete({ where: { id: req.params.id } });
  return res.status(204).send();
});

export default router;
