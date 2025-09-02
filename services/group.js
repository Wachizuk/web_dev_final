const Group = require("../models/group");

async function getAllGroups() {
return await Group.find().lean();} // will be replaced with DB
module.exports = { getAllGroups };



