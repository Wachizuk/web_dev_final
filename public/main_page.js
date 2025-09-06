
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
  if (scope === "post")  return `/posts/${encodeURIComponent(t)}`;                    // adjust if needed
  return `${routes.users.profile}/${encodeURIComponent(t)}`;
}

function titleFor(scope, term) {
  if (scope === "user")  return `Profile: ${term}`;
  if (scope === "group") return `Group: ${term}`;
  if (scope === "post")  return `Post: ${term}`;
  return term;
}

// submit -> navigate
form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const term = (input?.value || "").trim();
  if (!term) return;

  const scope = getScope();
  const path  = buildPath(scope, term);

  await renderContentWindow(path, {
    showHeader: true,
    title: titleFor(scope, term)
  });
  hideSuggest();
});

// --- Suggest (dropdown) ---
let options = [], idx = -1;

// input -> fetch suggestions (debounced)
input?.addEventListener("input", debounce(async () => {
  const q = (input.value || "").trim();
  if (!q) return hideSuggest();

  const scope = getScope();
  try {
    const res = await fetch(`/suggest?scope=${encodeURIComponent(scope)}&q=${encodeURIComponent(q)}&limit=8`, {
      headers: { Accept: "application/json" }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    renderSuggest(data, scope);
  } catch (err) {
    console.error("suggest fetch failed:", err);
    hideSuggest();
  }
}, 120));

// arrows / enter / escape
input?.addEventListener("keydown", (e) => {
  if (!menu || menu.classList.contains("d-none")) return;
  const max = options.length - 1;
  if (e.key === "ArrowDown") { e.preventDefault(); setIdx(Math.min(idx + 1, max)); }
  if (e.key === "ArrowUp")   { e.preventDefault(); setIdx(Math.max(idx - 1, 0)); }
  if (e.key === "Enter")     {
    const sel = options[idx];
    if (sel) { e.preventDefault(); openOption(sel, getScope()); }
  }
  if (e.key === "Escape")    hideSuggest();
});

// click outside closes
document.addEventListener("click", (e) => {
  if (!menu) return;
  if (!menu.contains(e.target) && e.target !== input) hideSuggest();
});

function renderSuggest(items, scope) {
  if (!menu) return;
  options = items || []; idx = -1;
  if (!options.length) return hideSuggest();

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
  renderContentWindow(path, { showHeader: true, title: titleFor(scope, opt.label) });
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

