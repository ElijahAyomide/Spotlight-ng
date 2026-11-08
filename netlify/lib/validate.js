/* Checks and cleans everything the admin dashboard saves, so a mistake or a stolen session can never break the site or inject code. */
const CAT = ["ds", "sp", "sa", "ai"], GCAT = ["class", "proj", "tools"];
const IMG = /^assets\/(images|uploads|gallery)\/[A-Za-z0-9._-]{1,100}\.(jpg|jpeg|png|webp|svg)$/;
const clean = (v, max, multi) => {
  let s = String(v == null ? "" : v).replace(/\r/g, "");
  s = multi ? s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "") : s.replace(/[\u0000-\u001F\u007F]/g, " ");
  return s.trim().slice(0, max);
};
const bad = (error) => ({ ok: false, error });

function validateBlog(a) {
  if (!Array.isArray(a) || a.length > 300) return bad("Blog data is not valid.");
  const slugs = new Set(); let featured = 0; const out = [];
  for (const p of a) {
    if (!p || typeof p !== "object") return bad("Blog data is not valid.");
    const o = { slug: clean(p.slug, 80), title: clean(p.title, 150), cat: clean(p.cat, 10), tag: clean(p.tag, 40), meta: clean(p.meta, 60),
      min: Math.round(Number(p.min)), img: clean(p.img, 160), desc: clean(p.desc, 400), featured: p.featured === true, body: clean(p.body, 30000, true) };
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(o.slug)) return bad(`A post has an invalid web address ("${o.slug}"). Use lowercase letters, numbers and hyphens.`);
    if (slugs.has(o.slug)) return bad(`Two posts share the web address "${o.slug}".`);
    slugs.add(o.slug);
    if (!o.title) return bad("Every post needs a title.");
    if (!CAT.includes(o.cat)) return bad(`"${o.title}" needs a valid category.`);
    if (!(o.min >= 1 && o.min <= 120)) o.min = 3;
    if (!IMG.test(o.img)) return bad(`"${o.title}" needs a cover image.`);
    if (!o.desc) return bad(`"${o.title}" needs a short summary.`);
    if (!o.body) return bad(`"${o.title}" needs some article text.`);
    if (o.featured) featured++;
    out.push(o);
  }
  if (featured > 1) return bad("Only one post can be featured.");
  return { ok: true, value: out };
}
function validateGallery(a) {
  if (!Array.isArray(a) || a.length > 300) return bad("Gallery data is not valid.");
  const out = [];
  for (const g of a) {
    if (!g || typeof g !== "object") return bad("Gallery data is not valid.");
    const o = { img: clean(g.img, 160), title: clean(g.title, 100), cat: clean(g.cat, 10), cap: clean(g.cap, 300) };
    if (!IMG.test(o.img)) return bad("Every gallery item needs a photo.");
    if (!o.title) return bad("Every gallery item needs a title.");
    if (!GCAT.includes(o.cat)) return bad(`"${o.title}" needs a valid category.`);
    out.push(o);
  }
  return { ok: true, value: out };
}
function validateSite(s) {
  if (!s || typeof s !== "object" || Array.isArray(s)) return bad("Site details are not valid.");
  const o = { heroTitle: clean(s.heroTitle, 120), heroText: clean(s.heroText, 600), footerText: clean(s.footerText, 250), email: clean(s.email, 150),
    phone: clean(s.phone, 30), phoneTel: clean(s.phoneTel, 20), whatsapp: clean(s.whatsapp, 120), assessly: clean(s.assessly, 200) };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(o.email)) return bad("Please enter a valid email address.");
  if (!o.phone) return bad("Please enter a phone number.");
  if (!/^\+?\d{7,15}$/.test(o.phoneTel)) return bad("The calling number must be digits only, like +2348012345678.");
  if (!/^https:\/\/wa\.me\/\d{7,15}(\?[^\s]*)?$/.test(o.whatsapp)) return bad("The WhatsApp link must look like https://wa.me/2348012345678.");
  if (!/^https:\/\/[^\s<>"']+$/.test(o.assessly)) return bad("The Assessly link must start with https://");
  if (!Array.isArray(s.partners) || s.partners.length > 30) return bad("Partner school list is not valid.");
  o.partners = [];
  for (const x of s.partners) {
    const name = clean(typeof x === "string" ? x : x && x.name, 80);
    const logo = x && typeof x === "object" ? clean(x.logo, 160) : "";
    if (!name) continue;
    if (logo && !IMG.test(logo)) return bad(`The logo for "${name}" is not valid.`);
    o.partners.push({ name, logo });
  }
  return { ok: true, value: o };
}
/* Wording and pictures on the Products and Partner pages: { text: {key: "..."}, images: {key: {img, alt}} } */
function validatePages(p) {
  if (!p || typeof p !== "object" || Array.isArray(p)) return bad("Page content is not valid.");
  const text = {}, images = {}, T = /^(products|partner)\.t\d{2}$/, I = /^(products|partner)\.i\d{2}$/;
  const tk = Object.entries(p.text || {}), ik = Object.entries(p.images || {});
  if (tk.length > 400 || ik.length > 100) return bad("Page content is not valid.");
  for (const [k, val] of tk) { if (!T.test(k)) return bad("Page content contains an unknown item."); const s = clean(val, 1500, true); if (s) text[k] = s; }
  for (const [k, val] of ik) {
    if (!I.test(k) || !val || typeof val !== "object") return bad("Page content contains an unknown picture.");
    const img = clean(val.img, 160); if (!IMG.test(img)) return bad("A page picture is not valid.");
    images[k] = { img, alt: clean(val.alt, 200) };
  }
  return { ok: true, value: { text, images } };
}
/* FAQs for each page: { home: [{q, a}], products: [...], partner: [...], contact: [...] } */
function validateFaqs(f) {
  if (!f || typeof f !== "object" || Array.isArray(f)) return bad("FAQ data is not valid.");
  const out = {};
  for (const k of ["home", "products", "partner", "contact"]) {
    const arr = f[k] == null ? [] : f[k];
    if (!Array.isArray(arr) || arr.length > 40) return bad("FAQ data is not valid.");
    out[k] = [];
    for (const x of arr) {
      const q = clean(x && x.q, 200), a = clean(x && x.a, 1500, true);
      if (!q || !a) return bad("Every FAQ needs both a question and an answer.");
      out[k].push({ q, a });
    }
  }
  return { ok: true, value: out };
}
const isJpeg = (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
const isPng = (b) => b.length > 8 && b.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
const isWebp = (b) => b.length > 12 && b.slice(0, 4).toString() === "RIFF" && b.slice(8, 12).toString() === "WEBP";
const isImage = (b) => isJpeg(b) || isPng(b) || isWebp(b);

module.exports = { validateBlog, validateGallery, validateSite, validatePages, validateFaqs, isImage };
