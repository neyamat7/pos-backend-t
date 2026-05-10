/**
 * Migration Script: Clear ALL customer crate counts to zero
 *
 * Logic:
 * - Set crate_info.type_1 and crate_info.type_2 to 0 for every customer
 * - No conditions, no exclusions
 *
 * Run: node src/utils/migrate-clear-customer-crates.js
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import customerModel from "../features/customer/customer.model.js";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  const result = await customerModel.updateMany(
    {},
    {
      $set: {
        "crate_info.type_1": 0,
        "crate_info.type_1_price": 0,
        "crate_info.type_2": 0,
        "crate_info.type_2_price": 0,
      },
    }
  );

  console.log(`✅ Done. Reset crates for ${result.modifiedCount} customers.`);
  await mongoose.disconnect();
  console.log("🔌 Disconnected from MongoDB");
}

run().catch((err) => {
  console.error("❌ Script failed:", err);
  mongoose.disconnect();
  process.exit(1);
});
