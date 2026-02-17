import mongoose from "mongoose";

const saleSchema = new mongoose.Schema(
  {
    sale_date: {
      type: String,
      required: true,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    total_custom_commission: {
      type: Number,
      default: 0,
    },

    total_lots_commission: {
      type: Number,
      default: 0,
    },

    // customers commission + lots commission + with out commission
    total_profit: {
      type: Number,
      default: 0,
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        product_name_bn: {
          type: String,
          default: "",
        },

        selected_lots: [
          {
            lotId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "InventoryLot",
              required: true,
            },
            kg: {
              type: Number,
              required: true,
              default: 0,
            },
            discount_Kg: {
              type: Number,
              default: 0,
            },

            // default lot Unit cost other wise unit cost + extra amount
            unit_price: {
              type: Number,
              required: true,
              default: 0,
            },

            total_price: {
              type: Number,
              default: 0, // totalPrice = kg * unitPrice
            },

            discount_amount: {
              type: Number,
              default: 0, // discountAmount = discountKg * unitPrice
            },

            selling_price: {
              type: Number,
              default: 0, // sellingPrice
            },

            crate_type1: {
              type: Number,
              default: 0,
            },
            crate_type2: {
              type: Number,
              default: 0,
            },

            box_quantity: {
              type: Number,
              default: 0,
            },
            
            isBoxed: {
              type: Boolean,
              default: false,
            },

            isPieced: {
              type: Boolean,
              default: false,
            },

            piece_quantity: {
              type: Number,
              default: 0,
            },

            lot_commission_rate: {
              type: Number,
              default: 0,
            },

            lot_commission_amount: {
              type: Number,
              default: 0, // sellingPrice * (lotCommissionRate / 100)
            },

            customer_commission_rate: {
              type: Number,
              default: 0,
            },

            customer_commission_amount: {
              type: Number,
              default: 0,
            },

            // without commission
            lot_profit: {
              type: Number,
              default: 0,
            },
          },
        ],
      },
    ],

    // payments details
    payment_details: {
      total_crate_type1_price: {
        type: Number,
        default: 0,
      },

      total_crate_type2_price: {
        type: Number,
        default: 0,
      },

      payable_amount: {
        type: Number,
        required: true,
        default: 0,
      },

      due_amount: {
        type: Number,
        default: 0,
      },

      payment_type: {
        type: String,
        enum: ["cash", "bank", "mobile", "balance", "other"],
        default: "cash",
      },

      received_amount: {
        type: Number,
        default: 0,
      },

      // received_amount_from_balance: {
      //   type: Number,
      //   default: 0,
      // },

      vat: {
        type: Number,
        default: 0,
      },

      note: {
        type: String,
        trim: true,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Sale", saleSchema);
