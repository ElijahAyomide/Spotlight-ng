/* SpotLight enquiry handler (Vercel serverless function).
   Receives the "Become a Partner" and "Contact us" forms and emails them to SpotLight via Resend.
   Settings come from Environment Variables in Vercel (never put keys in the website files):
     RESEND_API_KEY  (required)  your Resend API key
     TO_EMAIL        (optional)  where enquiries are delivered. Default: hellospotlite@gmail.com
     FROM_EMAIL      (optional)  sender. Default: SpotLight Website <onboarding@resend.dev>  */

const LIMITS = { name: 100, email: 150, school: 150, role: 80, stage: 40, pathway: 80, enquiry_type: 60, message: 3000 };
const REQUIRED = {
  partner: ["name", "email", "school", "role", "stage", "pathway", "message"],
  contact: ["name", "email", "school", "enquiry_type", "message"],
};
const LABELS = { name: "Name", email: "Email", school: "School / organization", role: "Role", stage: "School stage", pathway: "Pathway of interest", enquiry_type: "Enquiry type", message: "Message" };

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const oneLine = (s) => String(s).replace(/[\r\n]+/g, " ").trim();

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  body = body || {};

  // Spam trap: real visitors never see or fill this hidden field. Pretend success so bots move on.
  if (body.website) return res.status(200).json({ ok: true });

  const type = body.type === "partner" ? "partner" : "contact";
  const f = {};
  for (const k of Object.keys(LIMITS)) f[k] = String(body[k] == null ? "" : body[k]).trim().slice(0, LIMITS[k]);

  const missing = REQUIRED[type].filter((k) => !f[k]);
  if (missing.length) return res.status(400).json({ ok: false, error: "Please fill in all required fields." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email)) return res.status(400).json({ ok: false, error: "Please enter a valid email address." });
  if (body.consent !== true) return res.status(400).json({ ok: false, error: "Please tick the consent box." });

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("RESEND_API_KEY is not set");
    return res.status(500).json({ ok: false, error: "Email service is not configured." });
  }

  const fields = REQUIRED[type].filter((k) => k !== "message").concat("message");
  const subject = type === "partner"
    ? `New school partnership enquiry: ${oneLine(f.name)} (${oneLine(f.school)})`
    : `New website enquiry (${oneLine(f.enquiry_type)}): ${oneLine(f.name)}`;
  const when = new Date().toLocaleString("en-GB", { timeZone: "Africa/Lagos", dateStyle: "medium", timeStyle: "short" });
  const rows = fields.map((k) =>
    `<tr><td style="padding:8px 14px 8px 0;color:#5B6478;vertical-align:top;white-space:nowrap">${LABELS[k]}</td><td style="padding:8px 0;color:#0E1430;white-space:pre-wrap">${esc(f[k])}</td></tr>`).join("");
  const html = `<div style="font-family:Arial,sans-serif;max-width:620px">
<h2 style="color:#3A5CE8;margin:0 0 4px">${type === "partner" ? "New school partnership enquiry" : "New website enquiry"}</h2>
<p style="color:#5B6478;margin:0 0 16px">Received ${esc(when)} (Lagos time) from the SpotLight website. Reply to this email to answer ${esc(f.name)} directly.</p>
<table style="border-collapse:collapse;font-size:15px">${rows}</table></div>`;
  const text = `${subject}\nReceived ${when} (Lagos time)\n\n` + fields.map((k) => `${LABELS[k]}: ${f[k]}`).join("\n");

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.FROM_EMAIL || "SpotLight Website <onboarding@resend.dev>",
        to: [process.env.TO_EMAIL || "hellospotlite@gmail.com"],
        reply_to: f.email,
        subject, html, text,
      }),
    });
    if (!r.ok) {
      console.error("Resend error", r.status, await r.text());
      return res.status(502).json({ ok: false, error: "Could not send the email right now." });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("Send failed", e);
    return res.status(502).json({ ok: false, error: "Could not send the email right now." });
  }
};
