const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    authorName: String,
    authorAvatar: String,
    content: String,
    images: [String],
    likes: { type: Number, default: 0 },
    comments: [
      {
        authorName: String,
        authorAvatar: String,
        content: String,
        likes: { type: Number, default: 0 },
        createdAt: { type: Date, default: Date.now },
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
