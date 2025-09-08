import { renderAllPosts, getPostCard } from "../posts.js";
import { getFriends } from "../users.js";
import { renderContentWindow } from "../utils/renderer.js";
import { routes } from "../utils/routes.js";

console.log("group feed loaded");
renderGroupPosts();

async function renderGroupPosts() {
  const list = document.getElementById("post-list");
  const gid = list?.dataset.groupid; // we set this in the EJS
  if (!gid) return renderAllPosts(); // fallback: original behavior

  list.innerHTML = "";
  const res = await fetch(`/posts/group/${gid}`);
  const posts = res.ok ? await res.json() : [];

  if (!posts.length) {
    list.innerHTML = "<li class='post-list-item'>No posts in this group</li>";
    return;
  }

  for (const p of posts) {
    const card = await getPostCard(p._id);
    if (!card) continue;
    const li = document.createElement("li");
    li.className = "post-list-item";
    li.appendChild(card);
    list.appendChild(li);
  }
}

//------------------------------ Members card --------------------------------

async function initMembersCard() {
  var card = document.getElementById("group-members-card");
  if (!card) return;

  var groupName = card.getAttribute("data-group");
  if (!groupName) return;

  fetch("/groups/" + groupName + "/members") // uses services/groups.getMembers
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (data) {
      if (!data) return;

      // update counts
      var total = (data.counts && data.counts.total) || 0;
      var c1 = document.getElementById("members-count");
      if (c1) c1.textContent = String(total);
      var c2 = document.getElementById("members-count-btn");
      if (c2) c2.textContent = String(total);

      // 1) Always show lists to everyone (no admin controls yet)
      fillList("members-admins", data.admins, false, "admin");
      fillList("members-managers", data.managers, false, "manager");
      fillList("members-plain", data.plainUsers, false, "member");

      // 2) Then (optionally) check my role; if I'm admin, re-render with admin buttons
      fetch("/groups/" + groupName + "/membership")
        .then(function (r) {
          return r.ok ? r.json() : null;
        })
        .then(function (m) {
          if (m && m.role === "admin") {
            fillList("members-admins", data.admins, true, "admin");
            fillList("members-managers", data.managers, true, "manager");
            fillList("members-plain", data.plainUsers, true, "member");
          }
        });
    })
    .catch(function (e) {
      console.error("members card:", e && e.message ? e.message : e);
    });
}

function fillList(id, arr, isAdmin, currentRole) {
  var list = document.getElementById(id);
  if (!list) return;
  var html = (arr || [])
    .map((u) => {
      var uid = u && u._id ? u._id : "";
      var name = u && u.username;
      return (
        "" +
        '<li class="members-item">' +
        // Row 1: name (left) + Add Friend (right)
        '<div class="members-top">' +
        '<span class="members-name">' +
        name +
        "</span>" +
        (function () {
          var isFriend = friends.includes(uid); // use whatever flag your API returns
          var state = isFriend ? "friend" : "not-friend";
          var label = isFriend ? "Remove Friend" : "Add Friend";

          // match the profile page’s classes/behavior
          var btnCls =
            "btn btn-sm friend-btn " +
            (isFriend ? "btn-outline-secondary " : "btn-primary ") +
            (isFriend ? "remove-friend" : "add-friend");

          return (
            "" +
            '<button type="button" class="' +
            btnCls +
            '" ' +
            'data-action="friend-toggle" ' +
            'data-user="' +
            String(uid) +
            '" ' +
            'data-state="' +
            state +
            '">' +
            label +
            "</button>"
          );
        })() +
        "</div>" +
        // Row 2: admin-only role controls (labels depend on currentRole)
        (isAdmin
          ? (function () {
              if (currentRole === "admin") {
                return (
                  "" +
                  '<div class="members-admin">' +
                  '<button type="button" class="btn btn-sm btn-outline-secondary" ' +
                  'data-action="remove-admin" data-user="' +
                  String(uid) +
                  '">Remove admin</button>' +
                  '<button type="button" class="btn btn-sm btn-outline-secondary" ' +
                  'data-action="make-manager" data-user="' +
                  String(uid) +
                  '">Make manager</button>' +
                  '<button type="button" class="btn btn-sm btn-outline-danger" ' +
                  'data-action="remove-member" data-user="' +
                  String(uid) +
                  '">Remove</button>' +
                  "</div>"
                );
              }
              if (currentRole === "manager") {
                return (
                  "" +
                  '<div class="members-admin">' +
                  '<button type="button" class="btn btn-sm btn-outline-secondary" ' +
                  'data-action="make-admin" data-user="' +
                  String(uid) +
                  '">Make admin</button>' +
                  '<button type="button" class="btn btn-sm btn-outline-secondary" ' +
                  'data-action="remove-manager" data-user="' +
                  String(uid) +
                  '">Remove manager</button>' +
                  '<button type="button" class="btn btn-sm btn-outline-danger" ' +
                  'data-action="remove-member" data-user="' +
                  String(uid) +
                  '">Remove</button>' +
                  "</div>"
                );
              }
              // member/plain
              return (
                "" +
                '<div class="members-admin">' +
                '<button type="button" class="btn btn-sm btn-outline-secondary" ' +
                'data-action="make-admin" data-user="' +
                String(uid) +
                '">Make admin</button>' +
                '<button type="button" class="btn btn-sm btn-outline-secondary" ' +
                'data-action="make-manager" data-user="' +
                String(uid) +
                '">Make manager</button>' +
                '<button type="button" class="btn btn-sm btn-outline-danger" ' +
                'data-action="remove-member" data-user="' +
                String(uid) +
                '">Remove</button>' +
                "</div>"
              );
            })()
          : "") +
        "</li>"
      );
    })
    .join("");
  list.innerHTML = html;
}

