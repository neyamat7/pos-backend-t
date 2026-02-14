/**
 *  customer API Paths
 * --------------------------------------------
 *  This file defines all OpenAPI/Swagger path
 *  specifications for customer-related endpoints for documentation.
 *
 */

export const customerPaths = {
  "/api/v1/customer/all": {
    get: {
      tags: ["Customers"],
      summary: "Get all customers",
      description:
        "Retrieve a list of all customers with their complete information including basic info, contact details, account balance and crate tracking",
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
          description: "List of customers retrieved successfully",
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
                      $ref: "#/components/schemas/Customer",
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

  "/api/v1/customer/details/{id}": {
    get: {
      tags: ["Customers"],
      summary: "Get customer by ID",
      description: "Retrieve a single customer by their MongoDB ObjectId",
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: {
            type: "string",
          },
          description: "MongoDB ObjectId of the customer",
          example: "68fca33d6f0ffeab02d26ca5",
        },
      ],
      responses: {
        200: {
          description: "Customer retrieved successfully",
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
                    $ref: "#/components/schemas/Customer",
                  },
                },
              },
            },
          },
        },
        404: {
          description: "Customer not found",
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

  "/api/v1/customer": {
    get: {
      tags: ["Customers"],
      summary: "Search customers by query",
      description:
        "Search and filter customers by name, email, phone, or location",
      parameters: [
        {
          in: "query",
          name: "name",
          schema: {
            type: "string",
          },
          description: "Search by customer name",
          example: "Ahmed",
        },
        {
          in: "query",
          name: "email",
          schema: {
            type: "string",
          },
          description: "Search by customer email",
          example: "ahmed@example.com",
        },
        {
          in: "query",
          name: "phone",
          schema: {
            type: "string",
          },
          description: "Search by customer phone number",
          example: "+8801712345678",
        },
        {
          in: "query",
          name: "location",
          schema: {
            type: "string",
          },
          description: "Search by customer location",
          example: "Dhaka",
        },
      ],
      responses: {
        200: {
          description: "Customers retrieved successfully",
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
                      $ref: "#/components/schemas/Customer",
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

  "/api/v1/customer/add": {
    post: {
      tags: ["Customers"],
      summary: "Create a new customer",
      description:
        "Register a new customer in the system with their basic info, contact details, account and crate information",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/CustomerInput",
            },
          },
        },
      },
      responses: {
        201: {
          description: "Customer created successfully",
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
                    example: "Customer created successfully",
                  },
                  data: {
                    $ref: "#/components/schemas/Customer",
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

  "/api/v1/customer/update/{id}": {
    put: {
      tags: ["Customers"],
      summary: "Update customer by ID",
      description:
        "Update an existing customer's information including basic info, contact, account and crate details",
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: {
            type: "string",
          },
          description: "MongoDB ObjectId of the customer",
          example: "68fca2c1fbe9916a7a90d65e",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/CustomerUpdate",
            },
          },
        },
      },
      responses: {
        200: {
          description: "Customer updated successfully",
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
                    example: "Customer updated successfully",
                  },
                  data: {
                    $ref: "#/components/schemas/Customer",
                  },
                },
              },
            },
          },
        },
        404: {
          description: "Customer not found",
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
