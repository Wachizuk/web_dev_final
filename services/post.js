const Post = require("../models/post"); // Import the User model from Mongoose
const userService = require("./user");
const Validator = require("./validator");

const getAllPostIds = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  Post.find({}, { _id: 1 });
};

const getAllPosts = async () => Post.find();

const getPostById = async (id) => {
  return await Post.findById(id);
};

const getPostsByAuthor = async (id) => {
  return await Post.find({ author: id });
};

const getPostsByAuthorUsername = async (authorUsername) =>
  await Post.find({ authorUsername });
const getPostsByText = async (text) =>
  await Post.find({ $text: { $search: text } });

/**
 * creates new post, throws error on failure
 * @param {*} author - author id
 * @param {*} title - post title
 * @param {*} contentBlocks - [{type: "text/image/video", value: text/filepath}]
 * @returns - new post
 */
async function createPost(author, title, contentBlocks, group) {
  Validator.validatePostParams(author, title, contentBlocks);

  const user = await userService.getUserById(author);
  if (!user) throw new Error("Author does not exist");

  const postObj = new Post({
    title: title,
    author: author,
    authorUsername: user.username,
    content: contentBlocks,
    // group: group ? group : null,
    group: null,
    likes: [],
    comments: [],
  });

  //save returns the newly created object
  //save with no _id field will always create
  return await postObj.save();
}

/**
 * formats a date to mm:hh dd/MM/yyyy
 * @param {*} postDate
 * @returns
 */
function formatPostDate(postDate) {
  let minutes = postDate.getMinutes().toString().padStart(2, "0");
  let hours = postDate.getHours().toString().padStart(2, "0");

  let day = postDate.getDate().toString().padStart(2, "0");
  // for some reason months start from 0 unlike all the day...
  let month = (postDate.getMonth() + 1).toString().padStart(2, "0");
  let year = postDate.getFullYear();
  return `${day}/${month}/${year} ${minutes}:${hours}`;
}

const PERMISSIONS = {
  VIEW: "view",
  COMMENT: "comment",
  LIKE: "like",
  EDIT: "edit",
  DELETE: "delete",
  GROUP: "group",
};

const ROLES = {
  AUTHOR: [
    PERMISSIONS.COMMENT,
    PERMISSIONS.DELETE,
    PERMISSIONS.EDIT,
    PERMISSIONS.GROUP,
    PERMISSIONS.LIKE,
    PERMISSIONS.VIEW,
  ],
  GROUP_MANAGER: [
    PERMISSIONS.COMMENT,
    PERMISSIONS.GROUP,
    PERMISSIONS.LIKE,
    PERMISSIONS.VIEW,
  ],
  GUEST: [PERMISSIONS.VIEW, PERMISSIONS.LIKE, PERMISSIONS.COMMENT],
  BLOCKED: [],
};

/**
 *  return user permission level for the post
 * @param {String} postId
 * @param {String} userId
 * @returns
 */
function getPostPermissions(postId, userId) {
  try {
    const post = getPostById(postId);
    if (!post) {
      const err = new Error("post not found");
      err.code = "NOT_FOUND";
      throw err;
    };

    if (post.author == userId) return ROLES.AUTHOR;
    // TODO: GET GROUP ROLE OF USER AND RETURN PERMISSION ACCORDINGLY
    // BEST WAY TO DO IS HAVE A FUNCTION FOR THAT IN GROUP SERVICE

    return ROLES.GUEST;
  } catch (err) {
    console.error(`post with id '${postId}' does not exist`);
    return ROLES.BLOCKED;
  }
}

//TODO: update post (owner only), delete post (owner only), add comment, like post,
/**
 * update post according to given fields in the object, post Id must be passed
 * will only be updated if user has required permissions (PERMISSIONS.UPDATE)
 * CURRENTLY DOES SUPPORTS ONLY TEXT CONTENT BLOCKS, DOES NOT UPLOAD IMAGES AND VIDEOS
 * @param {Object} post
 * @param {String} post._id - id of post to update
 * @param {String} userId - id of user that requests the update
 * @param {String} post.title - post title
 * @param {*} post.contentBlocks - array of content blocks according to model schema
 */
async function updatePost(post, userId) {
  const oldPost = null;

  try {
    oldPost = getPostById(post._id);
    if (!oldPost) {
      throw new Error(`post with id '${post._id}' does not exist`);
    }
  } catch (err) {
    err.code = "NOT_FOUND";
    throw err;
  }

  const permissions = getPostPermissions(Post._id, userId);
  if (!permissions) {
    const err = new Error(
      `user '${userId}' is blocked from post '${Post._id}'`
    );
    err.code = "NOT_ALLOWED";
    throw err;
  }

  if (permissions.includes(PERMISSIONS.EDIT)) {
    oldPost.title = post.title ? post.title : oldPost.title;
    oldPost.contentBlocks = post.contentBlocks
      ? post.contentBlocks
      : oldPost.contentBlocks;
  }

  return await oldPost.save();
}

/**
 * deletes post if user has required permissions (PERMISSIONS.DELETE)
 * @param {String} postId post id
 * @param {String} userId user id
 */
async function deletePost(postId, userId) {
  const permissions = getPostPermissions(postId, userId);
  if (!permissions.includes(PERMISSIONS.DELETE)) {
    const err = new Error(
      `user '${userId} does not have permission to delete post ${postId}`
    );
    err.code = "NOT_ALLOWED";
    throw err;
  }

  await Post.findByIdAndDelete(postId);
}

module.exports = {
  createPost,
  getPostById,
  getPostsByAuthorUsername,
  getPostsByText,
  getAllPostIds,
  getPostsByAuthor,
  getAllPosts,
  formatPostDate,
  updatePost,
  deletePost,
};
