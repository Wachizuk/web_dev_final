import { renderContentWindow } from "./utils/renderer.js";
import { routes } from "./utils/routes.js";

/**
 * @typedef {"text" | "image" | "video"} ContentType
 */

/**
 * @typedef {Object} ContentBlock
 * @property {ContentType} type - The type of content
 * @property {string} value - Text content or file path (for image/video)
 */

/**
 * @typedef {Object} Comment
 * @property {string} user - User ID of commenter
 * @property {string} content - Comment text
 * @property {string[]} likes - Array of user IDs who liked the comment
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} Post
 * @property {string} _id - Post ID
 * @property {string} title - Post title
 * @property {string} author - User ID of the author
 * @property {string} authorUsername - Author username (denormalized)
 * @property {string} [group] - Optional group ID
 * @property {ContentBlock[]} content - Array of content blocks
 * @property {string[]} likes - Array of user IDs who liked the post
 * @property {Comment[]} comments - Array of comments
 * @property {string} createdAt
 * @property {string} updatedAt
 */

// GETTERS
async function getAllPosts() {
  try {
    const res = await fetch(`/posts`);

    if (!res.ok) {
      throw new Error("failed post fetch");
    }

    return await res.json();
  } catch (err) {
    console.error(
      `failed getting post card for ${postId}, reason: ${err.message}`
    );
  }
}

/**
 *
 * @returns array of post objects
 */
async function getMyFeedPosts() {
  try {
    const res = await fetch(routes.posts.myFeed);

    if (!res.ok) {
      throw new Error("failed post fetch");
    }

    return await res.json();
  } catch (err) {
    console.error(
      `failed getting post card for ${postId}, reason: ${err.message}`
    );
  }
}

/**
 *
 * @returns array of post objects
 */
async function getMyPosts() {
  try {
    const res = await fetch(routes.posts.myPosts);

    if (!res.ok) {
      throw new Error("failed post fetch");
    }

    return await res.json();
  } catch (err) {
    console.error(
      `failed getting post card for ${postId}, reason: ${err.message}`
    );
  }
}

/** gets posts with filtering options
 * @param {Object} filters -object with filters
 * @param {String[] | String} filters.groupIds - filter by group
 * @param {String[] | String} filters.authorIds - filter by authors
 * @param {String} filters.searchText - filter by title and content text
 * @param {String} filters.numOfLikes - minimum likes
 * @returns {Promise<Post[]>} - list of post objects
 */
async function getPosts(filters) {
  const searchPayload = {};

  if (filters.groupIds) searchPayload.groupIds = [...filters.groupIds];
  if (filters.authorIds) searchPayload.authorId = [...filters.authorIds];
  if (filters.searchText) searchPayload.searchText = filters.searchText;
  if (filters.numOfLikes) searchPayload.numOfLikes = filters.numOfLikes;

  try {
    const res = await fetch(routes.posts.search, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(searchPayload),
    });

    if (!res.ok) {
      throw new Error("failed post fetch");
    }

    return await res.json();
  } catch (err) {
    console.error(
      `failed getting post card for ${postId}, reason: ${err.message}`
    );
  }
}

/**
 * gets post data from the server
 * @param {String} postId - post id
 * @returns {Promise<Post>} post object with all data
 */
async function getPost(postId) {
  try {
    const res = await fetch(`/posts/${postId}`);

    if (!res.ok) {
      throw new Error("failed post fetch");
    }

    return await res.json();
  } catch (err) {
    console.error(
      `failed getting post card for ${postId}, reason: ${err.message}`
    );
  }
}
/**
 * returns a psot card element already with event listeners from a post id
 * @param {String} postId - post id to get
 * @returns {Element}
 */
async function getPostCard(postId) {
  try {
    const res = await fetch(`/posts/card/${postId}`);

    if (!res.ok) {
      throw new Error(`response status code: ${res.status}`);
    }

    const postString = (await res.text()).toString();

    //transform from text into an element
    const parser = new DOMParser();
    const postCard = parser.parseFromString(postString, "text/html").body
      .firstElementChild;

    //add event listeners where needed
    // edit btn redirect if exists
    addPostCardEventListeners(postCard)

    return postCard;
  } catch (err) {
    console.error(
      `failed getting post card for ${postId}, error message: ${err.message}`
    );
  }
}

const addPostCardEventListeners = (postCard) => {
  postCard
    .querySelector(".post-edit-btn")
    ?.addEventListener("click", () =>
      renderContentWindow(routes.posts.edit(postId))
    );
  const likeBtn = postCard.querySelector(".post-like-btn");
  likeBtn.addEventListener("click", async () => {
    const heartIcon = likeBtn.querySelector("i");
    const newNumOfLikes = await postToggleLike(postCard.dataset.postId);
    heartIcon.classList.toggle("bi-heart-fill");
    heartIcon.classList.toggle("bi-heart");
    likeBtn.querySelector(".post-num-of-likes").textContent = newNumOfLikes;
  });

  const postTitle = postCard.querySelector(".post-title");
  postTitle.addEventListener('click', () => {
    renderContentWindow(routes.posts.postPage(postCard.dataset.postId))
  })

  postCard.querySelectorAll(".post-group")?.forEach((elem) => {
    elem.addEventListener("click", async (e) => {
      const btn = e.target.closest("button");
      const groupName = btn.dataset.groupName;
      await renderContentWindow(routes.groups.groupName(groupName));
      window.scroll({ top: 0, behavior: "smooth" });
    });
  });

  postCard.querySelectorAll(".post-author")?.forEach((elem) => {
    elem.addEventListener("click", async (e) => {
      const btn = e.target.closest("button");
      const username = btn.dataset.username;
      await renderContentWindow(routes.users.profile + "/" + username);
      window.scroll({ top: 0, behavior: "smooth" });
    });
  });
};

