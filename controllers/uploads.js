const uploadsService = require("../services/uploads");

/**
 * Handle POST /uploads/avatar/:userId
 * Saves a new avatar for the given user and returns the URL.
 */
const uploadAvatar = async (req, res) => {
  try {
    const { userId } = req.params;
    const contentType = req.get("content-type");
    const buffer = req.body;

    const url = await uploadsService.saveImage(userId, buffer, contentType);

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
    const { filename } = req.params;
    const filePath = await uploadsService.getImagePathByFilename(filename);

    res.sendFile(filePath);
  } catch (err) {
    console.error(err.message);
    res.status(404).json({ error: "Avatar not found" });
  }
};

module.exports = { uploadAvatar, getAvatar };
