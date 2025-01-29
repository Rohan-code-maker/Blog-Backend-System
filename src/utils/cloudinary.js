import { v2 as cloudinary } from "cloudinary";
import { extractPublicId } from "cloudinary-build-url";
import fs from "fs"; //fileSystem

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      throw new Error("Local file path is required for upload");
    }

    // Upload file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", // Automatically detect the file type
    });

    // Check for successful upload
    if (response && response.secure_url) {
      fs.unlinkSync(localFilePath); // Remove the temporary file after upload
      return response;
    } else {
      console.error("Upload failed:", response);
      return null;
    }
  } catch (error) {
    console.error("Cloudinary upload error:", error); // Log the error
    try {
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath); // Ensure temporary file is removed
      }
    } catch (unlinkError) {
      console.error("Error removing local file:", unlinkError);
    }
    return null;
  }
};


const deleteFromCloudinary = async (oldFile) => {
  try {
    if (!oldFile) return null;

    const publicId = extractPublicId(oldFile);

    let resourceType = "image"; // Default to image
    if (oldFile.match(/\.(mp4|mkv|mov|avi)$/)) {
      resourceType = "video";
    } else if (oldFile.match(/\.(mp3|wav)$/)) {
      resourceType = "raw"; // For audio or other file types
    }

    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    // Check if the deletion was successful
    if (response.result === "ok") {
      return response;
    } else {
      console.error("Deletion failed:", response);
      return null;
    }
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
