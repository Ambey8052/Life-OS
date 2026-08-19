import { Router } from "express";
import { getSummary } from "../controllers/analyticsController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/summary", requireAuth, getSummary);

export default router;
