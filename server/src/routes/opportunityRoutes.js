import { Router } from "express";
import {
  listOpportunities,
  getOpportunity,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  setCredential,
  revealCredential,
  deleteCredential,
} from "../controllers/opportunityController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/", listOpportunities);
router.post("/", createOpportunity);
router.get("/:id", getOpportunity);
router.patch("/:id", updateOpportunity);
router.delete("/:id", deleteOpportunity);

router.post("/:id/credential", setCredential);
router.get("/:id/credential/reveal", revealCredential);
router.delete("/:id/credential", deleteCredential);

export default router;
