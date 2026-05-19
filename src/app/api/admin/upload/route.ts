import { NextRequest } from "next/server";
import { uploadImage } from "@/lib/cloudinary";
import { successResponse, errorResponse } from "@/lib/api-response";

export const dynamic = "force-dynamic";

/**
 * Upload room images to Cloudinary
 * Accepts base64 images and returns Cloudinary URLs
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { images } = body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return errorResponse("No images provided");
    }

    // Validate each image
    const validImages = images.filter(
      (img: string) =>
        typeof img === "string" &&
        img.startsWith("data:image") &&
        img.length > 100
    );

    if (validImages.length === 0) {
      return errorResponse("No valid base64 images found");
    }

    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error("[Upload] Cloudinary environment variables not set");
      return errorResponse(
        "Image upload is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your Vercel environment variables. Until then, rooms will be created with placeholder images."
      );
    }

    // Upload each image to Cloudinary (one at a time to avoid rate limits)
    const uploadResults: { index: number; url: string | null; success: boolean; error?: string }[] = [];
    
    for (let i = 0; i < validImages.length; i++) {
      const base64Image = validImages[i];
      try {
        const result = await uploadImage(base64Image, "snapforest/rooms");
        if (result.success) {
          uploadResults.push({ index: i, url: result.url, success: true });
        } else {
          uploadResults.push({ index: i, url: null, success: false, error: result.error });
          console.error(`[Upload] Image ${i + 1} failed:`, result.error);
        }
      } catch (err: any) {
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

    if (uploadedUrls.length === 0) {
      // Collect all error messages
      const errors = uploadResults.map((r, i) => `Image ${i + 1}: ${r.error || "Unknown error"}`).join("; ");
      return errorResponse(`All image uploads failed. Errors: ${errors}`);
    }

    return successResponse(
      {
        urls: uploadedUrls,
        uploaded: uploadedUrls.length,
        failed: failedCount,
      },
      `Successfully uploaded ${uploadedUrls.length} image${uploadedUrls.length > 1 ? "s" : ""}`
    );
  } catch (error: any) {
    console.error("[Upload] Error:", error);
    return errorResponse(error.message || "Failed to upload images");
  }
}
