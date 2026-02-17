import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
    },
    filepath: {
      type: String,
      required: true,
    },
    mimetype: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Virtual property to get image URL
imageSchema.virtual("imageUrl").get(function () {
  return `/api/v1/images/file/${this.filename}`;
});

// Include virtuals when converting to JSON
imageSchema.set("toJSON", { virtuals: true });
imageSchema.set("toObject", { virtuals: true });

const Image = mongoose.model("Image", imageSchema);

export default Image;
