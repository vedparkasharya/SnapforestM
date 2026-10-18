import { randomBytes } from "crypto";
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import InternshipCertificate from "@/models/InternshipCertificate";
import { checkAdminAuth } from "@/lib/admin-auth";
import { errorResponse, successResponse } from "@/lib/api-response";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function clean(value: unknown, max = 300): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
function validDate(value: unknown): Date | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
function publicShape(item: any) {
  return {
    _id: String(item._id),
    certificateNumber: item.certificateNumber,
    fullName: item.fullName,
    email: item.email,
    internshipRole: item.internshipRole,
    department: item.department,
    organization: item.organization,
    issuerName: item.issuerName,
    issuerTitle: item.issuerTitle,
    allotmentDate: item.allotmentDate,
    startDate: item.startDate,
    endDate: item.endDate,
    issueDate: item.issueDate,
    description: item.description,
    skills: item.skills || [],
    status: item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export async function GET(request: NextRequest) {
  const auth = checkAdminAuth(request);
  if (!auth.success) return auth.response;
  try {
    await connectDB();
    const certificates = await InternshipCertificate.find().sort({ createdAt: -1 }).limit(500).lean();
    return successResponse(certificates.map(publicShape));
  } catch (error) {
    console.error("Admin certificate list error:", error);
    return errorResponse("Could not load certificates", 500);
  }
}

export async function POST(request: NextRequest) {
  const auth = checkAdminAuth(request);
  if (!auth.success) return auth.response;
  try {
    const body = await request.json();
    const fullName = clean(body.fullName, 120);
    const email = clean(body.email, 160).toLowerCase();
    const internshipRole = clean(body.internshipRole, 120);
    const department = clean(body.department, 120);
    const organization = clean(body.organization, 120) || "Snapforest";
    const issuerName = clean(body.issuerName, 120) || "Snapforest";
    const issuerTitle = clean(body.issuerTitle, 120) || "Authorized Signatory";
    const allotmentDate = validDate(body.allotmentDate);
    const startDate = validDate(body.startDate);
    const endDate = validDate(body.endDate);
    const issueDate = validDate(body.issueDate) || new Date();
    const description = clean(body.description, 1500);
    const skills = Array.isArray(body.skills)
      ? body.skills.filter((item: unknown): item is string => typeof item === "string").map((item: string) => item.trim().slice(0, 60)).filter(Boolean).slice(0, 30)
      : [];

    if (!fullName || !internshipRole || !allotmentDate || !startDate || !endDate) {
      return errorResponse("Name, internship role, allotment date, start date and end date are required.", 400);
    }
    if (startDate > endDate || allotmentDate > endDate) {
      return errorResponse("Please check the allotment, start and end dates.", 400);
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return errorResponse("Enter a valid email address.", 400);
    }

    const requestedNumber = clean(body.certificateNumber, 50).toUpperCase().replace(/\s+/g, "");
    const certificateNumber = requestedNumber || `SF-INT-${new Date().getFullYear()}-${randomBytes(3).toString("hex").toUpperCase()}`;
    if (!/^[A-Z0-9][A-Z0-9-]{4,49}$/.test(certificateNumber)) {
      return errorResponse("Certificate number must use 5–50 letters, numbers or hyphens.", 400);
    }
    await connectDB();
    const exists = await InternshipCertificate.findOne({ certificateNumber }).lean();
    if (exists) return errorResponse("That certificate number already exists. Use a unique number.", 409);

    const certificate = await InternshipCertificate.create({
      certificateNumber, fullName, email, internshipRole, department, organization,
      issuerName, issuerTitle, allotmentDate, startDate, endDate, issueDate,
      description, skills, status: "active",
    });
    return successResponse(publicShape(certificate.toObject()), "Internship certificate issued successfully", 201);
  } catch (error) {
    console.error("Issue certificate error:", error);
    return errorResponse("Could not issue certificate. Please try again.", 500);
  }
}

export async function PATCH(request: NextRequest) {
  const auth = checkAdminAuth(request);
  if (!auth.success) return auth.response;
  try {
    const body = await request.json();
    const certificateNumber = clean(body.certificateNumber, 50).toUpperCase();
    const status = body.status;
    if (!certificateNumber || !["active", "revoked"].includes(status)) {
      return errorResponse("A valid certificate number and status are required.", 400);
    }
    await connectDB();
    const certificate = await InternshipCertificate.findOneAndUpdate(
      { certificateNumber }, { $set: { status } }, { new: true, runValidators: true }
    ).lean();
    if (!certificate) return errorResponse("Certificate not found.", 404);
    return successResponse(publicShape(certificate), status === "revoked" ? "Certificate revoked" : "Certificate reactivated");
  } catch (error) {
    console.error("Update certificate status error:", error);
    return errorResponse("Could not update certificate status.", 500);
  }
}
