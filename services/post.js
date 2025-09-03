const { default: mongoose } = require("mongoose");
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
async function createPost(author, title, contentBlocks) {
  Validator.validatePostParams(author, title, contentBlocks);

  const user = await userService.getUserById(author);
  if (!user) throw new Error("Author does not exist");

  const postObj = new Post({
    title: title,
    author: author,
    authorUsername: user.username,
    content: contentBlocks,
    likes: [],
    comments: [],
  });

  //save returns the newly created object
  //save with no _id field will always create
  return await newPost.save();
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


function getPostPermissions(PostId, AccountId) {

}

//TODO: update post (owner only), delete post (owner only), add comment, like post,
/**
 * update post according to given fields
 * @param {Object} post
 * @param {String} post._id - id of post to update
 * 
 */
// function UpdatePost(post) {
//   const post = getPostById(post._id);
//   if(!post) throw new Error("post not found");
//   post
// }

module.exports = {
  createPost,
  getPostById,
  getPostsByAuthorUsername,
  getPostsByText,
  getAllPostIds,
  getPostsByAuthor,
  getAllPosts,
  formatPostDate
};
