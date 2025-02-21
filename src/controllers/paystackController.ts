import { Request, Response } from "express";
import { updateRevenue } from "../services/paystackService";
import { PaystackEvent } from "../types/paystack";

let totalRevenue = 0;
let failedPayments = 0;
let chargebacks = 0;

export const paystackWebhook = (req: Request, res: Response): void => {
  const payload = req.body;

  try {
    console.log("Received Paystack Webhook:", JSON.stringify(payload, null, 2));

    const event = payload;

    switch (event.event) {
      case "charge.success":
        console.log("Payment successful for ₦", event.data.amount / 100);
        console.log("Transaction Reference:", event.data.reference);
        console.log("Customer Email:", event.data.email);
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
    if (!res.headersSent) {
      res.status(400).send("Error processing request");
    }
  }
};

export const revenueReport = (req: Request, res: Response): void => {
  res.status(200).json({
    totalRevenue: totalRevenue / 100,
    failedPayments: failedPayments / 100,
    chargebacks: chargebacks / 100,
  });
};
