/* SpotLight admin dashboard. Everything you change stays here (a draft) until you press "Publish changes",
   which saves it all to GitHub in one go; Netlify then updates the live site about a minute later. */
(function () {
"use strict";
const $ = (s) => document.querySelector(s), FN = "/.netlify/functions/";
const dz = () => ({ blog: 0, gallery: 0, site: 0, pages: 0, faqs: 0 });
const S = { site: {}, blog: [], gallery: [], pages: { text: {}, images: {} }, faqs: { home: [], products: [], partner: [], contact: [] }, schema: null, pending: {}, shown: {}, dirty: dz(), tab: "blog", ptab: "products", ftab: "home" };
const FPAGES = { home: "Home page", products: "Products page", partner: "Partner page", contact: "Contact page" };
const LABEL = { blog: "Blog posts", gallery: "Gallery", site: "Home & contact details", pages: "Products & Partner pages", faqs: "FAQs" };

/* ---------- helpers ---------- */
async function api(name, method, body) {
  const r = await fetch(FN + name, { method: method || "GET", credentials: "same-origin", headers: { "Content-Type": "application/json", "X-Requested-With": "sl-admin" }, body: body ? JSON.stringify(body) : undefined });
  let j = {}; try { j = await r.json(); } catch (e) {}
  if (r.status === 401 && name !== "admin-auth") { showLogin(); throw new Error("Your session ended. Please log in again."); }
  if (!r.ok || j.ok === false) throw new Error(j.error || "Something went wrong (" + r.status + ").");
  return j;
}
let tt;
function toast(msg, type) { const t = $("#toast"); t.textContent = msg; t.className = "toast on " + (type || ""); clearTimeout(tt); tt = setTimeout(() => (t.className = "toast"), type === "err" ? 9000 : 5000); }
const slugify = (s, n) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, n || 60);
const imgSrc = (p) => S.shown[p] || "../" + p;
const total = () => Object.values(S.dirty).reduce((a, b) => a + b, 0);
const move = (arr, i, d, key) => { const j = i + d; if (j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; S.dirty[key]++; render(); };

function shrink(file, opt) {
  opt = opt || {};
  return new Promise((res, rej) => {
    if (!/^image\//.test(file.type)) return rej(new Error("Please choose a picture (JPG, PNG or WebP)."));
    if (file.size > 25 * 1024 * 1024) return rej(new Error("That picture is very large (over 25 MB). Try a smaller one."));
    const im = new Image(), u = URL.createObjectURL(file);
    im.onload = () => {
      URL.revokeObjectURL(u);
      const draw = (max) => { const r = Math.min(1, max / im.width), c = document.createElement("canvas"); c.width = Math.max(1, Math.round(im.width * r)); c.height = Math.max(1, Math.round(im.height * r));
        const x = c.getContext("2d"); if (!opt.png) { x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); } x.drawImage(im, 0, 0, c.width, c.height); return c; };
      if (opt.png) { let max = opt.max || 400, d; do { d = draw(max).toDataURL("image/png"); max = Math.round(max * 0.75); } while (d.length > 650000 && max > 80); return res(d); }
      const c = draw(opt.max || 1400); let q = 0.84, d = c.toDataURL("image/jpeg", q);
      while (d.length > 900000 && q > 0.4) { q -= 0.1; d = c.toDataURL("image/jpeg", q); }
      res(d);
    };
    im.onerror = () => rej(new Error("Could not read that picture. Try a JPG or PNG."));
    im.src = u;
  });
}
const schemaImgs = () => (S.schema ? S.schema.pages.flatMap((p) => p.groups.flatMap((g) => g.fields.filter((f) => f.type === "image").map((f) => f.def))) : []);
const allImages = () => [...new Set([...S.blog.map((p) => p.img), ...S.gallery.map((g) => g.img), ...Object.values(S.pages.images).map((o) => o.img), ...schemaImgs(), ...Object.keys(S.pending)])].filter((p) => p && !/\/logo-[^/]*$/.test(p));

/* ---------- login / load ---------- */
function showLogin() { $("#app").hidden = true; closeModal(); $("#login").hidden = false; $("#pw").value = ""; $("#pw").focus(); }
async function load() {
  const j = await api("admin-content");
  S.site = j.site; S.blog = j.blog; S.gallery = j.gallery; S.pending = {}; S.dirty = dz();
  S.pages = j.pages || {}; S.pages.text = S.pages.text || {}; S.pages.images = S.pages.images || {};
  S.faqs = Object.assign({ home: [], products: [], partner: [], contact: [] }, j.faqs || {});
  S.site.partners = (S.site.partners || []).map((p) => (typeof p === "string" ? { name: p, logo: "" } : p));
  if (!S.schema) { try { S.schema = await (await fetch("../content/pages-schema.json")).json(); } catch (e) { S.schema = { pages: [] }; } }
  $("#login").hidden = true; $("#app").hidden = false; render();
}
$("#lf").onsubmit = async (e) => {
  e.preventDefault(); const b = $("#lb"); b.disabled = true; $("#le").textContent = "";
  try { await api("admin-auth", "POST", { password: $("#pw").value }); await load(); } catch (err) { $("#le").textContent = err.message; }
  b.disabled = false;
};
$("#lo").onclick = async () => { if (total() && !confirm("You have unpublished changes. Log out and lose them?")) return; try { await api("admin-auth", "DELETE"); } catch (e) {} S.dirty = dz(); showLogin(); };
window.addEventListener("beforeunload", (e) => { if (total()) { e.preventDefault(); e.returnValue = ""; } });

/* ---------- rendering ---------- */
function updatePub() {
  const n = Object.keys(S.dirty).filter((k) => S.dirty[k]);
  $("#pub").hidden = !n.length; $("#pubtxt").textContent = "Unpublished changes: " + n.map((k) => LABEL[k]).join(", ");
}
function render() {
  document.querySelectorAll("#tabs button").forEach((b) => b.classList.toggle("on", b.dataset.t === S.tab));
  $("#panel").innerHTML = { blog: rBlog, gallery: rGallery, pages: rPages, faqs: rFaqs, site: rSite }[S.tab]();
  updatePub();
  if (S.tab === "site") wireSite();
}
$("#tabs").onclick = (e) => { const b = e.target.closest("button"); if (b) { S.tab = b.dataset.t; render(); } };

function rBlog() {
  const rows = S.blog.map((p, i) => `<div class="row"><img class="th" src="${esc(imgSrc(p.img))}" alt=""><div class="rt"><b>${esc(p.title)}${p.featured ? '<span class="badge">Featured</span>' : ""}</b><small>${esc(CATS[p.cat] || "")} · ${esc(p.meta)} · ${p.min} min read</small></div>
  <div class="ra"><button class="ghost sm" data-a="edit-post" data-i="${i}">Edit</button><button class="ghost sm" data-a="up-post" data-i="${i}" aria-label="Move up">↑</button><button class="ghost sm" data-a="down-post" data-i="${i}" aria-label="Move down">↓</button><button class="ghost sm dng" data-a="del-post" data-i="${i}">Delete</button></div></div>`).join("");
  return `<div class="bar"><div><h2>Blog posts</h2><p class="mut">${S.blog.length} post${S.blog.length === 1 ? "" : "s"}. The order here is the order on the Blog page.</p></div><button class="btn" data-a="new-post">+ New post</button></div>${rows || '<div class="empty">No posts yet. Click “New post” to write your first one.</div>'}`;
}
function rGallery() {
  const cards = S.gallery.map((g, i) => `<div class="gcard"><img src="${esc(imgSrc(g.img))}" alt=""><b>${esc(g.title)}</b><small>${esc(GTAG[g.cat] || "")}${i < 6 ? " · on home slider" : ""}</small>
  <div class="ra"><button class="ghost sm" data-a="edit-photo" data-i="${i}">Edit</button><button class="ghost sm" data-a="up-photo" data-i="${i}" aria-label="Move earlier">←</button><button class="ghost sm" data-a="down-photo" data-i="${i}" aria-label="Move later">→</button><button class="ghost sm dng" data-a="del-photo" data-i="${i}">Delete</button></div></div>`).join("");
  return `<div class="bar"><div><h2>Gallery</h2><p class="mut">${S.gallery.length} photo${S.gallery.length === 1 ? "" : "s"}. The first 6 appear in the slider on the home page; all appear on the Gallery page.</p></div><button class="btn" data-a="new-photo">+ Add photo</button></div>${cards ? `<div class="ggrid">${cards}</div>` : '<div class="empty">No photos yet. Click “Add photo”.</div>'}`;
}
function rSite() {
  const s = S.site, f = (id, l, v, extra) => `<label>${l}<input id="s-${id}" value="${esc(v)}" ${extra || ""}></label>`;
  return `<div class="bar"><div><h2>Home &amp; contact details</h2><p class="mut">Text and links used across the website.</p></div></div>
  <form id="sf"><div class="panelbox"><h3>Home page</h3>${f("heroTitle", "Main headline", s.heroTitle, 'maxlength="120"')}<label>Intro text under the headline<textarea id="s-heroText" rows="3" maxlength="600">${esc(s.heroText)}</textarea></label>${f("footerText", "Short description in the footer", s.footerText, 'maxlength="250"')}</div>
  <div class="panelbox"><h3>Contact details</h3><div class="two">${f("email", "Email address", s.email, 'type="email" required')}${f("phone", "Phone number (as people read it)", s.phone, "required")}</div>
  <div class="two">${f("phoneTel", "Phone number for calling <small>(digits only, like +2348012345678)</small>", s.phoneTel, "required")}${f("whatsapp", "WhatsApp link <small>(https://wa.me/2348012345678)</small>", s.whatsapp, "required")}</div></div>
  <div class="panelbox"><h3>Links</h3>${f("assessly", "Assessly web app link", s.assessly, 'type="url" required')}</div>
  <div class="panelbox"><h3>Partner schools <small class="mut">(names and logos in the scrolling strip on the home page)</small></h3><div id="plist"></div><button type="button" class="ghost sm" id="addp" style="margin-top:12px">+ Add a school</button></div>
  <p class="err" id="se"></p><button class="btn">Save these details</button> <span class="mut" style="font-size:.8rem">Saves to your draft. Press “Publish changes” to put it on the live site.</span></form>`;
}
function wireSite() {
  const pl = $("#plist"); let ps = (S.site.partners || []).map((p) => ({ name: p.name, logo: p.logo || "" }));
  const sync = () => pl.querySelectorAll(".prow2").forEach((r, i) => { if (ps[i]) ps[i].name = r.querySelector("input[type=text]").value; });
  const draw = () => {
    pl.innerHTML = ps.map((p, i) => `<div class="prow2"><div class="plg">${p.logo ? `<img src="${esc(imgSrc(p.logo))}" alt="">` : "<span>No logo</span>"}</div><input type="text" value="${esc(p.name)}" maxlength="80" aria-label="School name" placeholder="School name">
      <div class="ra"><input type="file" accept="image/*" hidden data-lf="${i}"><button type="button" class="ghost sm" data-pa="logo" data-i="${i}">${p.logo ? "Change logo" : "Upload logo"}</button>${p.logo ? `<button type="button" class="ghost sm" data-pa="nologo" data-i="${i}">Remove logo</button>` : ""}<button type="button" class="ghost sm" data-pa="up" data-i="${i}" aria-label="Move up">↑</button><button type="button" class="ghost sm" data-pa="down" data-i="${i}" aria-label="Move down">↓</button><button type="button" class="ghost sm dng" data-pa="del" data-i="${i}">Remove school</button></div></div>`).join("") || '<p class="mut">No schools yet. The scrolling strip is hidden on the home page until you add one.</p>';
  };
  draw();
  pl.onclick = (e) => {
    const b = e.target.closest("[data-pa]"); if (!b) return; sync(); const i = +b.dataset.i, k = b.dataset.pa;
    if (k === "logo") return pl.querySelector(`[data-lf="${i}"]`).click();
    if (k === "nologo") ps[i].logo = ""; if (k === "del") ps.splice(i, 1);
    if (k === "up" && i > 0) [ps[i - 1], ps[i]] = [ps[i], ps[i - 1]]; if (k === "down" && i < ps.length - 1) [ps[i + 1], ps[i]] = [ps[i], ps[i + 1]];
    draw();
  };
  pl.onchange = async (e) => {
    const f = e.target.files && e.target.files[0]; if (!f || e.target.dataset.lf == null) return; sync(); const i = +e.target.dataset.lf;
    try { const d = await shrink(f, { max: 400, png: true }), p = "assets/uploads/logo-" + (slugify(ps[i].name, 30) || "school") + "-" + Date.now().toString(36) + ".png"; S.pending[p] = d; S.shown[p] = d; ps[i].logo = p; draw(); }
    catch (err) { toast(err.message, "err"); }
  };
  $("#addp").onclick = () => { sync(); ps.push({ name: "", logo: "" }); draw(); const all = pl.querySelectorAll("input[type=text]"); all[all.length - 1].focus(); };
  $("#sf").onsubmit = (e) => {
    e.preventDefault(); sync(); const v = (id) => $("#s-" + id).value.trim();
    if (!/^https:\/\/wa\.me\/\d{7,15}/.test(v("whatsapp"))) return ($("#se").textContent = "The WhatsApp link must look like https://wa.me/2348012345678");
    if (!/^\+?\d{7,15}$/.test(v("phoneTel"))) return ($("#se").textContent = "The calling number must be digits only, like +2348012345678");
    if (!/^https:\/\//.test(v("assessly"))) return ($("#se").textContent = "The Assessly link must start with https://");
    S.site = { heroTitle: v("heroTitle"), heroText: v("heroText"), footerText: v("footerText"), email: v("email"), phone: v("phone"), phoneTel: v("phoneTel"), whatsapp: v("whatsapp"), assessly: v("assessly"),
      partners: ps.map((p) => ({ name: p.name.trim(), logo: p.logo })).filter((p) => p.name) };
    S.dirty.site++; render(); toast("Saved to your draft. Press “Publish changes” when you are ready.", "ok");
  };
}

/* ---------- Products & Partner pages: wording and pictures ---------- */
const fdef = (key) => { for (const p of S.schema.pages) for (const g of p.groups) for (const f of g.fields) if (f.key === key) return f; };
const curText = (f) => (S.pages.text[f.key] !== undefined ? S.pages.text[f.key] : f.def);
const curImg = (f) => S.pages.images[f.key] || { img: f.def, alt: f.alt };
const imgDefault = (f, c) => c.img === f.def && c.alt === f.alt;
function fieldHtml(f) {
  if (f.type === "image") {
    const c = curImg(f);
    return `<div class="fld"><label>${esc(f.label)} <button type="button" class="lnk" data-reset="${f.key}" ${imgDefault(f, c) ? "hidden" : ""}>Reset to original</button></label><div class="pk"><img class="ipv" data-pv="${f.key}" src="${esc(imgSrc(c.img))}" alt=""><div>
      <input type="file" accept="image/*" hidden data-fi="${f.key}"><button type="button" class="ghost sm" data-upimg="${f.key}">Upload a new picture</button> <button type="button" class="ghost sm" data-libimg="${f.key}">Choose one already on the site</button>
      <label class="altl">Picture description <small>(for visitors who cannot see it)</small><input type="text" data-alt="${f.key}" value="${esc(c.alt)}" maxlength="200"></label></div></div><div class="lib" data-lib="${f.key}" hidden></div></div>`;
  }
  const v = curText(f), attr = `data-key="${f.key}" maxlength="1500"`;
  return `<div class="fld"><label>${esc(f.label)} <button type="button" class="lnk" data-reset="${f.key}" ${v === f.def ? "hidden" : ""}>Reset to original</button></label>${f.type === "area" ? `<textarea ${attr} rows="3">${esc(v)}</textarea>` : `<input type="text" ${attr} value="${esc(v)}">`}</div>`;
}
function rPages() {
  const pg = S.schema.pages.find((p) => p.id === S.ptab) || S.schema.pages[0];
  return `<div class="bar"><div><h2>Products &amp; Partner pages</h2><p class="mut">Change the wording and pictures on these two pages. The layout stays the same. Anything you do not change keeps its original wording; clear a box and it goes back to the original.</p></div></div>
  <div class="seg">${S.schema.pages.map((p) => `<button data-pt="${p.id}" class="${p.id === pg.id ? "on" : ""}">${esc(p.title)}</button>`).join("")}</div>` +
    pg.groups.map((g, i) => `<details class="grp" ${i === 0 ? "open" : ""}><summary>${esc(g.title)} <small class="mut">(${g.fields.length} items)</small></summary>${g.fields.map(fieldHtml).join("")}</details>`).join("");
}
function setImage(key, path, alt) {
  const f = fdef(key), c = { img: path || curImg(f).img, alt: alt != null ? alt : curImg(f).alt };
  if (imgDefault(f, c)) delete S.pages.images[key]; else S.pages.images[key] = c;
  S.dirty.pages = 1; updatePub();
  const box = $(`[data-pv="${key}"]`).closest(".fld"); $(`[data-pv="${key}"]`).src = imgSrc(c.img); box.querySelector("[data-alt]").value = c.alt; box.querySelector("[data-reset]").hidden = imgDefault(f, c);
}
function resetField(key) {
  const f = fdef(key); if (!f) return;
  if (f.type === "image") { delete S.pages.images[key]; setImage(key, f.def, f.alt); delete S.pages.images[key]; }
  else { delete S.pages.text[key]; const el = $(`[data-key="${key}"]`); el.value = f.def; el.closest(".fld").querySelector("[data-reset]").hidden = true; }
  S.dirty.pages = 1; updatePub();
}
$("#panel").addEventListener("input", (e) => {
  const t = e.target;
  if (t.dataset.key) {
    const f = fdef(t.dataset.key), val = t.value;
    if (!val.trim() || val === f.def) delete S.pages.text[f.key]; else S.pages.text[f.key] = val;
    t.closest(".fld").querySelector("[data-reset]").hidden = !S.pages.text[f.key]; S.dirty.pages = 1; updatePub();
  } else if (t.dataset.alt) setImage(t.dataset.alt, null, t.value);
});
$("#panel").addEventListener("change", async (e) => {
  const t = e.target; if (!t.dataset.fi || !t.files[0]) return;
  try { const d = await shrink(t.files[0]), p = "assets/uploads/" + slugify(t.dataset.fi.replace(".", "-"), 30) + "-" + Date.now().toString(36) + ".jpg"; S.pending[p] = d; S.shown[p] = d; setImage(t.dataset.fi, p); }
  catch (err) { toast(err.message, "err"); }
  t.value = "";
});

/* ---------- FAQs ---------- */
function rFaqs() {
  const l = S.faqs[S.ftab] || [];
  return `<div class="bar"><div><h2>FAQs</h2><p class="mut">The questions and answers shown on each page. Choose a page, then add, edit, reorder or delete questions.</p></div><button class="btn" data-a="new-faq">+ New question</button></div>
  <div class="seg">${Object.keys(FPAGES).map((k) => `<button data-ft="${k}" class="${k === S.ftab ? "on" : ""}">${FPAGES[k]}</button>`).join("")}</div>` +
    (l.map((f, i) => `<div class="row"><div class="rt"><b>${esc(f.q)}</b><small>${esc(f.a.length > 150 ? f.a.slice(0, 150) + "…" : f.a)}</small></div><div class="ra"><button class="ghost sm" data-a="edit-faq" data-i="${i}">Edit</button><button class="ghost sm" data-a="up-faq" data-i="${i}" aria-label="Move up">↑</button><button class="ghost sm" data-a="down-faq" data-i="${i}" aria-label="Move down">↓</button><button class="ghost sm dng" data-a="del-faq" data-i="${i}">Delete</button></div></div>`).join("") ||
      '<div class="empty">No questions on this page yet. The FAQ section is hidden on the website until you add one.</div>');
}
function editFaq(i) {
  const l = S.faqs[S.ftab], f = i >= 0 ? l[i] : { q: "", a: "" }, isNew = i < 0;
  modal(`<h3>${isNew ? "New question" : "Edit question"} <small class="mut">(${FPAGES[S.ftab]})</small></h3><form id="pform"><label>Question<input id="q-q" value="${esc(f.q)}" maxlength="200" required></label>
  <label>Answer<textarea id="q-a" rows="5" maxlength="1500" required>${esc(f.a)}</textarea></label><div class="acts"><button type="button" class="ghost" data-x="cancel">Cancel</button><button class="btn">${isNew ? "Add question" : "Save changes"}</button></div></form>`);
  $("#pform").onsubmit = (e) => { e.preventDefault(); const q = $("#q-q").value.trim(), an = $("#q-a").value.trim(); if (!q || !an) return;
    if (isNew) l.push({ q, a: an }); else l[i] = { q, a: an }; S.dirty.faqs++; closeModal(); render(); toast(isNew ? "Question added to your draft." : "Changes saved to your draft.", "ok"); };
}

/* ---------- panel buttons ---------- */
$("#panel").onclick = (e) => {
  const sg = e.target.closest("[data-pt],[data-ft]"); if (sg) { if (sg.dataset.pt) S.ptab = sg.dataset.pt; else S.ftab = sg.dataset.ft; return render(); }
  const rs = e.target.closest("[data-reset]"); if (rs) return resetField(rs.dataset.reset);
  const ui = e.target.closest("[data-upimg]"); if (ui) return $(`[data-fi="${ui.dataset.upimg}"]`).click();
  const lb = e.target.closest("[data-libimg]");
  if (lb) { const box = $(`[data-lib="${lb.dataset.libimg}"]`); box.hidden = !box.hidden; if (!box.hidden) box.innerHTML = allImages().map((p) => `<img src="${esc(imgSrc(p))}" data-p="${esc(p)}" data-k="${lb.dataset.libimg}" alt="">`).join(""); return; }
  const lt = e.target.closest("[data-lib] img"); if (lt) { lt.closest(".lib").hidden = true; return setImage(lt.dataset.k, lt.dataset.p); }
  const b = e.target.closest("[data-a]"); if (!b) return; const a = b.dataset.a, i = +b.dataset.i;
  if (a === "new-faq") return editFaq(-1); if (a === "edit-faq") return editFaq(i);
  if (a === "up-faq") return move(S.faqs[S.ftab], i, -1, "faqs"); if (a === "down-faq") return move(S.faqs[S.ftab], i, 1, "faqs");
  if (a === "del-faq") { if (confirm(`Delete this question?\n\n“${S.faqs[S.ftab][i].q}”`)) { S.faqs[S.ftab].splice(i, 1); S.dirty.faqs++; render(); } return; }
  if (a === "new-post") return editPost(-1); if (a === "edit-post") return editPost(i);
  if (a === "up-post") return move(S.blog, i, -1, "blog"); if (a === "down-post") return move(S.blog, i, 1, "blog");
  if (a === "del-post") { if (confirm(`Delete “${S.blog[i].title}”?\n\nIt is removed from the live site when you publish.`)) { S.blog.splice(i, 1); S.dirty.blog++; render(); } return; }
  if (a === "new-photo") return editPhoto(-1); if (a === "edit-photo") return editPhoto(i);
  if (a === "up-photo") return move(S.gallery, i, -1, "gallery"); if (a === "down-photo") return move(S.gallery, i, 1, "gallery");
  if (a === "del-photo") { if (confirm(`Delete “${S.gallery[i].title}” from the gallery?\n\nIt is removed from the live site when you publish.`)) { S.gallery.splice(i, 1); S.dirty.gallery++; render(); } }
};

/* ---------- modal + photo picker ---------- */
function modal(html) { $("#mbox").innerHTML = html; $("#modal").hidden = false; document.body.style.overflow = "hidden"; $("#mbox").querySelector("input,textarea,select")?.focus(); $("#mbox").querySelectorAll("[data-x=cancel]").forEach((b) => (b.onclick = closeModal)); }
function closeModal() { $("#modal").hidden = true; $("#mbox").innerHTML = ""; document.body.style.overflow = ""; }
$("#modal").onmousedown = (e) => { if (e.target.id === "modal" && !$("#mbox").querySelector("form")?.dataset.touched) closeModal(); };
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("#modal").hidden) closeModal(); });

