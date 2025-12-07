const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

const sign = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

/* ============================
    REGISTER
============================= */
router.post("/register", async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, gymLevel } = req.body || {};
    if (!firstName || !lastName || !email || !password)
      return res.status(400).json({ message: "Missing fields" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already used" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      firstName,
      lastName,
      email,
      passwordHash,
      gymLevel,
      points: 0,
      lifetimePoints: 0,
    });

    const token = sign(user);
    res.json({
      token,
      user: {
        id: user._id,
        firstName,
        lastName,
        email,
        gymLevel: user.gymLevel,
        points: user.points,
        avatar: user.avatar,
        bio: user.bio,
      },
    });
  } catch (e) {
    next(e);
  }
});

/* ============================
    LOGIN
============================= */
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const user = await User.findOne({ email });

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = sign(user);
    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        gymLevel: user.gymLevel,
        points: user.points,
        avatar: user.avatar,
        bio: user.bio,
      },
    });
  } catch (e) {
    next(e);
  }
});

/* ============================
    GET USER /me
============================= */
router.get("/me", auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    res.json({ user });
  } catch (e) {
    next(e);
  }
});

/* ============================
    UPDATE PROFILE
============================= */
router.put("/profile", auth, async (req, res, next) => {
  try {
    const { firstName, lastName, email, bio, avatar } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.json({ ok: true, user });
  } catch (err) {
    next(err);
  }
});

/* ============================
    CHANGE PASSWORD
============================= */
router.put("/change-password", auth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res
        .status(400)
        .json({ message: "Both current and new passwords are required" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch)
      return res.status(401).json({ message: "Current password is incorrect" });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

/* ============================
    UPDATE POINTS  (NEW)
============================= */
// body = { amount: number }
router.put("/points", auth, async (req, res, next) => {
  try {
    const { amount } = req.body;

    if (typeof amount !== "number")
      return res.status(400).json({ message: "amount must be a number" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // إضافة النقاط
    user.points += amount;
    if (user.points < 0) user.points = 0;

    // lifetimePoints يزيد فقط عند الإضافة وليس الحذف
    if (amount > 0) user.lifetimePoints += amount;

    await user.save();

    res.json({
      ok: true,
      points: user.points,
      lifetimePoints: user.lifetimePoints,
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
