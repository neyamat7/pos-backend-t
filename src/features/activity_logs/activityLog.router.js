import express from "express";
import {
    getActivityLogDetails,
    getAllActivityLogs
} from "./activityLog.controller.js";

const router = express.Router();

// get all activity logs
router.get("/all", getAllActivityLogs);

// get single activity log by ID with resolved related document
router.get("/details/:id", getActivityLogDetails);

export default router;
