/* SpotLight admin dashboard. Everything you change stays here (a draft) until you press "Publish changes",
   which saves it all to GitHub in one go; Netlify then updates the live site about a minute later. */
(function () {
"use strict";
const $ = (s) => document.querySelector(s), FN = "/.netlify/functions/";
const S = { site: {}, blog: [], gallery: [], pending: {}, shown: {}, dirty: { blog: 0, gallery: 0, site: 0 }, tab: "blog" };
const LABEL = { blog: "Blog posts", gallery: "Gallery", site: "Home & contact details" };

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

function shrink(file) {
  return new Promise((res, rej) => {
    if (!/^image\//.test(file.type)) return rej(new Error("Please choose a photo (JPG, PNG or WebP)."));
    if (file.size > 25 * 1024 * 1024) return rej(new Error("That photo is very large (over 25 MB). Try a smaller one."));
    const im = new Image(), u = URL.createObjectURL(file);
    im.onload = () => {
      const r = Math.min(1, 1400 / im.width), c = document.createElement("canvas");
      c.width = Math.round(im.width * r); c.height = Math.round(im.height * r);
      const x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); x.drawImage(im, 0, 0, c.width, c.height);
      URL.revokeObjectURL(u);
      let q = 0.84, d = c.toDataURL("image/jpeg", q);
      while (d.length > 900000 && q > 0.4) { q -= 0.1; d = c.toDataURL("image/jpeg", q); }
      res(d);
    };
    im.onerror = () => rej(new Error("Could not read that photo. Try a JPG or PNG."));
    im.src = u;
  });
}
const allImages = () => [...new Set([...S.blog.map((p) => p.img), ...S.gallery.map((g) => g.img), ...Object.keys(S.pending)])].filter(Boolean);

/* ---------- login / load ---------- */
function showLogin() { $("#app").hidden = true; closeModal(); $("#login").hidden = false; $("#pw").value = ""; $("#pw").focus(); }
async function load() {
  const j = await api("admin-content");
  S.site = j.site; S.blog = j.blog; S.gallery = j.gallery; S.pending = {}; S.dirty = { blog: 0, gallery: 0, site: 0 };
  $("#login").hidden = true; $("#app").hidden = false; render();
}
$("#lf").onsubmit = async (e) => {
  e.preventDefault(); const b = $("#lb"); b.disabled = true; $("#le").textContent = "";
  try { await api("admin-auth", "POST", { password: $("#pw").value }); await load(); } catch (err) { $("#le").textContent = err.message; }
  b.disabled = false;
};
$("#lo").onclick = async () => { if (total() && !confirm("You have unpublished changes. Log out and lose them?")) return; try { await api("admin-auth", "DELETE"); } catch (e) {} S.dirty = { blog: 0, gallery: 0, site: 0 }; showLogin(); };
window.addEventListener("beforeunload", (e) => { if (total()) { e.preventDefault(); e.returnValue = ""; } });

/* ---------- rendering ---------- */
function render() {
  document.querySelectorAll("#tabs button").forEach((b) => b.classList.toggle("on", b.dataset.t === S.tab));
  $("#panel").innerHTML = S.tab === "blog" ? rBlog() : S.tab === "gallery" ? rGallery() : rSite();
  const n = Object.keys(S.dirty).filter((k) => S.dirty[k]);
  $("#pub").hidden = !n.length; $("#pubtxt").textContent = "Unpublished changes: " + n.map((k) => LABEL[k]).join(", ");
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
  <div class="panelbox"><h3>Partner schools <small class="mut">(scrolling names on the home page)</small></h3><div id="plist"></div><button type="button" class="ghost sm" id="addp" style="margin-top:12px">+ Add a school</button></div>
  <p class="err" id="se"></p><button class="btn">Save these details</button> <span class="mut" style="font-size:.8rem">Saves to your draft. Press “Publish changes” to put it on the live site.</span></form>`;
}
function wireSite() {
  const pl = $("#plist"), row = (v) => { const d = document.createElement("div"); d.className = "prow"; d.innerHTML = `<input value="${esc(v)}" maxlength="80" aria-label="School name"><button type="button" class="ghost sm dng">Remove</button>`; d.querySelector("button").onclick = () => d.remove(); pl.appendChild(d); };
  (S.site.partners || []).forEach(row); $("#addp").onclick = () => { row(""); pl.lastChild.querySelector("input").focus(); };
  $("#sf").onsubmit = (e) => {
    e.preventDefault(); const v = (id) => $("#s-" + id).value.trim();
    if (!/^https:\/\/wa\.me\/\d{7,15}/.test(v("whatsapp"))) return ($("#se").textContent = "The WhatsApp link must look like https://wa.me/2348012345678");
    if (!/^\+?\d{7,15}$/.test(v("phoneTel"))) return ($("#se").textContent = "The calling number must be digits only, like +2348012345678");
    if (!/^https:\/\//.test(v("assessly"))) return ($("#se").textContent = "The Assessly link must start with https://");
    S.site = { heroTitle: v("heroTitle"), heroText: v("heroText"), footerText: v("footerText"), email: v("email"), phone: v("phone"), phoneTel: v("phoneTel"), whatsapp: v("whatsapp"), assessly: v("assessly"),
      partners: [...pl.querySelectorAll("input")].map((i) => i.value.trim()).filter(Boolean) };
    S.dirty.site++; render(); toast("Saved to your draft. Press “Publish changes” when you are ready.", "ok");
  };
}

/* ---------- panel buttons ---------- */
$("#panel").onclick = (e) => {
  const b = e.target.closest("[data-a]"); if (!b) return; const a = b.dataset.a, i = +b.dataset.i;
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
  const used = new Set([...S.blog, ...S.gallery].map((x) => x.img));
  Object.keys(S.pending).filter((p) => used.has(p)).forEach((p) => files.push({ path: p, base64: S.pending[p] }));
  if (JSON.stringify(files).length > 5.2e6) return toast("There are too many new photos for one publish. Publish now, then add the rest afterwards.", "err");
  const b = $("#publish"); b.disabled = true; b.textContent = "Publishing…";
  try { await api("admin-publish", "POST", { files }); S.pending = {}; S.dirty = { blog: 0, gallery: 0, site: 0 }; render(); toast("Published! Your live site will update in about a minute.", "ok"); }
  catch (err) { toast(err.message, "err"); }
  b.disabled = false; b.textContent = "Publish changes";
};
$("#discard").onclick = async () => { if (!confirm("Discard all unpublished changes?")) return; try { await load(); toast("Changes discarded."); } catch (e) { toast(e.message, "err"); } };

/* ---------- start ---------- */
(async () => { try { const j = await api("admin-auth"); if (j.ok) await load(); else showLogin(); } catch (e) { showLogin(); } })();
})();
