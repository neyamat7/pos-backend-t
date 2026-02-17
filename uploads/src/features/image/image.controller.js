import * as imageService from "./image.services.js";

// @desc    Upload single image
// @route   POST /api/v1/images/upload
// @access  Public
export const uploadImage = async (req, res) => {
  try {
    const image = await imageService.uploadImageService(req.file);
    res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
      data: image,
    });
  } catch (error) {
    if (req.file) fs.existsSync(req.file.path) && fs.unlinkSync(req.file.path);
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get single image
// @route   GET /api/v1/images/:id
// @access  Public
export const getImageById = async (req, res) => {
  try {
    const data = await imageService.getImageByIdService(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
};

// @desc    Update image
// @route   PUT /api/v1/images/:id
// @access  Public
export const updateImage = async (req, res) => {
  try {
    const updatedImage = await imageService.updateImageService(
      req.params.id,
      req.body
    );
    res
      .status(200)
      .json({ success: true, message: "Image updated", data: updatedImage });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
};


