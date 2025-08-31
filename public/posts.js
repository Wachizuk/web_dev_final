
async function getAllPosts() {
    try {
        const res = await fetch(`posts`);

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
        const res = await fetch(`posts/${postId}`);

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
        const res = await fetch(`posts/card/${postId}`);

        if(!res.ok) {
            throw new Error(`response status code: ${res.status}`)
        }

        return res.text();
    } catch (err) {
        console.error(console.error(`failed getting post card for ${postId}, error message: ${err.message}`))
    }
}

export {getPostCard, getPost, getAllPosts}