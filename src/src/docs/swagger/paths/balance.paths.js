export const balancePaths = {
  "/api/v1/balance/all/{id}": {
    get: {
      tags: ["Balances"],
      summary: "Get all balances for a user",
      description:
        "Retrieve a paginated list of balance transactions for a specific user with optional date and role filters",
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: {
            type: "string",
          },
          description: "MongoDB ObjectId of the user (customer/supplier)",
          example: "507f1f77bcf86cd799439011",
        },
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
        {
          in: "query",
          name: "fromDate",
          schema: {
            type: "string",
            format: "date",
          },
          description: "Start date for filtering balances (YYYY-MM-DD)",
          example: "2025-10-01",
        },
        {
          in: "query",
          name: "toDate",
          schema: {
            type: "string",
            format: "date",
          },
          description: "End date for filtering balances (YYYY-MM-DD)",
          example: "2025-10-31",
        },
        {
          in: "query",
          name: "role",
          schema: {
            type: "string",
            enum: ["customer", "vendor", "supplier"],
          },
          description: "Filter by user role",
          example: "customer",
        },
      ],
      responses: {
        200: {
          description: "Balance transactions retrieved successfully",
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
                      $ref: "#/components/schemas/Balance",
                    },
                  },
                  pagination: {
                    type: "object",
                    properties: {
                      currentPage: {
                        type: "integer",
                        example: 1,
                      },
                      totalPages: {
                        type: "integer",
                        example: 5,
                      },
                      totalItems: {
                        type: "integer",
                        example: 50,
                      },
                      limit: {
                        type: "integer",
                        example: 10,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        404: {
          description: "User not found",
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

  "/api/v1/balance/details/{id}": {
    get: {
      tags: ["Balances"],
      summary: "Get balance transaction by ID",
      description:
        "Retrieve detailed information about a specific balance transaction by its MongoDB ObjectId",
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: {
            type: "string",
          },
          description: "MongoDB ObjectId of the balance transaction",
          example: "507f1f77bcf86cd799439011",
        },
      ],
      responses: {
        200: {
          description: "Balance transaction retrieved successfully",
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
                    $ref: "#/components/schemas/Balance",
                  },
                },
              },
            },
          },
        },
        404: {
          description: "Balance transaction not found",
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

  "/api/v1/balance/add": {
    post: {
      tags: ["Balances"],
      summary: "Create a new balance transaction",
      description: "Add a new balance transaction for a customer or supplier",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/BalanceInput",
            },
          },
        },
      },
      responses: {
        201: {
          description: "Balance transaction created successfully",
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
                    example: "Balance transaction created successfully",
                  },
                  data: {
                    $ref: "#/components/schemas/Balance",
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
};
