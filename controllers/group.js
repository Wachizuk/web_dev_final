const groupService = require("../services/group");

const viewGroupPage = "main/base";

async function groupPage(req, res) {
  const groupName = req.params.groupName;
  const groups = await groupService.getAllGroups();

  res.render(viewGroupPage, {
    email: req.session.email,
    username: req.session.username,
    groupName,
    feedPartial: "group",
    groups,
  });
}

module.exports = { groupPage };
