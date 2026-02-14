import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    expense_category: {
      type: String,
      required: true,
    },

    expense_for: {
      type: String,
      required: true,
      trim: true,
    },

    payment_type: {
      type: String,
      required: true,
      enum: ["cash", "card", "bank", "mobile_wallet"],
    },

    reference_num: {
      type: String,
      trim: true,
      default: "",
    },

    // Relations
    expense_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // relates to User collection
      required: true,
    },

    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // relates to User collection
    },

    choose_account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account", // relates to Account collection
      // required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Expense", expenseSchema);
