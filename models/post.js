const mongoose = require("mongoose");

// supports multiple content types
//if image or video then value is the file path
const contentBlockSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["text", "image", "video"], required: true },
    value: { type: String, required: true },
  },
  { _id: false } // does not form id
);

// Define a schema for the 'post' collection
const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  group: {type: mongoose.Schema.Types.ObjectId, ref: "Group"},
  content: [contentBlockSchema], // allows for multiple content types on same post
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
}, {timestamps: true});



//index for searching posts by keywords
postSchema.index({title: "text", "content.value": "text"})

// Export the model so it can be used in other parts of the application
// 'Post' is the collection name
module.exports = mongoose.model("post", postSchema);
