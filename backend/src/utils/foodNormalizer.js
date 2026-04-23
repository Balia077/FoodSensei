const axios = require("axios");

async function normalizeFoodWikipedia(query) {
  try {
    if (!query) return query;

    const res = await axios.get(
      "https://en.wikipedia.org/w/api.php",
      {
        params: {
          action: "opensearch",
          search: query,
          limit: 3,
          namespace: 0,
          format: "json",
        },
        headers: {
          "User-Agent": "FoodSenseiApp/1.0 (contact: support@local.dev)",
          "Accept": "application/json",
        },
        timeout: 4000,
      }
    );

    const suggestions = res.data?.[1];

    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      return query; // 🔥 fallback safely
    }

    // pick best match (safe heuristic)
    const best =
      suggestions.find(s =>
        s?.toLowerCase().includes(query.toLowerCase())
      ) || suggestions[0];

    return best || query;

  } catch (err) {
    console.log("Wikipedia failed silently → using raw query");
    return query; // 🔥 NEVER BREAK PIPELINE
  }
}

module.exports = normalizeFoodWikipedia;