//POST DATA CHANGERS

/**
 * @typedef {Object} ContentBlock
 * @property {String} type - "text", "image", "video"
 * @property {String} value - text content or file name depending on type
 */

/**
 * create post on server
 * @param {String} title
 * @param {ContentBlock[]} contentBlocks
 * @param {String} group - group id
 * @returns {Promise<Post>}
 */
async function createPost(title, contentBlocks, groupId = null) {
  const res = await fetch(routes.posts.create, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, contentBlocks, group: groupId }),
  });

  if (!res.ok) {
    const message = await res.json().message;
    console.log(message);
    throw new Error(message);
  }

  return await res.json();
}

async function removePostFromGroup(postId) {
  const res = await fetch(routes.posts.removeGroup(postId), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ postId, group }),
  });
}

/**
 * toggles if the user likes the post in the server
 * @param {*} postId
 * @returns new number of likes
 */
async function postToggleLike(postId) {
  const res = await fetch(routes.posts.toggleLike(postId), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
  });

  const numOfLikes = (await res.json()).numOfLikes;
  console.log("new num of likes: " + numOfLikes);

  return numOfLikes;
}

/**
 * updates a post on server, group field is optional
 * @param {String} postId
 * @param {String} title
 * @param {ContentBlock[]} content
 * @param {String?} groupId
 */
async function updatePost(postId, title, content, groupId) {
  //done seperatly because group is optional
  const updatePayload = { _id: postId, title, content };
  if (groupId) updatePayload.group = groupId;

  const res = await fetch(routes.posts.edit(postId), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatePayload),
  });

  if (!res.ok) {
    const message = await res.json().message;
    console.log(message);
    throw new Error(message);
  }

  return await res.json();
}

async function deletePost(postId) {
  const res = await fetch(routes.posts.delete(postId), {
    method: "DELETE",
  });

  if (!res.ok) {
    const message = await res.json().message;
    console.log(message);
    throw new Error(message);
  }
}

async function uploadPostFile(file, postId, blockIndex) {
  try {
    // send raw file to server
    const buf = await file.arrayBuffer();

    // put block index in filename place intentionally
    const res = await fetch(
      routes.posts.uploadFile(postId, blockIndex, blockIndex),
      {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: buf,
      }
    );

    const data = await res.json();
    if (res.ok) {
      return data.url;
    } else {
      alert(data.error || "Failed to upload");
    }
  } catch (err) {
    console.error(err);
    alert("Something went wrong");
  }
}

//FRONT END STUFF

function addPostCardToList(postCard) {
  const postList = document.getElementById("post-list");
  let liElem = document.createElement("li");
  liElem.classList.add("post-list-item");

  liElem.appendChild(postCard);
  postList.appendChild(liElem);
}

async function getAndAddPostCard(postId) {
  let postCard = await getPostCard(postId);
  let attemptNum = 0;
  while (!postCard && attemptNum++ < 3) {
    postCard = await getPostCard(postId);
  }

  if (!postCard) console.error(`failed getting post ${postId}`);
  else addPostCardToList(postCard);
}

/**
 * renders all posts user has access to
 */
async function renderAllPosts() {
  const posts = await getAllPosts();

  if (!Array.isArray(posts)) {
    postList.innerHTML =
      "<li class='post-list-item'> Error: could not load posts</li>";
    return;
  }

  if (posts.length === 0) {
    postList.innerHTML = "<li class='post-list-item'> No posts available</li>";
    return;
  }

  posts.forEach((post) => {
    getAndAddPostCard(post._id);
  });
}

/** renders posts from post Ids
 * @param {Post[] | String[]} posts
 */
async function renderPosts(posts) {
  if (!Array.isArray(posts)) {
    postList.innerHTML =
      "<li class='post-list-item'> Error: could not load posts</li>";
    return;
  }

  if (posts.length === 0) {
    postList.innerHTML = "<li class='post-list-item'> No posts found</li>";
    return;
  }

  //doing one by one to keep order
  for (let index = 0; index < posts.length; index++) {
    const post = posts[index];
    if (typeof post == "string") {
      await getAndAddPostCard(post);
    } else {
      await getAndAddPostCard(post._id);
    }
  }
}

export {
  getPostCard,
  getPost,
  getAllPosts,
  renderAllPosts,
  createPost,
  updatePost,
  deletePost,
  uploadPostFile,
  renderPosts,
  getMyFeedPosts,
  getMyPosts,
  addPostCardEventListeners
};
