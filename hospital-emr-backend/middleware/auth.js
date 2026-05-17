const { verifyToken } = require("../utils/auth");

function requireAuth(req, res, next) {
  const header = req.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const staff = verifyToken(token);

  if (!staff) {
    return res.status(401).json({ error: "Sign in required" });
  }

  req.staff = staff;
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.staff) return res.status(401).json({ error: "Sign in required" });
    if (!roles.includes(req.staff.role)) {
      return res.status(403).json({ error: "You are not authorized to access this patient data" });
    }
    next();
  };
}

module.exports = {
  requireAuth,
  requireRole
};