const pickerHtml = (cur) => `<label>Photo <small>(JPG or PNG; it is shrunk automatically)</small></label><div class="pk"><img id="pv" src="${cur ? esc(imgSrc(cur)) : ""}" alt="" ${cur ? "" : "hidden"}><div><input type="file" id="pfile" accept="image/*" hidden>
  <button type="button" class="ghost sm" id="pup">Upload a photo</button> <button type="button" class="ghost sm" id="plib">Choose one already on the site</button><p class="mut" id="pname">${cur ? esc(cur) : "No photo chosen yet"}</p></div></div><div class="lib" id="lib" hidden></div>`;
function wirePicker(M, base) {
  const set = (p) => { M.img = p; $("#pv").src = imgSrc(p); $("#pv").hidden = false; $("#pname").textContent = p; };
  $("#pup").onclick = () => $("#pfile").click();
  $("#pfile").onchange = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    try { const d = await shrink(f), p = "assets/uploads/" + (slugify(base() || f.name.replace(/\.[^.]+$/, ""), 40) || "photo") + "-" + Date.now().toString(36) + ".jpg"; S.pending[p] = d; S.shown[p] = d; set(p); $("#lib").hidden = true; }
    catch (err) { toast(err.message, "err"); }
    e.target.value = "";
  };
  $("#plib").onclick = () => {
    const lib = $("#lib"); lib.hidden = !lib.hidden; if (lib.hidden) return;
    lib.innerHTML = allImages().map((p) => `<img src="${esc(imgSrc(p))}" data-p="${esc(p)}" alt="" class="${p === M.img ? "sel" : ""}">`).join("") || '<span class="mut">No photos yet.</span>';
    lib.onclick = (e) => { const i = e.target.closest("img"); if (i) { set(i.dataset.p); lib.hidden = true; } };
  };
}

