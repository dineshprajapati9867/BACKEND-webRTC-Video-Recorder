const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  mergedPath: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});


const Video = mongoose.model("Video", videoSchema);

module.exports = Video;
