const fs = require("fs");
const path = require("path");

// Directory where avatars will be stored (under /uploads/avatars)
const AVATARS_DIR = path.join(__dirname, "..", "uploads", "avatars");

// Make sure the directory exists
if (!fs.existsSync(AVATARS_DIR)) {
  fs.mkdirSync(AVATARS_DIR, { recursive: true });
}

/**
 * Save an avatar for a given user.
 * File will be saved as: userId.extension
 * Returns the public URL so it can be stored in MongoDB (e.g. /uploads/avatars/alice.jpg).
 */
const saveImage = async (userId, buffer, contentType) => {
  if (!buffer || !buffer.length) throw new Error("Empty body");

  let ext = "";
  if (contentType === "image/png") ext = "png";
  else if (contentType === "image/jpeg") ext = "jpg";
  else if (contentType === "image/webp") ext = "webp";
  else throw new Error("Unsupported Content-Type");

  const filename = `${userId}.${ext}`;
  const filePath = path.join(AVATARS_DIR, filename);

  // Write the image to disk
  await fs.promises.writeFile(filePath, buffer);

  // Return a public URL (note: /uploads/avatars, with 's')
  return `/uploads/avatars/${filename}`;
};

/**
 * Return the absolute path of the avatar by filename.
 * If file doesn't exist, return the placeholder avatar.
 */
const getImagePathByFilename = async (filename) => {
  const abs = path.join(AVATARS_DIR, filename);
  try {
    await fs.promises.access(abs, fs.constants.R_OK);
    return abs;
  } catch {
    // If missing, return placeholder
    return path.join(AVATARS_DIR, "placeholder.png");
  }
};

module.exports = { saveImage, getImagePathByFilename };
