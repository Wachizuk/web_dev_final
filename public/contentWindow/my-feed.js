import { getMyFeedPosts, renderPosts } from "../posts.js";

console.log("my feed loaded");

async function initMyFeed() {
  const myPosts = await getMyFeedPosts();

  renderPosts(myPosts);
}

initMyFeed();

// POST FILTERING PANEL
const searchForm = document.querySelector("#search-panel-form");
searchForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const params = extractSearchData();
  document.querySelectorAll(".post")?.forEach((post) => {
    matchAndSetPostVisibility(post, params);
  });
});

const extractSearchData = () => {
  let title = document.querySelector("#title-search").value;
  let content = document.querySelector("#content-search").value;
  let minLikes = document.querySelector("#min-likes-search").value;
    title = title ? title.toLowerCase() : "";
    content = content ? content.toLowerCase() : "";

  return { title, content, minLikes };
};

const showPost = (post) => {
  // setting empty resets to default
  post.style.display = "";
};

const hidePost = (post) => {
  post.style.display = "none";
};

function matchAndSetPostVisibility(post, params = {}) {
  let match = true;
  if (!post) {
    console.error("missing post in match function");
    return;
  }

  if (!params) {
    showPost(post);
    return match;
  }

  if (params.title) {
    let title = post.querySelector(".post-title").textContent;
    if (!title.toLowerCase().includes(params.title)) {
      hidePost(post);
      match = false;
      return match;
    }
  }

  if (params.minLikes) {
    let likes = 0;
    try {
      likes = parseInt(post.querySelector(".post-num-of-likes").textContent);
    } catch {}

    if (likes < params.minLikes) {
      hidePost(post);
      match = false;
      return match;
    }
  }

  if (params.content) {
    const postTexts = [...post.querySelectorAll(".post-text")];
    const matchFound = postTexts.some((block) => {
      return block.textContent.toLowerCase().includes(params.content);
    });

    if (!matchFound) {
      hidePost(post);
      match = false;
      return match;
    }
  }

  showPost(post);
  return match;
}
