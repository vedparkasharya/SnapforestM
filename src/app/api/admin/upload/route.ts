import { NextRequest } from "next/server";
import { uploadImage } from "@/lib/cloudinary";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireAdminAuth } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/upload
 * Upload room images to Cloudinary
 * Accepts base64 images and returns Cloudinary URLs
 *
 * Request body: { images: string[] } - array of base64 data URIs
 * Response: { urls: string[], uploaded: number, failed: number }
 */
export async function POST(request: NextRequest) {
  // Auth check (fallback if middleware doesn't catch it)
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { images } = body;

    console.log(`[Upload API] Received ${images?.length || 0} images for upload`);

    if (!images || !Array.isArray(images) || images.length === 0) {
      return errorResponse("No images provided");
    }

    // Validate each image - must be a non-empty base64 data URI
    const validImages = images.filter(
      (img: string) =>
        typeof img === "string" &&
        img.startsWith("data:image") &&
        img.length > 100
    );

    if (validImages.length === 0) {
      return errorResponse(
        "No valid base64 images found. Images must be base64 data URIs starting with 'data:image'."
      );
    }

    console.log(`[Upload API] ${validImages.length} valid images after filtering`);

    // Check if Cloudinary is configured
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      console.error("[Upload API] Cloudinary environment variables not set:");
      console.error(`  CLOUDINARY_CLOUD_NAME: ${cloudName ? "set" : "MISSING"}`);
      console.error(`  CLOUDINARY_API_KEY: ${apiKey ? "set" : "MISSING"}`);
      console.error(`  CLOUDINARY_API_SECRET: ${apiSecret ? "set" : "MISSING"}`);

      return errorResponse(
        "Image upload is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your Vercel environment variables."
      );
    }

    // Upload each image to Cloudinary (one at a time to avoid rate limits)
    const uploadResults: {
      index: number;
      url: string | null;
      success: boolean;
      error?: string;
    }[] = [];

    for (let i = 0; i < validImages.length; i++) {
      const base64Image = validImages[i];
      try {
        console.log(`[Upload API] Uploading image ${i + 1}/${validImages.length}...`);
        const result = await uploadImage(base64Image, "snapforest/rooms");
        if (result.success) {
          uploadResults.push({ index: i, url: result.url, success: true });
          console.log(`[Upload API] Image ${i + 1} uploaded successfully`);
        } else {
          uploadResults.push({
            index: i,
            url: null,
            success: false,
            error: result.error,
          });
          console.error(`[Upload API] Image ${i + 1} failed:`, result.error);
        }
      } catch (err: any) {
        console.error(`[Upload API] Image ${i + 1} exception:`, err?.message || err);
        uploadResults.push({
          index: i,
          url: null,
          success: false,
          error: err?.message || "Upload failed",
        });
      }
    }

    const uploadedUrls = uploadResults
      .filter((r) => r.success)
      .map((r) => r.url) as string[];
    const failedCount = uploadResults.filter((r) => !r.success).length;

    console.log(`[Upload API] Results: ${uploadedUrls.length} uploaded, ${failedCount} failed`);

    // If at least one image uploaded, return success with partial results
    if (uploadedUrls.length > 0) {
      return successResponse(
        {
          urls: uploadedUrls,
          uploaded: uploadedUrls.length,
          failed: failedCount,
          errors: failedCount > 0
            ? uploadResults
                .filter((r) => !r.success)
                .map((r) => `Image ${r.index + 1}: ${r.error}`)
            : undefined,
        },
        `Successfully uploaded ${uploadedUrls.length} image${uploadedUrls.length > 1 ? "s" : ""}${failedCount > 0 ? ` (${failedCount} failed)` : ""}`
      );
    }

    // All uploads failed
    const errors = uploadResults
      .map((r, i) => `Image ${i + 1}: ${r.error || "Unknown error"}`)
      .join("; ");

    return errorResponse(`All image uploads failed. Errors: ${errors}`);
  } catch (error: any) {
    console.error("[Upload API] Unexpected error:", error);
    return errorResponse(error.message || "Failed to upload images");
  }
}
