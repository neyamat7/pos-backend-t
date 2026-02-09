export const expensePaths = {
  "/api/v1/expenses/all": {
    get: {
      tags: ["Expenses"],
      summary: "Get all expenses",
      description: "Retrieve a paginated list of all expenses",
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
          description: "List of expenses retrieved successfully",
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
                      $ref: "#/components/schemas/Expense",
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

  "/api/v1/expenses/add": {
    post: {
      tags: ["Expenses"],
      summary: "Create a new expense",
      description: "Add a new expense record to the system",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ExpenseInput",
            },
          },
        },
      },
      responses: {
        201: {
          description: "Expense created successfully",
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
                    example: "Expense created successfully",
                  },
                  data: {
                    $ref: "#/components/schemas/Expense",
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

  "/api/v1/expenses/update/{id}": {
    put: {
      tags: ["Expenses"],
      summary: "Update expense by ID",
      description: "Update an existing expense's information",
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: {
            type: "string",
          },
          description: "MongoDB ObjectId of the expense",
          example: "507f1f77bcf86cd799439011",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ExpenseUpdate",
            },
          },
        },
      },
      responses: {
        200: {
          description: "Expense updated successfully",
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
                    example: "Expense updated successfully",
                  },
                  data: {
                    $ref: "#/components/schemas/Expense",
                  },
                },
              },
            },
          },
        },
        404: {
          description: "Expense not found",
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
