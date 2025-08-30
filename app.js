require('custom-env').env('', './config');
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');

//middleware imports

const session = require('express-session');

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
// Middleware for cors security
app.use(cors());
// Middle ware for handling user sessions
app.use(session({
  secret: process.env.SESSION_SECRET,
  saveUninitialized: false, // saves only if a session parameter is set
  resave: false // saves only when a session parameter changes
}));
// Middleware to parse incoming JSON requests (body parser)
app.use(express.json());

// Set EJS as the default template engine for rendering views
app.set('view engine', 'ejs')

// ---------------- ROUTES ----------------
// Load the authentication route (login, register, etc.)
const authRoute = require('./routes/auth');
app.use('/', authRoute); 

//after routes so overides will be possible for default paths
app.use(express.static('public'));

// ---------------- CONNECT TO DATABASE ----------------
// Connect to MongoDB using the connectDB function
connectDB();

// ---------------- START SERVER ----------------
// Start the Express server and listen on the specified port
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));