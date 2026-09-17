import { Router } from "express";
import {
  convertToOpportunity,
  convertToTask,
  listInsights,
  updateInsight,
} from "../controllers/inboxController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);
router.get("/", listInsights);
router.patch("/:id", updateInsight);
router.post("/:id/task", convertToTask);
router.post("/:id/opportunity", convertToOpportunity);

export default router;
