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
