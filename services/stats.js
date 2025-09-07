const Post = require("../models/post");
const { Types } = require("mongoose");

async function postsPerDayByUser(userId, days = 30) {
  const since = new Date(Date.now() - days * 864e5);
  const data = await Post.aggregate([
    { $match: { author: new Types.ObjectId(userId), createdAt: { $gte: since } } },
    { $group: { _id: { $dateToString: { date: "$createdAt", format: "%Y-%m-%d" } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
  return data.map(d => ({ date: d._id, count: d.count }));
}

async function postsByGroupForUser(userId, { limit = 8 } = {}) {
  const data = await Post.aggregate([
    { $match: { author: new Types.ObjectId(userId), group: { $ne: null } } }, // exclude null
    { $group: { _id: "$group", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
    { $project: { group: "$_id", count: 1, _id: 0 } }
  ]);
  return data;
}

module.exports = { postsPerDayByUser, postsByGroupForUser };
