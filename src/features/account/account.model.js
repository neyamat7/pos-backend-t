import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    account_type: {
      type: String,
      required: true,
      enum: ["bank", "mobile_wallet", "cash"], // restricts allowed values
    },
    account_name: {
      type: String,
      trim: true,
      default: "",
    },
    account_number: {
      type: String,
      trim: true,
      default: "",
    },
    balance: {
      type: Number,
      default: 0,
    },
    account_details: {
      type: String,
      trim: true,
      default: "",
    },
    added_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

export default mongoose.model("Account", accountSchema);
