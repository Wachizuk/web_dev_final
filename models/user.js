const mongoose = require('mongoose');
const { Schema, Types } = mongoose;


// Define a schema for the 'User' collection
const userSchema = new Schema({
  email:    { type: String, required: true, unique: true, index: true },
  username: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },

  // Profile picture (store only URL, do NOT store raw image data in MongoDB)
  avatarUrl:     { type: String, default: '' },   // Example: https://res.cloudinary.com/.../avatar.jpg

  // Friends: store references to other users
  friends: [{ type: Types.ObjectId, ref: 'User', default: [] }],
  groups: [{ type: Types.ObjectId, ref: 'Group', default: [] }], // groups the user is a member of
}, { timestamps: true });


// Export the model so it can be used in other parts of the application
// 'User' is the collection name 
module.exports = mongoose.model('User', userSchema);