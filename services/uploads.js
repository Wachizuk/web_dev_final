const fs = require("fs");
const path = require("path");
const User = require("../models/user"); // make sure this path is correct
const postService = require("../services/post");

// Directory where avatars will be stored (under /uploads/avatars)
const AVATARS_DIR = path.join(__dirname, "..", "uploads", "avatars");
const UPLOADS_DIR = path.join(__dirname, "..", "uploads");
const POSTS_DIR = path.join(UPLOADS_DIR, "posts");

// Make sure the directory exists
if (!fs.existsSync(AVATARS_DIR)) {
  fs.mkdirSync(AVATARS_DIR, { recursive: true });
}

// Make sure the directory exists
if (!fs.existsSync(POSTS_DIR)) {
  fs.mkdirSync(POSTS_DIR, { recursive: true });
}

/**
 * Save an avatar for a given user.
 * File will be saved as: userId.extension
 * Returns the public URL so it can be stored in MongoDB (e.g. /uploads/avatars/alice.jpg).
 */

const saveAvatarImage = async (userId, buffer, contentType) => {
  const url = await saveImage(buffer, contentType, userId, AVATARS_DIR);
  await User.updateOne({ _id: userId }, { $set: { avatarUrl: url } });
  return url;
};

//updates db with required data
const uploadPostFile = async (
  postId,
  contentBlockIndex,
  buffer,
  contentType,
  fileName = ""
) => {
  // const post = await postService.getPostById(postId);
  // if (!post) {
  //   const err = new Error("Post Not Found");
  //   err.code = "NOT_FOUND";
  //   throw err;
  // }

  const saveLocation = path.join(POSTS_DIR, postId);
  //unique file name
  const fileNameToSave = Date.now().toString() + fileName;

  const url = await saveFile(
    buffer,
    contentType,
    fileNameToSave,
    saveLocation,
    ["image/png", "image/jpeg", "image/webp", "video/mp4", "video/webm"]
  );
  await postService.updateContentBlockPath(postId, contentBlockIndex, url);

  return url;
};

// Generic image save function
const saveImage = async (buffer, contentType, fileName, savePath) => {
  if (!buffer?.length) throw new Error("Empty body");

  let ext = "";
  if (contentType === "image/png") ext = ".png";
  else if (contentType === "image/jpeg") ext = ".jpg";
  else if (contentType === "image/webp") ext = ".webp";
  else throw new Error("Unsupported Content-Type");
  const filename = fileName + ext;
  const filePath = path.join(savePath, filename);
  console.log("FILE NAME : " + fileName);
  console.log("FILE PATH : " + filePath);
  console.log("UPLOADS DIR : " + UPLOADS_DIR);
  if (!filePath.startsWith(UPLOADS_DIR)) {
    throw new Error("forbbiden path " + savePath);
  }
  await fs.promises.writeFile(filePath, buffer);
  return filePath.replace(UPLOADS_DIR, "\\uploads");
};

const saveFile = async (
  buffer,
  contentType,
  fileName,
  savePath,
  allowedTypes = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "video/mp4",
    "video/webm",
  ]
) => {
  if (!buffer?.length) throw new Error("Empty body");

  if (!allowedTypes.includes(contentType))
    throw new Error("Unsupported Content-Type");

  let ext = "." + contentType.split("/")[1];

  const filename = fileName + ext;
  const filePath = path.join(savePath, filename);
  console.log("FILE NAME : " + fileName);
  console.log("FILE PATH : " + filePath);
  if (!filePath.startsWith(UPLOADS_DIR)) {
    throw new Error("forbbiden path " + savePath);
  }

  if (!fs.existsSync(savePath)) {
    fs.mkdirSync(savePath, { recursive: true });
  }

  await fs.promises.writeFile(filePath, buffer);
  return filePath.replace(UPLOADS_DIR, "\\uploads");
};

/**
 * Return the absolute path of the avatar by filename.
 * If file doesn't exist, return the placeholder avatar.
 */
const getAvatarPathByFilename = async (filename) => {
  const abs = path.join(AVATARS_DIR, filename);
  try {
    await fs.promises.access(abs, fs.constants.R_OK);
    return abs;
  } catch {
    // If missing, return placeholder
    return path.join(AVATARS_DIR, "placeholder.png");
  }
};

module.exports = {
  saveAvatarImage,
  saveImage,
  getAvatarPathByFilename,
  uploadPostFile,
  POSTS_DIR,
};
