const userService = require('../services/user');

const login = async (req, res) => {
  // Extract email and password from the request body (sent by the client)
  const { email, password } = req.body;

  try {
    // Search for a user in the database by email
    const user = await userService.getUserByEmail(email);

    // If no user was found with that email, return an error message
    if (!user) {
      return res.json({ message: "User not found", success: false });
    }

    // If the user exists but the password does not match, return an error message
    if (user.password !== password) {
      return res.json({ message: "Incorrect password", success: false });
    }

    // If both email and password are correct, send a success message
    res.json({ message: "Login successful", success: true });

  } catch (err) {
    // If there was a server or database error, send a 500 error response
    res.status(500).json({ error: err.message });
  }
};

module.exports = {login};