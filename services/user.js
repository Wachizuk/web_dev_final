const User = require('../models/user'); // Import the User model from Mongoose

const getUserByEmail = async (email) =>{return await User.findOne({ email })};

module.exports = {getUserByEmail}