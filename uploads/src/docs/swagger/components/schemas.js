/**
 *  Global API Schemas
 * --------------------------------------------
 *  This file contains all OpenAPI / Swagger schema
 *  definitions used across the application.
 *
 *  Each module (User, Product, Order, etc.)
 *  should define its own schema and export it here
 *  for centralized API documentation.
 *
 */

// user schema
export const userSchemas = {
  User: {
    type: "object",
    required: ["name", "email", "password"],
    properties: {
      _id: {
        type: "string",
        description: "Auto-generated MongoDB ID",
        example: "507f1f77bcf86cd799439011",
      },
      name: {
        type: "string",
        description: "User's full name",
        example: "John Doe",
      },
      email: {
        type: "string",
        format: "email",
        description: "User's email address",
        example: "john@example.com",
      },
      password: {
        type: "string",
        description: "User's password (hashed)",
        example: "$2b$10$...",
      },
      role: {
        type: "string",
        enum: ["admin", "user", "manager"],
        description: "User's role",
        example: "user",
      },
      createdAt: {
        type: "string",
        format: "date-time",
        description: "User creation timestamp",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        description: "User last update timestamp",
      },
    },
  },

  UserInput: {
    type: "object",
    required: ["name", "email", "password"],
    properties: {
      name: {
        type: "string",
        example: "John Doe",
      },
      email: {
        type: "string",
        format: "email",
        example: "john@example.com",
      },
      password: {
        type: "string",
        format: "password",
        example: "Password123!",
      },
      role: {
        type: "string",
        enum: ["admin", "user", "manager"],
        example: "user",
      },
    },
  },

  UserUpdate: {
    type: "object",
    properties: {
      name: {
        type: "string",
        example: "John Updated",
      },
      email: {
        type: "string",
        format: "email",
        example: "johnupdated@example.com",
      },
      role: {
        type: "string",
        enum: ["admin", "user", "manager"],
        example: "manager",
      },
    },
  },

  Error: {
    type: "object",
    properties: {
      status: {
        type: "string",
        example: "error",
      },
      message: {
        type: "string",
        example: "Something went wrong",
      },
    },
  },

  Success: {
    type: "object",
    properties: {
      status: {
        type: "string",
        example: "success",
      },
      message: {
        type: "string",
        example: "Operation completed successfully",
      },
      data: {
        type: "object",
      },
    },
  },
};

// customer schema
export const customerSchemas = {
  Customer: {
    type: "object",
    required: ["basic_info", "contact_info"],
    properties: {
      _id: {
        type: "string",
        description: "Auto-generated MongoDB ID",
        example: "507f1f77bcf86cd799439011",
      },
      basic_info: {
        type: "object",
        required: ["sl", "name"],
        properties: {
          sl: {
            type: "string",
            description: "Serial number or unique identifier",
            example: "C001",
          },
          name: {
            type: "string",
            description: "Customer's full name",
            example: "Ahmed Khan",
          },
          role: {
            type: "string",
            enum: ["customer", "vendor", "admin"],
            description: "Customer's role in the system",
            example: "customer",
          },
          avatar: {
            type: "string",
            description: "URL to customer's avatar image",
            example: "https://example.com/avatar.jpg",
          },
        },
      },
      contact_info: {
        type: "object",
        required: ["email", "phone"],
        properties: {
          email: {
            type: "string",
            format: "email",
            description: "Customer's email address",
            example: "ahmed@example.com",
          },
          phone: {
            type: "string",
            description: "Customer's phone number",
            example: "+8801712345678",
          },
          location: {
            type: "string",
            description: "Customer's location or address",
            example: "Dhaka, Bangladesh",
          },
        },
      },
      account_info: {
        type: "object",
        properties: {
          account_number: {
            type: "string",
            description: "Customer's account number",
            example: "ACC123456",
          },
          balance: {
            type: "number",
            description: "Current account balance",
            example: 5000,
          },
          dua: {
            type: "number",
            description: "Due amount",
            example: 1500,
          },
          return_amount: {
            type: "number",
            description: "Return amount",
            example: 500,
          },
        },
      },
      crate_info: {
        type: "object",
        properties: {
          type_1: {
            type: "number",
            description: "Number of Type 1 crates",
            example: 10,
          },
          type_1_price: {
            type: "number",
            description: "Price per Type 1 crate",
            example: 50,
          },
          type_2: {
            type: "number",
            description: "Number of Type 2 crates",
            example: 5,
          },
          type_2_price: {
            type: "number",
            description: "Price per Type 2 crate",
            example: 75,
          },
        },
      },
      createdAt: {
        type: "string",
        format: "date-time",
        description: "Customer creation timestamp",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        description: "Customer last update timestamp",
      },
    },
  },

  CustomerInput: {
    type: "object",
    required: ["basic_info", "contact_info"],
    properties: {
      basic_info: {
        type: "object",
        required: ["sl", "name"],
        properties: {
          sl: {
            type: "string",
            example: "C001",
          },
          name: {
            type: "string",
            example: "Ahmed Khan",
          },
          role: {
            type: "string",
            enum: ["customer", "vendor", "admin"],
            example: "customer",
          },
          avatar: {
            type: "string",
            example: "https://example.com/avatar.jpg",
          },
        },
      },
      contact_info: {
        type: "object",
        required: ["email", "phone"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "ahmed@example.com",
          },
          phone: {
            type: "string",
            example: "+8801712345678",
          },
          location: {
            type: "string",
            example: "Dhaka, Bangladesh",
          },
        },
      },
      account_info: {
        type: "object",
        properties: {
          account_number: {
            type: "string",
            example: "ACC123456",
          },
          balance: {
            type: "number",
            example: 5000,
          },
          dua: {
            type: "number",
            example: 1500,
          },
          return_amount: {
            type: "number",
            example: 500,
          },
        },
      },
      crate_info: {
        type: "object",
        properties: {
          type_1: {
            type: "number",
            example: 10,
          },
          type_1_price: {
            type: "number",
            example: 50,
          },
          type_2: {
            type: "number",
            example: 5,
          },
          type_2_price: {
            type: "number",
            example: 75,
          },
        },
      },
    },
  },

  CustomerUpdate: {
    type: "object",
    properties: {
      basic_info: {
        type: "object",
        properties: {
          sl: {
            type: "string",
            example: "C001",
          },
          name: {
            type: "string",
            example: "Ahmed Khan Updated",
          },
          role: {
            type: "string",
            enum: ["customer", "vendor", "admin"],
            example: "vendor",
          },
          avatar: {
            type: "string",
            example: "https://example.com/new-avatar.jpg",
          },
        },
      },
      contact_info: {
        type: "object",
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "ahmed.updated@example.com",
          },
          phone: {
            type: "string",
            example: "+8801798765432",
          },
          location: {
            type: "string",
            example: "Chittagong, Bangladesh",
          },
        },
      },
      account_info: {
        type: "object",
        properties: {
          account_number: {
            type: "string",
            example: "ACC789012",
          },
          balance: {
            type: "number",
            example: 7500,
          },
          dua: {
            type: "number",
            example: 2000,
          },
          return_amount: {
            type: "number",
            example: 300,
          },
        },
      },
      crate_info: {
        type: "object",
        properties: {
          type_1: {
            type: "number",
            example: 15,
          },
          type_1_price: {
            type: "number",
            example: 55,
          },
          type_2: {
            type: "number",
            example: 8,
          },
          type_2_price: {
            type: "number",
            example: 80,
          },
        },
      },
    },
  },
};

