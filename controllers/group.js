const groupService = require("../services/group");
const { toUsernameArray, findMissingUsernames, findUserIdsByUsernames } = require("../services/user");

const createGroupRoute = "main/partials/create-group";
// const groupFeedRoute = "main/partials/group-feed";
const postModel = require("../models/post");
const groupModel = require("../models/group");

// GET /groups/new - render the create form
async function createGroupPage(req, res) {
  res.render(createGroupRoute, {});
}

// POST /groups - create a group
async function createGroup(req, res) {
  try {
    
    const displayName = String(req.body.displayName || "").trim();
    if (!displayName) {
      return res.status(400).json({ ok: false, message: "Group name is required" });
    }

    // set groupName by normalizing displayName
    const groupName = groupService.normalizeGroupName(displayName);
    if (!groupName) {
      return res.status(400).json({ ok: false, message: "Invalid Group name" });
    }

    // check if groupName unique 
    const exists = await groupService.getGroupByName(groupName);
    if (exists) {
      return res.status(400).json({ ok: false, message: "Group name already exists" });
    }

    // make sure admins and managers are valid arrays
    const adminUsernames = toUsernameArray(req.body.admins);
    const managerUsernames = toUsernameArray(req.body.managers);

    // validate all usernames exist, if not alert which ones
    const [missingAdmins, missingManagers] = await Promise.all([
      findMissingUsernames(adminUsernames),
      findMissingUsernames(managerUsernames),
    ]);
    if (missingAdmins.length || missingManagers.length) {
      return res.status(400).json({
        ok: false,
        message: "Some usernames do not exist",
        invalid: { admins: missingAdmins, managers: missingManagers },
      });
    }

    // get ids for each username
    const [adminIdsResolved, managerIdsResolved] = await Promise.all([
      findUserIdsByUsernames(adminUsernames),
      findUserIdsByUsernames(managerUsernames),
    ]);

    // initiate creator as an admin 
    const creatorId = String(req.session._id);
    const admins   = Array.from(new Set([creatorId, ...adminIdsResolved.map(String)]));
    const managers = Array.from(new Set(managerIdsResolved.map(String)));

    const members = { admins, managers, plainUsers: [] };

    // create
    const created = await groupService.createGroup({
      groupName:   groupName,
      displayName: displayName,
      description: (req.body.description || "").trim(),
      members,
    });

    // success
    return res.json({ ok: true, groupName: created.groupName, displayName: created.displayName });
  } catch (err) {
    console.error("createGroup error:", err);
    return res.status(500).json({ ok: false, message: "Server error creating group" });
  }
}

async function groupPage(req, res) {
  try {
    const groupName = req.params.groupName;
    const group = await groupService.getGroupByName(groupName);
    const userId = req.session._id;

    const isAdmin = Array.isArray(group.members.admins) && group.members.admins.some(a => String(a) === String(userId));

    res.render('main/partials/group-feed', {
      group,
      coverUrl: group.coverFile ? `/uploads/groups/${group.coverFile}` : null,
      isAdmin,
      user: { _id: userId },
    });
  } catch (err) {
    console.error('groupPage error:', err.message);
    res.status(404).send('Group not found');
  }
}


// --------------------------------------- Follow related function ---------------------------------

// remove a member (admin only)
async function removeMember(req, res) {
  try {
    const { groupName, userId } = req.params;
    const result = await groupService.toggleFollow(groupName, userId);
    return res.json({ ok: true, removed: true, membersCount: result.membersCount });
  } catch (err) {
    return res.status(err.status || 500).json({ ok: false, message: err.message || 'Server error' });
  }
}

// GET membership info for the logged-in user
async function getMembership(req, res) {
  try {
    const { groupName } = req.params;
    const userId = req.session._id;

    const { followed, role, membersCount } = await groupService.getMembership(groupName, userId);
    return res.status(200).json({ ok: true, followed, role, membersCount });
  } catch (err) {
    console.error('getMembership error:', err.message);
    return res.status(err.status || 500).json({ ok: false, message: err.message });
  }
}

