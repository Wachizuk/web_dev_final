const Group = require("../models/group");

async function getAllGroups() {
return await Group.find().lean();} 

async function getGroupByName(groupName) {
    return await Group.findOne({groupName});
}

function normalizeGroupName(displayName = "") {
  const raw = String(displayName || "").trim().toLowerCase();
  const norm = raw
    .replace(/[^a-z0-9\s-]/g, "") 
    .replace(/\s+/g, "-")         
    .replace(/-+/g, "-")          
    .replace(/^-|-$/g, "");       
  return norm || null;
}

async function createGroup({ groupName, displayName, description, members }) {
  const doc = new Group({ groupName, displayName, description, members });
  return await doc.save();
}

module.exports = { getAllGroups, getGroupByName, normalizeGroupName, createGroup };



