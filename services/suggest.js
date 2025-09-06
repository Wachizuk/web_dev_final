const User  = require("../models/user");
const Group = require("../models/group");
const Post  = require("../models/post");

const esc = (s="") => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

async function suggest({ scope, q, limit }) {
  const rx = q ? new RegExp("^" + esc(q), "i") : null;
  if (scope === "user")  return users(rx, limit);
  if (scope === "group") return groups(rx, limit);
  if (scope === "post")  return posts(rx, limit);
  return [];
}

async function users(rx, limit) {
  const docs = await User.find(rx ? { username: rx } : {}, "username -_id")
    .sort({ username: 1 }).limit(limit).lean();
  return docs.map(u => ({
    label: u.username,
    value: u.username,
    path: `/user/profile/${encodeURIComponent(u.username)}`
  }));
}



// not working for groups
async function groups(rx, limit) {
  const filter = rx ? { $or: [{ groupName: rx }, { displayName: rx }] } : {};

  const docs = await Group.find(filter, "groupName displayName -_id")
    .collation({ locale: "en", strength: 2 }) // case-insensitive
    .sort({ groupName: 1 })
    .limit(limit)
    .lean();

  return docs.map(g => ({
    label: g.displayName || g.groupName,            
    value: g.groupName,                           
    path: `/groups/${encodeURIComponent(g.groupName)}` 
  }));
}



async function posts(rx, limit) {
  const docs = await Post.find(rx ? { title: rx } : {}, "_id title")
    .sort({ createdAt: -1 }).limit(limit).lean();
  return docs.map(p => ({
    label: p.title || String(p._id),
    value: String(p._id),
    path: `/posts/${p._id}`
  }));
}

module.exports = { suggest };
