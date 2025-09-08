const suggestService = require("../services/suggest");

async function suggest(req, res) {
  try {
    const scope = String(req.query.scope || "user").toLowerCase();
    const q = String(req.query.q || "").trim();
    const limit = Math.min(parseInt(req.query.limit || "8", 10), 20);
    const items = await suggestService.suggest({ scope, q, limit });
    return res.json(items);
  } catch (err) {
    console.error("suggest controller error:", err);
    return res.status(500).json([]);
  }
}

module.exports = { suggest };
