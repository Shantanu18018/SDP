import express from "express";
import { requireAuth } from "@clerk/express";
import { syncUser } from "../controllers/userController.js";

const router = express.Router();

router.post("/sync", requireAuth(), syncUser);

export default router;
