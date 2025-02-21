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

  try {
    handlePaystackEvent(payload, signature);

    const event: PaystackEvent = req.body;

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
      console.error(error.message);
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
