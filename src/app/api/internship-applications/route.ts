import { randomBytes } from "crypto";
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import cloudinary from "@/lib/cloudinary";
import InternshipApplication from "@/models/InternshipApplication";
import { errorResponse, successResponse } from "@/lib/api-response";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const clean = (value: unknown, max = 300) => typeof value === "string" ? value.trim().slice(0, max) : "";

async function uploadDocument(value: unknown, folder: string): Promise<string | null> {
  if (typeof value !== "string" || !value) return null;
  const match = value.match(/^data:(image\/(?:jpeg|png|webp)|application\/pdf);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) throw new Error("Upload a JPG, PNG, WEBP or PDF file.");
  if (value.length * 0.75 > 3 * 1024 * 1024) throw new Error("Each document must be 3 MB or smaller.");
  const result = await cloudinary.uploader.upload(value, {
    folder: "snapforest/internship-applications",
    resource_type: "auto",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf"],
    use_filename: false,
    unique_filename: true,
  });
  return result.secure_url;
}

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

    if (!fullName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !phone || !college || !branch || !yearOfStudy || !registrationNumber || !internshipRole || !deliveryMode || !body.collegeId) {
      return errorResponse("Please complete all required fields and upload your college ID/admission slip.", 400);
    }
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return errorResponse("Document uploads are temporarily unavailable. Please contact Snapforest support.", 503);
    }

    const collegeIdUrl = await uploadDocument(body.collegeId, "snapforest/internship-applications");
    if (!collegeIdUrl) return errorResponse("College ID upload is required.", 400);
    const resumeUrl = body.resume ? await uploadDocument(body.resume, "snapforest/internship-applications") : "";

    await connectDB();
    const applicationNumber = "SF-INT-" + new Date().getFullYear() + "-" + randomBytes(5).toString("hex").toUpperCase();
    const record = await InternshipApplication.create({
      applicationNumber, fullName, email, phone, college, branch, yearOfStudy,
      registrationNumber, internshipRole, deliveryMode, collegeIdUrl, resumeUrl, motivation,
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
