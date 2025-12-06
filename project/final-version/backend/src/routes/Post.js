const express = require("express");
const auth = require("../middleware/auth");
const mongoose = require("mongoose");
const router = express.Router();
const User = require("../models/User");

/* ============================
      SCHEMA
============================= */
const PostSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    authorName: String,
    authorAvatar: String,
    content: String,
    images: [String],
    likes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
        authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        authorName: String,
        authorAvatar: String,
        content: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

PostSchema.index({ createdAt: -1 });

const Post = mongoose.model("Post", PostSchema);

/* ============================
    HELPER: UPDATE POINTS
============================= */
async function addPoints(userId, amount) {
  if (amount === 0) return;

  const user = await User.findById(userId);
  if (!user) return;

  user.points += amount;
  if (user.points < 0) user.points = 0;

  if (amount > 0) {
    user.lifetimePoints = (user.lifetimePoints || 0) + amount;
  }

  await user.save();
}

/* ============================
    GET ALL POSTS
============================= */
router.get("/", async (req, res, next) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({ ok: true, posts });
  } catch (err) {
    console.error("❌ Error loading posts:", err);
    next(err);
  }
});

/* ============================
    CREATE POST (+10 points)
============================= */
router.post("/", auth, async (req, res, next) => {
  try {
    const { content, images } = req.body;
    const user = req.user;

    const post = await Post.create({
      authorId: user._id,
      authorName: `${user.firstName} ${user.lastName}`,
      authorAvatar: user.avatar || "",
      content,
      images,
    });

    // نقاط +10
    await addPoints(user._id, 10);

    res.status(201).json({ ok: true, post });
  } catch (err) {
    next(err);
  }
});

/* ============================
    DELETE POST (-10 points)
============================= */
router.delete("/:id", auth, async (req, res, next) => {
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      authorId: req.user._id,
    });

    if (!post) return res.status(404).json({ message: "Not found" });

    // خصم نقاط -10
    await addPoints(req.user._id, -10);

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/* ============================
    ADD COMMENT  (+5 points)
============================= */
router.post("/:id/comments", auth, async (req, res, next) => {
  try {
    const { content } = req.body;

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({
      authorId: req.user._id,
      authorName: `${req.user.firstName} ${req.user.lastName}`,
      authorAvatar: req.user.avatar || "",
      content,
    });

    await post.save();

    // نقاط +5 لصاحب التعليق
    await addPoints(req.user._id, 5);

    res.json({ ok: true, comments: post.comments });
  } catch (err) {
    next(err);
  }
});

/* ============================
 DELETE COMMENT (-5 points)
============================= */
router.delete("/:postId/comments/:commentId", auth, async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // فقط صاحب التعليق يحذف
    if (String(comment.authorId) !== String(req.user._id))
      return res.status(403).json({ message: "Unauthorized" });

    comment.deleteOne();
    await post.save();

    // خصم نقاط -5
    await addPoints(req.user._id, -5);

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/* ============================
    LIKE / UNLIKE POST
============================= */
router.post("/:id/like", auth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user._id;
    const alreadyLiked = post.likedBy.includes(userId);

    if (alreadyLiked) {
      // إزالة لايك
      post.likedBy.pull(userId);
      post.likes -= 1;

      await post.save();
      return res.json({ ok: true, likes: post.likes });
    } else {
      // إضافة لايك
      post.likedBy.push(userId);
      post.likes += 1;

      await post.save();

      // نقاط +1 لصاحب البوست
      await addPoints(post.authorId, 1);

      return res.json({ ok: true, likes: post.likes });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
