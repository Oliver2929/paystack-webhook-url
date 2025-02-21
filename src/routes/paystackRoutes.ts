import { Router } from "express";
import {
  paystackWebhook,
  revenueReport,
} from "../controllers/paystackController";

const router = Router();

router.post("/paystack-webhook", paystackWebhook);
router.get("/revenue-report", revenueReport);

export default router;