// activity logs
export const activityLogSchemas = {
  ActivityLog: {
    type: "object",
    required: ["model_name", "action"],
    properties: {
      _id: {
        type: "string",
        description: "Auto-generated MongoDB ID",
        example: "507f1f77bcf86cd799439011",
      },
      date: {
        type: "string",
        format: "date-time",
        description: "Date of the activity",
        example: "2025-10-25T10:30:00.000Z",
      },
      logs_fields_id: {
        type: "string",
        description: "Reference ID to the related document",
        example: "507f1f77bcf86cd799439012",
      },
      model_name: {
        type: "string",
        description: "Name of the model/collection this log refers to",
        example: "Customer",
      },
      action: {
        type: "string",
        enum: ["Added", "Created", "Returned", "Updated", "Deleted", "Payment"],
        description: "Type of action performed",
        example: "Created",
      },
      note: {
        type: "string",
        description: "Additional notes about the activity",
        example: "Customer created with initial balance",
      },
      by: {
        type: "string",
        description: "User ID who performed the action",
        example: "507f1f77bcf86cd799439013",
      },
      createdAt: {
        type: "string",
        format: "date-time",
        description: "Activity log creation timestamp",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        description: "Activity log last update timestamp",
      },
    },
  },
};

// category schema
export const categorySchemas = {
  Category: {
    type: "object",
    required: ["categoryName", "slug"],
    properties: {
      _id: {
        type: "string",
        description: "Auto-generated MongoDB ID",
        example: "507f1f77bcf86cd799439011",
      },
      categoryName: {
        type: "string",
        description: "Name of the category",
        example: "Electronics",
      },
      slug: {
        type: "string",
        description: "URL-friendly unique identifier",
        example: "electronics",
      },
      description: {
        type: "string",
        description: "Category description",
        example: "All electronic items and gadgets",
      },
      comment: {
        type: "string",
        description: "Additional comments about the category",
        example: "Popular category with high demand",
      },
      createdAt: {
        type: "string",
        format: "date-time",
        description: "Category creation timestamp",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        description: "Category last update timestamp",
      },
    },
  },

  CategoryInput: {
    type: "object",
    required: ["categoryName", "slug"],
    properties: {
      categoryName: {
        type: "string",
        example: "Electronics",
      },
      slug: {
        type: "string",
        example: "electronics",
      },
      description: {
        type: "string",
        example: "All electronic items and gadgets",
      },
      comment: {
        type: "string",
        example: "Popular category with high demand",
      },
    },
  },

  CategoryUpdate: {
    type: "object",
    properties: {
      categoryName: {
        type: "string",
        example: "Electronics Updated",
      },
      slug: {
        type: "string",
        example: "electronics-updated",
      },
      description: {
        type: "string",
        example: "Updated description for electronics",
      },
      comment: {
        type: "string",
        example: "Updated comment",
      },
    },
  },
};

