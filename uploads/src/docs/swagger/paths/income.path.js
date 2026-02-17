export const incomePaths = {
  "/api/v1/income/all": {
    get: {
      tags: ["Incomes"],
      summary: "Get all incomes",
      description:
        "Retrieve a paginated list of incomes with optional search and date filters",
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

        {
          in: "query",
          name: "fromDate",
          schema: {
            type: "string",
            format: "date",
          },
          description: "Start date for filtering incomes (YYYY-MM-DD)",
          example: "2025-10-01",
        },
        {
          in: "query",
          name: "toDate",
          schema: {
            type: "string",
            format: "date",
          },
          description: "End date for filtering incomes (YYYY-MM-DD)",
          example: "2025-10-31",
        },
      ],
      responses: {
        200: {
          description: "List of incomes retrieved successfully",
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
                      $ref: "#/components/schemas/Income",
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

  "/api/v1/income/details/{id}": {
    get: {
      tags: ["Incomes"],
      summary: "Get income by ID",
      description:
        "Retrieve detailed information about a specific income by its MongoDB ObjectId",
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: {
            type: "string",
          },
          description: "MongoDB ObjectId of the income",
          example: "507f1f77bcf86cd799439011",
        },
      ],
      responses: {
        200: {
          description: "Income retrieved successfully",
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
                    $ref: "#/components/schemas/Income",
                  },
                },
              },
            },
          },
        },
        404: {
          description: "Income not found",
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

  "/api/v1/income/stats/summary": {
    get: {
      tags: ["Incomes"],
      summary: "Get income statistics summary",
      description:
        "Retrieve statistical summary of incomes for a specified date range",
      parameters: [
        {
          in: "query",
          name: "fromDate",
          schema: {
            type: "string",
            format: "date",
          },
          description: "Start date for statistics (YYYY-MM-DD)",
          example: "2025-10-01",
        },
        {
          in: "query",
          name: "toDate",
          schema: {
            type: "string",
            format: "date",
          },
          description: "End date for statistics (YYYY-MM-DD)",
          example: "2025-10-31",
        },
      ],
      responses: {
        200: {
          description: "Income statistics retrieved successfully",
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
                    type: "object",
                    properties: {
                      totalIncome: {
                        type: "number",
                        example: 150000,
                      },
                      totalTransactions: {
                        type: "integer",
                        example: 45,
                      },
                      averageIncome: {
                        type: "number",
                        example: 3333.33,
                      },
                      totalCommission: {
                        type: "number",
                        example: 4000,
                      },
                      totalDue: {
                        type: "number",
                        example: 5000,
                      },
                      period: {
                        type: "object",
                        properties: {
                          from: {
                            type: "string",
                            example: "2025-10-01",
                          },
                          to: {
                            type: "string",
                            example: "2025-10-31",
                          },
                        },
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

  "/api/v1/income/periods": {
    get: {
      tags: ["Incomes"],
      summary: "Get all income periods",
      description:
        "Retrieve a list of all distinct income periods or date ranges",
      responses: {
        200: {
          description: "Income periods retrieved successfully",
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
                      type: "object",
                      properties: {
                        period: {
                          type: "string",
                          example: "2025-10",
                        },
                        totalIncome: {
                          type: "number",
                          example: 50000,
                        },
                        count: {
                          type: "integer",
                          example: 15,
                        },
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
};
