const Group = require("../models/group");

async function getAllGroups() {
return await Group.find().lean();} // will be replaced with DB

async function getGroupByName(groupName) {
    return await Group.findOne({groupName});
}

module.exports = { getAllGroups, getGroupByName };



