/**
 * Migration Script: Clear ALL supplier crate counts to zero
 *
 * Logic:
 * - Set all crate_info fields to 0 for every supplier
 * - No conditions, no exclusions
 *
 * Run: node src/utils/migrate-clear-supplier-crates.js
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import supplierModel from "../features/supplier/supplier.model.js";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  const result = await supplierModel.updateMany(
    {},
    {
      $set: {
        "crate_info.crate1": 0,
        "crate_info.crate1Price": 0,
        "crate_info.needToGiveCrate1": 0,
        "crate_info.crate2": 0,
        "crate_info.crate2Price": 0,
        "crate_info.needToGiveCrate2": 0,
      },
    }
  );

  console.log(`✅ Done. Reset crates for ${result.modifiedCount} suppliers.`);
  await mongoose.disconnect();
  console.log("🔌 Disconnected from MongoDB");
}

run().catch((err) => {
  console.error("❌ Script failed:", err);
  mongoose.disconnect();
  process.exit(1);
});