// supplier schema
export const supplierSchemas = {
  Supplier: {
    type: "object",
    required: ["basic_info"],
    properties: {
      _id: {
        type: "string",
        description: "Auto-generated MongoDB ID",
        example: "507f1f77bcf86cd799439011",
      },
      basic_info: {
        type: "object",
        required: ["sl", "name"],
        properties: {
          sl: {
            type: "string",
            description: "Serial number or unique identifier",
            example: "S001",
          },
          name: {
            type: "string",
            description: "Supplier's full name",
            example: "Rahman Suppliers",
          },
          avatar: {
            type: "string",
            description: "URL to supplier's avatar image",
            example: "https://example.com/avatar.jpg",
          },
          role: {
            type: "string",
            enum: ["supplier"],
            description: "Supplier's role (fixed as supplier)",
            example: "supplier",
          },
        },
      },
      contact_info: {
        type: "object",
        properties: {
          email: {
            type: "string",
            format: "email",
            description: "Supplier's email address",
            example: "rahman@example.com",
          },
          phone: {
            type: "string",
            description: "Supplier's phone number",
            example: "+8801712345678",
          },
          location: {
            type: "string",
            description: "Supplier's location or address",
            example: "Dhaka, Bangladesh",
          },
        },
      },
      account_info: {
        type: "object",
        properties: {
          accountNumber: {
            type: "string",
            description: "Supplier's account number",
            example: "ACC123456",
          },
          balance: {
            type: "number",
            description: "Current account balance",
            example: 15000,
          },
          due: {
            type: "number",
            description: "Due amount",
            example: 3000,
          },
          cost: {
            type: "number",
            description: "Total cost amount",
            example: 20000,
          },
        },
      },
      crate_info: {
        type: "object",
        properties: {
          crate1: {
            type: "number",
            description: "Number of Crate 1",
            example: 50,
          },
          crate1Price: {
            type: "number",
            description: "Price per Crate 1",
            example: 100,
          },
          needToGiveCrate1: {
            type: "number",
            description: "Remaining Crate 1 count",
            example: 45,
          },
          crate2: {
            type: "number",
            description: "Number of Crate 2",
            example: 30,
          },
          crate2Price: {
            type: "number",
            description: "Price per Crate 2",
            example: 150,
          },
          needToGiveCrate2: {
            type: "number",
            description: "Remaining Crate 2 count",
            example: 28,
          },
        },
      },
      createdAt: {
        type: "string",
        format: "date-time",
        description: "Supplier creation timestamp",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        description: "Supplier last update timestamp",
      },
    },
  },

  SupplierInput: {
    type: "object",
    required: ["basic_info"],
    properties: {
      basic_info: {
        type: "object",
        required: ["sl", "name"],
        properties: {
          sl: {
            type: "string",
            example: "S001",
          },
          name: {
            type: "string",
            example: "Rahman Suppliers",
          },
          avatar: {
            type: "string",
            example: "https://example.com/avatar.jpg",
          },
          role: {
            type: "string",
            enum: ["supplier"],
            example: "supplier",
          },
        },
      },
      contact_info: {
        type: "object",
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "rahman@example.com",
          },
          phone: {
            type: "string",
            example: "+8801712345678",
          },
          location: {
            type: "string",
            example: "Dhaka, Bangladesh",
          },
        },
      },
      account_info: {
        type: "object",
        properties: {
          accountNumber: {
            type: "string",
            example: "ACC123456",
          },
          balance: {
            type: "number",
            example: 15000,
          },
          due: {
            type: "number",
            example: 3000,
          },
          cost: {
            type: "number",
            example: 20000,
          },
        },
      },
      crate_info: {
        type: "object",
        properties: {
          crate1: {
            type: "number",
            example: 50,
          },
          crate1Price: {
            type: "number",
            example: 100,
          },
          needToGiveCrate1: {
            type: "number",
            example: 45,
          },
          crate2: {
            type: "number",
            example: 30,
          },
          crate2Price: {
            type: "number",
            example: 150,
          },
          needToGiveCrate2: {
            type: "number",
            example: 28,
          },
        },
      },
    },
  },
};

// account schema
export const accountSchemas = {
  Account: {
    type: "object",
    required: ["name", "account_type"],
    properties: {
      _id: {
        type: "string",
        description: "Auto-generated MongoDB ID",
        example: "507f1f77bcf86cd799439011",
      },
      name: {
        type: "string",
        description: "Account holder's name",
        example: "John Doe",
      },
      account_type: {
        type: "string",
        enum: ["bank", "mobile_wallet", "cash"],
        description: "Type of account",
        example: "bank",
      },
      account_name: {
        type: "string",
        description: "Name of the bank or wallet service",
        example: "Dhaka Bank",
      },
      account_number: {
        type: "string",
        description: "Account number or wallet number",
        example: "1234567890",
      },
      balance: {
        type: "number",
        description: "Current account balance",
        example: 50000,
      },
      account_details: {
        type: "string",
        description: "Additional details about the account",
        example: "Primary business account",
      },
      added_by: {
        type: "string",
        description: "User who added this account",
        example: "Admin User",
      },
      createdAt: {
        type: "string",
        format: "date-time",
        description: "Account creation timestamp",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        description: "Account last update timestamp",
      },
    },
  },

  AccountInput: {
    type: "object",
    required: ["name", "account_type"],
    properties: {
      name: {
        type: "string",
        example: "John Doe",
      },
      account_type: {
        type: "string",
        enum: ["bank", "mobile_wallet", "cash"],
        example: "bank",
      },
      account_name: {
        type: "string",
        example: "Dhaka Bank",
      },
      account_number: {
        type: "string",
        example: "1234567890",
      },
      balance: {
        type: "number",
        example: 50000,
      },
      account_details: {
        type: "string",
        example: "Primary business account",
      },
      added_by: {
        type: "string",
        example: "Admin User",
      },
    },
  },

  AccountUpdate: {
    type: "object",
    properties: {
      name: {
        type: "string",
        example: "John Doe Updated",
      },
      account_type: {
        type: "string",
        enum: ["bank", "mobile_wallet", "cash"],
        example: "mobile_wallet",
      },
      account_name: {
        type: "string",
        example: "bKash",
      },
      account_number: {
        type: "string",
        example: "01712345678",
      },
      balance: {
        type: "number",
        example: 75000,
      },
      account_details: {
        type: "string",
        example: "Updated account details",
      },
      added_by: {
        type: "string",
        example: "Manager User",
      },
    },
  },
};

