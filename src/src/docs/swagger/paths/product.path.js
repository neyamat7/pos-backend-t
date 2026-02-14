export const productPaths = {
  "/api/v1/products/all": {
    get: {
      tags: ["Products"],
      summary: "Get all products",
      description: "Retrieve a paginated list of all products",
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
          description: "List of products retrieved successfully",
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
                      $ref: "#/components/schemas/Product",
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

  "/api/v1/products/details/{id}": {
    get: {
      tags: ["Products"],
      summary: "Get product by ID",
      description: "Retrieve a single product by its MongoDB ObjectId",
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: {
            type: "string",
          },
          description: "MongoDB ObjectId of the product",
          example: "507f1f77bcf86cd799439011",
        },
      ],
      responses: {
        200: {
          description: "Product retrieved successfully",
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
                    $ref: "#/components/schemas/Product",
                  },
                },
              },
            },
          },
        },
        404: {
          description: "Product not found",
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

  "/api/v1/products/add": {
    post: {
      tags: ["Products"],
      summary: "Create a new product",
      description: "Add a new product to the system",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ProductInput",
            },
          },
        },
      },
      responses: {
        201: {
          description: "Product created successfully",
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
                    example: "Product created successfully",
                  },
                  data: {
                    $ref: "#/components/schemas/Product",
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

  "/api/v1/products/update/{id}": {
    put: {
      tags: ["Products"],
      summary: "Update product by ID",
      description: "Update an existing product's information",
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: {
            type: "string",
          },
          description: "MongoDB ObjectId of the product",
          example: "507f1f77bcf86cd799439011",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ProductUpdate",
            },
          },
        },
      },
      responses: {
        200: {
          description: "Product updated successfully",
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
                    example: "Product updated successfully",
                  },
                  data: {
                    $ref: "#/components/schemas/Product",
                  },
                },
              },
            },
          },
        },
        404: {
          description: "Product not found",
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
