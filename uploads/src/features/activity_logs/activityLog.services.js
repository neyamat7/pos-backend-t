import activityLogModel from "./activityLog.model.js";

// Get all activity logs with pagination and filters
export const getAllActivityLogs = async ({ page, limit, action, by }) => {
  const query = {};

  if (action) query.action = action;
  if (by) query.by = by;

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
