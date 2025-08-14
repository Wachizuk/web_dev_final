require('custom-env').env('', './config');
const express = require('express');
const connectDB = require('./config/db');

const app = express();

// ---------------- CHECK ENV VARIABLES ----------------
// Check if the MongoDB connection string exists in the environment variables
if (!process.env.CONNECTION_STRING) {
  console.error('CONNECTION_STRING is missing in config/.env'); 
  process.exit(1); 
}

// Check if the port number exists in the environment variables
if (!process.env.PORT) {
  console.error('PORT is missing in config/.env'); 
  process.exit(1); 
}

// ---------------- MIDDLEWARE ----------------
// Middleware to parse incoming JSON requests (body parser)
app.use(express.json());
app.use(express.static('public'));

// ---------------- ROUTES ----------------
// Load the index route (main page routes)
const indexRoute = require('./routes/index');
app.use('/', indexRoute); 

// Load the authentication route (login, register, etc.)
const authRoute = require('./routes/auth');
app.use('/auth', authRoute); 

// ---------------- CONNECT TO DATABASE ----------------
// Connect to MongoDB using the connectDB function
connectDB();

// ---------------- START SERVER ----------------
// Start the Express server and listen on the specified port
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));