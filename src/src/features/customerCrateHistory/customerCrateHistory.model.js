import mongoose from "mongoose";

const customerCrateHistorySchema = new mongoose.Schema(
  {
    // Add your schema fields here
    saleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sale",
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    crate_type1: {
      type: String,
      required: true,
    },
    crate_type2: {
      type: String,
      required: true,
    },
    crate_type1_price: {
      type: Number,
      required: true,
    },
    crate_type2_price: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["given", "returned"],
      default: "given",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "CustomerCrateHistory",
  customerCrateHistorySchema
);
