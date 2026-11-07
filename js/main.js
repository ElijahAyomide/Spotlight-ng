/* SpotLight scripts: page switching (#home, #products...), mobile menu, content, scrolling school names, enquiry forms. */
var pages=["home","products","gallery","blog","article","partner","contact"];
function route(){
var h=location.hash.slice(1),f=h==="faq";if(h==="assessly")h="products";var pk="";if(h.indexOf("post-")===0){pk=h.slice(5);h=findPost(pk)?"article":"blog"}
if(f||pages.indexOf(h)<0)h="home";if(h==="article")renderArticle(pk);else document.title="SpotLight | Digital tech for schools";
pages.forEach(function(p){document.getElementById("pg-"+p).classList.toggle("on",p===h)});
document.querySelectorAll("nav a").forEach(function(a){a.classList.toggle("on",a.dataset.p===(h==="article"?"blog":h)&&!a.classList.contains("cta"))});
document.getElementById("nav").classList.remove("open");if(f)setTimeout(function(){document.getElementById("faq").scrollIntoView()},30);else window.scrollTo(0,0);if(window.gGo)gGo()}
window.addEventListener("hashchange",route);
document.getElementById("burger").onclick=function(){document.getElementById("nav").classList.toggle("open")};
document.getElementById("y").textContent=new Date().getFullYear();

/* Put the editable details (from content/site.json) into the page */
function applySite(){
document.querySelectorAll("[data-site]").forEach(function(el){var v=SITE[el.dataset.site];if(v)el.textContent=v});
var L={email:["mailto:"+SITE.email,SITE.email],phone:["tel:"+SITE.phoneTel,SITE.phone],wa:[SITE.whatsapp]};
document.querySelectorAll("[data-link]").forEach(function(a){var d=L[a.dataset.link];if(d&&d[0]&&d[0]!=="mailto:undefined"&&d[0]!=="tel:undefined"){a.href=d[0];if(d[1])a.querySelector(".tx").lastChild.textContent=d[1]}});
document.querySelectorAll("[data-assessly]").forEach(function(a){if(SITE.assessly)a.href=SITE.assessly});
var names=(SITE.partners&&SITE.partners.length)?SITE.partners:[],half="";
if(names.length){for(var i=0;half===""||i<Math.max(4,names.length);i++)half+='<span><img src="assets/logo-white.png" alt="">'+esc(names[i%names.length])+"</span>"}
document.getElementById("trk").innerHTML=half+half;document.querySelector(".strip").style.display=names.length?"":"none"}

/* Enquiry forms: send to /api/enquiry (netlify/functions/enquiry.js), which emails SpotLight */
document.querySelectorAll("form.enq").forEach(function(f){f.onsubmit=function(e){e.preventDefault();
var m=f.querySelector(".fm"),btn=f.querySelector("button[type=submit]"),d={type:f.dataset.type};
new FormData(f).forEach(function(v,k){d[k]=v});d.consent=f.querySelector("[name=consent]").checked;
m.className="fm";m.textContent="Sending…";btn.disabled=true;
fetch("/api/enquiry",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(d)})
.then(function(r){return r.json().then(function(j){return r.ok&&j.ok},function(){return false})})
.then(function(ok){if(!ok)throw 0;m.textContent="Thank you! Your message has been sent. We will reply to "+d.email+" soon.";f.reset()})
.catch(function(){m.className="fm err";m.textContent="Sorry, we could not send your message right now. Please try again, email hellospotlite@gmail.com or message us on WhatsApp."})
.then(function(){btn.disabled=false})}});

/* Start: show the page straight away, then fill in the content and show it again */
if(location.hash.indexOf("#post-")!==0)route();
CONTENT_READY.then(function(c){SITE=c.site;BLOG=c.blog;GALLERY=c.gallery;applySite();buildBlog();initGallery();route()});
