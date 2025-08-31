const postService = require("../services/post");
const fs = require("fs");
const path = require("path");

const getAllPosts = async (req, res) => {
  let posts = null;
  posts = await postService.getAllPosts();
  res.json(posts);
};

//returns a json of the post
const getPostById = async (req, res) => {
  let post = null;
  try {
    post = await postService.getPostById(req.params.id);
  } catch (err) {
    console.error(err.message);
  }

  if (post) {
    //user should not know who liked the post except for himself
    post.likedByUser = post.likes.includes(req.session._id);
    post.numOfLikes = post.likes.length;
    delete post.likes;

    res.json(post);
  } else {
    res.status(404).json({ error: "Post not found" });
  }
};

//returns a html card of the post ready for client to use
const getPostCardById = async (req, res) => {
  let post = null;
  try {
    post = await postService.getPostById(req.params.id);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "server error ocurred" });
  }
  console.log(post);
  if (post) {
    //user should not know who liked the post except for himself
    post.likedByUser = post.likes.includes(req.session._id);
    post.numOfLikes = post.likes.length;
    post.createdAtFormatted = postService.formatPostDate(post.createdAt);
    res.render("../views/main/partials/post", { post });
  } else {
    res.status(404).json({ error: "Post not found" });
  }
};

const uploadsPath = path.join(__dirname, "../uploads/");

const getPostFile = async (req, res) => {
  const filePath = path.join(
    uploadsPath,
    req.params.folder,
    req.params.filename
  );

  console.log(`path: ${filePath}`);
  //checks that path is secure and not trying to get something outside the folder
  if (!filePath.startsWith(uploadsPath)) {
    return res.status(403).json({ error: "forbidden path" });
  }

  //try to send file, if missing return not found
  res.sendFile(filePath, (err) => {
    if (err) {
      console.log("failed sending the file:\n" + filePath);
      return res.status(404).json({ error: "file not found" });
    }
  });
};

module.exports = { getPostById, getPostCardById, getAllPosts, getPostFile };
