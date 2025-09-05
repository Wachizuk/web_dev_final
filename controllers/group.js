const groupService = require("../services/group");
const { toUsernameArray, findMissingUsernames, findUserIdsByUsernames } = require("../services/user");

const createGroupRoute = "main/partials/create-group";
const groupFeedRoute = "main/partials/group-feed";

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
    const adminUsernames   = toUsernameArray(req.body.admins);
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
  const groupName = req.params.groupName;
  const group = await groupService.getGroupByName(groupName);
  const coverUrl = group.coverFile ? `/uploads/groups/${group.coverFile}` : "";

  res.render(groupFeedRoute, {group, coverUrl});
}



module.exports = { groupPage, createGroupPage, createGroup };
