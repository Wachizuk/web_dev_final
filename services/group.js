const Group = require("../models/group");
const User = require("../models/user");

// --------------------------------------- Group related function ---------------------------------

async function getAllGroups() {
return await Group.find().lean();} 

async function getGroupByName(groupName) {
    return await Group.findOne({groupName})
      .select('groupName displayName coverFile members description') .lean(); 
}

function normalizeGroupName(displayName = "") {
  const raw = String(displayName || "").trim().toLowerCase();
  const norm = raw
    .replace(/[^a-z0-9\s-]/g, "") 
    .replace(/\s+/g, "-")         
    .replace(/-+/g, "-")          
    .replace(/^-|-$/g, "");       
  return norm;
}


// --------------------------------------- Follow related function ---------------------------------

function idEq(a, b) { return String(a) === String(b); }
// remove all occurrences of userId from arr
function pull(arr, userId) { return (arr || []).filter(id => !idEq(id, userId)); }
// add userId to arr if not already present
function push(arr, userId) {
  arr = arr || [];
  if (!arr.some(id => idEq(id, userId))) arr.push(userId);
  return arr;
}

// toggle follow/unfollow for userId on groupName
async function toggleFollow(groupName, userId) {
  const group = await Group.findOne({ groupName }).select('members _id').lean(false);
  if (!group) { const e = new Error('Group not found'); e.status = 404; throw e; }

  const user = await User.findById(userId).select('groups').lean(false);
  if (!user) { const e = new Error('User not found'); e.status = 404; throw e; }

  group.members = group.members || { admins: [], managers: [], plainUsers: [] };

  const inAdmins = (group.members.admins || []).some(id => idEq(id, userId));
  const inManagers = (group.members.managers || []).some(id => idEq(id, userId));
  const inPlain = (group.members.plainUsers || []).some(id => idEq(id, userId));
  const isMember = inAdmins || inManagers || inPlain;

  if (isMember) {
    if (inAdmins && (group.members.admins || []).length <= 1) {
      const e = new Error('Cannot leave: at least one admin is required');
      e.status = 409; throw e;
    }
    // remove user from all roles
    group.members.admins = pull(group.members.admins, userId);
    group.members.managers = pull(group.members.managers, userId);
    group.members.plainUsers = pull(group.members.plainUsers, userId);
    user.groups = pull(user.groups, group._id);
    await user.save();
    // await User.updateOne({ _id: userId }, { $pull: { groups: group._id } });

    group.markModified('members');
    await group.save();

    const membersCount =
      (group.members.admins?.length || 0) +
      (group.members.managers?.length || 0) +
      (group.members.plainUsers?.length || 0);

    return { followed: false, membersCount };
  }

  // follow
  group.members.plainUsers = push(group.members.plainUsers, userId);
  user.groups = push(user.groups, group._id);
  await user.save();
  // await User.updateOne({ _id: userId }, { $addToSet: { groups: group._id } });
  group.markModified('members');
  await group.save();

  const membersCount =
    (group.members.admins?.length || 0) +
    (group.members.managers?.length || 0) +
    (group.members.plainUsers?.length || 0);

  return { followed: true, membersCount };
}

// ---------------------------------------------------------------------------------------------------


// --------------------------------------- Group Members related function ---------------------------------

async function getMembers(groupName) {
  const group = await Group.findOne({ groupName })
    .select("members")
    .populate({ path: "members.admins", select: "username" })
    .populate({ path: "members.managers", select: "username" })
    .populate({ path: "members.plainUsers", select: "username" })
    .lean();

  if (!group) {
    const err = new Error("Group not found");
    err.status = 404;
    throw err;
  }

  const m = group.members || {};
  const admins = m.admins || [];
  const managers = m.managers || [];
  const plainUsers = m.plainUsers || [];

  const counts = {
    admins: admins.length,
    managers: managers.length,
    plainUsers: plainUsers.length,
    total: admins.length + managers.length + plainUsers.length,
  };

  return { admins, managers, plainUsers, counts };
}

async function getMembership(groupName, userId) {
  const group = await Group.findOne({ groupName }).select('members').lean();
  if (!group) { const e = new Error('Group not found'); e.status = 404; throw e; }

  const m = group.members || {};
  const inAdmins = (m.admins || []).some(id => String(id) === String(userId));
  const inManagers = (m.managers || []).some(id => String(id) === String(userId));
  const inPlain = (m.plainUsers || []).some(id => String(id) === String(userId));

  const followed = !!(inAdmins || inManagers || inPlain);
  const role = inAdmins ? 'admin' : inManagers ? 'manager' : inPlain ? 'member' : 'none';

  const membersCount =
    (m.admins?.length || 0) + (m.managers?.length || 0) + (m.plainUsers?.length || 0);

  return { followed, role, membersCount };
}

// -------------------------------------------------------------------------------------------------------



async function createGroup({ groupName, displayName, description, members }) {
  const doc = new Group({ groupName, displayName, description, members });
  return await doc.save();
}

// updateOps is an object with the fields to update
async function updateGroupByName(groupName, updateOps) {
  return Group.findOneAndUpdate({ groupName }, updateOps, { new: true }).lean();
}

module.exports = {
  getAllGroups,
  getGroupByName,
  normalizeGroupName,
  createGroup,
  updateGroupByName,
  toggleFollow,
  getMembers,
  getMembership,
};



