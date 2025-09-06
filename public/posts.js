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



async function getAllPosts() {
  try {
    const res = await fetch(`/posts`);

    if (!res.ok) {
      throw new Error("failed post fetch");
    }

    return await res.json();
  } catch (err) {
    console.error(
      console.error(
        `failed getting post card for ${postId}, reason: ${err.message}`
      )
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
      )
  }
}

async function getPostCard(postId) {
  try {
    const res = await fetch(`/posts/card/${postId}`);

    if (!res.ok) {
      throw new Error(`response status code: ${res.status}`);
    }

    return res.text();
  } catch (err) {
    console.error(
      console.error(
        `failed getting post card for ${postId}, error message: ${err.message}`
      )
    );
  }
}

function addPostCardToList(postCard) {
  const postList = document.getElementById("post-list");
  let liElem = document.createElement("li");
  liElem.classList.add("post-list-item");

  liElem.innerHTML = postCard;
  // const postEditBtn = liElem.querySelector("post-edit-btn");
  // postEditBtn?.addEventListener('click', () => {
  //   renderContentWindow(routes.posts.edit(postEditBtn.dateset.postId))
  // });
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

/* async function renderAllPosts() {
  const posts = await getAllPosts();
  posts.forEach((post) => {
    console.log(post);
    getAndAddPostCard(post._id);
  });
} */

//new addition for filtering posts by groups
async function renderAllPosts() {
  let posts;

  // if (groupName) {
  //   posts = await getAllPosts(); //will be switched to getPostsByGroup(groupName)
  // } else {
  posts = await getAllPosts();
  // }

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

/**
 * @typedef {Object} ContentBlock
 * @property {String} type - "text", "image", "video"
 * @property {String} value - text content or file name depending on type
 */

/**
 * create post on server
 * @param {String} title
 * @param {ContentBlock[]} contentBlocks
 */
async function createPost(title, contentBlocks) {
  const res = await fetch(routes.posts.create, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, contentBlocks }),
  });

  if (!res.ok) {
    const message = await res.json().message
    console.log(message)
    throw new Error(message);
  }

  return await res.json();
}

async function changePostGroup(postId, groupId) {
  const res = await fetch(routes.posts.changeGroup(postId, groupId) , {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ postId, group }),
  });
}


/**
 * updates a post on server
 * @param {String} postId
 * @param {String} title
 * @param {ContentBlock[]} content
 * @param {String} groupId
 */
async function updatePost(postId, title, content, groupId) {
  //done seperatly because group is optional
  const updatePayload = {_id: postId, title, content};
  if (groupId) updatePayload.group = groupId;

  const res = await fetch(routes.posts.edit(postId), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatePayload),
  });

  if (!res.ok) {
    const message = await res.json().message
    console.log(message)
    throw new Error(message);
  }

  return await res.json();
}

async function deletePost(postId) {
  const res = await fetch(routes.posts.delete(postId), {
    method: "DELETE"
  });

  if (!res.ok) {
    const message = await res.json().message
    console.log(message)
    throw new Error(message);
  }
}

export { getPostCard, getPost, getAllPosts, renderAllPosts, createPost, updatePost, deletePost };
