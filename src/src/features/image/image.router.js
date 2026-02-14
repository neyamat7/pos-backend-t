import express from "express";
import { getImageById, updateImage, uploadImage } from "./image.controller.js";
import { uploadSingle } from "../../middleware/upload.js";

const router = express.Router();

// Routes
router.post(
  "/upload",
  (req, res, next) => {
    uploadSingle.single("image")(req, res, (err) => {
      if (err)
        return res.status(400).json({ success: false, message: err.message });
      next();
    });
  },
  // authMiddleware,
  // authorizeRoles("admin", "reporter"),
  uploadImage
);

router.get("/:id", getImageById);

router.put("/:id", updateImage);

export default router;
