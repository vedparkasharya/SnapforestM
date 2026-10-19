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
    const internshipRole = clean(body.internshipRole, 120);
    const deliveryMode = body.deliveryMode === "offline" ? "offline" : body.deliveryMode === "online" ? "online" : "";
    const motivation = clean(body.motivation, 1500);
    const utrNumber = clean(body.utrNumber, 100);

    if (!fullName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !phone || !college || !branch || !yearOfStudy || !registrationNumber || !internshipRole || !deliveryMode || !utrNumber) {
      return errorResponse("Please complete all required fields and enter the payment UTR / transaction ID.", 400);
    }
    if (!utrNumber) return errorResponse("Please enter the payment UTR / transaction ID.", 400);

    await connectDB();
    const applicationNumber = "SF-INT-" + new Date().getFullYear() + "-" + randomBytes(5).toString("hex").toUpperCase();
    const record = await InternshipApplication.create({
      applicationNumber, fullName, email, phone, college, branch, yearOfStudy,
      registrationNumber, internshipRole, deliveryMode, utrNumber, motivation,
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
    const message = error instanceof Error ? error.message : "";
    if (message.includes("Upload a JPG") || message.includes("5 MB") || message.includes("Invalid image") || message.includes("File size")) {
      return errorResponse(message, 400);
    }
    return errorResponse("We could not submit your application right now. Please try again later.", 500);
  }
}
