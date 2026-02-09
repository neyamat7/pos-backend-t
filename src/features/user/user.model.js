import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },

    email: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    image: {
      type: String,
    },

    role: {
      type: String,
      enum: ["user", "admin", "manager", "operator", "staff"],
      default: "user",
      required: true,
    },

    salary: {
      type: Number,
    },
    remaining_salary: {
      type: Number,
      default: 0,
    },
    last_salary_reset_month: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Pre-save hook to set remaining_salary equal to salary for new users
userSchema.pre("save", function (next) {
  // Only run this for new documents (when user is being created)
  if (this.isNew && this.salary) {
    // Set remaining_salary to match salary
    this.remaining_salary = this.salary;
    
    // Set initial month-year for salary tracking
    const currentDate = new Date();
    this.last_salary_reset_month = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  }
  next();
});

export default mongoose.model("User", userSchema);
