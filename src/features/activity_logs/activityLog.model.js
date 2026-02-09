import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
    },
    logs_fields_id: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "model_name",
      // required: true,
    },
    model_name: {
      type: String,
      required: true,
      trim: true,
    },
    action: {
      type: String,
      enum: ["Added", "Created", "Returned", "Updated", "Deleted", "Payment"],
      required: true,
    },
    note: {
      type: String,
      default: "",
      trim: true,
    },
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("ActivityLog", activityLogSchema);
