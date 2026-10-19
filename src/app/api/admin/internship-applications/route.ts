import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import InternshipApplication from "@/models/InternshipApplication";
import { checkAdminAuth } from "@/lib/admin-auth";
import { errorResponse, successResponse } from "@/lib/api-response";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = checkAdminAuth(request);
  if (!auth.success) return auth.response;
  try {
    await connectDB();
    const search = (request.nextUrl.searchParams.get("q") || "").trim().slice(0, 120);
    const status = request.nextUrl.searchParams.get("status") || "";
    const filter: Record<string, unknown> = {};
    if (["submitted", "reviewing", "accepted", "rejected"].includes(status)) filter.status = status;
    if (search) filter.$or = [
      { applicationNumber: { $regex: search, $options: "i" } },
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { registrationNumber: { $regex: search, $options: "i" } },
    ];
    const [applications, total, submitted, reviewing, accepted, rejected] = await Promise.all([
      InternshipApplication.find(filter).sort({ createdAt: -1 }).limit(200).select("-resumeUrl").lean(),
      InternshipApplication.countDocuments(),
      InternshipApplication.countDocuments({ status: "submitted" }),
      InternshipApplication.countDocuments({ status: "reviewing" }),
      InternshipApplication.countDocuments({ status: "accepted" }),
      InternshipApplication.countDocuments({ status: "rejected" }),
    ]);
    return successResponse({
      applications: applications.map((item: any) => ({ ...item, _id: String(item._id) })),
      stats: { total, submitted, reviewing, accepted, rejected },
    });
  } catch (error) {
    console.error("Admin internship list error:", error);
    return errorResponse("Could not load internship applications.", 500);
  }
}

export async function PATCH(request: NextRequest) {
  const auth = checkAdminAuth(request);
  if (!auth.success) return auth.response;
  try {
    const body = await request.json();
    const id = typeof body.id === "string" ? body.id : "";
    const status = body.status;
    const note = typeof body.adminNote === "string" ? body.adminNote.trim().slice(0, 1500) : undefined;
    if (!id || !["submitted", "reviewing", "accepted", "rejected"].includes(status)) {
      return errorResponse("A valid application ID and status are required.", 400);
    }
    await connectDB();
    const update: Record<string, unknown> = { status };
    if (note !== undefined) update.adminNote = note;
    const record = await InternshipApplication.findByIdAndUpdate(id, { $set: update }, { new: true }).select("-collegeIdUrl -resumeUrl").lean();
    if (!record) return errorResponse("Application not found.", 404);
    return successResponse({ ...record, _id: String(record._id) }, "Application updated.");
  } catch (error) {
    console.error("Admin internship update error:", error);
    return errorResponse("Could not update application.", 500);
  }
}
