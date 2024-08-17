const mongoose = require("mongoose");

const textSchema = new mongoose.Schema({
  videoNo: String,
  videoText: String,
});
const Text = mongoose.model("Text", textSchema);

module.exports = Text;
