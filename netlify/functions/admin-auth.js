/* Admin login. GET = am I logged in?   POST {password} = log in.   DELETE = log out.
   Needs these Netlify environment variables: ADMIN_PASSWORD, SESSION_SECRET (40+ random characters). */
const crypto = require("crypto");
const { sign, isAdmin, cookie, csrfOk, json } = require("../lib/session");
const attempts = new Map();
const sha = (s) => crypto.createHash("sha256").update(String(s)).digest();

exports.handler = async (event) => {
  const m = event.httpMethod;
  if (m === "GET") return json(200, { ok: isAdmin(event) });
  if (m !== "POST" && m !== "DELETE") return json(405, { ok: false, error: "Method not allowed" });
  if (!csrfOk(event)) return json(403, { ok: false, error: "Bad request" });
  if (m === "DELETE") return json(200, { ok: true }, { "Set-Cookie": cookie("", 0) });

  const pw = process.env.ADMIN_PASSWORD, secret = process.env.SESSION_SECRET;
  if (!pw || !secret || secret.length < 32) return json(500, { ok: false, error: "Admin is not set up yet. Add ADMIN_PASSWORD and SESSION_SECRET in Netlify (see ADMIN-SETUP.md)." });

  const ip = String((event.headers || {})["x-nf-client-connection-ip"] || (event.headers || {})["x-forwarded-for"] || "?").split(",")[0].trim();
  const now = Date.now();
  const a = attempts.get(ip) || { n: 0, t: now };
  if (now - a.t > 15 * 60 * 1000) { a.n = 0; a.t = now; }
  if (a.n >= 8) return json(429, { ok: false, error: "Too many attempts. Please wait 15 minutes and try again." });

  let b = {}; try { b = JSON.parse(event.body || "{}") || {}; } catch (e) { b = {}; }
  if (!crypto.timingSafeEqual(sha(b.password || ""), sha(pw))) {
    a.n++; attempts.set(ip, a);
    if (process.env.ADMIN_FAST !== "1") await new Promise((r) => setTimeout(r, 800)); // slows down password guessing
    return json(401, { ok: false, error: "Wrong password." });
  }
  attempts.delete(ip);
  return json(200, { ok: true }, { "Set-Cookie": cookie(sign({ exp: Math.floor(now / 1000) + 8 * 3600 }, secret), 8 * 3600) });
};
