import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
  {
    // basic information
    purchase_date: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["on the way", "received", "canceled"],
      default: "on the way",
    },

    is_lots_created: {
      type: Boolean,
      default: false,
    },

    // items (each supplier can have multiple lots)
    items: [
      {
        supplier: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Supplier",
          required: true,
        },

        // select lots
        lots: [
          {
            productId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Product",
              required: true,
            },
            lot_name: {
              type: String,
              required: true,
            },
            unit_Cost: {
              type: Number,
              required: true,
            },
            commission_rate: {
              type: Number,
              default: 0,
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
            isBagged: {
              type: Boolean,
              default: false,
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
            },

            box_quantity: {
              type: Number,
              default: 0,
            },

            piece_quantity: {
              type: Number,
              default: 0,
            },

            bag_quantity: {
              type: Number,
              default: 0,
            },

            total_kg: {
              type: Number,
              default: 0,
            },
            discount_amount: {
              type: Number,
              default: 0,
            },

            //  Expense Breakdown (per lot)
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
            },
          },
        ],
      },
    ],

    // total expenses
    total_expenses: {
      labour: {
        type: Number,
        default: 0,
      },
      transportation: {
        type: Number,
        default: 10,
      },
      van_vara: {
        type: Number,
        default: 10,
      },
      moshjid: {
        type: Number,
        default: 10,
      },
      trading_post: {
        type: Number,
        default: 0,
      },
      other_expenses: {
        type: Number,
        default: 30,
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Purchase", purchaseSchema);
