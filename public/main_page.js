// Import functions from other modules
import { getPostCard, getAllPosts } from "./posts.js";
import { getSettingWindow , initSettingsHandlers } from "./profile-menu/settings.js";
import {getCreateGroupWindow, getGroupWindow, initCreateGroupForm} from "./groups.js"


// Main content window container
const contentWindow = document.getElementById('content-window');

// Utility function: add a post card element into the post list
function addPostCardToList(postCard) {
  const postList = document.getElementById("post-list");
  console.log("here");
  let liElem = document.createElement("li");
  liElem.classList.add("post-list-item");

  liElem.innerHTML = postCard;
  postList.appendChild(liElem);
}

// Utility function: fetch a post card by postId and add it to the list
async function getAndAddPostCard(postId) {
  let postCard = await getPostCard(postId);
  let attemptNum = 0;
  
  // Retry up to 3 times if postCard is null/undefined
  while (!postCard && attemptNum++ < 3) {
    postCard = await getPostCard(postId);
  }

  if (!postCard) console.error(`failed getting post ${postId}`);
  else addPostCardToList(postCard);
}


// Render all posts into the post list
// Supports group filtering in the future (currently always loads all posts)
//new addition for filtering posts by groups  
async function renderAllPosts() {
  let posts;

  // Future support for group filtering (commented for now)
  // if (groupName) {
  //   posts = await getAllPosts(); // will be switched to getPostsByGroup(groupName)
  // } else {
    posts = await getAllPosts();
  // }

  // Error handling: posts is not an array
  if (!Array.isArray(posts)) {
    postList.innerHTML = "<li class='post-list-item'> Error: could not load posts</li>";
    return;
  }

  // If no posts are available
  if (posts.length === 0) {
    postList.innerHTML = "<li class='post-list-item'> No posts available</li>";
    return;
  }

  // Render each post card
  posts.forEach((post) => {
    console.log(post);
    getAndAddPostCard(post._id);
  });
}

// Initial render of all posts when page loads
renderAllPosts();

// Render group window inside the content area and reload posts
async function renderGroupWindow(groupName) {
    const groupWindow = await getGroupWindow(groupName);
    contentWindow.innerHTML = groupWindow;
    window.location.hash = `/groups/${groupName}`;
    renderAllPosts();
}

// Render settings window inside the content area
async function renderSettingsWindow() {
  contentWindow.innerHTML = await getSettingWindow();
  initSettingsHandlers();
}
document.getElementById('settingsBtn').addEventListener('click', renderSettingsWindow);


// Attach click listeners to all side group navigation buttons
const sideGroups = [...document.getElementsByClassName('side-nav-group')];
sideGroups.forEach(elem => {
  elem.addEventListener('click', async (e) => {
    const groupName = e.target.closest('button').id;
    renderGroupWindow(groupName);
  });
});

// Attach click listener to the "create group" button
const createGroupBtn = document.getElementById('create-group-btn');
createGroupBtn.addEventListener('click', async () => {
  contentWindow.innerHTML = await getCreateGroupWindow();
  initCreateGroupForm (async(groupName) => {
    await renderGroupWindow(groupName);
    
  });
});
