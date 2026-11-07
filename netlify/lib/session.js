/* Admin login sessions: a signed, expiring cookie. The signing secret (SESSION_SECRET) lives only in Netlify. */
const crypto = require("crypto");
const COOKIE = "sl_admin";
const b64u = (s) => Buffer.from(s).toString("base64url");

function sign(payload, secret) {
  const p = b64u(JSON.stringify(payload));
  return p + "." + crypto.createHmac("sha256", secret).update(p).digest("base64url");
}
function verify(token, secret) {
  if (!token || !secret) return null;
  const [p, s] = String(token).split(".");
  if (!p || !s) return null;
  const expect = crypto.createHmac("sha256", secret).update(p).digest();
  let got; try { got = Buffer.from(s, "base64url"); } catch (e) { return null; }
  if (got.length !== expect.length || !crypto.timingSafeEqual(got, expect)) return null;
  let o; try { o = JSON.parse(Buffer.from(p, "base64url").toString()); } catch (e) { return null; }
  return o && o.exp && o.exp > Date.now() / 1000 ? o : null;
}
function readCookie(event) {
  const h = event.headers || {};
  const raw = h.cookie || h.Cookie || "";
  const m = raw.split(/;\s*/).find((c) => c.startsWith(COOKIE + "="));
  return m ? m.slice(COOKIE.length + 1) : "";
}
const isAdmin = (event) => !!verify(readCookie(event), process.env.SESSION_SECRET);
const cookie = (token, maxAge) => `${COOKIE}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`;
/* Browsers cannot add this header on a request from another website, which blocks cross-site attacks. */
const csrfOk = (event) => ((event.headers || {})["x-requested-with"] || "") === "sl-admin";
const json = (code, obj, extra) => ({ statusCode: code, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...(extra || {}) }, body: JSON.stringify(obj) });

module.exports = { sign, verify, isAdmin, cookie, csrfOk, json };
