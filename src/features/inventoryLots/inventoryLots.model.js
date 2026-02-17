import mongoose from "mongoose";

const inventoryLotsSchema = new mongoose.Schema(
  {
    payment_status: {
      type: String,
      enum: ["paid", "unpaid"],
      default: "unpaid",
    },

    // Basic Info
    lot_name: {
      type: String,
      required: true,
    },

    purchase_date: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["in stock", "stock out"],
      default: "in stock",
    },

    hasCommission: {
      type: Boolean,
      default: false,
    },

    isCrated: {
      type: Boolean,
      default: false,
    },
    isBoxed: {
      type: Boolean,
      default: false,
    },
    isPieced: {
      type: Boolean,
      default: false,
    },

    // Relations
    productsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },

    purchaseListId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase",
      required: true,
    },

    // Carat Details
    carat: {
      carat_Type_1: {
        type: Number,
        default: 0,
      },
      carat_Type_2: {
        type: Number,
        default: 0,
      },
      remaining_crate_Type_1: {
        type: Number,
        default: 0,
      },
      remaining_crate_Type_2: {
        type: Number,
        default: 0,
      },
    },

    box_quantity: {
      type: Number,
      default: 0,
    },

    remaining_boxes: {
      type: Number,
      default: 0,
    },

    piece_quantity: {
      type: Number,
      default: 0,
    },

    remaining_pieces: {
      type: Number,
      default: 0,
    },

    costs: {
      unitCost: {
        type: Number,
        required: true,
      },

      commissionRate: {
        type: Number,
        default: 0,
      },
    },

    sales: {
      totalKgSold: {
        type: Number,
        default: 0,
      },
      totalCrateType1Sold: {
        type: Number,
        default: 0,
      },
      totalCrateType2Sold: {
        type: Number,
        default: 0,
      },
      totalPieceSold: {
        type: Number,
        default: 0,
      },
      totalBoxSold: {
        type: Number,
        default: 0,
      },
      totalSoldPrice: {
        type: Number,
        default: 0,
      },
    },

    profits: {
      lotProfit: {
        type: Number,
        default: 0,
      },

      customerProfit: {
        type: Number,
        default: 0,
      },

      //  lotCommission +  customerCommission,
      totalProfit: {
        type: Number,
        default: 0,
      },

      lot_loss: {
        type: Number,
        default: 0,
      },
    },

    expenses: {
      labour: {
        type: Number,
        default: 0,
      },

      transportation: {
        type: Number,
        default: 0,
      },

      van_vara: {
        type: Number,
        default: 0,
      },

      moshjid: {
        type: Number,
        default: 0,
      },

      trading_post: {
        type: Number,
        default: 0,
      },

      other_expenses: {
        type: Number,
        default: 0,
      },

      custom_expenses: [
        {
          name: {
            type: String,
          },
          amount: {
            type: Number,
            default: 0,
          },
        },
      ],

      extra_expense: {
        type: Number,
        default: 0,
      },

      extra_expense_note: {
        type: String,
        default: "",
      },

      // total
      total_expenses: {
        type: Number,
        default: 0,
      },

      extra_discount: {
        type: Number,
        default: 0,
      },

    },

    stock_adjust: {
      unit_quantity: {
        type: Number,
        default: 0,
      },
      reason_note: {
        type: String,
      },
    },

    // Track supplier due added for this lot (for adjustment when expenses change)
    supplierDueAdded: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("InventoryLot", inventoryLotsSchema);
