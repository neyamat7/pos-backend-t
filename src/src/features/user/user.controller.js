import { getAllUsers, getUserById, getUsersByRole } from "./user.service.js";

export async function getAll(req, res) {
  try {
    const { page = 1, limit = 10 } = req.query;
    const users = await getAllUsers(parseInt(page), parseInt(limit));

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getById(req, res) {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export const filterUsersByRole = async (req, res) => {
  try {
    const users = await getUsersByRole(req.params.role);

    if (users.length === 0) {
      return res
        .status(404)
        .json({ message: `No users found with role: ${role}` });
    }

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
