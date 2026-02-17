import Image from "./image.model.js";

import path from "path";

// @desc Get absolute file path
// @access Private
const getFilePath = (filename) => path.join(process.cwd(), "uploads", filename);

// @desc Upload single image
// @access Public
export const uploadImageService = async (file) => {
  if (!file) throw new Error("Please upload an image file");

  const image = await Image.create({
    filename: file.filename,
    filepath: file.path,
    mimetype: file.mimetype,
    size: file.size,
  });

  return image;
};

// @desc Get single image
// @access Public
export const getImageByIdService = async (id) => {
  const image = await Image.findById(id).select("-filepath");
  if (!image) throw new Error("Image not found");

  return {
    ...image.toObject(),
    imageUrl: `/api/v1/images/file/${image.filename}`,
  };
};

// @desc Update image
// @access Public
export const updateImageService = async (id, updateData) => {
  const image = await Image.findById(id);
  if (!image) throw new Error("Image not found");

  if (updateData.filename) image.filename = updateData.filename;
  await image.save();
  return image;
};
