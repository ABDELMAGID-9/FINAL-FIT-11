const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
const app = express();

// DB
connectDB();

// Middlewares
app.use(express.json({ limit: "1mb" }));

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  methods: ["GET","HEAD","PUT","PATCH","POST","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.use(morgan("dev"));

// Health
app.get("/api/health", (req, res) => res.json({ ok: true }));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/workouts", require("./routes/workouts"));
app.use("/api/ai", require("./routes/ai"));
app.use("/api/nutrition", require("./routes/nutrition"));
app.use("/api/users", require("./routes/users"));
app.use("/api/posts", require("./routes/Post"));

// Error handler
app.use((err, req, res, next) => {
  console.error("ERR:", err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`> API running on port ${PORT}`));
