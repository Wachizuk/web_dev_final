const mongoose = require('mongoose');

// Define a schema for the 'User' collection
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// Export the model so it can be used in other parts of the application
// 'User' is the collection name 
module.exports = mongoose.model('users', userSchema);