import mongoose from "mongoose";

const ExpenseCategoriesSchema = new mongoose.Schema(
  {
    // Add your schema fields here
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },
  },

  {
    timestamps: true,
  }
);

export default mongoose.model("ExpenseCategories", ExpenseCategoriesSchema);
