
// Import functions from other modules
import { getSettingWindow , initSettingsHandlers } from "./profile-menu/settings.js";
import { renderAllPosts , getPostCard, getAllPosts} from "./posts.js";
import {getCreateGroupWindow, getGroupWindow , initCreateGroupForm} from "./groups.js"
import { renderContentWindow } from "./utils/renderer.js";
import { routes } from "./utils/routes.js";
const contentWindow = document.getElementById('content-window');


// Main content window container
const contentWindow = document.getElementById('content-window');



//new addition for filtering posts by groups
//if valid groupname available the read it, else null (main feed)
// let groupName = null;
// if (postList && postList.dataset && postList.dataset.group) {
//   groupName = postList.dataset.group;
// } 




//renderAllPosts();

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
      // window.location.href = "/user/login";
       window.location.href = routes.users.login;
    } else {
      console.error("Logout failed");
    }
  } catch (err) {
    console.error(err);
  }
});


// Render group window inside the content area and reload posts
async function renderGroupWindow(groupName) {
    const groupWindow = await getGroupWindow(groupName);
    contentWindow.innerHTML = groupWindow;
    window.location.hash = `/groups/${groupName}`;
    renderAllPosts();
}

// Render settings window inside the content area
async function renderSettingsWindow() {
  contentWindow.innerHTML = await getSettingWindow();
  initSettingsHandlers();
}
document.getElementById('settingsBtn').addEventListener('click', renderSettingsWindow);


// Attach click listeners to all side group navigation buttons
const sideGroups = [...document.getElementsByClassName('side-nav-group')];
sideGroups.forEach(elem => {
  elem.addEventListener('click', async (e) => {
    const groupName = e.target.closest('button').id;
    renderContentWindow(routes.groups.groupName(groupName))
    // renderGroupWindow(groupName);
    //  window.location.hash = `groups/${groupName}`
  })
});


const createGroupBtn = document.getElementById('create-group-btn');
createGroupBtn.addEventListener('click', async () => {
contentWindow.innerHTML = await getCreateGroupWindow();
initCreateGroupForm (async(groupName) => {
await renderGroupWindow(groupName);
    
  });
});

window.addEventListener('DOMContentLoaded', async () => {
  await renderContentWindow(window.location.hash.substring(1))
})
