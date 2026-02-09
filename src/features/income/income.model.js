import mongoose from "mongoose";

const incomeSchema = new mongoose.Schema(
  {
    sellDate: {
      type: Date,
      required: true,
    },
    information: {
      saleId: {
        type: String,
        required: true,
      },
      lots_Ids: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "InventoryLot",
        },
      ],
    },

    total_Sell: {
      type: Number,
      required: true,
    },

    lot_Commission: {
      type: Number,
      default: 0,
    },

    customer_Commission: {
      type: Number,
      default: 0,
    },

    total_Income: {
      type: Number,
      default: 0,
    },

    received_amount: {
      type: Number,
      default: 0,
    },

    // received_amount_from_balance: {
    //   type: Number,
    //   default: 0,
    // },

    due: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Income", incomeSchema);
