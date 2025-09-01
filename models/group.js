const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  groupName: { type: String, required: true, unique: true },  // for URL ("group-number-1")
  displayName: { type: String, required: true },              // for UI ("Group Number 1")
});

module.exports = mongoose.model("Group", groupSchema);