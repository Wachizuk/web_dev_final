const mongoose = require("mongoose");
const { Schema } = mongoose;

const groupSchema = new mongoose.Schema(
  {
    groupName: { type: String, required: true, unique: true, index: true, trim: true }, 
    displayName: { type: String, default: "", required: true },
    description: { type: String, default: "" },
    coverFile: { type: String, default: "" },
  
    members: {
    admins: [{ type: Schema.Types.ObjectId, ref: "User", required: true, default: [] }],
    managers: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    plainUsers: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  }, // admins, managers, plain users
  },
  { timestamps: true }
);

module.exports = mongoose.model("Group", groupSchema);
