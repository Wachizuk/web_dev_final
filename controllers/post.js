const postService = require("../services/post");
const path = require("path");
const userService = require("../services/user");
const Post = require("../models/post");
const twitterService = require("../services/twitter");

const handlePostErrors = async (req, res, err) => {
  switch (err.code) {
    // non default errors are console log because they are related to client errors and not server errors
    case "NOT_FOUND":
      console.log(`error code: ${err.code}, error messge: ${err.message}`);
      return res.status(404).json({ message: "post not found" });
    case "NOT_ALLOWED":
      console.log(`error code: ${err.code}, error messge: ${err.message}`);
      return res.status(403);
    default:
      console.error(err.message);
      return res.status(500).json({ message: "internal server error" });
  }
};

const getUserFeedPosts = async (req, res) => {
  const userId = req.session._id;

  posts = await postService.getUserFeedPosts(userId);
  return res.json(posts);
};

const getUserMyPosts = async (req, res) => {
  const userId = req.session._id;
  posts = await postService.getPostsByAuthor(userId);
  return res.json(posts);
};

const getAllPosts = async (req, res) => {
  let posts = null;
  posts = await postService.getAllPosts();
  return res.json(posts);
};

const getAllGroupPosts = async (req, res) => {
  try {
    const gid = req.params.groupId || req.query.groupId;
    if (!gid) return res.json([]); // no id then empty list
    const posts = await Post.find({ group: gid })
      .sort({ createdAt: -1 })
      .lean();
    res.json(posts);
  } catch (err) {
    console.error("getAllGroupPosts failed:", err);
    res.status(500).json({ error: "Server error" });
  }
};

//returns a json of the post
const getPostById = async (req, res) => {
  let post = null;
  try {
    post = await postService.getPostById(req.params.id);
  } catch (err) {
    await handlePostErrors(req, res, err);
  }

  if (post) {
    res.json(post);
  } else {
    return res.status(404).json({ error: "Post not found" });
  }
};

