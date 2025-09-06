import { renderAllPosts } from "../posts.js";

console.log("group feed loaded");
renderAllPosts()

window.GroupMembers = (function () {
  function renderList(listId, users) {
    var list = document.getElementById(listId);
    if (!list) return;
    list.innerHTML = '';

    (users || []).forEach(function (u) {
      var li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';

      // left: username
      var nameSpan = document.createElement('span');
      nameSpan.textContent = u.username || 'user';

      // right: friend button
      var btn = document.createElement('button');
      btn.className = 'btn btn-outline-primary btn-sm';
      btn.type = 'button';
      btn.textContent = 'Add Friend';   // later can toggle to 'Remove Friend'
      btn.setAttribute('data-user-id', u._id || '');

      li.appendChild(nameSpan);
      li.appendChild(btn);
      list.appendChild(li);
    });
  }

  function open(groupName) {
    var url = '/groups/' + groupName + '/members';

    fetch(url, { headers: { 'Content-Type': 'application/json' } })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        if (!data || !data.ok) return;

        renderList('members-admins', data.admins);
        renderList('members-managers', data.managers);
        renderList('members-plain', data.plainUsers);

        var totalEl = document.getElementById('members-total');
        if (totalEl) {
          var total = (data.counts && data.counts.total) ? data.counts.total : 0;
          totalEl.textContent = 'Total: ' + total;
        }

        var modalEl = document.getElementById('groupMembersModal');
        if (modalEl && window.bootstrap && bootstrap.Modal) {
          var modal = new bootstrap.Modal(modalEl);
          modal.show();
        }
      })
      .catch(function (e) {
        console.error('members popup failed:', e.message);
      });
  }

  return { open: open };
})();

//------------------------------ Members POPUP window ------------------------------

function initMembersButton() {
  var btn = document.getElementById('group-members-btn');
  if (!btn || !window.GroupMembers) return;

  var groupName = btn.getAttribute('data-group');
  if (!groupName) return;

  btn.addEventListener('click', function () {
    window.GroupMembers.open(groupName);
  });
}

//document.addEventListener('DOMContentLoaded', initMembersButton);


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
      .then(function (res) {
        if (!res.ok) return res.json().then(function (j){ throw new Error(j && j.message || ('HTTP ' + res.status)); });
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
      })
      .catch(function (e) { alert(e.message); });
  });
}


initFollowButton();
initMembersButton();