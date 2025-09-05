const uploadsService = require("../services/uploads");
const User = require("../models/user"); // make sure this path is correct


/**
 * Handle POST /uploads/avatar/:userId
 * Saves a new avatar for the given user and returns the URL.
 */
const uploadAvatar = async (req, res) => {
  try {
    const userId = req.session._id;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const contentType = req.get("content-type");
    const buffer = req.body;

    // 1) save file to /uploads/avatars and get the public URL
    const url = await uploadsService.saveImage(userId, buffer, contentType);

    // 2) persist the URL in MongoDB
    await User.updateOne({ _id: userId }, { $set: { avatarUrl: url } });

    // 3) respond
    return res.status(201).json({ url, message: "Avatar uploaded successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Upload failed" });
  }
};

/**
 * Handle GET /uploads/avatar/:filename
 * Returns the image file directly to the client.
 */
const getAvatar = async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = await uploadsService.getImagePathByFilename(filename); // /uploads/avatar/alice.png

    res.sendFile(filePath);   // sending the picture
  } catch (err) {
    console.error(err.message);
    res.status(404).json({ error: "Avatar not found" });
  }
};

module.exports = { uploadAvatar, getAvatar };
