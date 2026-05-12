import { v2 as cloudinary } from "cloudinary";

/**
 * Cloudinary configuration for image uploads
 * 
 * Required environment variables:
 * - CLOUDINARY_CLOUD_NAME
 * - CLOUDINARY_API_KEY
 * - CLOUDINARY_API_SECRET
 */

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
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
    console.error("[Cloudinary] Upload error:", error);
    return {
      success: false,
      error: error.message || "Failed to upload image",
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