function initMembersButton() {
  var btn = document.getElementById("group-members-btn");
  if (!btn) return;

  btn.addEventListener("click", function (e) {
    e.preventDefault();

    const title = document.getElementById("group-title-anchor");
    if (title) title.scrollIntoView({ behavior: "smooth", block: "start" });

    const anchor =
      document.getElementById("members-card-anchor") ||
      document.getElementById("group-members-card");
    const container = document.getElementById("group-right-col");
    if (container && anchor) {
      container.scrollTo({
        top: anchor.offsetTop - container.offsetTop,
        behavior: "smooth",
      });
    }
  });
}

//------------------------------ Members admin actions ----------------------------
function initMembersAdminActions() {
  var membersCard = document.getElementById("group-members-card");
  if (!membersCard) return;

  // Event delegation: listen for clicks on any button with [data-action] inside the card
  membersCard.addEventListener("click", function (evt) {
    var actionBtn = evt.target.closest("[data-action]");
    if (!actionBtn || !membersCard.contains(actionBtn)) return;

    var action = actionBtn.getAttribute("data-action"); // 'remove-member' | 'make-admin' | 'make-manager' | 'remove-admin' | 'remove-manager'
    if (!action) return;

    if (action == "friend-toggle") {
      try {
        friendBtnAction(actionBtn);
      } catch (e) {
        console.error(e.message);
      }

      return;
    }

    // Only handle the admin controls; ignore other buttons like friend-toggle
    var isRoleAction =
      action === "make-admin" ||
      action === "make-manager" ||
      action === "remove-admin" ||
      action === "remove-manager";
    var isRemoveMember = action === "remove-member";
    if (!isRoleAction && !isRemoveMember) return;

    var targetUserId = actionBtn.getAttribute("data-user");
    var groupName = membersCard.getAttribute("data-group");
    if (!targetUserId || !groupName) return;

    // Prevent double submits
    if (actionBtn.disabled) return;
    actionBtn.disabled = true;

    // Build request
    var url,
      fetchOptions = { method: "POST" };

    if (isRemoveMember) {
      url = "/groups/" + groupName + "/members/" + targetUserId + "/remove";
    } else {
      // role change
      var targetRole =
        action === "make-admin"
          ? "admin"
          : action === "make-manager"
          ? "manager"
          : "member";

      url = "/groups/" + groupName + "/members/" + targetUserId + "/role";
      fetchOptions.headers = { "Content-Type": "application/json" };
      fetchOptions.body = JSON.stringify({ role: targetRole });
    }

    // Send and refresh
    fetch(url, fetchOptions)
      .then(function (res) {
        return res
          .json()
          .catch(function () {
            return {};
          })
          .then(function (j) {
            if (!res.ok)
              throw new Error((j && j.message) || "HTTP " + res.status);
            return j;
          });
      })
      .then(function () {
        // lists + counts based on fresh server state
        initMembersCard();
      })
      .catch(function (err) {
        alert(err && err.message ? err.message : "Request failed");
      })
      .finally(function () {
        actionBtn.disabled = false;
      });
  });
}

//----------------------------------------------------------------------------------

//------------------------------ Follow/Unfollow button ----------------------------