/* ---------- blog post editor ---------- */
function editPost(i) {
  const p = i >= 0 ? S.blog[i] : { slug: "", title: "", cat: "ds", tag: "", meta: "", min: 3, img: "", desc: "", featured: false, body: "" }, M = { img: p.img }, isNew = i < 0;
  modal(`<h3>${isNew ? "New post" : "Edit post"}</h3><form id="pform">
  <label>Title<input id="f-title" value="${esc(p.title)}" maxlength="150" required></label>
  <div class="two"><label>Category<select id="f-cat">${Object.keys(CATS).map((k) => `<option value="${k}"${p.cat === k ? " selected" : ""}>${CATS[k]}</option>`).join("")}</select></label>
  <label>Label on the card <small>(optional, e.g. UI/UX design)</small><input id="f-tag" value="${esc(p.tag)}" maxlength="40"></label></div>
  <div class="two"><label>Type <small>(e.g. Classroom activity)</small><input id="f-meta" value="${esc(p.meta)}" maxlength="60"></label><label>Reading time (minutes)<input id="f-min" type="number" min="1" max="120" value="${p.min}"></label></div>
  <label>Short summary <small>(shown on the blog card)</small><textarea id="f-desc" rows="2" maxlength="400" required>${esc(p.desc)}</textarea></label>
  ${pickerHtml(p.img)}
  <label class="chk"><input type="checkbox" id="f-feat" ${p.featured ? "checked" : ""}> Make this the featured article (shown large at the top of the Blog page; any other featured post is un-featured)</label>
  ${isNew ? `<label>Web address <small>(made from the title; letters, numbers and hyphens)</small><input id="f-slug" maxlength="80"></label>` : ""}
  <label>Article text</label><div class="tb"><button type="button" class="ghost sm" data-ins="## ">Subheading</button><button type="button" class="ghost sm" data-ins="- ">Bullet point</button><button type="button" class="ghost sm" data-ins="> ">Highlighted tip</button><button type="button" class="ghost sm" id="ptog">Preview</button></div>
  <textarea id="f-body" rows="12" required>${esc(p.body)}</textarea><div class="prev" id="prev" hidden></div>
  <div class="help">Writing tips: leave a blank line to start a new paragraph. Put <b>##</b> at the start of a line for a subheading, <b>-</b> for a bullet point and <b>&gt;</b> for a highlighted tip. Use the buttons above to add them.</div>
  <p class="err" id="fe" role="alert"></p><div class="acts"><button type="button" class="ghost" data-x="cancel">Cancel</button><button class="btn">${isNew ? "Add post" : "Save changes"}</button></div></form>`);
  wirePicker(M, () => $("#f-title").value);
  const ta = $("#f-body");
  document.querySelectorAll("[data-ins]").forEach((b) => (b.onclick = () => { const s = ta.selectionStart, ls = ta.value.lastIndexOf("\n", s - 1) + 1; ta.value = ta.value.slice(0, ls) + b.dataset.ins + ta.value.slice(ls); ta.focus(); ta.selectionStart = ta.selectionEnd = s + b.dataset.ins.length; }));
  $("#ptog").onclick = () => { const pv = $("#prev"); pv.hidden = !pv.hidden; ta.hidden = !pv.hidden; $("#ptog").textContent = pv.hidden ? "Preview" : "Back to editing"; if (!pv.hidden) pv.innerHTML = fmt(ta.value) || '<span class="mut">Nothing to preview yet.</span>'; };
  let slugEdited = false; if (isNew) { $("#f-slug").oninput = () => (slugEdited = true); $("#f-title").oninput = () => { if (!slugEdited) $("#f-slug").value = slugify($("#f-title").value, 60); }; }
  $("#pform").onsubmit = (e) => {
    e.preventDefault(); const v = (id) => $("#f-" + id).value.trim(), err = (m) => ($("#fe").textContent = m);
    const slug = isNew ? v("slug") : p.slug;
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return err("The web address can only use lowercase letters, numbers and hyphens.");
    if (S.blog.some((x, k) => x.slug === slug && k !== i)) return err("Another post already uses that web address. Change it a little.");
    if (!M.img) return err("Please choose a photo for the post.");
    if (!v("title") || !v("desc") || !v("body")) return err("Please fill in the title, summary and article text.");
    const post = { slug, title: v("title"), cat: $("#f-cat").value, tag: v("tag"), meta: v("meta"), min: Math.max(1, Math.min(120, parseInt($("#f-min").value, 10) || 3)), img: M.img, desc: v("desc"), featured: $("#f-feat").checked, body: $("#f-body").value.trim() };
    if (post.featured) S.blog.forEach((x) => (x.featured = false));
    if (isNew) S.blog.unshift(post); else S.blog[i] = post;
    S.dirty.blog++; closeModal(); render(); toast(isNew ? "Post added to your draft." : "Changes saved to your draft.", "ok");
  };
}

