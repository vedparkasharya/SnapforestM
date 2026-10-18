import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import InternshipCertificate from "@/models/InternshipCertificate";
import { errorResponse, successResponse } from "@/lib/api-response";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const number = (request.nextUrl.searchParams.get("number") || "").trim().toUpperCase().replace(/\s+/g, "");
  if (!number || number.length > 50 || !/^[A-Z0-9][A-Z0-9-]{4,49}$/.test(number)) {
    return errorResponse("Enter a valid certificate number.", 400);
  }
  try {
    await connectDB();
    const certificate = await InternshipCertificate.findOne({ certificateNumber: number }).lean();
    if (!certificate) return errorResponse("No certificate was found with this number. Check the number and try again.", 404);
    return successResponse({
      certificateNumber: certificate.certificateNumber,
      fullName: certificate.fullName,
      internshipRole: certificate.internshipRole,
      department: certificate.department,
      organization: certificate.organization,
      issuerName: certificate.issuerName,
      issuerTitle: certificate.issuerTitle,
      allotmentDate: certificate.allotmentDate,
      startDate: certificate.startDate,
      endDate: certificate.endDate,
      issueDate: certificate.issueDate,
      description: certificate.description,
      skills: certificate.skills || [],
      status: certificate.status,
      createdAt: certificate.createdAt,
    }, certificate.status === "active" ? "Certificate record found" : "This certificate has been revoked");
  } catch (error) {
    console.error("Public certificate verification error:", error);
    return errorResponse("Verification service is temporarily unavailable.", 503);
  }
}
