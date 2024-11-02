import {v2 as cloudinary} from "cloudinary"
import fs from "fs" //fileSystem


// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

function getPublicIdFromUrl(url) {
    // Match the pattern to extract the public ID (ignoring the beginning part and the extension)
    const matches = url.match(/\/([^/]+)\.[a-z]+$/i);
    return matches ? matches[1] : null;
}

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //uplaod file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        //file has been uploaded successfully
        // console.log("file is uploaded successfully ",response.url);
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath) //remove the locally saved temporary file as the upload failed
        return null
    }
}

const deleteFromCloudinary = async (oldImage) => {
    try {
        if (!oldImage) return null;

        let resourceType = "image"; // Default to image
        if (fileUrl.match(/\.(mp4|mkv|mov|avi)$/)) {
            resourceType = "video";
        } else if (fileUrl.match(/\.(mp3|wav)$/)) {
            resourceType = "raw"; // For audio or other file types
        }

        const response = await cloudinary.uploader.destroy(getPublicIdFromUrl(oldImage), {
            resource_type: resourceType
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


export {uploadOnCloudinary, deleteFromCloudinary}