import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema(
  {
    global_crate_type_1_price: {
      type: Number,
      default: 0,
    },
    global_crate_type_2_price: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Settings", SettingsSchema);
