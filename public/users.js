import { routes } from "./utils/routes.js";


const getFriends = async () => {
    try {
    const res = await fetch(routes.users.getFriends);

    if (!res.ok) {
      throw new Error("failed post fetch");
    }

    return await res.json();
  } catch (err) {
    console.error(
      `failed getting friend list, reason: ${err.message}`
    );
  }
}

/**
 * returns if user is friend
 * @param {String} friendId 
 * @returns {boolean}
 */
const isFriend = async (friendId) => {
    try {
    const res = await fetch(routes.users.isFriend(friendId));

    if (!res.ok) {
      throw new Error("failed post fetch");
    }

    return await res.json().isFriend;
  } catch (err) {
    console.error(
      `failed getting friend list, reason: ${err.message}`
    );
  }
}

export {isFriend, getFriends}