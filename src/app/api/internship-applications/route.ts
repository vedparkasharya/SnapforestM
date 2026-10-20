import { randomBytes, createHmac, timingSafeEqual } from "crypto";
import Razorpay from "razorpay";
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import InternshipApplication from "@/models/InternshipApplication";
import { errorResponse, successResponse } from "@/lib/api-response";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const clean = (value: unknown, max = 300) => typeof value === "string" ? value.trim().slice(0, max) : "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const fullName = clean(body.fullName, 120);
    const email = clean(body.email, 160).toLowerCase();
    const phone = clean(body.phone, 20);
    const college = clean(body.college, 180);
    const branch = clean(body.branch, 120);
    const yearOfStudy = clean(body.yearOfStudy, 60);
    const registrationNumber = clean(body.registrationNumber, 80);
    const internshipRole = clean(body.internshipRole, 120) || "Software Developer Intern";
    const durationWeeks = clean(body.durationWeeks, 2) || "4";
    if (!["2", "4", "6", "8", "12"].includes(durationWeeks)) return errorResponse("Please choose a valid internship duration.", 400);
    const deliveryMode = body.deliveryMode === "offline" ? "offline" : "online";
    const motivation = clean(body.motivation, 1500);
    const utrNumber = clean(body.utrNumber, 100);
    const referralCode = clean(body.referralCode, 40).toUpperCase();
    const referralSource = clean(body.referralSource, 80);
    const boardCollegeUniversity = clean(body.boardCollegeUniversity, 180);
    const paymentMethod = body.paymentMethod === "razorpay" ? "razorpay" : "upi";
    const collegeIdUrl = clean(body.collegeIdUrl, 1000);
    const paymentScreenshotUrl = clean(body.paymentScreenshotUrl, 1000);
    const nocLetterUrl = clean(body.nocLetterUrl, 1000);
    const razorpayOrderId = clean(body.razorpay_order_id, 100);
    const razorpayPaymentId = clean(body.razorpay_payment_id, 100);
    const razorpaySignature = clean(body.razorpay_signature, 300);

    if (!fullName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return errorResponse("Please enter your name and a valid email address.", 400);
    }
    // Standard registration still requires the ₹100 payment transaction reference.
    // Referral-code eligibility is recorded for admin review; it is not auto-waived until verified.
    if (paymentMethod === "upi" && !utrNumber) return errorResponse("Please complete the ₹100 UPI payment and enter its UTR / transaction ID.", 400);
    if (paymentMethod === "razorpay") {
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) return errorResponse("Please complete Razorpay payment before submitting.", 400);
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      const keyId = process.env.RAZORPAY_KEY_ID;
      if (!keySecret || !keyId) return errorResponse("Razorpay is not configured. Please use UPI QR payment.", 503);
      const expected = createHmac("sha256", keySecret).update(razorpayOrderId + "|" + razorpayPaymentId).digest("hex");
      const a = Buffer.from(expected); const b = Buffer.from(razorpaySignature);
      if (a.length !== b.length || !timingSafeEqual(a, b)) return errorResponse("Razorpay payment signature is invalid.", 400);
      const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
      const [order, payment] = await Promise.all([razorpay.orders.fetch(razorpayOrderId), razorpay.payments.fetch(razorpayPaymentId)]);
      if (Number(order.amount) !== 10000 || order.currency !== "INR" || payment.order_id !== razorpayOrderId || payment.status !== "captured" || Number(payment.amount) !== 10000 || payment.currency !== "INR") {
        return errorResponse("Razorpay payment is not captured or does not match ₹100.", 409);
      }
    }

    await connectDB();
    const applicationNumber = "SF-INT-" + new Date().getFullYear() + "-" + randomBytes(5).toString("hex").toUpperCase();
    const record = await InternshipApplication.create({
      applicationNumber, fullName, email, phone, college, branch, yearOfStudy,
      registrationNumber, internshipRole, durationWeeks, deliveryMode, utrNumber, referralCode,
      referralSource, boardCollegeUniversity, paymentMethod, collegeIdUrl, paymentScreenshotUrl, nocLetterUrl, motivation,
    });
    return successResponse({
      applicationNumber: record.applicationNumber,
      fullName: record.fullName,
      email: record.email,
      internshipRole: record.internshipRole,
      deliveryMode: record.deliveryMode,
      paymentMethod: record.paymentMethod,
      status: record.status,
      createdAt: record.createdAt,
    }, "Your Snapforest internship application has been submitted.");
  } catch (error) {
    console.error("Internship application submission error:", error);
    return errorResponse("We could not submit your application right now. Please try again later.", 500);
  }
}
