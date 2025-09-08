const mongoose = require('mongoose');
const { Schema, Types } = mongoose;


// Define a schema for the 'User' collection
const userSchema = new Schema({
  email:    { type: String, required: true, unique: true, index: true },
  username: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },

  // Profile picture
  avatarUrl:     { type: String, default: '' },   

  // Friends: store references to other users

  friends: [{ type: Types.ObjectId, ref: 'User', default: [] }],
  groups: [{ type: Types.ObjectId, ref: 'Group', default: [] }], // groups the user is a member of
  address: { type: String, trim: true, default: "" },

}, { timestamps: true });


module.exports = mongoose.model('User', userSchema);