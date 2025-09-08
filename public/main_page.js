
// Import functions from other modules
import { renderContentWindow, stateTracker } from "./utils/renderer.js";
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

const myFeedBtn = document.getElementById("my-feed-btn");
myFeedBtn.addEventListener('click', async () => {
  await renderContentWindow(routes.myFeed);
})

const myPostsBtn = document.getElementById("my-posts-btn");
myPostsBtn.addEventListener('click', async () => {
  await renderContentWindow(routes.myPosts);
})

const allGroupsBtn = document.getElementById("all-groups-btn");
allGroupsBtn.addEventListener('click', async () => {
  await renderContentWindow(routes.groups.allGroups);
})

window.addEventListener('DOMContentLoaded', async () => {
  await renderContentWindow(window.location.hash.substring(1))
})

window.addEventListener('hashchange', async () => {
  //variable is defined in renderer and set to true if change was triggered by it
  //we dont need to run it again in that case
  if(stateTracker.internalHashChange) {
    stateTracker.internalHashChange = false;
    return;
  }

  await renderContentWindow(window.location.hash.substring(1), true)
})

///////////////SEARCH BAR////////////////////////
// DOM refs
const form  = document.getElementById("top-nav-search-form");
const input = document.getElementById("top-nav-search-input");
const menu  = document.getElementById("top-nav-suggest");

// scope from radios
function getScope() {
  return document.querySelector('input[name="searchScope"]:checked')?.value || "user";
}

// build target path
function buildPath(scope, term) {
  const t = String(term).trim().replace(/^\s*[@#]/, "").replace(/\s+/g, "");
  if (scope === "user")  return `${routes.users.profile}/${encodeURIComponent(t)}`;   // /user/profile/:username
  if (scope === "group") return routes.groups.groupName(encodeURIComponent(t));       // /groups/:groupName
  if (scope === "post")  return routes.posts.cardById(encodeURIComponent(t));         // /posts/:postId
  return `${routes.users.profile}/${encodeURIComponent(t)}`;
}


// submit -> navigate
form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const term = (input?.value || "").trim();
  if (!term) return;

  const scope = getScope();  // scope can be "user" , "grop" , "post"
  const path  = buildPath(scope, term);

  await renderContentWindow(path)
});

// --- Suggest (dropdown) ---
let options = [], idx = -1;

// input -> fetch suggestions (debounced)
input?.addEventListener("input", debounce(async () => {
  const q = (input.value || "").trim();   
  if (!q) return hideSuggest();

  const scope = getScope();
  try {
    const res = await 
    fetch(`/suggest?scope=${encodeURIComponent(scope)}&q=${encodeURIComponent(q)}&limit=8`);   //   /suggest + parameters  limit
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    renderSuggest(data, scope);
  } 
  catch (err) {
    console.error("suggest fetch failed:", err);
    hideSuggest();
  }
}, 120));

// click outside closes
document.addEventListener("click", (e) => {
  if (!menu) return;
  if (!menu.contains(e.target) && e.target !== input) hideSuggest();
});

function renderSuggest(items, scope) {
  if (!menu) return;
  options = items || []; idx = -1;
  if (!options.length) return hideSuggest();
//         o - label / value         i - index
  menu.innerHTML = options.map((o, i) => `
    <div class="item" data-i="${i}">
      ${icon(scope)} <span>${escapeHtml(o.label)}</span>
      <span class="muted">${scope}</span>
    </div>
  `).join("");
  menu.classList.remove("d-none");

  menu.querySelectorAll(".item").forEach(el => {
    el.addEventListener("mouseenter", () => setIdx(+el.dataset.i));
    el.addEventListener("mouseleave", () => setIdx(-1));
    el.addEventListener("click", () => openOption(options[+el.dataset.i], scope));
  });
}

function openOption(opt, scope) {
  hideSuggest();
  const path = opt.path || buildPath(scope, opt.value || opt.label);
  renderContentWindow(path);
}

function setIdx(i) {
  idx = i;
  if (!menu) return;
  menu.querySelectorAll(".item").forEach((el, j) => el.classList.toggle("active", j === i));
}

function hideSuggest() {
  if (!menu) return;
  menu.classList.add("d-none");
  menu.innerHTML = "";
  options = []; idx = -1;
}

function icon(scope) {
  if (scope === "user")  return `<i class="bi bi-person"></i>`;
  if (scope === "group") return `<i class="bi bi-people"></i>`;
  if (scope === "post")  return `<i class="bi bi-card-text"></i>`;
  return `<i class="bi bi-search"></i>`;
}

function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
function escapeHtml(s = "") {
  return String(s).replaceAll("&","&amp;").replaceAll("<","&lt;")
    .replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
}



// SELECTED PROFILE FUNCTION

document.addEventListener("click", async (e) => {
  const btn = e.target.closest("#btn-add, #btn-remove");
  // find if clicked element is "Add" or "Remove" button
  if (!btn) return;

  const root = document.getElementById("selected-profile");
  // root element of the profile page
  if (!root) return; 

  e.preventDefault();  
  // stop default button/link behavior

  const profileId = root.dataset.profileId;
  // get profile id from data attribute
  if (!profileId) {
    console.error("[friends] missing profile id");
    return;
  }

  const method = btn.id === "btn-add" ? "POST" : "DELETE";
  // choose HTTP method: add = POST, remove = DELETE

  const prevText = btn.textContent;
  btn.disabled = true;
  btn.textContent = method === "POST" ? "Adding..." : "Removing...";
  // disable button and show loading text

  try {
    const res = await fetch(`/user/friends/${encodeURIComponent(profileId)}`, {
      method,
      credentials: "same-origin",        // send cookies/session
      headers: { "Accept": "application/json" },
    });

    const ct = res.headers.get("content-type") || "";
    const payload = ct.includes("application/json")
      ? await res.json()
      : { success: false, message: await res.text() };


    if (!res.ok || !payload.success) {
      throw new Error(payload.message || `Request failed (${res.status})`);
    }
    // if request failed, throw error

    location.reload();
    // on success: reload page to update UI

  } catch (err) {
    console.error("[friends] error:", err);
    alert(err.message || "Action failed");
    // show error message to user
    btn.disabled = false;
    btn.textContent = prevText;
    // re-enable button and restore text
  }
});


