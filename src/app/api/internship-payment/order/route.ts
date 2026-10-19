import { NextRequest } from "next/server";
import Razorpay from "razorpay";
import { errorResponse, successResponse } from "@/lib/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_request: NextRequest) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) return errorResponse("Razorpay is not configured. Please use UPI QR payment.", 503);
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await razorpay.orders.create({ amount: 10000, currency: "INR", receipt: "sfint" + Date.now(), notes: { purpose: "Snapforest internship registration" } });
    return successResponse({ orderId: order.id, amount: order.amount, currency: order.currency, keyId });
  } catch {
    return errorResponse("Could not start Razorpay payment. Please use UPI QR instead.", 500);
  }
}
