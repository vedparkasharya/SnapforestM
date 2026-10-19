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
    if (!certificate || Array.isArray(certificate)) return errorResponse("No certificate was found with this number. Check the number and try again.", 404);
    // Mongoose lean() can be inferred as a document-or-array union in this model;
    // findOne() returns one record, so narrow it to the certificate record shape.
    const certificateRecord = certificate as unknown as {
      certificateNumber: string;
      fullName: string;
      internshipRole: string;
      department: string;
      organization: string;
      issuerName: string;
      issuerTitle: string;
      allotmentDate: Date;
      startDate: Date;
      endDate: Date;
      issueDate: Date;
      description: string;
      skills?: string[];
      deliveryMode?: "online" | "offline";
      status: string;
      createdAt: Date;
    };
    return successResponse({
      certificateNumber: certificateRecord.certificateNumber,
      fullName: certificateRecord.fullName,
      internshipRole: certificateRecord.internshipRole,
      department: certificateRecord.department,
      organization: certificateRecord.organization,
      issuerName: certificateRecord.issuerName,
      issuerTitle: certificateRecord.issuerTitle,
      allotmentDate: certificateRecord.allotmentDate,
      startDate: certificateRecord.startDate,
      endDate: certificateRecord.endDate,
      issueDate: certificateRecord.issueDate,
      description: certificateRecord.description,
      skills: certificateRecord.skills || [],
      deliveryMode: certificateRecord.deliveryMode || "online",
      status: certificateRecord.status,
      createdAt: certificateRecord.createdAt,
    }, certificateRecord.status === "active" ? "Certificate record found" : "This certificate has been revoked");
  } catch (error) {
    console.error("Public certificate verification error:", error);
    return errorResponse("Verification service is temporarily unavailable.", 503);
  }
}
