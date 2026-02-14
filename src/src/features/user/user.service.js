import userModel from "./user.model.js";

export async function getAllUsers(page, limit) {
  const skip = (page - 1) * limit;

  const total = await userModel.countDocuments();
  const users = await userModel
    .find()
    .sort({ createdAt: -1, _id: -1 })
    .skip(skip)
    .limit(limit);

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    users,
  };
}

export async function getUserById(id) {
  return await userModel.findById(id);
}

export const getUsersByRole = async (role) => {
  // Validate role input
  const validRoles = ["user", "admin", "manager", "operator", "staff"];

  if (!validRoles.includes(role)) {
    throw new Error("Invalid role. Allowed roles: user, admin, staff");
  }

  // Query users by role
  const users = await userModel.find({ role }).select("-password"); // hide passwords

  return users;
};
