const groupService = require("../services/group");

const viewGroupRoute = "main/partials/group-feed";
const createGroupRoute = "main/partials/create-group";


async function groupPage(req, res) {
  const groupName = req.params.groupName;
  const group = await groupService.getGroupByName(groupName);

  res.render(viewGroupRoute, {groupName});
}

async function createGroupPage(req, res) {
  res.render(createGroupRoute, {});
}

module.exports = { groupPage, createGroupPage };
