const uploadsService = require("../services/uploads");

/**
 * Handle POST /uploads/avatar/:userId
 * Saves a new avatar for the given user and returns the URL.
 */
const uploadAvatar = async (req, res) => {
  try {
    const userId  = req.session._id;
    const contentType = req.get("content-type");
    const buffer = req.body;

    const url = await uploadsService.saveAvatarImage(userId, buffer, contentType);

    res.status(201).json({ url, message: "Avatar uploaded successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Upload failed" });
  }
};

/**
 * Handle GET /uploads/avatar/:filename
 * Returns the image file directly to the client.
 */
const getAvatar = async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = await uploadsService.getAvatarPathByFilename(filename); // /uploads/avatar/alice.png

    res.sendFile(filePath);   // sending the picture
  } catch (err) {
    console.error(err.message);
    res.status(404).json({ error: "Avatar not found" });
  }
};

module.exports = { uploadAvatar, getAvatar };
