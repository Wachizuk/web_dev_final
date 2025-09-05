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

// currently does not support nesting because
// it either requires complex queries or has scalability issues on simple implementations
// right now its directly imbeded in the post, to improve will require seperation
const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: { type: String, required: true }, //currently text only for simplisity
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  },
  { // adds createdAt and updatedAt with auto updates only on comment change
    timestamps: true, 
  }
);

// Define a schema for the 'post' collection
const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  //save username directly and index for easy searching
  authorUsername: { type: String, index: true },
  group: {type: mongoose.Schema.Types.ObjectId, ref: "Group"},
  content: [contentBlockSchema], // allows for multiple content types on same post
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [commentSchema],
}, {timestamps: true});



//index for searching posts by keywords
postSchema.index({title: "text", "content.value": "text"})

// Export the model so it can be used in other parts of the application
// 'Post' is the collection name
module.exports = mongoose.model("post", postSchema);