function initFollowButton() {
  var btn = document.getElementById("follow-group-btn");
  if (!btn) return;

  var groupName = btn.getAttribute("data-group");

  btn.addEventListener("click", function () {
    fetch("/groups/" + groupName + "/follow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
      .then(async function (res) {
        if (!res.ok) {
          const j = await res.json();
          throw new Error((j && j.message) || "HTTP " + res.status);
        }
        return res.json();
      })
      .then(function (data) {
        if (!data || !data.ok) return;

        // flip label
        var followed = !!data.followed;
        btn.textContent = followed ? "Unfollow" : "Follow Group";
        btn.classList.toggle("btn-primary", !followed);
        btn.classList.toggle("btn-outline-primary", followed);
        btn.setAttribute("data-followed", followed ? "1" : "0");

        // update Members button count
        var membersBtn = document.getElementById("group-members-btn");
        if (membersBtn)
          membersBtn.textContent = "Members (" + (data.membersCount || 0) + ")";

        initMembersCard();
        window.location.reload();
      })
      .catch(function (e) {
        alert(e.message);
      });
  });
}

//----------------------------------------------------------------------------------

//------------------------------ Group settings card ----------------------------

function initGroupSettingsCard() {
  const btn = document.getElementById("group-settings-btn");
  const card = document.getElementById("group-settings-card");
  if (!btn || !card) {
    console.error("Settings card elements not found:", {
      btn: !!btn,
      card: !!card,
    });
    return;
  }

  const form = card.querySelector("#edit-group-form");
  if (!form) {
    console.error("Edit form not found in settings card");
    return;
  }

  const groupName = card.dataset.group || "";
  const delBtn = card.querySelector("#delete-group-btn");

  // Cover picker (same as create-group)
  const pickBtn = card.querySelector("#coverPickBtnEdit");
  const fileInput = card.querySelector("#groupCoverEdit");

  if (pickBtn && fileInput) {
    pickBtn.addEventListener("click", () => fileInput.click());
  }

  // Toggle show and scroll(Bootstrap .d-none)
  btn.addEventListener("click", () => {
    if (card.classList.contains("d-none")) card.classList.remove("d-none");

    const title = document.getElementById("group-title-anchor");
    if (title) title.scrollIntoView({ behavior: "smooth", block: "start" });

    const container = document.getElementById("group-right-col");
    if (container) {
      container.scrollTo({
        top: card.offsetTop - container.offsetTop,
        behavior: "smooth",
      });
    }
  });

  // Submit edits
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // optional cover upload
    if (fileInput && fileInput.files && fileInput.files[0]) {
      const f = fileInput.files[0];
      const up = await fetch(`/uploads/groups/${groupName}/cover`, {
        method: "POST",
        headers: { "Content-Type": f.type || "application/octet-stream" },
        body: f,
      });
      if (!up.ok) {
        const t = await up.text().catch(() => "Upload failed");
        alert(t);
        return;
      }
    }

    // other fields
    const fd = new FormData(form);
    const nextName = (fd.get("newGroupName") || "").trim();
    const desc = (fd.get("description") || "").trim();

    const body = { displayName: nextName, description: desc };
    if (body.displayName.length > 20) {
      alert("Display name is too long [20 MAX]");
      return;
    }
    const res = await fetch(`/groups/${groupName}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const t = await res.text().catch(() => "Server error");
      alert(`Update failed: ${t}`);
      return;
    }

    const data = await res.json().catch(() => ({}));
    const finalName = data.groupName || groupName;

    renderContentWindow(routes.groups.groupName(finalName));
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Delete group
  delBtn.addEventListener("click", async () => {
    if (!confirm("Are you sure you want to DELETE this group?")) return;

    const res = await fetch(`/groups/${groupName}`, { method: "DELETE" });
    if (!res.ok) {
      const t = await res.text().catch(() => "Server error");
      alert(`Delete failed: ${t}`);
      return;
    }
    renderContentWindow(routes.mainFeed);
  });
}
//----------------------------------------------------------------------------------
var friends = [];

async function initAll() {
  initFollowButton();
  initMembersButton();
  friends = await getFriends();
  friends = friends ? friends.map((fr) => fr._id) : [];
  initMembersCard();
  initMembersAdminActions();
  initGroupSettingsCard();
}

initAll();

async function friendBtnAction(btn) {
  const friendUid = btn.dataset.user;
  const method = btn.classList.contains("btn-primary") ? "POST" : "DELETE";

  try {
    const res = await fetch(`/user/friends/${encodeURIComponent(friendUid)}`, {
      method,
      credentials: "same-origin", // send cookies/session
      headers: { Accept: "application/json" },
    });

    const ct = res.headers.get("content-type") || "";
    const payload = ct.includes("application/json")
      ? await res.json()
      : { success: false, message: await res.text() };

    if (!res.ok || !payload.success) {
      throw new Error(payload.message || `Request failed (${res.status})`);
    }

    btn.classList.toggle("add-friend");
    btn.classList.toggle("remove-friend");
    btn.classList.toggle("btn-primary");
    btn.classList.toggle("btn-outline-secondary");
    btn.textContent = btn.classList.contains("add-friend")
      ? "Add friend"
      : "Remove friend";
  } catch (err) {
    console.error("[friends] error:", err);
    alert(err.message || "Action failed");
  }
}

//----------------------------------------------------------------------------------
