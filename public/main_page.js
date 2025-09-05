
// Import functions from other modules
import { renderContentWindow } from "./utils/renderer.js";
import { routes } from "./utils/routes.js";

const logoutBtn = document.getElementById("leaveBtn");
const logoutToastEl = document.getElementById("logoutToast");
const logoutToast = new bootstrap.Toast(logoutToastEl, { autohide: false });

logoutBtn.addEventListener("click", (e) => {
  e.preventDefault();
  logoutToast.show();
});

document.getElementById("confirmLogout").addEventListener("click", async () => {
  try {
    const res = await fetch(routes.users.logout, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}), // Send userIdentifier & password as JSON
    });

    const data = await res.json();

    if (data.success) {
       window.location.href = routes.users.login;
    } else {
      console.error("Logout failed");
    }
  } catch (err) {
    console.error(err);
  }
});


document.getElementById('settingsBtn').addEventListener('click', async () => {
  await renderContentWindow(routes.users.settings)});


document.getElementById('profile-btn').addEventListener('click', async () => {
  await renderContentWindow(routes.users.profile )});


  
// Attach click listeners to all side group navigation buttons
const sideGroups = [...document.getElementsByClassName('side-nav-group')];
sideGroups.forEach(elem => {
  elem.addEventListener('click', async (e) => {
    const groupName = e.target.closest('button').id;
    renderContentWindow(routes.groups.groupName(groupName))
  })
});


const createGroupBtn = document.getElementById('create-group-btn');
createGroupBtn.addEventListener('click', async () => {
  await renderContentWindow(routes.groups.new);
});

const createPostBtn = document.getElementById("create-post-btn");
createPostBtn.addEventListener('click', async () => {
  await renderContentWindow(routes.posts.create);
})

const homeBtn = document.getElementById("home-btn");
homeBtn.addEventListener('click', async () => {
  await renderContentWindow(routes.mainFeed);
})

window.addEventListener('DOMContentLoaded', async () => {
  await renderContentWindow(window.location.hash.substring(1))
})

// window.addEventListener('hashchange', async () => {
//   await renderContentWindow(window.location.hash.substring(1))
// })