// express schema
export const expenseSchemas = {
  Expense: {
    type: "object",
    required: [
      "date",
      "amount",
      "expense_for",
      "payment_type",
      "expense_by",
      "choose_account",
    ],
    properties: {
      _id: {
        type: "string",
        description: "Auto-generated MongoDB ID",
        example: "507f1f77bcf86cd799439011",
      },
      date: {
        type: "string",
        description: "Date of the expense",
        example: "2025-10-25",
      },
      amount: {
        type: "number",
        description: "Expense amount",
        example: 5000,
      },
      expense_for: {
        type: "string",
        description: "Purpose or reason for the expense",
        example: "Office supplies",
      },
      payment_type: {
        type: "string",
        enum: ["cash", "card", "bank", "mobile_wallet"],
        description: "Payment method used",
        example: "bank",
      },
      reference_num: {
        type: "string",
        description: "Transaction reference number",
        example: "TRX123456789",
      },
      expense_by: {
        type: "string",
        description: "User ID who made the expense",
        example: "507f1f77bcf86cd799439012",
      },
      choose_account: {
        type: "string",
        description: "Account ID used for the expense",
        example: "507f1f77bcf86cd799439013",
      },
      createdAt: {
        type: "string",
        format: "date-time",
        description: "Expense creation timestamp",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        description: "Expense last update timestamp",
      },
    },
  },

  ExpenseInput: {
    type: "object",
    required: [
      "date",
      "amount",
      "expense_for",
      "payment_type",
      "expense_by",
      "choose_account",
    ],
    properties: {
      date: {
        type: "string",
        example: "2025-10-25",
      },
      amount: {
        type: "number",
        example: 5000,
      },
      expense_for: {
        type: "string",
        example: "Office supplies",
      },
      payment_type: {
        type: "string",
        enum: ["cash", "card", "bank", "mobile_wallet"],
        example: "bank",
      },
      reference_num: {
        type: "string",
        example: "TRX123456789",
      },
      expense_by: {
        type: "string",
        example: "507f1f77bcf86cd799439012",
      },
      choose_account: {
        type: "string",
        example: "507f1f77bcf86cd799439013",
      },
    },
  },

  ExpenseUpdate: {
    type: "object",
    properties: {
      date: {
        type: "string",
        example: "2025-10-26",
      },
      amount: {
        type: "number",
        example: 7500,
      },
      expense_for: {
        type: "string",
        example: "Updated expense purpose",
      },
      payment_type: {
        type: "string",
        enum: ["cash", "card", "bank", "mobile_wallet"],
        example: "mobile_wallet",
      },
      reference_num: {
        type: "string",
        example: "TRX987654321",
      },
      expense_by: {
        type: "string",
        example: "507f1f77bcf86cd799439012",
      },
      choose_account: {
        type: "string",
        example: "507f1f77bcf86cd799439013",
      },
    },
  },
};

// products schema
export const productSchemas = {
  Product: {
    type: "object",
    properties: {
      _id: {
        type: "string",
        description: "Auto-generated MongoDB ID",
        example: "507f1f77bcf86cd799439011",
      },
      productName: {
        type: "string",
        description: "Name of the product",
        example: "Fresh Mango",
      },
      basePrice: {
        type: "number",
        minimum: 0,
        description: "Base price of the product",
        example: 150,
      },
      productImage: {
        type: "string",
        description: "URL to product image",
        example: "https://example.com/mango.jpg",
      },
      description: {
        type: "string",
        description: "Product description",
        example: "Fresh organic mangoes from local farms",
      },
      categoryId: {
        type: "string",
        description: "Category ID reference",
        example: "507f1f77bcf86cd799439012",
      },
      commissionRate: {
        type: "number",
        minimum: 0,
        maximum: 100,
        description: "Commission rate percentage",
        example: 10,
      },
      allowCommission: {
        type: "boolean",
        description: "Whether commission is allowed on this product",
        example: true,
      },
      isCrated: {
        type: "boolean",
        description: "Whether product is sold in crates",
        example: true,
      },
      createdAt: {
        type: "string",
        format: "date-time",
        description: "Product creation timestamp",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        description: "Product last update timestamp",
      },
    },
  },

  ProductInput: {
    type: "object",
    properties: {
      productName: {
        type: "string",
        example: "Fresh Mango",
      },
      basePrice: {
        type: "number",
        minimum: 0,
        example: 150,
      },
      productImage: {
        type: "string",
        example: "https://example.com/mango.jpg",
      },
      description: {
        type: "string",
        example: "Fresh organic mangoes from local farms",
      },
      categoryId: {
        type: "string",
        example: "507f1f77bcf86cd799439012",
      },
      commissionRate: {
        type: "number",
        minimum: 0,
        maximum: 100,
        example: 10,
      },
      allowCommission: {
        type: "boolean",
        example: true,
      },
      isCrated: {
        type: "boolean",
        example: true,
      },
    },
  },

  ProductUpdate: {
    type: "object",
    properties: {
      productName: {
        type: "string",
        example: "Fresh Mango Updated",
      },
      basePrice: {
        type: "number",
        minimum: 0,
        example: 175,
      },
      productImage: {
        type: "string",
        example: "https://example.com/mango-updated.jpg",
      },
      description: {
        type: "string",
        example: "Updated product description",
      },
      categoryId: {
        type: "string",
        example: "507f1f77bcf86cd799439013",
      },
      commissionRate: {
        type: "number",
        minimum: 0,
        maximum: 100,
        example: 15,
      },
      allowCommission: {
        type: "boolean",
        example: false,
      },
      isCrated: {
        type: "boolean",
        example: false,
      },
    },
  },
};

