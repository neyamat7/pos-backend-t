import { schemas } from "../docs/swagger/components/schemas.js";
import { tags } from "../docs/swagger/tags.js";

import { userPaths } from "../docs/swagger/paths/user.paths.js";
import { categoryPaths } from "../docs/swagger/paths/category.path.js";
import { customerPaths } from "../docs/swagger/paths/customer.path.js";
import { activityLogPaths } from "../docs/swagger/paths/activityLog.path.js";
import { supplierPaths } from "../docs/swagger/paths/supplier.path.js";
import { accountPaths } from "../docs/swagger/paths/account.path.js";
import { expensePaths } from "../docs/swagger/paths/expense.path.js";
import { productPaths } from "../docs/swagger/paths/product.path.js";
import { purchasePaths } from "../docs/swagger/paths/purchase.path.js";
import { inventoryLotsPaths } from "../docs/swagger/paths/inventoryLots.paths.js";
import { salePaths } from "../docs/swagger/paths/sale.paths.js";
import { incomePaths } from "../docs/swagger/paths/income.path.js";
import { balancePaths } from "../docs/swagger/paths/balance.paths.js";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Nexrox POS Inventory  API",
    version: "1.0.0",
    description:
      "A comprehensive REST API for managing POS inventory system with user authentication, product management, and order processing.",
    // contact: {
    //   name: "API Support",
    //   email: "hh",
    // },
    // license: {
    //   name: "MIT",
    //   url: "hh",
    // },
  },

  servers: [
    {
      url: process.env.API_URL || "http://localhost:8000",
      description: "Development server",
    },
    {
      url: "https://pos-inventory-server.vercel.app",
      description: "Production server",
    },
  ],

  tags,
  components: {
    schemas,
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT token",
      },
    },
  },

  // paths
  paths: {
    ...activityLogPaths,
    ...userPaths,
    ...customerPaths,
    ...supplierPaths,
    ...categoryPaths,
    ...accountPaths,
    ...expensePaths,
    ...productPaths,
    ...purchasePaths,
    ...inventoryLotsPaths,
    ...salePaths,
    ...incomePaths,
    ...balancePaths,
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

export default swaggerDefinition;
