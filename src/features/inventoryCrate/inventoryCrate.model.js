import mongoose from "mongoose";

const { Schema } = mongoose;

// InventoryCrate Schema
const CrateTransitionSchema = new Schema(
  {
    date: {
      type: String,
      required: true,
    },

    stockType: {
      type: String,
      enum: ["new", "re-stock"],
      required: true,
      default: "new",
    },

    status: {
      type: String,
      enum: ["IN", "OUT", "CANCELLED"],
    },

    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      default: null,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },

    crate_type_1_qty: {
      type: Number,
      default: 0,
    },

    crate_type_1_price: {
      type: Number,
      default: 0,
    },

    crate_type_2_qty: {
      type: Number,
      default: 0,
    },

    crate_type_2_price: {
      type: Number,
      default: 0,
    },

    note: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Separate Total Schema
const crateTotalSchema = new Schema(
  {
    type_1_total: {
      type: Number,
      default: 0,
    },

    remaining_type_1: {
      type: Number,
      default: 0,
    },

    type_1_total_cost: {
      type: Number,
      default: 0,
    },

    type_2_total: {
      type: Number,
      default: 0,
    },

    remaining_type_2: {
      type: Number,
      default: 0,
    },

    type_2_total_cost: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Crate Profit Schema
const CrateProfitSchema = new Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    crate_type: {
      type: String,
      enum: ["type_1", "type_2"],
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
    },

    profitAmount: {
      type: Number,
      required: true,
    },

    date: {
      type: String,
      required: true,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryCrate",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Export models
export const InventoryCrate = mongoose.model(
  "InventoryCrate",
  CrateTransitionSchema
);

export const CrateTotal = mongoose.model("CrateTotal", crateTotalSchema);

export const CrateProfit = mongoose.model("CrateProfit", CrateProfitSchema);
