import { randomBytes } from "crypto";
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import OfferLetter from "@/models/OfferLetter";
import { checkAdminAuth } from "@/lib/admin-auth";
import { errorResponse, successResponse } from "@/lib/api-response";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const clean = (value: unknown, max = 300) => typeof value === "string" ? value.trim().slice(0, max) : "";
function validDate(value: unknown): Date | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}
function shape(item: any) {
  return {
    _id: String(item._id), offerLetterNumber: item.offerLetterNumber, fullName: item.fullName,
    email: item.email, jobTitle: item.jobTitle, department: item.department,
    employmentType: item.employmentType, workLocation: item.workLocation, salary: item.salary,
    joiningDate: item.joiningDate, issueDate: item.issueDate, probationPeriod: item.probationPeriod,
    reportingTo: item.reportingTo, organization: item.organization, issuerName: item.issuerName,
    issuerTitle: item.issuerTitle, terms: item.terms, status: item.status, createdAt: item.createdAt,
  };
}

export async function GET(request: NextRequest) {
  const auth = checkAdminAuth(request);
  if (!auth.success) return auth.response;
  try {
    await connectDB();
    const records = await OfferLetter.find().sort({ createdAt: -1 }).limit(500).lean();
    return successResponse(records.map(shape));
  } catch (error) {
    console.error("Admin offer letter list error:", error);
    return errorResponse("Could not load offer letters.", 500);
  }
}

export async function POST(request: NextRequest) {
  const auth = checkAdminAuth(request);
  if (!auth.success) return auth.response;
  try {
    const body = await request.json();
    const fullName = clean(body.fullName, 120);
    const email = clean(body.email, 160).toLowerCase();
    const jobTitle = clean(body.jobTitle, 120);
    const joiningDate = validDate(body.joiningDate);
    const issueDate = validDate(body.issueDate);
    if (!fullName || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !jobTitle || !joiningDate || !issueDate) {
      return errorResponse("Name, valid email, job title, joining date and issue date are required.", 400);
    }
    // A long random public token makes the shareable letter URL difficult to guess.
    const offerLetterNumber = "SF-OFR-" + new Date().getFullYear() + "-" + randomBytes(9).toString("hex").toUpperCase();
    await connectDB();
    const record = await OfferLetter.create({
      offerLetterNumber, fullName, email, jobTitle, joiningDate, issueDate,
      department: clean(body.department, 120), employmentType: clean(body.employmentType, 80) || "Internship",
      workLocation: clean(body.workLocation, 160) || "Remote", salary: clean(body.salary, 120) || "As discussed",
      probationPeriod: clean(body.probationPeriod, 120) || "Not applicable",
      reportingTo: clean(body.reportingTo, 120) || "Team Lead", organization: clean(body.organization, 120) || "Snapforest",
      issuerName: clean(body.issuerName, 120) || "Snapforest",
      issuerTitle: clean(body.issuerTitle, 120) || "Authorized Signatory", terms: clean(body.terms, 5000),
    });
    return successResponse(shape(record), "Offer letter created successfully.");
  } catch (error) {
    const err = error as { code?: number; message?: string };
    if (err.code === 11000) return errorResponse("A duplicate offer-letter number was generated. Please submit again.", 409);
    console.error("Offer letter creation error:", error);
    return errorResponse("Could not create offer letter. Check server logs and database configuration.", 500);
  }
}

export async function PATCH(request: NextRequest) {
  const auth = checkAdminAuth(request);
  if (!auth.success) return auth.response;
  try {
    const body = await request.json();
    const number = clean(body.offerLetterNumber, 80).toUpperCase();
    if (!number || !["active", "revoked"].includes(body.status)) return errorResponse("Valid offer letter number and status are required.", 400);
    await connectDB();
    const record = await OfferLetter.findOneAndUpdate({ offerLetterNumber: number }, { status: body.status }, { new: true }).lean();
    if (!record) return errorResponse("Offer letter not found.", 404);
    return successResponse(shape(record), "Offer letter status updated.");
  } catch (error) {
    console.error("Offer letter status update error:", error);
    return errorResponse("Could not update offer letter.", 500);
  }
}
