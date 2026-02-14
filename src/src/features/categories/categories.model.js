import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    comment: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Category", categorySchema);
