export const supplierPaths = {
  "/api/v1/suppliers/all": {
    get: {
      tags: ["Suppliers"],
      summary: "Get all suppliers",
      description:
        "Retrieve a list of all suppliers with their complete information including basic info, contact details, account balance and crate tracking",

      parameters: [
        {
          in: "query",
          name: "page",
          schema: {
            type: "integer",
            default: 1,
          },
          description: "Page number for pagination",
          example: 1,
        },
        {
          in: "query",
          name: "limit",
          schema: {
            type: "integer",
            default: 10,
          },
          description: "Number of items per page",
          example: 10,
        },
      ],

      responses: {
        200: {
          description: "List of suppliers retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: {
                    type: "string",
                    example: "success",
                  },
                  data: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/Supplier",
                    },
                  },
                },
              },
            },
          },
        },
        500: {
          description: "Server error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
      },
    },
  },

  "/api/v1/suppliers/details/{id}": {
    get: {
      tags: ["Suppliers"],
      summary: "Get supplier by ID",
      description: "Retrieve a single supplier by their MongoDB ObjectId",
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: {
            type: "string",
          },
          description: "MongoDB ObjectId of the supplier",
          example: "507f1f77bcf86cd799439011",
        },
      ],
      responses: {
        200: {
          description: "Supplier retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: {
                    type: "string",
                    example: "success",
                  },
                  data: {
                    $ref: "#/components/schemas/Supplier",
                  },
                },
              },
            },
          },
        },
        404: {
          description: "Supplier not found",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
        500: {
          description: "Server error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
      },
    },
  },

  "/api/v1/suppliers": {
    get: {
      tags: ["Suppliers"],
      summary: "Search suppliers by query",
      description:
        "Search and filter suppliers by name, email, phone, or location",
      parameters: [
        {
          in: "query",
          name: "name",
          schema: {
            type: "string",
          },
          description: "Search by supplier name",
          example: "Rahman Suppliers",
        },
        {
          in: "query",
          name: "email",
          schema: {
            type: "string",
          },
          description: "Search by supplier email",
          example: "rahman@example.com",
        },
        {
          in: "query",
          name: "phone",
          schema: {
            type: "string",
          },
          description: "Search by supplier phone number",
          example: "+8801712345678",
        },
        {
          in: "query",
          name: "location",
          schema: {
            type: "string",
          },
          description: "Search by supplier location",
          example: "Dhaka",
        },
      ],
      responses: {
        200: {
          description: "Suppliers retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: {
                    type: "string",
                    example: "success",
                  },
                  data: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/Supplier",
                    },
                  },
                },
              },
            },
          },
        },
        500: {
          description: "Server error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
      },
    },
  },

  "/api/v1/suppliers/add": {
    post: {
      tags: ["Suppliers"],
      summary: "Create a new supplier",
      description:
        "Add a new supplier to the system with basic info, contact details, account and crate information",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/SupplierInput",
            },
          },
        },
      },
      responses: {
        201: {
          description: "Supplier created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: {
                    type: "string",
                    example: "success",
                  },
                  message: {
                    type: "string",
                    example: "Supplier created successfully",
                  },
                  data: {
                    $ref: "#/components/schemas/Supplier",
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Invalid input",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
        500: {
          description: "Server error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
      },
    },
  },

  "/api/v1/suppliers/update/{id}": {
    put: {
      tags: ["Suppliers"],
      summary: "Update supplier by ID",
      description:
        "Update an existing supplier's information including basic info, contact, account and crate details",
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: {
            type: "string",
          },
          description: "MongoDB ObjectId of the supplier",
          example: "507f1f77bcf86cd799439011",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/SupplierInput",
            },
          },
        },
      },
      responses: {
        200: {
          description: "Supplier updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: {
                    type: "string",
                    example: "success",
                  },
                  message: {
                    type: "string",
                    example: "Supplier updated successfully",
                  },
                  data: {
                    $ref: "#/components/schemas/Supplier",
                  },
                },
              },
            },
          },
        },
        404: {
          description: "Supplier not found",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
        400: {
          description: "Invalid input",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
        500: {
          description: "Server error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
      },
    },
  },
};
