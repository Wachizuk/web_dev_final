const Post = require("../models/post"); // Import the User model from Mongoose
const userService = require("./user");
const Validator = require("./validator");
const path = require("path");

const PLACEHOLDER_LOCATION = path.join(
  "uploads",
  "posts",
  "missing",
  "placeHolder.png"
);

const getAllPostIds = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return await Post.find({}, { _id: 1 });
};

const getAllPosts = async () => await Post.find();

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

//not very efficient but does the job - .save updates the whole post each time
//to improve will need to use findByIdAndUpdate but its a weird query, not very readable and its harder to check errors
/**
 *
 * @param {String} postId - post id
 * @param {String} contentBlockIndex - index of content block
 * @param {String} path - path to make queries for getting the desired file
 * @returns
 */
const updateContentBlockPath = async (postId, contentBlockIndex, path) => {
  const post = await getPostById(postId);

  if (!post) {
    const err = new Error("post not found");
    err.code = "NOT_FOUND";
    throw err;
  }

  if (!["video", "image"].includes(post.content[contentBlockIndex].type)) {
    const err = new Error("content block is not a path type");
    err.code = "INVALID_PARAM";
    throw err;
  }

  const originalPath = post.content[contentBlockIndex].value;

  post.content[contentBlockIndex].value = path;

  await post.save();

  return originalPath;
};

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
    // for blocks the path is decided after the user uploads a file and it gets saved in the server
    // this is done after create
    content: contentBlocks.map((block) => {
      if (["image", "video"].includes(block.type))
        block.value = PLACEHOLDER_LOCATION;
      return block;
    }),
    group: group ? group : null,
    likes: [],
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
  return `${day}/${month}/${year} ${hours}:${minutes}`;
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
async function getPostPermissions(postId, userId) {
  try {
    const post = await getPostById(postId);
    if (!post) {
      const err = new Error("post not found");
      err.code = "NOT_FOUND";
      throw err;
    }

    if (post.author == userId) return ROLES.AUTHOR;
    // TODO: GET GROUP ROLE OF USER AND RETURN PERMISSION ACCORDINGLY
    // BEST WAY TO DO IS HAVE A FUNCTION FOR THAT IN GROUP SERVICE

    return ROLES.GUEST;
  } catch (err) {
    console.error(`post with id '${postId}' does not exist`);
    return ROLES.BLOCKED;
  }
}

//add comment, like post

/**
 * toggle user like on post
 * @param {String} postId
 * @param {String} userId
 * @returns new num of likes
 */
const toggleLike = async (postId, userId) => {
  const post = await Post.findById(postId, "likes");

  if (post.likes.includes(userId)) {
    await Post.findByIdAndUpdate(postId, { $pull: { likes: userId } });
    return post.likes.length - 1;
  }

  await Post.findByIdAndUpdate(postId, { $addToSet: { likes: userId } });
  return post.likes.length + 1;
};

/**
 * update post according to given fields in the object, post Id must be passed
 * will only be updated if user has required permissions (PERMISSIONS.UPDATE)
 * CURRENTLY DOES SUPPORTS ONLY TEXT CONTENT BLOCKS, DOES NOT UPLOAD IMAGES AND VIDEOS
 * @param {Object} post
 * @param {String} post._id - id of post to update
 * @param {String} userId - id of user that requests the update
 * @param {String} post.title - post title
 * @param {String} post.group - group id
 * @param {*} post.contentBlocks - array of content blocks according to model schema
 */
async function updatePost(post, userId) {
  let oldPost = null;

  try {
    oldPost = await getPostById(post._id);
    if (!oldPost) {
      throw new Error(`post with id '${post._id}' does not exist`);
    }
  } catch (err) {
    err.code = "NOT_FOUND";
    throw err;
  }

  const permissions = await getPostPermissions(oldPost._id, userId);
  if (!permissions) {
    const err = new Error(
      `user '${userId}' is blocked from post '${oldPost._id}'`
    );
    err.code = "NOT_ALLOWED";
    throw err;
  }

  if (permissions.includes(PERMISSIONS.EDIT)) {
    oldPost.title = post.title ? post.title : oldPost.title;
    if (post.content) {
      const newContent = post.content;

      newContent.forEach((block, index) => {
        if (["image", "video"].includes(block.type) && !block.value)
          block.value = PLACEHOLDER_LOCATION;
      });

      oldPost.content = newContent;
      oldPost.group = post.group;
    }
    //attempt to change without permissions
  } else if (!post.title || !post.content || !post.group) {
    const err = new Error(
      `user '${userId}' is blocked from  updating content of post '${oldPost._id}'`
    );
    err.code = "NOT_ALLOWED";
    throw err;
  }

  if (permissions.includes(PERMISSIONS.GROUP)) {
    oldPost.group = post.group ? post.group : oldPost.group;
  } else if (!post.group) {
    const err = new Error(
      `user '${userId}' is blocked updating/changin group assosiation of post '${oldPost._id}'`
    );
    err.code = "NOT_ALLOWED";
    throw err;
  }

  return await oldPost.save();
}

/**
 * deletes post if user has required permissions (PERMISSIONS.DELETE)
 * @param {String} postId post id
 * @param {String} userId user id
 */
async function deletePost(postId, userId) {
  const permissions = await getPostPermissions(postId, userId);
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
  getPostPermissions,
  PERMISSIONS,
  toggleLike,
  updateContentBlockPath,
};