/* ---------- gallery photo editor ---------- */
function editPhoto(i) {
  const g = i >= 0 ? S.gallery[i] : { img: "", title: "", cat: "class", cap: "" }, M = { img: g.img }, isNew = i < 0;
  modal(`<h3>${isNew ? "Add a gallery photo" : "Edit gallery photo"}</h3><form id="pform">${pickerHtml(g.img)}
  <label>Title<input id="g-title" value="${esc(g.title)}" maxlength="100" required></label>
  <label>Category<select id="g-cat">${Object.keys(GTAG).map((k) => `<option value="${k}"${g.cat === k ? " selected" : ""}>${GTAG[k]}</option>`).join("")}</select></label>
  <label>Caption <small>(one or two sentences)</small><textarea id="g-cap" rows="3" maxlength="300">${esc(g.cap)}</textarea></label>
  <p class="err" id="fe" role="alert"></p><div class="acts"><button type="button" class="ghost" data-x="cancel">Cancel</button><button class="btn">${isNew ? "Add photo" : "Save changes"}</button></div></form>`);
  wirePicker(M, () => $("#g-title").value);
  $("#pform").onsubmit = (e) => {
    e.preventDefault(); const t = $("#g-title").value.trim();
    if (!M.img) return ($("#fe").textContent = "Please choose a photo."); if (!t) return ($("#fe").textContent = "Please give the photo a title.");
    const item = { img: M.img, title: t, cat: $("#g-cat").value, cap: $("#g-cap").value.trim() };
    if (isNew) S.gallery.unshift(item); else S.gallery[i] = item;
    S.dirty.gallery++; closeModal(); render(); toast(isNew ? "Photo added to your draft." : "Changes saved to your draft.", "ok");
  };
}

