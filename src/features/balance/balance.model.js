import mongoose from "mongoose";

const balanceSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    amount: {
      type: Number,
      required: true,
    },
    transaction_Id: {
      type: String,
      unique: true,
    },
    slip_img: {
      type: String,
      default: null,
    },
    note: {
      type: String,
      default: "",
    },
    payment_method: {
      type: String,
      enum: ["MFS", "bank", "cash"],
    },

    //
    balance_for: {
      type: String,
      required: true,
    },

    // it could be supplier or customer
    role: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Balance", balanceSchema);
