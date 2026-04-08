import cors from "cors";
import express from "express";
import path from "path";
import swaggerUi from "swagger-ui-express";
import { fileURLToPath } from "url";
import swaggerSpec from "./config/swagger.config.js";

// routes
import accountRouter from "./features/account/account.routes.js";
import activityLogRouter from "./features/activity_logs/activityLog.router.js";
import analysisRoute from "./features/analysis/analysis.router.js";
import balanceRoute from "./features/balance/balance.router.js";
import cashManagementRouter from "./features/cash-management/cash-management.router.js";
import categoryRouter from "./features/categories/categories.router.js";
import customerRouter from "./features/customer/customer.router.js";
import customerCrateHistoryRoute from "./features/customerCrateHistory/customerCrateHistory.router.js";
import expensesRouter from "./features/expense/expense.routes.js";
import expenseRoute from "./features/expenseCategories/expenseCategories.router.js";
import imageRoute from "./features/image/image.router.js";
import incomeRoute from "./features/income/income.router.js";
import crateRoute from "./features/inventoryCrate/inventoryCrate.router.js";
import inventoryLotsRouter from "./features/inventoryLots/inventoryLots.router.js";
import paymentsRoute from "./features/payment/payment.router.js";
import productsRouter from "./features/products/products.router.js";
import purchaseRouter from "./features/purchase/purchase.router.js";
import saleRouter from "./features/sale/sale.router.js";
import settingsRouter from "./features/settings/settings.route.js";
import suppliersRouter from "./features/supplier/supplier.routes.js";
import userRouter from "./features/user/user.router.js";

const app = express();
const API_VERSION = process.env.API_VERSION || "/api/v1";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

const uploadsPath = path.resolve(__dirname, "..", "uploads");
app.use("/uploads", express.static(uploadsPath));

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 20px 0; }
      .swagger-ui .scheme-container { background: #fafafa; padding: 15px; }
    `,
    customSiteTitle: "POS Inventory API Docs",
    customfavIcon: "/favicon.ico",
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      tryItOutEnabled: true,
    },
  })
);

// root
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Pos Inventory server is running successfully",
    version: "1.0.0",
    apiVersion: API_VERSION,
    docs: "http://localhost:8000/docs",
    note: "Use the versioned API routes for all endpoints.",
  });
});

// Keep-alive ping endpoint
app.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

// routes declaration

// user routes
app.use(`${API_VERSION}/users`, userRouter);

// customer routes
app.use(`${API_VERSION}/customer`, customerRouter);

// suppliers routes
app.use(`${API_VERSION}/suppliers`, suppliersRouter);

// products routes
app.use(`${API_VERSION}/products`, productsRouter);

// category routes
app.use(`${API_VERSION}/categories`, categoryRouter);

// account routes
app.use(`${API_VERSION}/account`, accountRouter);

// expenses routes
app.use(`${API_VERSION}/expenses`, expensesRouter);

// activity routes
app.use(`${API_VERSION}/activity`, activityLogRouter);

// purchase routes
app.use(`${API_VERSION}/purchase`, purchaseRouter);

// inventory Lots routes
app.use(`${API_VERSION}/inventoryLots`, inventoryLotsRouter);

// inventory Lots routes
app.use(`${API_VERSION}/sale`, saleRouter);

// inventory Lots routes
app.use(`${API_VERSION}/income`, incomeRoute);

// balance  routes
app.use(`${API_VERSION}/balance`, balanceRoute);

// payments  routes
app.use(`${API_VERSION}/payment`, paymentsRoute);

// crates  routes
app.use(`${API_VERSION}/crates`, crateRoute);

// img  routes
app.use(`${API_VERSION}/image`, imageRoute);

// img  routes
app.use(`${API_VERSION}/analysis`, analysisRoute);

// Expense  routes
app.use(`${API_VERSION}/expense-category`, expenseRoute);

// Expense  routes
app.use(`${API_VERSION}/customer-crate-history`, customerCrateHistoryRoute);
app.use(`${API_VERSION}/daily-cash`, cashManagementRouter);
app.use(`${API_VERSION}/settings`, settingsRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
    docs: `http://localhost:${process.env.PORT || 8000}/docs`,
  });
});

// Global error handler for multer errors
app.use((err, req, res, next) => {
  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: "File size too large. Maximum size is 5MB",
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        error: "Too many files. Maximum is 10 files",
      });
    }
  }

  res.status(500).json({
    success: false,
    error: err.message || "Server Error",
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
});

export default app;
