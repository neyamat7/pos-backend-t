/**
 * Logs an activity event to the database.
 * @param {Object} options
 * @param {String} options.model_name - The name of the model affected (e.g., "Customer")
 * @param {String|ObjectId} options.logs_fields_id - The affected document's _id
 * @param {String|ObjectId} options.by - The user who performed the action
 * @param {String} options.action - Enum: Added, Created, Returned, Updated, Deleted, Payment
 * @param {String} [options.note] - Optional note or description
 * @param {import('mongoose').ClientSession} [options.session] - Optional MongoDB session; when provided, the log write is part of the caller's transaction
 */

import activityLogModel from "../features/activity_logs/activityLog.model.js";

export const logActivity = async ({
  model_name,
  logs_fields_id,
  by,
  action,
  note = "",
  session,
}) => {
  if (session) {
    // Inside a transaction — let errors propagate so the transaction rolls back
    await activityLogModel.create(
      [{ model_name, logs_fields_id, by, action, note }],
      { session }
    );
  } else {
    // Outside a transaction — swallow errors so a log failure never breaks the operation
    try {
      await activityLogModel.create({
        model_name,
        logs_fields_id,
        by,
        action,
        note,
      });
    } catch (error) {
      console.error("Failed to log activity:", error.message);
    }
  }
};
