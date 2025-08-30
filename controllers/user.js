const { url } = require("inspector");
const userService = require("../services/user");
// Import the 'path' module to work with file and directory paths
const path = require("path");

// Redirect URLs (routes)
const urlLogin = "/login";
const urlMainPage = "/";
const urlRegister = "/register";

// View names (EJS templates inside views folder)
const viewMainPage = "main/base";
const viewLogin = "login-page/base";
const viewRegister = "login-page/register-page";

// Middleware to check if a user is logged in based on session._id
// If logged in → continue, otherwise redirect to login page
function isLoggedIn(req, res, next) {
  if (req.session._id != null) return next();
  else res.redirect(urlLogin);
}

// Logout function: destroys the session and responds with success JSON
function logout(req, res) {
  req.session.destroy(() => {
    res.json({ success: true });
  });
}

// Render main page with user info (pulled from session)
function mainPage(req, res) {
  res.render(viewMainPage, {
    email: req.session.email,
    username: req.session.username,
  });
}

// Render login page
function loginPage(req, res) {
  res.render(viewLogin);
}

// Render register page
function registerPage(req, res) {
  res.render(viewRegister);
}

// Register function: creates a new account
// If successful, returns JSON with success:true
// If failed, returns JSON with success:false
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const newAccount = await userService.register(username, email, password);

    // Registration successful
    if (newAccount === 1) {
      return res.json({ message: "Login successful", success: true });
    } else {
      return res.json({ message: "Registration failed", success: false });
    }

  } catch (err) {
    // Catch any server/db errors during registration
    console.error("Error during registration:", err);
    res.status(500).json({ error: "Server error during registration" });
  }
};

// Login function: validates credentials and creates session
const login = async (req, res) => {
  // Extract userIdentifier (can be username or email) and password
  const { userIdentifier, password } = req.body;
  console.log(
    "login attempt for a user with user identifier: " + userIdentifier
  );

  // Try to log in using userService
  const userId = await userService.login(userIdentifier, password);

  // If login fails, return a generic error (no detailed reason for security)
  if (!userId) {
    return res.json({ message: "login failed", success: false });
  }

  try {
    // Retrieve user details from DB using userId
    userEmail = await userService.getEmail(userId);
    userUsername = await userService.getUsername(userId);

    // Store user info in session
    req.session._id = userId;
    req.session.email = userEmail;
    req.session.username = userUsername;

    // Respond with success JSON (redirect handled on client side)
    return res.json({ message: "Login successful", success: true });
  } catch (err) {
    // Catch any server/db errors during login
    console.error(err.message);
    res.status(500).json({ error: "error occured on the server" });
  }
};

// Export controller functions to be used in routes
module.exports = {
  login,
  logout,
  isLoggedIn,
  register,
  registerPage,
  mainPage,
  loginPage,
};
