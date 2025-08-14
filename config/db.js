// Import Mongoose for MongoDB connection and data modeling
const mongoose = require('mongoose');

// Function to connect to the MongoDB database
const connectDB = async () => {
  try {
    // Attempt to connect using the MONGO_URI from environment variables (.env file)
    await mongoose.connect(process.env.CONNECTION_STRING);

    // If successful, log confirmation message
    console.log('MongoDB Connected');
  } catch (err) {
    // If there is an error, log it and stop the application
    console.error('MongoDB connection error:', err.message);
    process.exit(1); // Exit with failure code
  }
};

// Export the function so it can be used in app.js
module.exports = connectDB;