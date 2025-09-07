import { getMyPosts, renderPosts } from "../posts.js";

console.log("my feed loaded");

async function initMyPosts() {
  const myPosts = await getMyPosts();

  renderPosts(myPosts);
}

initMyPosts();
