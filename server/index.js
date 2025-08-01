const express = require("express");
require("dotenv").config();
const { initializeTables } = require("./initTables");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const postRoutes = require("./routes/post.routes");
const cors = require("cors");

// Import models to trigger table creation
require("./models/post.model");
require("./models/comment.model");
require("./models/like.model");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: ["https://blog-app-front-one.vercel.app/", "http://localhost:5173"],
    credentials: true,
  })
);

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/posts", postRoutes);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

async function startServer() {
  try {
    initializeTables();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
