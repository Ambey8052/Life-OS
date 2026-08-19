import { Router } from "express";
import {
  listOpportunities,
  getOpportunity,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
} from "../controllers/opportunityController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/", listOpportunities);
router.post("/", createOpportunity);
router.get("/:id", getOpportunity);
router.patch("/:id", updateOpportunity);
router.delete("/:id", deleteOpportunity);

export default router;