/* ---------- publish / discard ---------- */
$("#publish").onclick = async () => {
  const keys = Object.keys(S.dirty).filter((k) => S.dirty[k]); if (!keys.length) return;
  const files = keys.map((k) => ({ path: `content/${k}.json`, content: JSON.stringify(S[k]) }));
  const used = new Set([...S.blog, ...S.gallery].map((x) => x.img).concat(Object.values(S.pages.images).map((o) => o.img), (S.site.partners || []).map((p) => p.logo)));
  Object.keys(S.pending).filter((p) => used.has(p)).forEach((p) => files.push({ path: p, base64: S.pending[p] }));
  if (JSON.stringify(files).length > 5.2e6) return toast("There are too many new photos for one publish. Publish now, then add the rest afterwards.", "err");
  const b = $("#publish"); b.disabled = true; b.textContent = "Publishing…";
  try { await api("admin-publish", "POST", { files }); S.pending = {}; S.dirty = dz(); render(); toast("Published! Your live site will update in about a minute.", "ok"); }
  catch (err) { toast(err.message, "err"); }
  b.disabled = false; b.textContent = "Publish changes";
};
$("#discard").onclick = async () => { if (!confirm("Discard all unpublished changes?")) return; try { await load(); toast("Changes discarded."); } catch (e) { toast(e.message, "err"); } };

/* ---------- start ---------- */
(async () => { try { const j = await api("admin-auth"); if (j.ok) await load(); else showLogin(); } catch (e) { showLogin(); } })();
})();
