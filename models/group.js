const mongoose = require("mongoose");
const { Schema } = mongoose;

// const membersSchema = new mongoose.Schema(
//   {
//     admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
//     managers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//     plainUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//   },
//   { 
//     timestamps: true, // adds createdAt and updatedAt with auto updates
//   }
// );


// Define a schema for the 'group' collection

const groupSchema = new mongoose.Schema(
  {
    groupName: { type: String, required: true, unique: true, index: true, trim: true }, 
    displayName: { type: String, default: "", required: true },
    description: { type: String, default: "" },
  
    members: {
    admins: [{ type: Schema.Types.ObjectId, ref: "user", required: true }],
    managers: [{ type: Schema.Types.ObjectId, ref: "user", default: [] }],
    plainUsers: [{ type: Schema.Types.ObjectId, ref: "user", default: [] }],
  }, // admins, managers, plain users
  },
  { timestamps: true }
);

module.exports = mongoose.model("Group", groupSchema);
