// backend/src/routes/users.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");

/* ============================
    GET ALL USERS STATS
============================= */
/*
 يرجّع قائمة بكل المستخدمين:
 [
   {
     id,
     firstName,
     lastName,
     fullName,
     avatar,
     points,
     stats: { posts, comments, likesReceived }
   }
 ]
*/

router.get("/stats", async (req, res, next) => {
  try {
    const users = await User.find({})
      .select("firstName lastName avatar points stats")
      .lean();

    const formatted = users.map(u => ({
      id: u._id,
      firstName: u.firstName,
      lastName: u.lastName,
      fullName: `${u.firstName} ${u.lastName}`,
      avatar: u.avatar || "",
      points: u.points || 0,
      stats: {
        posts: u.stats?.posts || 0,
        comments: u.stats?.comments || 0,
        likesReceived: u.stats?.likesReceived || 0,
      },
    }));

    res.json({ ok: true, users: formatted });
  } catch (err) {
    console.error("❌ Error loading user stats:", err);
    res.status(500).json({ ok: false, message: "Failed to load user stats" });
  }
});

module.exports = router;
