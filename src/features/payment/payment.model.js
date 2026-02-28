import mongoose from "mongoose";

const selectedLotInfoSchema = new mongoose.Schema(
  {
    lot_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryLot",
      required: true,
    },

    total_sell: {
      type: Number,
      required: true,
      default: 0,
    },

    base_expense: {
      type: Number,
      default: 0,
    },

    extra_expense: {
      type: Number,
      default: 0,
    },

    total_expense: {
      type: Number,
      default: 0,
    },

    profit: {
      type: Number,
      required: true,
      default: 0,
    },

    discount: {
      type: Number,
      default: 0,
    },

    paid_amount: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { _id: false }
);

const paymentSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },

    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },

    selected_lots_info: {
      type: [selectedLotInfoSchema],
      required: true,
      default: [],
    },

    payment_method: {
      type: String,
      enum: ["MFS", "bank", "cash", "balance"],
      required: true,
    },

    payable_amount: {
      type: Number,
      required: true,
      default: 0,
    },

    total_lots_expenses: {
      type: Number,
      default: 0,
    },

    amount_from_balance: {
      type: Number,
      default: 0,
    },

    total_paid_amount: {
      type: Number,
      required: true,
      default: 0,
    },

    need_to_pay_due: {
      type: Number,
      default: 0,
    },

    transactionId: {
      type: String,
    },

    proof_img: {
      type: String,
    },

    note: {
      type: String,
      default: "",
    },

    discount_received: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
