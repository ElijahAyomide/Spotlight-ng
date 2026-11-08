/* Loads the website's content from the files in content/ (site, blog, gallery, pages, faqs).
   You normally edit these through the admin dashboard (/admin), not by hand. */
var SITE={},BLOG=[],GALLERY=[];
var PAGES={text:{},images:{}},FAQS={};
/* Each file is loaded on its own; if one is missing the website still works with what it has. */
window.CONTENT_READY=(window.__CONTENT__?Promise.resolve(window.__CONTENT__):
Promise.all([["site",{}],["blog",[]],["gallery",[]],["pages",{text:{},images:{}}],["faqs",{}]].map(function(f){return fetch("content/"+f[0]+".json",{cache:"no-cache"}).then(function(r){if(!r.ok)throw 0;return r.json()}).catch(function(){return f[1]})}))
.then(function(a){return{site:a[0],blog:a[1],gallery:a[2],pages:a[3],faqs:a[4]}}));
function findPost(k){for(var i=0;i<BLOG.length;i++)if(BLOG[i].slug===k)return BLOG[i];return null}
