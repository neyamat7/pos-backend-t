import activityLogModel from "./activityLog.model.js";
import { resolveDetail } from "./detailResolver.js";

// Get all activity logs with pagination and filters
export const getAllActivityLogs = async ({ page, limit, action, by, model_name }) => {
  const query = {};

  if (action) query.action = action;
  if (by) query.by = by;
  if (model_name) query.model_name = model_name;

  const skip = (page - 1) * limit;
  const total = await activityLogModel.countDocuments(query);

  const logs = await activityLogModel
    .find(query)
    .populate("by", "name email role")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    logs,
  };
};

// Get single activity log by ID
export const getActivityLogById = async (id) => {
  return await activityLogModel.findById(id).populate("by", "name email role");
};

// Get activity log by ID and resolve its related document
export const getActivityLogDetails = async (id) => {
  const log = await activityLogModel
    .findById(id)
    .populate("by", "name email role")
    .lean();

  if (!log) {
    throw new Error("Activity log not found");
  }

  let details = null;
  if (log.logs_fields_id) {
    details = await resolveDetail(log.model_name, log.logs_fields_id);
  }

  return { ...log, details };
};
