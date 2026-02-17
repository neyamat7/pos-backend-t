export const inventoryLotsPaths = {
  "/api/v1/inventoryLots/all": {
    get: {
      tags: ["Inventory Lots"],
      summary: "Get all inventory lots",
      description:
        "Retrieve a list of all inventory lots with product, supplier, and profit information",

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
          description: "List of inventory lots retrieved successfully",
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
                      $ref: "#/components/schemas/InventoryLot",
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

  "/api/v1/inventoryLots/details/{id}": {
    get: {
      tags: ["Inventory Lots"],
      summary: "Get inventory lot by ID",
      description:
        "Retrieve detailed information about a specific inventory lot by its MongoDB ObjectId",
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: {
            type: "string",
          },
          description: "MongoDB ObjectId of the inventory lot",
          example: "507f1f77bcf86cd799439011",
        },
      ],
      responses: {
        200: {
          description: "Inventory lot retrieved successfully",
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
                    $ref: "#/components/schemas/InventoryLot",
                  },
                },
              },
            },
          },
        },
        404: {
          description: "Inventory lot not found",
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

  "/api/v1/inventoryLots/in-stock": {
    get: {
      tags: ["Inventory Lots"],
      summary: "Get all in-stock lots",
      description:
        "Retrieve a list of all inventory lots that are currently in stock",
      responses: {
        200: {
          description: "List of in-stock lots retrieved successfully",
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
                      $ref: "#/components/schemas/InventoryLot",
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

  "/api/v1/inventoryLots/by-supplier/{id}": {
    get: {
      tags: ["Inventory Lots"],
      summary: "Get inventory lots by supplier ID",
      description: "Retrieve all inventory lots for a specific supplier",
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
        {
          in: "query",
          name: "page",
          schema: { type: "integer", default: 1 },
          description: "Page number for pagination",
        },
        {
          in: "query",
          name: "limit",
          schema: { type: "integer", default: 10 },
          description: "Number of items per page",
        },
        {
          in: "query",
          name: "search",
          schema: { type: "string" },
          description: "Search keyword to filter inventory lots",
        },
        {
          in: "query",
          name: "fromDate",
          schema: { type: "string", format: "date" },
          description: "Filter results from this date (inclusive)",
        },
        {
          in: "query",
          name: "toDate",
          schema: { type: "string", format: "date" },
          description: "Filter results up to this date (inclusive)",
        },
      ],
      responses: {
        200: {
          description: "Inventory lots retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", example: "success" },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/InventoryLot" },
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
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        500: {
          description: "Server error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
      },
    },
  },

  "/api/v1/inventoryLots/add/?id=xyz": {
    post: {
      tags: ["Inventory Lots"],
      summary: "Create new inventory lots",
      description:
        "Create new inventory lots with product, supplier, purchase details, costs, sales, and profit tracking",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/InventoryLotInput",
            },
          },
        },
      },
      responses: {
        201: {
          description: "Inventory lot created successfully",
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
                    example: "Inventory lot created successfully",
                  },
                  data: {
                    $ref: "#/components/schemas/InventoryLot",
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

  "/api/v1/inventoryLots/status/{id}": {
    put: {
      tags: ["Inventory Lots"],
      summary: "Update lot status",
      description:
        "Update the status of an inventory lot (in stock or stock out)",
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: {
            type: "string",
          },
          description: "MongoDB ObjectId of the inventory lot",
          example: "507f1f77bcf86cd799439011",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/LotStatusUpdate",
            },
          },
        },
      },
      responses: {
        200: {
          description: "Lot status updated successfully",
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
                    example: "Lot status updated successfully",
                  },
                  data: {
                    $ref: "#/components/schemas/InventoryLot",
                  },
                },
              },
            },
          },
        },
        404: {
          description: "Inventory lot not found",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
        400: {
          description: "Invalid status value",
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
