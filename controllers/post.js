const postService = require("../services/post");
const groupService = require("../services/group");
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

  if (post) {
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
    }
  });
};

// renders the main feed page this way views/main/base knows when to use main-feed 
const renderMainFeed = async (req, res) => {
  res.render("main/partials/main-feed", {});
};

const createPost = async (req, res) => {
  const author = req.session._id;
  console.log("author is:" + author);
  const title = req.body.title;
  const contentBlocks = req.body.contentBlocks;
  const group = req.session.group;

  try {
    const post = await postService.createPost(author, title, contentBlocks, group);
    res.status(200).json(post);
  } catch (err) {
    switch(err.code) {
        case "INVALID_PARAM":
          console.log(err.message);
          return res.status(403).json({message: err.message});
        default:
          console.error(err.message);
          return res.status(500).json({message: "internal server error"})
      }
  }
}

const updatePostContent = async (req, res) => {
  const userId = req.session._id;
  const post = req.body.post;

  try {
  const updatedPost = await postService.updatePost(post, userId);
  res.json(updatedPost);
  } catch (err) {
    
      switch (err.code) {
        case "NOT_FOUND":
          console.log(err.message)
          return res.status(404).json({message: "post not found"})
        case "NOT_ALLOWED":
          console.log(err.message)
          return res.status(403);
        default:
          console.error(err.message)
          res.status(500).json({message: "internal server error"})
          break;
      }
  }

}

const deletePost = async (req, res) => {
    const userId = req.session._id;
    const postId = req.params.id;

    try {
      await postService.deletePost(postId, userId);
      return res.status(200).json({message: "Post deleted successfully"});
    } catch (err) {
      switch(err.code) {
        case "NOT_ALLOWED":
          console.log(err.message);
          return res.status(403).json({message: "User is not allowed to delete this post"});
        case "NOT_FOUND":
          console.log(err.message)
          return res.status(404).json({message: "Post not found"});
        default:
          console.error(err.message);
          return res.status(500).json({message: "internal server error"})
      }
    }
}

const getCreatePostWindow = async (req, res) => {
  res.render("main/partials/create-post", {});
}

module.exports = { getPostById, getPostCardById, getAllPosts, getPostFile, renderMainFeed, updatePostContent, deletePost, createPost, getCreatePostWindow };
