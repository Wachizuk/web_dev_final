import { getMyFeedPosts, renderPosts } from "../posts.js";

console.log("my feed loaded");

async function initMyFeed() {
  const myPosts = await getMyFeedPosts();

  renderPosts(myPosts);
}

initMyFeed();