//returns a html card of the post ready for client to use
const getPostCardById = async (req, res) => {
  let post = null;
  try {
    post = await postService.getPostById(req.params.id);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: "server error ocurred" });
  }

  if (post) {
    await post.populate("author", "username");
    await post.populate("group", "groupName members");
    if (!post.author) post.author = { username: "DELETED_USER" };
    post.likedByUser = post.likes.includes(req.session._id);
    post.numOfLikes = post.likes.length;
    post.createdAtFormatted = postService.formatPostDate(post.createdAt);
    post.canEdit = req.session._id == post.author._id;

    post.canManageGroup = false;
    if (post.group && post.group.members) {
      const uid = String(req.session._id || "");
      const m = post.group.members;
      const isAdmin =
        Array.isArray(m.admins) && m.admins.some((id) => String(id) === uid);
      const isManager =
        Array.isArray(m.managers) &&
        m.managers.some((id) => String(id) === uid);
      post.canManageGroup = isAdmin || isManager;
    }
    res.render("../views/main/partials/post", { post });
  } else {
    return res.status(404).json({ error: "Post not found" });
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

const renderMyFeed = async (req, res) => {
  res.render("main/partials/my-feed", {});
};

const renderMyPosts = async (req, res) => {
  res.render("main/partials/my-posts", {});
};

const renderPostPage = async (req, res) => {
  let post = null;
  try {
    post = await postService.getPostById(req.params.id);
  } catch (err) {
    console.error(err.message);
    return res.status(404).json({ error: "Post Not Found" });
  }

  if (post) {
    await post.populate("author", "username");
    await post.populate("group", "groupName members");
    if (!post.author) post.author = { username: "DELETED_USER" };
    post.likedByUser = post.likes.includes(req.session._id);
    post.numOfLikes = post.likes.length;
    post.createdAtFormatted = postService.formatPostDate(post.createdAt);
    post.canEdit = req.session._id == post.author._id;

    post.canManageGroup = false;
    if (post.group && post.group.members) {
      const uid = String(req.session._id || "");
      const m = post.group.members;
      const isAdmin =
        Array.isArray(m.admins) && m.admins.some((id) => String(id) === uid);
      const isManager =
        Array.isArray(m.managers) &&
        m.managers.some((id) => String(id) === uid);
      post.canManageGroup = isAdmin || isManager;
    }
    return res.render("main/partials/post-page", { post });
  } else {
    return res.status(404).json({ error: "Post not found" });
  }
};

const createPost = async (req, res) => {
  const author = req.session._id;
  console.log("author of new post is:" + author);
  const title = req.body.title;
  const contentBlocks = req.body.contentBlocks;
  const group = req.body.group ? req.body.group : null;
  const postToTwitter = req.body.postToTwitter ? true : false;

  console.log("group of new post is: " + group);
  try {
    const post = await postService.createPost(
      author,
      title,
      contentBlocks,
      group
    );
    console.log("post to twitter var value: " + postToTwitter);

    if (postToTwitter) {
      try {
        console.log("trying to post");
        let textToPost = title + "\n\n";
        contentBlocks.forEach((block) => {
          if (block.type == "text") {
            textToPost += block.value + "\n";
          }
        });

        console.log("final post text: \n" + textToPost);

        await twitterService.tweet(textToPost);
      } catch (e) {
        console.error("tweet failed:", e.message || e);
      }
    }

    res.status(200).json(post);
  } catch (err) {
    switch (err.code) {
      case "INVALID_PARAM":
        console.log(err.message);
        return res.status(403).json({ message: err.message });
      default:
        console.error(err.message);
        return res.status(500).json({ message: "internal server error" });
    }
  }
};

const updatePostContent = async (req, res) => {
  const userId = req.session._id;
  const post = {};
  post.title = req.body.title;
  post.content = req.body.content;
  post.group = req.body.group ? req.body.group : null;
  post._id = req.params.id;

  try {
    const updatedPost = await postService.updatePost(post, userId);
    res.json(updatedPost);
  } catch (err) {
    switch (err.code) {
      case "NOT_FOUND":
        console.log(`error code ${err.code}, error messge ${err.message}`);
        return res.status(404).json({ message: "post not found" });
      case "NOT_ALLOWED":
        console.log(`error code ${err.code}, error messge ${err.message}`);
        return res.status(403);
      default:
        console.error(err.message);
        res.status(500).json({ message: "internal server error" });
        break;
    }
  }
};

// Remove a post's group (button shows only to managers/admins of the group)
async function removeGroup(req, res) {
  try {
    const postId = req.params.id;
    const updated = await Post.findByIdAndUpdate(
      postId,
      { $unset: { group: "" } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Post not found" });
    return res.json({ ok: true, postId });
  } catch (err) {
    console.error("removeGroup error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

const deletePost = async (req, res) => {
  const userId = req.session._id;
  const postId = req.params.id;

  try {
    await postService.deletePost(postId, userId);
    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    switch (err.code) {
      case "NOT_ALLOWED":
        console.log(err.message);
        return res
          .status(403)
          .json({ message: "User is not allowed to delete this post" });
      case "NOT_FOUND":
        console.log(err.message);
        return res.status(404).json({ message: "Post not found" });
      default:
        console.error(err.message);
        return res.status(500).json({ message: "internal server error" });
    }
  }
};

const getCreatePostWindow = async (req, res) => {
  let groups = await userService.getUserGroups(req.session._id);

  groups = groups ? groups : [];
  res.render("main/partials/create-post", {
    groups,
    groupName: req.params.groupName,
  });
};

const getEditPostWindow = async (req, res) => {
  const permissions = await postService.getPostPermissions(
    req.params.id,
    req.session._id
  );
  if (permissions.includes(postService.PERMISSIONS.EDIT)) {
    const post = await postService.getPostById(req.params.id);
    let groupName = null;
    if (post.group) {
      await post.populate("group", "groupName");
      groupName = post.group.groupName;
    }

    let groups = await userService.getUserGroups(req.session._id);
    groups = groups ? groups : [];

    res.render("main/partials/edit-post", {
      postId: req.params.id,
      groups,
      groupName,
    });
  } else {
    res.status(403).json("user is not allowed to edit this post");
  }
};

const toggleLike = async (req, res) => {
  const userId = req.session._id;
  const postId = req.params.id;

  try {
    const numOfLikes = await postService.toggleLike(postId, userId);
    res.status(200).json({ numOfLikes });
  } catch (err) {
    await handlePostErrors(req, res, err);
  }
};

module.exports = {
  getPostById,
  getPostCardById,
  getAllPosts,
  getAllGroupPosts,
  getPostFile,
  renderMainFeed,
  renderMyFeed,
  updatePostContent,
  removeGroup,
  deletePost,
  createPost,
  getCreatePostWindow,
  getEditPostWindow,
  toggleLike,
  getUserFeedPosts,
  getUserMyPosts,
  renderMyPosts,
  renderPostPage,
};
