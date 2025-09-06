const uploadsService = require("../services/uploads");
const groupService = require("../services/group")

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


// -----------------------------------group cover image upload-----------------------------------

// Handle POST /uploads/groups/:groupName/cover
// Saves a new cover image for the given group and updates the group document.
const saveGroupCover = async (req, res) => {
  try {
    const groupName   = req.params.groupName;
    const contentType = req.get("content-type");
    const buffer      = req.body;

    // Expected to return: { filename, url }
    const { filename, url } = await uploadsService.saveGroupCoverImage(groupName,buffer,contentType);

    // Record the filename on the group document
    await groupService.updateGroupByName(groupName, { $set: { coverFile: filename } });

    return res.status(201).json({ url, message: "Group cover uploaded successfully" });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: "Upload failed" });
  }
};

// -----------------------------------end of group cover image upload-----------------------------------


module.exports = { uploadAvatar, getAvatar, saveGroupCover };
