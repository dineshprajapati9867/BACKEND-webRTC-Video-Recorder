const express = require("express");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const videoRoutes = require("./routes/videoRoutes");
const fs = require("fs");

require("dotenv").config();

const app = express();

// Middleware
app.use(cors());

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Ensure directories exist
const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};
ensureDirectoryExists("uploads");
ensureDirectoryExists("merged");

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("Error connecting to MongoDB", err));

// Routes
app.use("/api", videoRoutes);

// const PORT = 3001;
app.listen(process.env.PORT,  () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`);
});