// POST toggle follow/unfollow for the logged-in user
async function toggleFollow(req, res) {
  try {
    const { groupName } = req.params;
    const userId = req.session._id;
    const { followed, membersCount } = await groupService.toggleFollow(groupName, userId);
    return res.status(200).json({ ok: true, followed, membersCount });
  } catch (err) {
    return res.status(err.status || 500).json({ ok: false, message: err.message });
  }
}

// -------------------------------------------------------------------------------------------------------


// --------------------------------------- Group Members related function ---------------------------------

async function getMembers(req, res) {
  try {
    const { groupName } = req.params;
    const data = await groupService.getMembers(groupName);
    return res.status(200).json({ ok: true, ...data });
  } catch (err) {
    console.error('getMembers error:', err.message);
    return res.status(err.status || 500).json({ ok: false, message: err.message });
  }
}

// Move a user between admin / manager / member (plainUsers)
async function setMemberRole(req, res) {
  try {
    const { groupName, userId } = req.params;
    const role = (req.body && req.body.role) || ''; // 'admin' | 'manager' | 'member'
    if (!['admin', 'manager', 'member'].includes(role)) {
      return res.status(400).json({ ok: false, message: 'Invalid role' });
    }

    const result = await groupService.setMemberRole(groupName, userId, role);
    return res.json({ ok: true, role: result.role, membersCount: result.membersCount });
  } catch (err) {
    return res.status(err.status || 500).json({ ok: false, message: err.message || 'Server error' });
  }
}

// --------------------------------------------------------------------------------------------------------


// --------------------------------------- Edit / Delete Group related function ---------------------------------

const services = require('../services/group');
const Group = require('../models/group'); // used for delete

async function updateGroup(req, res) {
  try {
    const viewerId  = req.session?._id;
    const current   = req.params.groupName;
    const { displayName, description } = req.body || {};

    const group = await services.getGroupByName(current);
    if (!group) return res.status(404).send('Group not found');

    // admin-only
    const isAdmin = Array.isArray(group.members?.admins) &&
      group.members.admins.some(a => String(a) === String(viewerId));
    if (!isAdmin) return res.status(403).send('Admins only');

    const updates = {};
    if (typeof description === 'string') updates.description = description.trim();

    let finalGroupName = group.groupName;

    // If displayName provided, update it and normalize to groupName
    if (typeof displayName === 'string' && displayName.trim()) {
      const cleanDisplay = displayName.trim();
      updates.displayName = cleanDisplay;

      // normalize to groupName
      const normalize =
        (typeof services.normalizeGroupName === 'function')
          ? services.normalizeGroupName
          : (s) => String(s).toLowerCase().trim().replace(/[^a-z0-9\- ]/g,'').replace(/\s+/g,'-');

      const derived = normalize(cleanDisplay);

      if (derived !== group.groupName) {
        const exists = await services.getGroupByName(derived);
        if (exists) return res.status(409).send('Group name already exists');
        updates.groupName = derived;
        finalGroupName = derived;
      }
    }

    const saved = await services.updateGroupByName(current, updates);
    if (!saved) return res.status(500).send('Failed to update group');

    const finalDisplay = (typeof updates.displayName === 'string' && updates.displayName.trim())
  ? updates.displayName.trim()
  : group.displayName;

    res.json({ ok: true, groupName: finalGroupName, displayName: finalDisplay });
  } catch (err) {
    console.error('updateGroup error:', err);
    res.status(500).send('Server error');
  }
};

// DELETE
async function deleteGroup(req, res) {
  try {
    const viewerId  = req.session?._id;
    const groupName = req.params.groupName;

    const group = await services.getGroupByName(groupName);
    if (!group) return res.status(404).send('Group not found');

    // admin-only
    const isAdmin = Array.isArray(group.members?.admins) &&
      group.members.admins.some(a => String(a) === String(viewerId));
    if (!isAdmin) return res.status(403).send('Admins only');


    // detach posts from this group first:
    await postModel.updateMany({ group: group._id }, { $unset: { group: 1 } });

    // delete the group document
    await groupModel.deleteOne({ _id: group._id });



    res.json({ ok: true });
  } catch (err) {
    console.error('deleteGroup error:', err);
    res.status(500).send('Server error');
  }
};

module.exports = { groupPage, createGroupPage, createGroup, getMembership, toggleFollow, getMembers, removeMember, setMemberRole, updateGroup, deleteGroup };
