import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  disconnectGmail,
  getConnectUrl,
  getStatus,
  handleCallback,
  syncInbox,
} from "../controllers/gmailController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Each sync can spend several AI calls; this keeps one user from draining the free quota.
const syncLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: { error: "Too many syncs — try again in a few minutes." },
});

// Google redirects the browser here; identity comes from the signed OAuth state.
router.get("/callback", handleCallback);

router.use(requireAuth);
router.get("/status", getStatus);
router.get("/connect-url", getConnectUrl);
router.post("/sync", syncLimiter, syncInbox);
router.delete("/", disconnectGmail);

export default router;