// purchase schema
export const purchaseSchemas = {
  Purchase: {
    type: "object",
    properties: {
      _id: {
        type: "string",
        description: "Auto-generated MongoDB ID",
        example: "507f1f77bcf86cd799439011",
      },
      purchase_date: {
        type: "string",
        format: "date-time",
        description: "Date of purchase",
        example: "2025-10-25T10:30:00.000Z",
      },
      status: {
        type: "string",
        enum: ["on the way", "received", "canceled"],
        description: "Status of the purchase",
        example: "on the way",
      },
      is_lots_created: {
        type: "boolean",
        description: "Whether lots have been created for this purchase",
        example: false,
      },
      items: {
        type: "array",
        description: "List of items purchased from suppliers",
        items: {
          type: "object",
          properties: {
            supplier: {
              type: "string",
              description: "Supplier ID reference",
              example: "507f1f77bcf86cd799439012",
            },
            lots: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  productId: {
                    type: "string",
                    description: "Product ID reference",
                    example: "507f1f77bcf86cd799439013",
                  },
                  lot_name: {
                    type: "string",
                    example: "Lot A-001",
                  },
                  unit_Cost: {
                    type: "number",
                    example: 150,
                  },
                  commission_rate: {
                    type: "number",
                    example: 5,
                  },
                  carat: {
                    type: "object",
                    properties: {
                      carat_Type_1: {
                        type: "number",
                        example: 10,
                      },
                      carat_Type_2: {
                        type: "number",
                        example: 5,
                      },
                    },
                  },
                  expenses: {
                    type: "object",
                    properties: {
                      labour: {
                        type: "number",
                        example: 500,
                      },
                      transportation: {
                        type: "number",
                        example: 300,
                      },
                      van_vara: {
                        type: "number",
                        example: 200,
                      },
                      moshjid: {
                        type: "number",
                        example: 100,
                      },
                      trading_post: {
                        type: "number",
                        example: 150,
                      },
                      other_expenses: {
                        type: "number",
                        example: 250,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      total_expenses: {
        type: "object",
        properties: {
          labour: {
            type: "number",
            example: 1000,
          },
          transportation: {
            type: "number",
            example: 600,
          },
          van_vara: {
            type: "number",
            example: 400,
          },
          moshjid: {
            type: "number",
            example: 200,
          },
          trading_post: {
            type: "number",
            example: 300,
          },
          other_expenses: {
            type: "number",
            example: 500,
          },
        },
      },
      createdAt: {
        type: "string",
        format: "date-time",
        description: "Purchase creation timestamp",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        description: "Purchase last update timestamp",
      },
    },
  },

  PurchaseInput: {
    type: "object",
    properties: {
      purchase_date: {
        type: "string",
        format: "date-time",
        example: "2025-10-25T10:30:00.000Z",
      },
      status: {
        type: "string",
        enum: ["on the way", "received", "canceled"],
        example: "on the way",
      },
      is_lots_created: {
        type: "boolean",
        example: false,
      },
      items: {
        type: "array",
        items: {
          type: "object",
          required: ["supplier", "lots"],
          properties: {
            supplier: {
              type: "string",
              example: "507f1f77bcf86cd799439012",
            },
            lots: {
              type: "array",
              items: {
                type: "object",
                required: ["productId", "lot_name", "unit_Cost"],
                properties: {
                  productId: {
                    type: "string",
                    example: "507f1f77bcf86cd799439013",
                  },
                  lot_name: {
                    type: "string",
                    example: "Lot A-001",
                  },
                  unit_Cost: {
                    type: "number",
                    example: 150,
                  },
                  commission_rate: {
                    type: "number",
                    example: 5,
                  },
                  carat: {
                    type: "object",
                    properties: {
                      carat_Type_1: {
                        type: "number",
                        example: 10,
                      },
                      carat_Type_2: {
                        type: "number",
                        example: 5,
                      },
                    },
                  },
                  expenses: {
                    type: "object",
                    properties: {
                      labour: {
                        type: "number",
                        example: 500,
                      },
                      transportation: {
                        type: "number",
                        example: 300,
                      },
                      van_vara: {
                        type: "number",
                        example: 200,
                      },
                      moshjid: {
                        type: "number",
                        example: 100,
                      },
                      trading_post: {
                        type: "number",
                        example: 150,
                      },
                      other_expenses: {
                        type: "number",
                        example: 250,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      total_expenses: {
        type: "object",
        properties: {
          labour: {
            type: "number",
            example: 1000,
          },
          transportation: {
            type: "number",
            example: 600,
          },
          van_vara: {
            type: "number",
            example: 400,
          },
          moshjid: {
            type: "number",
            example: 200,
          },
          trading_post: {
            type: "number",
            example: 300,
          },
          other_expenses: {
            type: "number",
            example: 500,
          },
        },
      },
    },
  },

  PurchaseUpdate: {
    type: "object",
    properties: {
      purchase_date: {
        type: "string",
        format: "date-time",
        example: "2025-10-26T10:30:00.000Z",
      },
      status: {
        type: "string",
        enum: ["on the way", "received", "canceled"],
        example: "received",
      },
      is_lots_created: {
        type: "boolean",
        example: true,
      },
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            supplier: {
              type: "string",
              example: "507f1f77bcf86cd799439012",
            },
            lots: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  productId: {
                    type: "string",
                    example: "507f1f77bcf86cd799439013",
                  },
                  lot_name: {
                    type: "string",
                    example: "Lot B-002",
                  },
                  unit_Cost: {
                    type: "number",
                    example: 175,
                  },
                  commission_rate: {
                    type: "number",
                    example: 7,
                  },
                  carat: {
                    type: "object",
                    properties: {
                      carat_Type_1: {
                        type: "number",
                        example: 15,
                      },
                      carat_Type_2: {
                        type: "number",
                        example: 8,
                      },
                    },
                  },
                  expenses: {
                    type: "object",
                    properties: {
                      labour: {
                        type: "number",
                        example: 600,
                      },
                      transportation: {
                        type: "number",
                        example: 350,
                      },
                      van_vara: {
                        type: "number",
                        example: 250,
                      },
                      moshjid: {
                        type: "number",
                        example: 120,
                      },
                      trading_post: {
                        type: "number",
                        example: 180,
                      },
                      other_expenses: {
                        type: "number",
                        example: 300,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      total_expenses: {
        type: "object",
        properties: {
          labour: {
            type: "number",
            example: 1200,
          },
          transportation: {
            type: "number",
            example: 700,
          },
          van_vara: {
            type: "number",
            example: 500,
          },
          moshjid: {
            type: "number",
            example: 240,
          },
          trading_post: {
            type: "number",
            example: 360,
          },
          other_expenses: {
            type: "number",
            example: 600,
          },
        },
      },
    },
  },
};

// inventory Lots Schemas
export const inventoryLotsSchemas = {
  InventoryLot: {
    type: "object",
    required: [
      "lot_name",
      "productsId",
      "supplierId",
      "purchaseListId",
      "costs",
    ],
    properties: {
      _id: {
        type: "string",
        description: "Auto-generated MongoDB ID",
        example: "507f1f77bcf86cd799439011",
      },
      lot_name: {
        type: "string",
        description: "Name of the lot",
        example: "Lot A-001",
      },
      purchase_date: {
        type: "string",
        format: "date-time",
        description: "Date of purchase",
        example: "2025-10-25T10:30:00.000Z",
      },
      status: {
        type: "string",
        enum: ["in stock", "stock out"],
        description: "Current status of the lot",
        example: "in stock",
      },
      hasCommission: {
        type: "boolean",
        description: "Whether commission is applicable",
        example: true,
      },
      productsId: {
        type: "string",
        description: "Product ID reference",
        example: "507f1f77bcf86cd799439012",
      },
      supplierId: {
        type: "string",
        description: "Supplier ID reference",
        example: "507f1f77bcf86cd799439013",
      },
      purchaseListId: {
        type: "string",
        description: "Purchase list ID reference",
        example: "507f1f77bcf86cd799439014",
      },
      costs: {
        type: "object",
        required: ["unitCost"],
        properties: {
          unitCost: {
            type: "number",
            description: "Cost per unit",
            example: 150,
          },
          commissionRate: {
            type: "number",
            description: "Commission rate percentage",
            example: 5,
          },
        },
      },
      sales: {
        type: "object",
        properties: {
          totalKgSold: {
            type: "number",
            description: "Total kilograms sold",
            example: 500,
          },
          totalSoldPrice: {
            type: "number",
            description: "Total price of sold items",
            example: 75000,
          },
        },
      },
      profits: {
        type: "object",
        properties: {
          lotProfit: {
            type: "number",
            description: "Profit from the lot",
            example: 5000,
          },
          customerProfit: {
            type: "number",
            description: "Customer profit",
            example: 2000,
          },
          totalProfit: {
            type: "number",
            description: "Total profit including commission",
            example: 7000,
          },
          totalProfitWithoutComm: {
            type: "number",
            description: "Total profit without commission",
            example: 6500,
          },
        },
      },
      createdAt: {
        type: "string",
        format: "date-time",
        description: "Lot creation timestamp",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        description: "Lot last update timestamp",
      },
    },
  },

  InventoryLotInput: {
    type: "object",
    required: [
      "lot_name",
      "productsId",
      "supplierId",
      "purchaseListId",
      "costs",
    ],
    properties: {
      lot_name: {
        type: "string",
        example: "Lot A-001",
      },
      purchase_date: {
        type: "string",
        format: "date-time",
        example: "2025-10-25T10:30:00.000Z",
      },
      status: {
        type: "string",
        enum: ["in stock", "stock out"],
        example: "in stock",
      },
      hasCommission: {
        type: "boolean",
        example: true,
      },
      productsId: {
        type: "string",
        example: "507f1f77bcf86cd799439012",
      },
      supplierId: {
        type: "string",
        example: "507f1f77bcf86cd799439013",
      },
      purchaseListId: {
        type: "string",
        example: "507f1f77bcf86cd799439014",
      },
      costs: {
        type: "object",
        required: ["unitCost"],
        properties: {
          unitCost: {
            type: "number",
            example: 150,
          },
          commissionRate: {
            type: "number",
            example: 5,
          },
        },
      },
      sales: {
        type: "object",
        properties: {
          totalKgSold: {
            type: "number",
            example: 500,
          },
          totalSoldPrice: {
            type: "number",
            example: 75000,
          },
        },
      },
      profits: {
        type: "object",
        properties: {
          lotProfit: {
            type: "number",
            example: 5000,
          },
          customerProfit: {
            type: "number",
            example: 2000,
          },
          totalProfit: {
            type: "number",
            example: 7000,
          },
          totalProfitWithoutComm: {
            type: "number",
            example: 6500,
          },
        },
      },
    },
  },

  LotStatusUpdate: {
    type: "object",
    required: ["status"],
    properties: {
      status: {
        type: "string",
        enum: ["in stock", "stock out"],
        example: "stock out",
      },
    },
  },
};

// sale schemas
export const saleSchemas = {
  Sale: {
    type: "object",
    required: ["sale_date", "customerId", "payment_details"],
    properties: {
      _id: {
        type: "string",
        description: "Auto-generated MongoDB ID",
        example: "507f1f77bcf86cd799439011",
      },
      sale_date: {
        type: "string",
        description: "Date of sale",
        example: "2025-10-25",
      },
      customerId: {
        type: "string",
        description: "Customer ID reference",
        example: "507f1f77bcf86cd799439012",
      },
      total_custom_commission: {
        type: "number",
        description: "Total custom commission amount",
        example: 500,
      },
      total_lots_commission: {
        type: "number",
        description: "Total lots commission amount",
        example: 750,
      },
      items: {
        type: "array",
        description: "List of sale items",
        items: {
          type: "object",
          properties: {
            productId: {
              type: "string",
              description: "Product ID reference",
              example: "507f1f77bcf86cd799439013",
            },
            selected_lots: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  lotId: {
                    type: "string",
                    description: "Lot ID reference",
                    example: "507f1f77bcf86cd799439014",
                  },
                  kg: {
                    type: "number",
                    description: "Kilograms sold",
                    example: 50,
                  },
                  discount_Kg: {
                    type: "number",
                    description: "Discount in kilograms",
                    example: 2,
                  },
                  unit_price: {
                    type: "number",
                    description: "Price per unit",
                    example: 150,
                  },
                  total_price: {
                    type: "number",
                    description: "Total price (kg * unit_price)",
                    example: 7500,
                  },
                  discount_amount: {
                    type: "number",
                    description: "Discount amount (discount_Kg * unit_price)",
                    example: 300,
                  },
                  selling_price: {
                    type: "number",
                    description: "Final selling price after discount",
                    example: 7200,
                  },
                  lot_commission_rate: {
                    type: "number",
                    description: "Commission rate for this lot",
                    example: 5,
                  },
                  lot_commission_amount: {
                    type: "number",
                    description: "Commission amount for this lot",
                    example: 360,
                  },
                  crate_type1: {
                    type: "number",
                    description: "Number of crate type 1",
                    example: 10,
                  },
                  crate_type2: {
                    type: "number",
                    description: "Number of crate type 2",
                    example: 5,
                  },
                },
              },
            },
            customer_commission_rate: {
              type: "number",
              description: "Customer commission rate percentage",
              example: 3,
            },
            customer_commission_amount: {
              type: "number",
              description: "Customer commission amount",
              example: 216,
            },
            profit: {
              type: "number",
              description: "Profit from this item",
              example: 1000,
            },
          },
        },
      },
      payment_details: {
        type: "object",
        required: ["payable_amount"],
        properties: {
          extra_crate_type1_price: {
            type: "number",
            description: "Extra charge for crate type 1",
            example: 100,
          },
          extra_crate_type2_price: {
            type: "number",
            description: "Extra charge for crate type 2",
            example: 150,
          },
          payable_amount: {
            type: "number",
            description: "Total payable amount",
            example: 7450,
          },
          change_amount: {
            type: "number",
            description: "Change amount given to customer",
            example: 50,
          },
          due_amount: {
            type: "number",
            description: "Due amount remaining",
            example: 0,
          },
          payment_type: {
            type: "string",
            enum: ["cash", "bank", "mobile", "balance", "other"],
            description: "Payment method",
            example: "cash",
          },
          received_amount: {
            type: "number",
            description: "Amount received from customer",
            example: 7500,
          },
          received_amount_from_balance: {
            type: "number",
            description: "Amount received from customer balance",
            example: 0,
          },
          vat: {
            type: "number",
            description: "VAT amount",
            example: 0,
          },
          note: {
            type: "string",
            description: "Additional notes about payment",
            example: "Paid in full",
          },
        },
      },
      createdAt: {
        type: "string",
        format: "date-time",
        description: "Sale creation timestamp",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        description: "Sale last update timestamp",
      },
    },
  },

  SaleInput: {
    type: "object",
    required: ["sale_date", "customerId", "payment_details"],
    properties: {
      sale_date: {
        type: "string",
        example: "2025-10-25",
      },
      customerId: {
        type: "string",
        example: "507f1f77bcf86cd799439012",
      },
      total_custom_commission: {
        type: "number",
        example: 500,
      },
      total_lots_commission: {
        type: "number",
        example: 750,
      },
      items: {
        type: "array",
        items: {
          type: "object",
          required: ["productId", "selected_lots"],
          properties: {
            productId: {
              type: "string",
              example: "507f1f77bcf86cd799439013",
            },
            selected_lots: {
              type: "array",
              items: {
                type: "object",
                required: ["lotId", "kg", "unit_price"],
                properties: {
                  lotId: {
                    type: "string",
                    example: "507f1f77bcf86cd799439014",
                  },
                  kg: {
                    type: "number",
                    example: 50,
                  },
                  discount_Kg: {
                    type: "number",
                    example: 2,
                  },
                  unit_price: {
                    type: "number",
                    example: 150,
                  },
                  total_price: {
                    type: "number",
                    example: 7500,
                  },
                  discount_amount: {
                    type: "number",
                    example: 300,
                  },
                  selling_price: {
                    type: "number",
                    example: 7200,
                  },
                  lot_commission_rate: {
                    type: "number",
                    example: 5,
                  },
                  lot_commission_amount: {
                    type: "number",
                    example: 360,
                  },
                  crate_type1: {
                    type: "number",
                    example: 10,
                  },
                  crate_type2: {
                    type: "number",
                    example: 5,
                  },
                },
              },
            },
            customer_commission_rate: {
              type: "number",
              example: 3,
            },
            customer_commission_amount: {
              type: "number",
              example: 216,
            },
            profit: {
              type: "number",
              example: 1000,
            },
          },
        },
      },
      payment_details: {
        type: "object",
        required: ["payable_amount"],
        properties: {
          extra_crate_type1_price: {
            type: "number",
            example: 100,
          },
          extra_crate_type2_price: {
            type: "number",
            example: 150,
          },
          payable_amount: {
            type: "number",
            example: 7450,
          },
          change_amount: {
            type: "number",
            example: 50,
          },
          due_amount: {
            type: "number",
            example: 0,
          },
          payment_type: {
            type: "string",
            enum: ["cash", "bank", "mobile", "balance", "other"],
            example: "cash",
          },
          received_amount: {
            type: "number",
            example: 7500,
          },
          received_amount_from_balance: {
            type: "number",
            example: 0,
          },
          vat: {
            type: "number",
            example: 0,
          },
          note: {
            type: "string",
            example: "Paid in full",
          },
        },
      },
    },
  },
};

// income schema
export const incomeSchemas = {
  Income: {
    type: "object",
    required: ["sellDate", "information", "total_Sell"],
    properties: {
      _id: {
        type: "string",
        description: "Auto-generated MongoDB ID",
        example: "507f1f77bcf86cd799439011",
      },
      sellDate: {
        type: "string",
        format: "date-time",
        description: "Date of the sale",
        example: "2025-10-25T10:30:00.000Z",
      },
      information: {
        type: "object",
        required: ["saleId"],
        properties: {
          saleId: {
            type: "string",
            description: "Sale ID reference",
            example: "507f1f77bcf86cd799439012",
          },
          lots_Ids: {
            type: "array",
            description: "Array of inventory lot IDs",
            items: {
              type: "string",
              example: "507f1f77bcf86cd799439013",
            },
          },
        },
      },
      total_Sell: {
        type: "number",
        description: "Total selling amount",
        example: 50000,
      },
      lot_Commission: {
        type: "number",
        description: "Commission from lots",
        example: 2500,
      },
      customer_Commission: {
        type: "number",
        description: "Commission from customer",
        example: 1500,
      },
      total_Income: {
        type: "number",
        description: "Total income amount",
        example: 46000,
      },
      received_amount: {
        type: "number",
        description: "Amount received from customer",
        example: 45000,
      },
      received_amount_from_balance: {
        type: "number",
        description: "Amount received from customer balance",
        example: 1000,
      },
      due: {
        type: "number",
        description: "Due amount remaining",
        example: 0,
      },
      createdAt: {
        type: "string",
        format: "date-time",
        description: "Income creation timestamp",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        description: "Income last update timestamp",
      },
    },
  },

  IncomeInput: {
    type: "object",
    required: ["sellDate", "information", "total_Sell"],
    properties: {
      sellDate: {
        type: "string",
        format: "date-time",
        example: "2025-10-25T10:30:00.000Z",
      },
      information: {
        type: "object",
        required: ["saleId"],
        properties: {
          saleId: {
            type: "string",
            example: "507f1f77bcf86cd799439012",
          },
          lots_Ids: {
            type: "array",
            items: {
              type: "string",
              example: "507f1f77bcf86cd799439013",
            },
          },
        },
      },
      total_Sell: {
        type: "number",
        example: 50000,
      },
      lot_Commission: {
        type: "number",
        example: 2500,
      },
      customer_Commission: {
        type: "number",
        example: 1500,
      },
      total_Income: {
        type: "number",
        example: 46000,
      },
      received_amount: {
        type: "number",
        example: 45000,
      },
      received_amount_from_balance: {
        type: "number",
        example: 1000,
      },
      due: {
        type: "number",
        example: 0,
      },
    },
  },
};

// balance schemas
export const balanceSchemas = {
  Balance: {
    type: "object",
    required: ["date", "amount", "balance_for", "role"],
    properties: {
      _id: {
        type: "string",
        description: "Auto-generated MongoDB ID",
        example: "507f1f77bcf86cd799439011",
      },
      date: {
        type: "string",
        description: "Date of the balance transaction",
        example: "2025-10-25",
      },
      amount: {
        type: "number",
        description: "Transaction amount",
        example: 5000,
      },
      transaction_Id: {
        type: "string",
        description: "Unique transaction identifier",
        example: "TXN123456789",
      },
      slip_img: {
        type: "string",
        description: "URL to payment slip image",
        example: "https://example.com/slip.jpg",
      },
      note: {
        type: "string",
        description: "Additional notes about the transaction",
        example: "Payment for goods delivered",
      },
      payment_method: {
        type: "string",
        enum: ["MFS", "bank", "cash"],
        description: "Payment method used",
        example: "bank",
      },
      balance_for: {
        type: "string",
        description: "ID of the customer or supplier",
        example: "507f1f77bcf86cd799439012",
      },
      role: {
        type: "string",
        description: "role type (supplier or customer)",
        example: "customer",
      },
      createdAt: {
        type: "string",
        format: "date-time",
        description: "Balance transaction creation timestamp",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        description: "Balance transaction last update timestamp",
      },
    },
  },

  BalanceInput: {
    type: "object",
    required: ["date", "amount", "balance_for", "role"],
    properties: {
      date: {
        type: "string",
        example: "2025-10-25",
      },
      amount: {
        type: "number",
        example: 5000,
      },
      transaction_Id: {
        type: "string",
        example: "TXN123456789",
      },
      slip_img: {
        type: "string",
        example: "https://example.com/slip.jpg",
      },
      note: {
        type: "string",
        example: "Payment for goods delivered",
      },
      payment_method: {
        type: "string",
        enum: ["MFS", "bank", "cash"],
        example: "bank",
      },
      balance_for: {
        type: "string",
        example: "507f1f77bcf86cd799439012",
      },
      role: {
        type: "string",
        example: "customer",
      },
    },
  },
};

// Combine all schemas
export const schemas = {
  ...activityLogSchemas,
  ...userSchemas,
  ...customerSchemas,
  ...categorySchemas,
  ...supplierSchemas,
  ...accountSchemas,
  ...expenseSchemas,
  ...productSchemas,
  ...purchaseSchemas,
  ...inventoryLotsSchemas,
  ...saleSchemas,
  ...incomeSchemas,
  ...balanceSchemas,
};
