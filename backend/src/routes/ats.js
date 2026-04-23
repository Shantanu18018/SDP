import express from "express";
import multer from "multer";
import { requireAuth } from "@clerk/express";
import { evaluateCandidate } from "../controllers/atsController.js";

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  }
});

router.post("/evaluate", requireAuth(), upload.single("resume"), evaluateCandidate);

export default router;
