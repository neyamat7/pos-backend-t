/**
 * Logs an activity event to the database.
 * @param {Object} options
 * @param {String} options.model_name - The name of the model affected (e.g., "Customer")
 * @param {String|ObjectId} options.logs_fields_id - The affected document's _id
 * @param {String|ObjectId} options.by - The user who performed the action
 * @param {String} options.action - Enum: Added, Created, Returned, Updated, Deleted, Payment
 * @param {String} [options.note] - Optional note or description
 */

import activityLogModel from "../features/activity_logs/activityLog.model.js";

export const logActivity = async ({
  model_name,
  logs_fields_id,
  by,
  action,
  note = "",
}) => {
  try {
    let activity = await activityLogModel.create({
      model_name,
      logs_fields_id,
      by,
      action,
      note,
    });

    // console.log(activity);
  } catch (error) {
    console.error("Failed to log activity:", error.message);
  }
};
