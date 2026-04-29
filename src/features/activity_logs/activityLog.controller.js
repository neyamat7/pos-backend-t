import * as activityLogService from "./activityLog.services.js";

// @desc    Get all activity logs (with pagination & filters)
// @route   GET /api/v1/activity-logs
// @access  Admin
export const getAllActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, action, by, model_name } = req.query;

    const logs = await activityLogService.getAllActivityLogs({
      page: parseInt(page),
      limit: parseInt(limit),
      action,
      by,
      model_name,
    });

    res.status(200).json(logs);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get single activity log by ID
// @route   GET /api/v1/activity-logs/:id
// @access  Admin
export const getActivityLogById = async (req, res) => {
  try {
    const log = await activityLogService.getActivityLogById(req.params.id);

    if (!log) {
      return res.status(404).json({ message: "Activity log not found" });
    }

    res.status(200).json(log);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get activity log by ID with resolved related document
// @route   GET /api/v1/activity-logs/details/:id
// @access  Admin
export const getActivityLogDetails = async (req, res) => {
  try {
    const result = await activityLogService.getActivityLogDetails(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    if (err.message === "Activity log not found") {
      return res.status(404).json({ message: err.message });
    }
    res.status(400).json({ message: err.message });
  }
};
