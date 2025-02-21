import { PaystackEvent } from "../types/paystack";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY as string;

export const handlePaystackEvent = (
  payload: any,
  signature: string
): boolean => {
  const computedSignature = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(payload))
    .digest("hex");

  return signature === computedSignature;
};

export const updateRevenue = (
  event: PaystackEvent,
  totalRevenue: number,
  failedPayments: number,
  chargebacks: number
): { totalRevenue: number; failedPayments: number; chargebacks: number } => {
  switch (event.event) {
    case "charge.success":
      totalRevenue += event.data.amount;
      break;

    case "charge.failed":
      failedPayments += event.data.amount;
      break;

    case "chargeback.created":
      chargebacks += event.data.amount;
      totalRevenue -= event.data.amount;
      break;

    default:
      throw new Error("Unknown event");
  }
  return { totalRevenue, failedPayments, chargebacks };
};
