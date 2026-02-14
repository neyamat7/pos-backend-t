import express from "express";
import * as cashManagementController from "./cash-management.controller.js";

const router = express.Router();

// Routes
router.get("/", cashManagementController.getDailyCash);
router.post("/cash-in", cashManagementController.addCashIn);
router.post("/cash-out", cashManagementController.addCashOut);
router.get("/history", cashManagementController.getDailyCashHistory);

export default router;
