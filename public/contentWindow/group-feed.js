import { renderAllPosts } from "../posts.js";

console.log("group feed loaded");
renderAllPosts()

//------------------------------ Members card --------------------------------

function initMembersCard() {
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
        fillList("members-admins",   data.admins,   false, 'admin');
        fillList("members-managers", data.managers, false, 'manager');
        fillList("members-plain",    data.plainUsers, false, 'member');

      // 2) Then (optionally) check my role; if I'm admin, re-render with admin buttons
      fetch("/groups/" + groupName + "/membership")
        .then(function (r) {
          return r.ok ? r.json() : null;
        })
        .then(function (m) {
          if (m && m.role === "admin") {
            fillList("members-admins", data.admins, true, 'admin');
            fillList("members-managers", data.managers, true, 'manager');
            fillList("members-plain", data.plainUsers, true, 'member');
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
    .map(function (u) {
      var uid = u && (u._id || u.id) ? u._id || u.id : "";
      var name = (u && u.username) || "user";
      return '' +
  '<li class="members-item">' +

    // Row 1: name (left) + Add Friend (right)
    '<div class="members-top">' +
      '<span class="members-name">' + name + '</span>' +
      '<button type="button" class="btn btn-sm btn-link members-action" ' +
              'data-action="friend-toggle" data-user="' + String(uid) + '">Add Friend</button>' +
    '</div>' +

    // Row 2: admin-only role controls (labels depend on currentRole)
    (isAdmin ? (function(){
      if (currentRole === 'admin') {
        return '' +
          '<div class="members-admin">' +
            '<button type="button" class="btn btn-sm btn-outline-secondary" ' +
                    'data-action="remove-admin" data-user="' + String(uid) + '">Remove admin</button>' +
            '<button type="button" class="btn btn-sm btn-outline-secondary" ' +
                    'data-action="make-manager" data-user="' + String(uid) + '">Make manager</button>' +
            '<button type="button" class="btn btn-sm btn-outline-danger" ' +
                    'data-action="remove-member" data-user="' + String(uid) + '">Remove</button>' +
          '</div>';
      }
      if (currentRole === 'manager') {
        return '' +
          '<div class="members-admin">' +
            '<button type="button" class="btn btn-sm btn-outline-secondary" ' +
                    'data-action="make-admin" data-user="' + String(uid) + '">Make admin</button>' +
            '<button type="button" class="btn btn-sm btn-outline-secondary" ' +
                    'data-action="remove-manager" data-user="' + String(uid) + '">Remove manager</button>' +
            '<button type="button" class="btn btn-sm btn-outline-danger" ' +
                    'data-action="remove-member" data-user="' + String(uid) + '">Remove</button>' +
          '</div>';
      }
      // member/plain
      return '' +
        '<div class="members-admin">' +
          '<button type="button" class="btn btn-sm btn-outline-secondary" ' +
                  'data-action="make-admin" data-user="' + String(uid) + '">Make admin</button>' +
          '<button type="button" class="btn btn-sm btn-outline-secondary" ' +
                  'data-action="make-manager" data-user="' + String(uid) + '">Make manager</button>' +
          '<button type="button" class="btn btn-sm btn-outline-danger" ' +
                  'data-action="remove-member" data-user="' + String(uid) + '">Remove</button>' +
        '</div>';
    })() : '') +

  '</li>';
    })
    .join("");
    list.innerHTML = html;
}

function initMembersButton() {
  var btn = document.getElementById('group-members-btn');
  if (!btn) return;

  btn.addEventListener('click', function (e) {
    e.preventDefault();
    var anchor = document.getElementById('members-card-anchor') || document.getElementById('group-members-card');
    if (anchor && anchor.scrollIntoView) {
      anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}



//------------------------------ Members admin actions ----------------------------
function initMembersAdminActions() {
  var membersCard = document.getElementById('group-members-card');
  if (!membersCard) return;

  // Event delegation: listen for clicks on any button with [data-action] inside the card
  membersCard.addEventListener('click', function (evt) {
    var actionBtn = evt.target.closest('[data-action]');
    if (!actionBtn || !membersCard.contains(actionBtn)) return;

    var action = actionBtn.getAttribute('data-action'); // 'remove-member' | 'make-admin' | 'make-manager' | 'remove-admin' | 'remove-manager'
    if (!action) return;

    // Only handle the admin controls; ignore other buttons like friend-toggle
    var isRoleAction = (action === 'make-admin' || action === 'make-manager' || action === 'remove-admin' || action === 'remove-manager');
    var isRemoveMember = (action === 'remove-member');
    if (!isRoleAction && !isRemoveMember) return;

    var targetUserId = actionBtn.getAttribute('data-user');
    var groupName    = membersCard.getAttribute('data-group');
    if (!targetUserId || !groupName) return;

    // Prevent double submits
    if (actionBtn.disabled) return;
    actionBtn.disabled = true;

    // Build request
    var url, fetchOptions = { method: 'POST' };

    if (isRemoveMember) {
      url = '/groups/' + groupName + '/members/' + targetUserId + '/remove';
    } else {
        // role change
      var targetRole =
        action === 'make-admin'     ? 'admin'   :
        action === 'make-manager'   ? 'manager' :
        'member';

      url = '/groups/' + groupName + '/members/' + targetUserId + '/role';
      fetchOptions.headers = { 'Content-Type': 'application/json' };
      fetchOptions.body    = JSON.stringify({ role: targetRole });
    }

    // Send and refresh
    fetch(url, fetchOptions)
      .then(function (res) {
        return res.json().catch(function(){ return {}; }).then(function (j) {
          if (!res.ok) throw new Error(j && j.message || ('HTTP ' + res.status));
          return j;
        });
      })
      .then(function () {
        // lists + counts based on fresh server state
        initMembersCard();
      })
      .catch(function (err) {
        alert(err && err.message ? err.message : 'Request failed');
      })
      .finally(function () {
        actionBtn.disabled = false;
      });
  });
}


// expose to renderer
window.groupFeed = window.groupFeed || {};
window.groupFeed.initMembersCard = initMembersCard;
window.groupFeed.initMembersButton = initMembersButton;



//----------------------------------------------------------------------------------

//------------------------------ Follow/Unfollow button ----------------------------

function initFollowButton() {
  var btn = document.getElementById('follow-group-btn');
  if (!btn) return;

  var groupName = btn.getAttribute('data-group');

  btn.addEventListener('click', function () {
    fetch('/groups/' + groupName + '/follow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(async function (res) {
        if (!res.ok) {
          const j = await res.json();
          throw new Error(j && j.message || ('HTTP ' + res.status));
        }
        return res.json();
      })
      .then(function (data) {
        if (!data || !data.ok) return;

        // flip label
        var followed = !!data.followed;
        btn.textContent = followed ? 'Unfollow' : 'Follow Group';
        btn.classList.toggle('btn-primary', !followed);
        btn.classList.toggle('btn-outline-primary', followed);
        btn.setAttribute('data-followed', followed ? '1' : '0');

        // update Members button count
        var membersBtn = document.getElementById('group-members-btn');
        if (membersBtn) membersBtn.textContent = 'Members (' + (data.membersCount || 0) + ')';

        initMembersCard();
      })
      .catch(function (e) { alert(e.message); });
  });
}


initFollowButton();
initMembersButton();
initMembersCard();
initMembersAdminActions();