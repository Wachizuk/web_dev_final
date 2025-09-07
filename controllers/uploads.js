const uploadsService = require("../services/uploads");

const postService = require("../services/post");
const path = require("path");
const groupService = require("../services/group")


/**
 * Handle POST /uploads/avatar/:userId
 * Saves a new avatar for the given user and returns the URL.
 */
const uploadAvatar = async (req, res) => {
  try {
    const userId = req.session._id;
    const contentType = req.get("content-type");
    const buffer = req.body;

    const url = await uploadsService.saveAvatarImage(
      userId,
      buffer,
      contentType
    );

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

    res.sendFile(filePath); // sending the picture
  } catch (err) {
    console.error(err.message);
    res.status(404).json({ error: "Avatar not found" });
  }
};


const getPostFile = async (req, res) => {
  try {
    const filename = req.params.filename;
    const postId = req.params.postId;
    const userId = req.session._id;

    
  //permission check
  const postPermissions = await postService.getPostPermissions(postId, userId);

  if (!postPermissions.includes(postService.PERMISSIONS.VIEW)) {
    console.error(
      `User '${userId}' does not have permission to edit post ${postId}`
    );
    return res.status(403).json({ message: "Missing VIEW Permissions for Post" });
  }

    let filePath = path.join(uploadsService.POSTS_DIR, postId, filename); // /uploads/avatar/alice.png

    // removes all ../ ./ stuff to create the actual path
    filePath = path.resolve(filePath);
    if(!filePath.startsWith(uploadsService.POSTS_DIR)) throw new Error("Forbidden path for post file: " + filePath)
    res.sendFile(filePath); // sending the picture
  } catch (err) {
    console.error(err.message);
    res.status(404).json({ error: "Post not found" });
  }
};

const uploadPostFile = async (req, res) => {
  const userId = req.session._id;
  const postId = req.params.postId;
  const blockIndex = req.params.blockIndex;
  const filename = req.params.fileName;

  const filenameLimit = 50;

  if (filename.length > filenameLimit) {
    return res
      .status(400)
      .json("filename exceeds valid limit of " + filenameLimit);
  }

  //permission check
  const postPermissions = await postService.getPostPermissions(postId, userId);

  if (!postPermissions.includes(postService.PERMISSIONS.EDIT)) {
    console.error(
      `User '${userId}' does not have permission to edit post ${postId}`
    );
    return res.status(403).json({ message: "Edit Permission Missing" });
  }

  const contentType = req.get("content-type");
  const buffer = req.body;

  try {
    const url = await uploadsService.uploadPostFile(
      postId,
      blockIndex,
      buffer,
      contentType,
      filename
    );
    return res.status(201).json({ url, message: "File uploaded successfully" });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: "Upload failed" });
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



module.exports = { uploadAvatar, getAvatar, saveGroupCover , uploadPostFile, getPostFile };


