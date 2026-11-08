/* Publishes the dashboard's changes: checks everything, then saves all files to GitHub in ONE commit
   (Netlify then rebuilds the live site once). Admin only. */
const { isAdmin, csrfOk, json } = require("../lib/session");
const { commitFiles } = require("../lib/github");
const V = require("../lib/validate");

const CONTENT = { "content/site.json": V.validateSite, "content/blog.json": V.validateBlog, "content/gallery.json": V.validateGallery, "content/pages.json": V.validatePages, "content/faqs.json": V.validateFaqs };
const UPLOAD = /^assets\/uploads\/[a-z0-9][a-z0-9._-]{0,80}\.(jpg|jpeg|png|webp)$/;
const MAX_BODY = 5.5 * 1024 * 1024, MAX_IMAGE = 1.5 * 1024 * 1024;

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { ok: false, error: "Method not allowed" });
  if (!isAdmin(event)) return json(401, { ok: false, error: "Your session has ended. Please log in again." });
  if (!csrfOk(event)) return json(403, { ok: false, error: "Bad request" });
  if ((event.body || "").length > MAX_BODY) return json(413, { ok: false, error: "Too many or too large photos in one publish. Publish what you have, then add the rest." });

  let b; try { b = JSON.parse(event.body || "{}"); } catch (e) { return json(400, { ok: false, error: "Bad request" }); }
  const list = b && b.files;
  if (!Array.isArray(list) || !list.length || list.length > 40) return json(400, { ok: false, error: "Nothing to publish." });

  const files = [], seen = new Set(); let images = 0;
  for (const f of list) {
    const path = f && typeof f.path === "string" ? f.path : "";
    if (seen.has(path)) return json(400, { ok: false, error: "Duplicate file in request." });
    seen.add(path);
    if (CONTENT[path]) {
      let data; try { data = JSON.parse(f.content); } catch (e) { return json(400, { ok: false, error: "Content is not valid." }); }
      const r = CONTENT[path](data);
      if (!r.ok) return json(400, { ok: false, error: r.error });
      files.push({ path, content: Buffer.from(JSON.stringify(r.value, null, 2) + "\n") });
    } else if (UPLOAD.test(path)) {
      const raw = String(f.base64 || "").replace(/^data:[^,]*,/, "");
      if (!/^[A-Za-z0-9+/=\s]+$/.test(raw)) return json(400, { ok: false, error: "A photo could not be read." });
      const buf = Buffer.from(raw, "base64");
      if (buf.length > MAX_IMAGE) return json(400, { ok: false, error: "A photo is too large (limit 1.5 MB). Try a smaller one." });
      if (!V.isImage(buf)) return json(400, { ok: false, error: "Only JPG, PNG or WebP photos can be uploaded." });
      files.push({ path, content: buf }); images++;
    } else return json(400, { ok: false, error: "That file cannot be changed from the dashboard." });
  }
  try {
    const parts = files.filter((f) => CONTENT[f.path]).map((f) => f.path.replace("content/", "").replace(".json", ""));
    const sha = await commitFiles(files, `Admin dashboard: update ${parts.join(", ") || "photos"}${images ? ` (+${images} photo${images > 1 ? "s" : ""})` : ""}`);
    return json(200, { ok: true, commit: sha });
  } catch (e) {
    console.error("admin-publish", e.status || "", e.detail || e.message);
    if (e.config) return json(500, { ok: false, error: "GitHub is not set up yet. Add GITHUB_TOKEN and GITHUB_REPO in Netlify (see ADMIN-SETUP.md)." });
    if (e.status === 401 || e.status === 403 || e.status === 404) return json(502, { ok: false, error: "GitHub refused the save. Check the token is correct, not expired, and allowed to write to this repository (Contents: Read and write)." });
    if (e.status === 422 || e.status === 409) return json(409, { ok: false, error: "The site was changed somewhere else a moment ago. Click Publish again." });
    return json(502, { ok: false, error: "Could not save to GitHub right now. Your changes are still here: try again." });
  }
};
