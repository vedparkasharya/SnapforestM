import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import OfferLetter from "@/models/OfferLetter";
import { errorResponse, successResponse } from "@/lib/api-response";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const number = (request.nextUrl.searchParams.get("number") || "").trim().toUpperCase().replace(/\s+/g, "");
  if (!/^SF-OFR-\d{4}-[A-F0-9]{18}$/.test(number)) return errorResponse("Enter a valid offer-letter link.", 400);
  try {
    await connectDB();
    const record = await OfferLetter.findOne({ offerLetterNumber: number }).lean();
    if (!record || Array.isArray(record)) return errorResponse("Offer letter not found. Please check the link.", 404);
    const item = record as any;
    // The unguessable token is the access link. Do not include the recipient's email.
    return successResponse({
      offerLetterNumber: item.offerLetterNumber, fullName: item.fullName, jobTitle: item.jobTitle,
      department: item.department, employmentType: item.employmentType, workLocation: item.workLocation,
      salary: item.salary, joiningDate: item.joiningDate, issueDate: item.issueDate,
      probationPeriod: item.probationPeriod, reportingTo: item.reportingTo, organization: item.organization,
      issuerName: item.issuerName, issuerTitle: item.issuerTitle, terms: item.terms, status: item.status,
    }, item.status === "active" ? "Offer letter found" : "This offer letter has been withdrawn");
  } catch (error) {
    console.error("Offer letter lookup error:", error);
    return errorResponse("Offer-letter service is temporarily unavailable.", 503);
  }
}
