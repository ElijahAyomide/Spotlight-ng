/* Loads the website's content from content/site.json, content/blog.json and content/gallery.json.
   You normally edit these through the admin dashboard (/admin), not by hand. */
var SITE={},BLOG=[],GALLERY=[];
window.CONTENT_READY=(window.__CONTENT__?Promise.resolve(window.__CONTENT__):
Promise.all(["site","blog","gallery"].map(function(n){return fetch("content/"+n+".json",{cache:"no-cache"}).then(function(r){if(!r.ok)throw 0;return r.json()})}))
.then(function(a){return{site:a[0],blog:a[1],gallery:a[2]}})).catch(function(){return{site:{},blog:[],gallery:[]}});
function findPost(k){for(var i=0;i<BLOG.length;i++)if(BLOG[i].slug===k)return BLOG[i];return null}
