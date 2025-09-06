const User = require("../models/user");
const Validator = require("./validator");
const mongoose = require("mongoose");

const getUserByEmail = async (email) => {
  return await User.findOne({ email: email.toLowerCase() });
};
const getUserByUsername = async (username) => {
  return await User.findOne({ username });
};
const getUserById = async (id) => {
  return await User.findById(id);
};

const getIdByUsername = async (username) => {
  const doc = await User.findOne({ username }, "_id").lean();
  console.log(doc._id);
  return doc?._id ?? null;
};

//helper functions to get user properties by id
const getEmail = async (id) => {
  const user = await getUserById(id);
  return user ? user.email : null;
};
const getUsername = async (id) => {
  const user = await getUserById(id);
  return user ? user.username : null;
};

async function getAvatarUrl(userId) {
  const user = await User.findById(userId).select('avatarUrl');
  return user?.avatarUrl || '';
}

const getFriends = async (id) => {
  try {
    const user = await User.findById(id)
      .populate("friends", "username avatarUrl");
    if (!user) {
      throw new Error("User not found");
    }
    return user.friends;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/////////////////////////

//  Helper: safely convert a value to a MongoDB ObjectId.
function oid(x) {
  return mongoose.Types.ObjectId.isValid(x) ? new mongoose.Types.ObjectId(x) : null;
}

async function getPublicProfileByUsername(username) {
  return User.findOne(
    { username: String(username).trim() },
    //  include only these fields in the result (hide others like password)
    { username: 1, email: 1, avatarUrl: 1, friends: 1 }
    // replace ObjectIds in 'friends' with the actual friend docs,
    // but only keep their username and avatarUrl
  ).populate({ path: "friends", select: "username avatarUrl" });
}

async function areFriends(userId, targetId) {
  // convert userId and targetId to ObjectId 
  const u = oid(userId), t = oid(targetId);
  if (!u || !t) return false;
  // takes only the id
  const doc = await User.findOne({ _id: u, friends: t }, { _id: 1 }).lean();
  // convert doc to boolean: true if found, false if null
  return !!doc;
}

async function addFriend(userId, targetId) {
  // convert userId and targetId to ObjectId 
  const u = oid(userId), t = oid(targetId);
  if (!u || !t) {
    const e = new Error("bad_id");
    e.code = 400;
    throw e;
  }

  if (String(u) === String(t)) {
    const e = new Error("cannot_add_self");
    e.code = 400;
    throw e;
  }

  // Run both updates 
  const [rViewer, rTarget] = await Promise.all([
    User.updateOne({ _id: u }, { $addToSet: { friends: t } }),
    User.updateOne({ _id: t }, { $addToSet: { friends: u } }),
  ]);

  return {
    // matchedCount && modifiedCount comes from mongoDB (.updateOne)
    matchedViewer:  rViewer.matchedCount  > 0,
    modifiedViewer: rViewer.modifiedCount || 0,
    matchedTarget:  rTarget.matchedCount  > 0,
    modifiedTarget: rTarget.modifiedCount || 0,
  };
}

async function removeFriend(userId, targetId) {
   // convert userId and targetId to ObjectId
  const u = oid(userId), t = oid(targetId);
  if (!u || !t) 
    return { matchedViewer:false, modifiedViewer:0, matchedTarget:false, modifiedTarget:0 };
  if (String(u) === String(t)) 
    return { matchedViewer:true, modifiedViewer:0, matchedTarget:true, modifiedTarget:0 }; 
   // run both updates
  const [rViewer, rTarget] = await Promise.all([
    User.updateOne({ _id: u }, { $pull: { friends: t } }),
    User.updateOne({ _id: t }, { $pull: { friends: u } }),
  ]);

  return {
    // matchedCount && modifiedCount comes from mongoDB (.updateOne)
    matchedViewer:  rViewer.matchedCount  > 0,
    modifiedViewer: rViewer.modifiedCount || 0,
    matchedTarget:  rTarget.matchedCount  > 0,
    modifiedTarget: rTarget.modifiedCount || 0,
  };
}



//////////////////////////////////




// Change username service
const changeUsername = async (userId, newUsername) => {
  // Validate username format (no spaces, not empty, etc.)
  if (!Validator.validateUsername(newUsername)) {
    return { success: false, code: 400, message: "Invalid username format" };
  }

  // Find user by ID
  const user = await getUserById(userId);
  if (!user) {
    return { success: false, code: 404, message: "User not found" };
  }

  // Prevent updating to the same username
  if (user.username === newUsername) {
    return {
      success: false,
      code: 400,
      message: "Username is the same as current",
    };
  }

  try {
    // Update and save new username
    user.username = newUsername;
    await user.save();

    return { success: true, user };
  } catch (err) {
    // Handle duplicate key error (username already exists)
    if (err.code === 11000) {
      return { success: false, code: 409, message: "Username already in use" };
    }

    // Log and return generic server error
    console.error("changeUsername error:", err);
    return { success: false, code: 500, message: "Unexpected server error" };
  }
};

// Change email service
const changeEmail = async (userId, newEmail) => {
  // Validate email format
  if (!Validator.validateEmail(newEmail)) {
    return { success: false, code: 400, message: "Invalid email format" };
  }
  // Change password service

  // Find user by ID
  const user = await getUserById(userId);
  if (!user) {
    return { success: false, code: 404, message: "User not found" };
  }

  // Prevent updating to the same email
  if (user.email === newEmail) {
    return {
      success: false,
      code: 400,
      message: "Email is the same as current",
    };
  }

  try {
    // Update and save new email
    user.email = newEmail;
    await user.save();

    return { success: true, user };
  } catch (err) {
    // Handle duplicate key error (email already exists)
    if (err.code === 11000) {
      return { success: false, code: 409, message: "Email already in use" };
    }

    // Log and return generic server error
    console.error("changeEmail error:", err);
    return { success: false, code: 500, message: "Unexpected server error" };
  }
};

// Change password service
const changePassword = async (userId, newPassword) => {
  // Validate Password format
  if (!Validator.validatePassword(newPassword)) {
    return { success: false, code: 400, message: "Invalid Password format" };
  }
  // Change password service

  // Find user by ID
  const user = await getUserById(userId);
  if (!user) {
    return { success: false, code: 404, message: "User not found" };
  }

  // Prevent updating to the same Password
  if (user.password === newPassword) {
    return {
      success: false,
      code: 400,
      message: "Password is the same as current",
    };
  }

  try {
    // Update and save new Password
    user.password = newPassword;
    await user.save();
    return { success: true, user };
  } catch (err) {
    console.error("changePassword error:", err);
    return { success: false, code: 500, message: "Unexpected server error" };
  }
};

// Delete Account Service
const deleteAccount = async (userId, password) => {
  try {
    // Load user by ID
    const user = await getUserById(userId);
    if (!user) {
      return { success: false, code: 404, message: "User not found" };
    }

    // Optional: require password confirmation
    if (
      typeof password === "string" &&
      password.length > 0 &&
      user.password !== password
    ) {
      return { success: false, code: 401, message: "Wrong password" };
    }

    // Delete the user document
    await user.deleteOne();

    return { success: true, message: "Account deleted" };
  } catch (err) {
    console.error("deleteAccount error:", err);
    return { success: false, code: 500, message: "Unexpected server error" };
  }
};

// ----------------helper functions to get user ids by usernames (used for groups)----------------

// cleans input and makes sure is a valid array
function toUsernameArray(input) {
  if (Array.isArray(input))
    return input.map((s) => String(s || "").trim()).filter(Boolean); //cleans input and makes sure is a valid array
  if (typeof input === "string")
    return input
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean); //if string, split by comma and clean
  return [];
}

// helper functions to get id list from username list (used for group members)
async function findUserIdsByUsernames(input) {
  const usernames = toUsernameArray(input); //cleans input and makes sure is a valid array
  if (usernames.length === 0) return []; //if empty
  const users = await User.find(
    { username: { $in: usernames } },
    { _id: 1 }
  ).lean(); //fetch all users with one query return only _ids
  return users.map((u) => u._id); //return array of ObjectIds
}

// return just the invalid usernames (for invalid usernames allert)
async function findMissingUsernames(input) {
  const usernames = toUsernameArray(input);
  if (usernames.length === 0) return [];
  const found = await User.find(
    { username: { $in: usernames } },
    { username: 1 }
  ).lean();
  const ok = new Set(found.map((u) => u.username)); //set of valid usernames
  return usernames.filter((u) => !ok.has(u)); //return only invalid usernames
}

//----------------------------------------end of helper functions----------------------------------------

/**
 * creates a user in db if params are valid and username is not taken
 * @param {String} username - non empty string, not email, has no leading or trailing whitespace chars
 * @param {String} email - follows email convention
 * @param {String} password - non empty string
 * @returns 1: success, 0: creation in db failed, -1: missing/invalid properties, -2: username already exists -3: email already exists
 */
async function register(username, email, password) {
  if (
    !Validator.validateUsername(username) ||
    !Validator.validateEmail(email) ||
    !Validator.validatePassword(password)
  )
    return -1;
  email = email.toLowerCase();
  if (await getUserByUsername(username)) return -2;
  if (await getUserByEmail(email)) return -3;
  try {
    await User.create({ username: username, email: email, password: password });
    console.log(`the user ${username} was created successfully`);
    return 1;
  } catch {
    console.error(`failed creation of user ${username}`);
    return 0;
  }
}

/**
 * auths user in db
 * @param {*} userIdentifier - username or email
 * @param {*} password
 * @returns - user id on success, null on fail
 */
async function login(userIdentifier, password) {
  let user = null;
  if (Validator.validateUsername(userIdentifier)) {
    user = await User.findOne({ username: userIdentifier, password: password });
  } else if (Validator.validateEmail(userIdentifier)) {
    user = await User.findOne({ email: userIdentifier, password: password });
  }

  if (user) return user._id;

  return null;
}

module.exports = {
  getUserByEmail,
  getUserByUsername,
  getUserById,
  getIdByUsername,
  getEmail,
  getUsername,
  login,
  register,
  changeUsername,
  changeEmail,
  changePassword,
  deleteAccount,
  toUsernameArray,
  findUserIdsByUsernames,
  findMissingUsernames,
  getFriends,
  getAvatarUrl,
  areFriends,
  addFriend,
  removeFriend,
  getPublicProfileByUsername,
};
