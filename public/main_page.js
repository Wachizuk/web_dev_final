import { getPostCard, getAllPosts } from "./posts.js";

const postList = document.getElementById("post-list");

function addPostCardToList(postCard) {
  let liElem = document.createElement("li");
  liElem.classList.add("post-list-item");

  liElem.innerHTML = postCard;
  postList.appendChild(liElem);
}

async function getAndAddPostCard(postId) {
  let postCard = await getPostCard(postId);
  if (!postCard) console.error(`failed getting post ${postId}`);
  else addPostCardToList(postCard);
}

async function renderAllPosts() {
  const posts = await getAllPosts();
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

