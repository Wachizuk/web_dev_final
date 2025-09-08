const Post = require("../models/post");
const { Types } = require("mongoose");

async function postsPerDayByUser(userId, days = 30) {
  const since = new Date(Date.now() - days * 864e5); // go back X days
  const data = await Post.aggregate([
    { $match: { author: new Types.ObjectId(userId), createdAt: { $gte: since } } }, // filter posts by user + date
    { $group: { _id: { $dateToString: { date: "$createdAt", format: "%Y-%m-%d" } }, count: { $sum: 1 } } }, // group by day
    { $sort: { _id: 1 } } // sort days ascending
  ]);
  return data.map(d => ({ date: d._id, count: d.count })); // clean format
}

async function postsByGroupForUser(userId, { limit = 8 } = {}) {
  const data = await Post.aggregate([
    { $match: { author: new Types.ObjectId(userId), group: { $type: "objectId" } } }, // only posts with group
    { $group: { _id: "$group", count: { $sum: 1 } } }, // count posts per group
    { $sort: { count: -1 } }, // sort by count
    { $limit: limit }, // take top groups

    { $lookup: { from: "groups", localField: "_id", foreignField: "_id", as: "g" } }, // join with groups collection
    { $unwind: "$g" }, // flatten array

    { $project: {
        _id: 0, // drop internal id
        groupId: "$_id", // keep groupId
        label: { $ifNull: ["$g.displayName", "$g.groupName"] }, // prefer displayName
        count: 1 // keep count
      }
    }
  ]);

  return data; // [{ groupId, label, count }]
}

module.exports = { postsPerDayByUser, postsByGroupForUser };
