import { Schema, model } from "mongoose";

const DailyCashSchema = new Schema(
  {
    businessDate: {
      type: Date,
      required: true,
      unique: true, // Only one record per day
    },

    openingCash: {
      type: Number,
      required: true,
      min: 0, // Starting cash for the day
    },

    cashIn: {
      type: Number,
      default: 0,
      min: 0, // Total cash received during the day
    },

    cashOut: {
      type: Number,
      default: 0,
      min: 0, // Total cash spent during the day
    },

    closingCash: {
      type: Number,
      required: true,
      min: 0, // openingCash + cashIn - cashOut
    },

    isClosed: {
      type: Boolean,
      default: false, // True if day is closed and no more transactions allowed
    },
  },
  { timestamps: true } // stores createdAt and updatedAt
);

// Index to prevent duplicate day
DailyCashSchema.index({ businessDate: 1 }, { unique: true });

export const DailyCash = model("DailyCash", DailyCashSchema);

const CashTransactionSchema = new Schema(
  {
    businessDate: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ["IN", "OUT"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    source: {
      type: String,
      enum: ["manual", "crate-transition", "sale", "expense", "other"],
      default: "manual",
    },
    note: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

CashTransactionSchema.index({ businessDate: 1, createdAt: -1 });

export const CashTransaction = model("CashTransaction", CashTransactionSchema);
