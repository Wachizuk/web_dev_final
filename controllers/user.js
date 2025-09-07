const { url } = require("inspector");
const userService = require("../services/user");
const groupService = require("../services/group");
const statsService = require("../services/stats");
// Import the 'path' module to work with file and directory paths
const path = require("path");

// Redirect URLs (routes)
const urlLogin = "/user/login";
const urlMainPage = "/";
const urlRegister = "/register";

// View names (EJS templates inside views folder)
const viewMainPage = "main/base";
const viewLogin = "login-page/base";
const viewRegister = "login-page/register-page";
const viewSettings = "main/partials/settings";
const viewProfile = "main/partials/profile"
const viewSelectedProfile = "main/partials/selected-profile";

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

// Render main page
async function mainPage(req, res) {
  try {
    const groups = await groupService.getAllGroups();
    res.render(viewMainPage, {
      email: req.session.email,
      username: req.session.username,
      feedPartial: "main",
      groups,
      groupName: null,
    });
  } catch (err) {
    console.error("Error in mainPage:", err);
    res.status(500).send("Internal Server Error");
  }
}

// Render login page
async function loginPage(req, res) {
  res.render(viewLogin);
}

// Render register page
async function registerPage(req, res) {
  res.render(viewRegister);
}

//Render profile page 
async function profilePage(req, res) {
  try {
    const userId = req.session?._id;
    if (!userId) return res.status(401).render("errors/401");

      const [perDay, byGroup] = await Promise.all([
      statsService.postsPerDayByUser(userId, 30),
      statsService.postsByGroupForUser(userId, { limit: 8 })
    ]);
    console.log(perDay);
    console.log(byGroup);
    const userIdStr = String(userId);
    const [email, username, friends, avatarUrl, address] = await Promise.all([
      userService.getEmail(userIdStr),
      userService.getUsername(userIdStr),
      userService.getFriends(userIdStr),
      userService.getAvatarUrl(userIdStr),
      userService.getAddress(userIdStr),
    ]);

    return res.render(viewProfile, { userId: userIdStr, email, username, friends, avatarUrl, address ,statsSeed: { perDay, byGroup }});
  } catch (err) {
    console.error("profilePage error:", err);
    return res.status(500).render("errors/500", { message: "Server error" });
  }
}

//Render other page 
async function selectedProfilePage(req, res) {
  try {
    const selectedUsername = req.params.username;
    const profileUser = await userService.getPublicProfileByUsername(selectedUsername);
    if (!profileUser) return res.status(404).render("errors/404", { message: "User not found" });

    const viewerId = req.session?._id || null;
    const isSelf = viewerId && String(viewerId) === String(profileUser._id);
    const isFriend = viewerId && !isSelf
      ? await userService.areFriends(viewerId, profileUser._id)
      : false;

    return res.render(viewSelectedProfile, {
      profile: {
        _id: profileUser._id,
        username: profileUser.username,
        email: profileUser.email,
        avatarUrl: profileUser.avatarUrl,
        friends: profileUser.friends || [],
        address: profileUser.address || "",
      },
      viewer: { _id: viewerId || null },
      isSelf,
      isFriend,
      message: "",
    });
  } catch (err) {
    console.error("selectedProfilePage error:", err);
    return res.status(500).render("errors/500", { message: "Server error" });
  }
}


// Function add friends
async function addFriend(req, res) {
  try {
    const viewerId = req.session?._id;
    const targetId = req.params.userId;
    if (!targetId) return res.status(400).json({ success: false, message: "Missing target id" });

    const r = await userService.addFriend(viewerId, targetId);
    if (!r.matchedViewer || !r.matchedTarget) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.json({
      success: true,
      info: {
        viewer: { matched: r.matchedViewer, modified: r.modifiedViewer },
        target: { matched: r.matchedTarget, modified: r.modifiedTarget },
      }
    });
  } catch (err) {
    const msg =
      err.message === "cannot_add_self" ? "You cannot add yourself" :
      err.message === "bad_id"           ? "Bad user id" :
      "Failed to add";
    return res.status(err.code || 400).json({ success: false, message: msg });
  }
}


