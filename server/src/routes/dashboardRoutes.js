import { Router } from "express";
import { getToday } from "../controllers/dashboardController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/today", requireAuth, getToday);

export default router;
