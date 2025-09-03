
async function getAllPosts() {
    try {
        const res = await fetch(`/posts`);

        if(!res.ok) {
            throw new Error("failed post fetch");
        }

        return await res.json();
    } catch (err) {
        console.error(console.error(`failed getting post card for ${postId}, reason: ${err.message}`))
    }
}

async function getPost(postId) {
    try {
        const res = await fetch(`/posts/${postId}`);

        if(!res.ok) {
            throw new Error("failed post fetch");
        }

        return await res.json();
    } catch (err) {
        console.error(console.error(`failed getting post card for ${postId}, reason: ${err.message}`))
    }
}

async function getPostCard(postId) {
    try {
        const res = await fetch(`/posts/card/${postId}`);

        if(!res.ok) {
            throw new Error(`response status code: ${res.status}`)
        }

        return res.text();
    } catch (err) {
        console.error(console.error(`failed getting post card for ${postId}, error message: ${err.message}`))
    }
}

function addPostCardToList(postCard) {
  const postList = document.getElementById("post-list");
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
    postList.innerHTML = "<li class='post-list-item'> Error: could not load posts</li>";
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

export {getPostCard, getPost, getAllPosts, renderAllPosts}