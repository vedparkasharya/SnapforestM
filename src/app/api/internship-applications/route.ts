import { randomBytes } from "crypto";
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
    const deliveryMode = body.deliveryMode === "offline" ? "offline" : "online";
    const motivation = clean(body.motivation, 1500);
    const utrNumber = clean(body.utrNumber, 100);
    const referralCode = clean(body.referralCode, 40).toUpperCase();
    const referralSource = clean(body.referralSource, 80);

    if (!fullName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return errorResponse("Please enter your name and a valid email address.", 400);
    }
    // Standard registration still requires the ₹100 payment transaction reference.
    // Referral-code eligibility is recorded for admin review; it is not auto-waived until verified.
    if (!utrNumber) return errorResponse("Please complete the ₹100 registration payment and enter its UTR / transaction ID.", 400);

    await connectDB();
    const applicationNumber = "SF-INT-" + new Date().getFullYear() + "-" + randomBytes(5).toString("hex").toUpperCase();
    const record = await InternshipApplication.create({
      applicationNumber, fullName, email, phone, college, branch, yearOfStudy,
      registrationNumber, internshipRole, deliveryMode, utrNumber, referralCode,
      referralSource, motivation,
    });
    return successResponse({
      applicationNumber: record.applicationNumber,
      fullName: record.fullName,
      email: record.email,
      internshipRole: record.internshipRole,
      deliveryMode: record.deliveryMode,
      status: record.status,
      createdAt: record.createdAt,
    }, "Your Snapforest internship application has been submitted.");
  } catch (error) {
    console.error("Internship application submission error:", error);
    return errorResponse("We could not submit your application right now. Please try again later.", 500);
  }
}
