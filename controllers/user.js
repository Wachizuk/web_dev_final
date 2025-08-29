const userService = require('../services/user');
// Import the 'path' module to work with file and directory paths
const path = require('path');


//redirect paths
const redirectToLogin = '/auth/login'
const redirectToMainPage = '/'

//validates if a user is logged in according to session._id param before running next, else redirect to login page
//to use
function isLoggedIn(req, res, next) {
  if (req.session._id != null)
    return next();
  else
    res.redirect(redirectToLogin)
}

//logout function with a redirect back to the login page
function logout(req, res) {
  req.session.destroy(() => {
    res.redirect(redirectToLogin);
  });
}

function mainPage(req, res) { res.render('../views/main/base') }
function loginPage(req, res) { res.sendFile(path.join(__dirname, '../public/index.html')) }

const login = async (req, res) => {
  // Extract userIdentifier and password from the request body (sent by the client)
  // userIdentifier is expected to be username or email
  const { userIdentifier, password } = req.body;
  console.log("login attempt for a user with user identifier: " + userIdentifier)

  //gets user id if credentials are valid
  const userId = await userService.login(userIdentifier, password);

  //login failed - not returning reason cause its more secure
  if(!userId) {
    return res.json({ message: "login failed", success: false });
  }

  try {
    req.session._id = userId; // update session with user id to keep track

    //pass json back to client and make the redirect over there
    return res.json({ message: "Login successful", success: true }); 


  } catch (err) {
    // If there was a server or database error, send a 500 error response
    console.error(err.message)
    res.status(500).json({ error: "error occured on the server" });
  }
};

module.exports = {login, logout, isLoggedIn, mainPage, loginPage};