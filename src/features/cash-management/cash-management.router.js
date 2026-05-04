import express from "express";
import * as cashManagementController from "./cash-management.controller.js";
import { authMiddleware, adminMiddleware } from "../../middleware/auth.js";

const router = express.Router();

// Routes
router.get("/", authMiddleware, cashManagementController.getDailyCash);
router.post("/cash-in", authMiddleware, adminMiddleware, cashManagementController.addCashIn);
router.post("/cash-out", authMiddleware, adminMiddleware, cashManagementController.addCashOut);
router.get("/history", authMiddleware, cashManagementController.getDailyCashHistory);

export default router;
