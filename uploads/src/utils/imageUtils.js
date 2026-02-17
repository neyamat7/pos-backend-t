import fs from "fs";
import path from "path";
import Image from "../models/imageModel.js";

export const deleteImageFormServer = async (imageId, imageUrl = null) => {
  try {
    const deletionResults = {
      imageFromDbDeleted: false,
      imageFileDeleted: false,
      message: "",
    };

    // Delete from images collection if imageId provided
    if (imageId) {
      const image = await Image.findByIdAndDelete(imageId);
      deletionResults.imageFromDbDeleted = !!image;

      // If image document found, use its filepath
      if (image && image.filepath) {
        if (fs.existsSync(image.filepath)) {
          fs.unlinkSync(image.filepath);
          deletionResults.imageFileDeleted = true;
          deletionResults.message =
            "Image deleted from database and file system";
        }
      }
    }

    // If no image document but we have URL, try to delete from URL
    if (!deletionResults.imageFileDeleted && imageUrl) {
      const urlParts = imageUrl.split("/");
      const filename = urlParts[urlParts.length - 1];
      const filePath = path.join(process.cwd(), "uploads", filename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        deletionResults.imageFileDeleted = true;
        deletionResults.message =
          deletionResults.message || "Image file deleted from file system";
      }
    }

    return deletionResults;
  } catch (error) {
    console.error("Error in deleteImage utility:", error);
    throw error;
  }
};
