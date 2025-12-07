const mongoose = require("mongoose");

module.exports = async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI is missing in .env");
    process.exit(1);
  }
  try {
    await mongoose.connect(uri, { autoIndex: true });
    console.log("> MongoDB connected");
  } catch (err) {
    console.error("Mongo error:", err.message);
    process.exit(1);
  }
};
