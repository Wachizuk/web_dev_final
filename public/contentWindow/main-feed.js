import { renderAllPosts } from "../posts.js";

console.log("main feed loaded");
renderAllPosts();

// POST FILTERING PANEL
const searchForm = document.querySelector("#search-panel-form");
searchForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const params = extractSearchData();
  document.querySelectorAll(".post")?.forEach((post) => {
    matchAndSetPostVisibility(post, params);
  });
});

searchForm?.addEventListener("change", (e) => {
  e.preventDefault();
  const params = extractSearchData();
  document.querySelectorAll(".post")?.forEach((post) => {
    matchAndSetPostVisibility(post, params);
  });
});

const extractSearchData = () => {
  let title = document.querySelector("#title-search").value;
  let author = document.querySelector("#author-search").value;
  let group = document.querySelector("#group-search").value;
  let content = document.querySelector("#content-search").value;
  let minLikes = document.querySelector("#min-likes-search").value;
  title = title ? title.toLowerCase() : "";
  author = author ? author.toLowerCase() : "";
  group = group ? group.toLowerCase() : "";
  content = content ? content.toLowerCase() : "";

  return { title, author, group, content, minLikes };
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

  if (params.author) {
    let author = post.querySelector(".post-author").textContent;
    if (!author.toLowerCase().includes(params.author)) {
      hidePost(post);
      match = false;
      return match;
    }
  }

  if (params.group) {
    let group = post.querySelector(".post-group");
    // remove the 'in ' from 'in groupName' with substring(3);
    if (!group || !group.textContent.substring(3).toLowerCase().includes(params.group)) {
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
