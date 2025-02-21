import { Request, Response } from "express";
import {
  handlePaystackEvent,
  updateRevenue,
} from "../services/paystackService";
import { PaystackEvent } from "../types/paystack";

let totalRevenue = 0;
let failedPayments = 0;
let chargebacks = 0;

export const paystackWebhook = (req: Request, res: Response): void => {
  const payload = req.body;
  const signature = req.headers["x-paystack-signature"] as string;

  if (!handlePaystackEvent(payload, signature)) {
    res.status(400).send("Invalid signature");
    return;
  }

  try {
    const event = payload;
    console.log("Received event:", event);

    switch (event.event) {
      case "charge.success":
        console.log("Payment successful for ₦", event.data.amount / 100);
        break;

      case "charge.failed":
        console.log("Payment failed for ₦", event.data.amount / 100);
        break;

      case "chargeback.created":
        console.log("Chargeback created for ₦", event.data.amount / 100);
        break;

      default:
        console.log("Unknown event received:", event.event);
    }

    const updatedData = updateRevenue(
      event,
      totalRevenue,
      failedPayments,
      chargebacks
    );

    totalRevenue = updatedData.totalRevenue;
    failedPayments = updatedData.failedPayments;
    chargebacks = updatedData.chargebacks;

    res.status(200).send("OK");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error processing the event:", error.message);
    } else {
      console.error("An unknown error occurred");
    }
    res.status(400).send("Invalid signature or unknown error");
  }
};

export const revenueReport = (req: Request, res: Response): void => {
  res.status(200).json({
    totalRevenue: totalRevenue / 100,
    failedPayments: failedPayments / 100,
    chargebacks: chargebacks / 100,
  });
};
