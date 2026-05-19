import { v2 as cloudinary } from "cloudinary";

/**
 * Cloudinary configuration for image uploads
 * 
 * Required environment variables:
 * - CLOUDINARY_CLOUD_NAME
 * - CLOUDINARY_API_KEY
 * - CLOUDINARY_API_SECRET
 */

// Validate Cloudinary config
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const isCloudinaryConfigured = !!(cloudName && apiKey && apiSecret);

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

/**
 * Upload image to Cloudinary
 * @param file - Base64 encoded image or file path
 * @param folder - Folder name in Cloudinary (default: "snapforest")
 * @returns Upload result with secure_url and public_id
 */
export async function uploadImage(file: string, folder: string = "snapforest") {
  try {
    // Check if Cloudinary is configured
    if (!isCloudinaryConfigured) {
      console.error("[Cloudinary] ERROR: Cloudinary not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET env vars.");
      return {
        success: false,
        error: "Cloudinary is not configured. Please set the environment variables in Vercel dashboard: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET",
      };
    }

    // Validate base64 input
    if (!file || typeof file !== "string") {
      return {
        success: false,
        error: "Invalid image data: must be a non-empty base64 string",
      };
    }

    // Ensure it starts with data:image
    if (!file.startsWith("data:image")) {
      return {
        success: false,
        error: "Invalid image format: must be a base64 data URI starting with 'data:image'",
      };
    }

    // Check file size (base64 ~4/3 of actual size, so 7MB base64 ~5MB actual)
    const base64Size = file.length * 0.75;
    const maxSize = 10 * 1024 * 1024; // 10MB max
    if (base64Size > maxSize) {
      return {
        success: false,
        error: `Image too large (${Math.round(base64Size / 1024 / 1024)}MB). Maximum allowed is ${Math.round(maxSize / 1024 / 1024)}MB.`,
      };
    }

    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: "auto",
      transformation: [
        { quality: "auto:good" },
        { fetch_format: "auto" },
      ],
    });

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error: any) {
    console.error("[Cloudinary] Upload error:", error?.message || error);
    // Return more descriptive error
    let errorMessage = error?.message || "Failed to upload image";
    if (errorMessage.includes("unknown api_key")) {
      errorMessage = "Invalid Cloudinary API key. Please check your CLOUDINARY_API_KEY environment variable.";
    } else if (errorMessage.includes("cloud_name")) {
      errorMessage = "Invalid Cloudinary cloud name. Please check your CLOUDINARY_CLOUD_NAME environment variable.";
    } else if (errorMessage.includes("authorization")) {
      errorMessage = "Cloudinary authorization failed. Please check your API credentials.";
    } else if (errorMessage.includes("File size")) {
      errorMessage = "Image file is too large. Maximum size is 10MB.";
    } else if (errorMessage.includes("Invalid image file")) {
      errorMessage = "The uploaded file is not a valid image. Please upload JPG or PNG files only.";
    }
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Delete image from Cloudinary
 * @param publicId - The public ID of the image to delete
 */
export async function deleteImage(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: result.result === "ok",
      result,
    };
  } catch (error: any) {
    console.error("[Cloudinary] Delete error:", error);
    return {
      success: false,
      error: error.message || "Failed to delete image",
    };
  }
}

export default cloudinary;
