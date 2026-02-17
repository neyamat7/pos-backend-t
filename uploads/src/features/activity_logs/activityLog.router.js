import express from "express";
import {
  getAllActivityLogs,
  getActivityLogById,
} from "./activityLog.controller.js";

const router = express.Router();

// get all activity logs
router.get("/all", getAllActivityLogs);

// get single activity log by ID
router.get("/details/:id", getActivityLogById);

export default router;
