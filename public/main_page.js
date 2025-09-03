import { getPostCard, getAllPosts } from "./posts.js";
import {getCreateGroupWindow, getGroupWindow, initCreateGroupForm} from "./groups.js"

const contentWindow = document.getElementById('content-window');






//new addition for filtering posts by groups
//if valid groupname available the read it, else null (main feed)
// let groupName = null;
// if (postList && postList.dataset && postList.dataset.group) {
//   groupName = postList.dataset.group;
// } 

function addPostCardToList(postCard) {
  const postList = document.getElementById("post-list");
  console.log("here")
  let liElem = document.createElement("li");
  liElem.classList.add("post-list-item");

  liElem.innerHTML = postCard;
  postList.appendChild(liElem);
}

async function getAndAddPostCard(postId) {
  let postCard = await getPostCard(postId);
  let attemptNum = 0
  while (!postCard && attemptNum++ < 3) {
    postCard = await getPostCard(postId);
  }

  if (!postCard) console.error(`failed getting post ${postId}`);
  else addPostCardToList(postCard);
}


//new addition for filtering posts by groups  
async function renderAllPosts() {
  let posts;

  // if (groupName) {
  //   posts = await getAllPosts(); //will be switched to getPostsByGroup(groupName)
  // } else {
    posts = await getAllPosts();
  // }

  if (!Array.isArray(posts)) {
    postList.innerHTML = "<li class='post-list-item'> Error: could not load posts</li>";
    return;
  }

  if (posts.length === 0) {
    postList.innerHTML = "<li class='post-list-item'> No posts available</li>";
    return;
  }

  posts.forEach((post) => {
    console.log(post); 
    getAndAddPostCard(post._id);
  });
}


renderAllPosts();

const logoutBtn = document.getElementById("leaveBtn");
const logoutToastEl = document.getElementById("logoutToast");
const logoutToast = new bootstrap.Toast(logoutToastEl, { autohide: false });

logoutBtn.addEventListener("click", (e) => {
  e.preventDefault();
  logoutToast.show();
});

document.getElementById("confirmLogout").addEventListener("click", async () => {
  try {
    const res = await fetch("/user/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}), // Send userIdentifier & password as JSON
    });

    const data = await res.json();

    if (data.success) {
      window.location.href = "/user/login";
    } else {
      console.error("Logout failed");
    }
  } catch (err) {
    console.error(err);
  }
});



async function renderGroupWindow(groupName) {
    const groupWindow = await getGroupWindow(groupName);
    contentWindow.innerHTML = groupWindow;
    window.location.hash = `/groups/${groupName}`;
    renderAllPosts();
}


const sideGroups = [...document.getElementsByClassName('side-nav-group')]
//swap content window with groups
sideGroups.forEach(elem => {
  elem.addEventListener('click', async (e) => {
    const groupName = e.target.closest('button').id;
    renderGroupWindow(groupName);
  })
});

const createGroupBtn = document.getElementById('create-group-btn');

createGroupBtn.addEventListener('click', async () => {
  contentWindow.innerHTML = await getCreateGroupWindow();
  initCreateGroupForm (async(groupName) => {
    await renderGroupWindow(groupName);
    
  });
});





