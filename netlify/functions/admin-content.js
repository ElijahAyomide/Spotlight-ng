/* Sends the dashboard the latest saved content (read straight from GitHub, so it is never out of date). Admin only. */
const { isAdmin, json } = require("../lib/session");
const { readFile } = require("../lib/github");

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") return json(405, { ok: false, error: "Method not allowed" });
  if (!isAdmin(event)) return json(401, { ok: false, error: "Please log in." });
  try {
    const out = { ok: true };
    for (const n of ["site", "blog", "gallery"]) out[n] = JSON.parse(await readFile(`content/${n}.json`));
    const optional = { pages: { text: {}, images: {} }, faqs: { home: [], products: [], partner: [], contact: [] } };
    for (const n of Object.keys(optional)) {
      try { out[n] = JSON.parse(await readFile(`content/${n}.json`)); } catch (e) { if (e.status !== 404) throw e; out[n] = optional[n]; }
    }
    return json(200, out);
  } catch (e) {
    console.error("admin-content", e.status || "", e.detail || e.message);
    if (e.config) return json(500, { ok: false, error: "GitHub is not set up yet. Add GITHUB_TOKEN and GITHUB_REPO in Netlify (see ADMIN-SETUP.md)." });
    if (e.status === 401 || e.status === 403) return json(502, { ok: false, error: "GitHub refused the token. Check that GITHUB_TOKEN is correct and has not expired." });
    if (e.status === 404) return json(502, { ok: false, error: "GitHub could not find the content files. Check GITHUB_REPO and GITHUB_BRANCH." });
    return json(502, { ok: false, error: "Could not load the content from GitHub right now." });
  }
};
