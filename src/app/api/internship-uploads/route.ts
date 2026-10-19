import { NextRequest } from "next/server";
import { uploadImage } from "@/lib/cloudinary";
import { errorResponse, successResponse } from "@/lib/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const file = typeof body.file === "string" ? body.file : "";
    const kind = typeof body.kind === "string" ? body.kind : "document";
    if (!file.startsWith("data:image/")) return errorResponse("Please upload a JPG, PNG or WebP image.", 400);
    if (file.length > 14_000_000) return errorResponse("File must be 10 MB or smaller.", 413);
    const result = await uploadImage(file, "snapforest/internship-applications");
    if (!result.success || !result.url) return errorResponse(result.error || "File upload failed.", 500);
    return successResponse({ url: result.url, kind }, "File uploaded.");
  } catch {
    return errorResponse("Could not upload this file. Please try again.", 500);
  }
}