// Function to remove friends
async function removeFriend(req, res) {
  try {
    const viewerId = req.session?._id;
    const targetId = req.params.userId;
    if (!targetId) return res.status(400).json({ success:false, message:"Missing target id" });
    const r = await userService.removeFriend(viewerId, targetId);
    return res.json({
      success: true,
      info: {
        viewer: { matched: r.matchedViewer, modified: r.modifiedViewer },
        target: { matched: r.matchedTarget, modified: r.modifiedTarget },
      }
    });
  } catch (err) {
    console.error("removeFriend error:", err);
    return res.status(400).json({ success:false, message:"Failed to remove" });
  }
}


//Render settings page
async function settingsPage(req, res) {
  const userId = req.session._id;
  const email = await userService.getEmail(userId);
  const username = await userService.getUsername(userId);
  res.render(viewSettings, { userId, email, username });
}

// Controller: update username
async function updateUsername(req, res) {
  try {
    const userId = req.session._id;

    // Call service layer to change username
    const result = await userService.changeUsername(userId, req.body.username);

    // Handle failure (bad format, duplicate, not found, etc.)
    if (!result.success) {
      return res
        .status(result.code)
        .json({ success: false, message: result.message });
    }

    // Update session with new username
    req.session.username = result.user.username;

    return res.json({
      success: true,
      message: "Username updated successfully",
    });
  } catch (err) {
    console.error("updateUsername fatal:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// Controller: update email
async function updateEmail(req, res) {
  try {
    const userId = req.session._id;

    // Call service layer to change email
    const result = await userService.changeEmail(userId, req.body.email);

    // Handle failure (bad format, duplicate, not found, etc.)
    if (!result.success) {
      return res
        .status(result.code)
        .json({ success: false, message: result.message });
    }

    // Update session with new email
    req.session.email = result.user.email;

    return res.json({ success: true, message: "Email updated successfully" });
  } catch (err) {
    console.error("updateEmail fatal:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// Controller: update password
async function updatePassword(req, res) {
  try {
    const userId = req.session._id;

    // Call service layer to change email
    const result = await userService.changePassword(userId, req.body.password);

    // Handle failure (bad format, duplicate, not found, etc.)
    if (!result.success) {
      return res
        .status(result.code)
        .json({ success: false, message: result.message });
    }
    return res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("updatePassword fatal:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// Contreoller: delete Account 

async function removeAccount(req, res) {
  try {
    // Identify the current user from session
    const userId = req.session._id;

    // Read password from request body 
    const passowrd = req.body.password;

    // Delegate to service
    const result = await userService.deleteAccount(userId, passowrd);

    // Handle service outcome
    if (!result.success) {
      return res.status(result.code ?? 400).json({
        success: false,
        message: result.message
      });
    }
    // On success: destroy session and clear cookie, then respond
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      return res.json({ success: true, message: "Account deleted" });
    });
  } catch (err) {
    console.error("removeAccount error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// function to update Address
async function updateAddress(req, res) {
  try {
    const userId = req.session?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Login required" });
    }

    const { address } = req.body;
    console.log(address);
    if (typeof address !== "string" || !address.trim()) {
      return res.status(400).json({ success: false, message: "address is required" });
    }

    const normalized = address.trim();
    await userService.changeAddress(userId, normalized);

    return res.json({ success: true, message: "Address updated", address: normalized });
  } catch (err) {
    console.error("updateAddress error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
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
    }
    // -2: username already exists
    else if (newAccount === -2) {
      return res.json({
        message: "Registration failed - username already exists",
        success: false,
      });
    }
    // -3: email already exists
    else if (newAccount === -3) {
      return res.json({
        message: "Registration failed - email already exists",
        success: false,
      });
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
  settingsPage,
  updateUsername,
  updateEmail,
  updatePassword,
  updateAddress,
  removeAccount , 
  profilePage,
  selectedProfilePage,
  addFriend,
  removeFriend
};
