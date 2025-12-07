const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function auth(req, res, next) {
  try {
    const hdr = req.headers.authorization || "";
    const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
    if (!token) return res.status(401).json({ message: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ⛔ قبل: req.user = { id: decoded.id };
    // ✅ الآن:
    const user = await User.findById(decoded.id).select("-passwordHash");
    if (!user) return res.status(401).json({ message: "Invalid token user" });

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};
