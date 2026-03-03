import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    // Basic Information
    basic_info: {
      sl: {
        type: String,
        required: true,
        trim: true,
      },
      name: {
        type: String,
        required: true,
        trim: true,
      },
      role: {
        type: String,
        default: "customer",
        enum: ["customer"],
      },
      avatar: {
        type: String,
        default: "",
      },
    },

    // Contact Information
    contact_info: {
      email: {
        type: String,
        trim: true,
        lowercase: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
      location: {
        type: String,
        default: "",
      },
    },

    // Account & Balance
    account_info: {
      account_number: {
        type: String,
        default: "",
      },
      balance: {
        type: Number,
        default: 0,
      },
      due: {
        type: Number,
        default: 0,
      },
      return_amount: {
        type: Number,
        default: 0,
      },
    },

    // Crate Tracking
    crate_info: {
      type_1: {
        type: Number,
        default: 0,
      },
      type_1_price: {
        type: Number,
        default: 0,
      },
      type_2: {
        type: Number,
        default: 0,
      },
      type_2_price: {
        type: Number,
        default: 0,
      },
    },

    // Soft Delete Fields
    isPinned: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true, // Index for query performance
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Customer", customerSchema);
