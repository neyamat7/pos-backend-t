import jwt from "jsonwebtoken";

// Middleware to check if user is logged in
export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1]; // Expect: "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    // Verify JWT with the same secret as NextAuth
    const decoded = jwt.verify(token, process.env.AUTH_SECRET);
    // console.log(decoded);

    req.user = decoded; // { id, role }
    // console.log("form middleware auth", req.user);

    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
