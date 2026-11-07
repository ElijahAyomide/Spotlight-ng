/* SpotLight scripts: page switching (#home, #products...), mobile menu, scrolling school names, contact form preview. */
var pages=["home","products","gallery","blog","article","partner","contact"];
function route(){
var h=location.hash.slice(1),f=h==="faq";if(h==="assessly")h="products";var pk="";if(h.indexOf("post-")===0){pk=h.slice(5);h=(window.ARTICLES&&ARTICLES[pk])?"article":"blog"}
if(f||pages.indexOf(h)<0)h="home";if(h==="article")renderArticle(pk);else document.title="SpotLight | Digital tech for schools";
pages.forEach(function(p){document.getElementById("pg-"+p).classList.toggle("on",p===h)});
document.querySelectorAll("nav a").forEach(function(a){a.classList.toggle("on",a.dataset.p===(h==="article"?"blog":h)&&!a.classList.contains("cta"))});
document.getElementById("nav").classList.remove("open");if(f)setTimeout(function(){document.getElementById("faq").scrollIntoView()},30);else window.scrollTo(0,0);if(window.gGo)gGo()}
window.addEventListener("hashchange",route);route();
document.getElementById("burger").onclick=function(){document.getElementById("nav").classList.toggle("open")};
document.getElementById("y").textContent=new Date().getFullYear();
var names=["Triumph Model College","ESOPAT School"],t="";for(var i=0;i<8;i++)t+="<span><img src=\"assets/logo-white.png\" alt=\"\">"+names[i%2]+"</span>";document.getElementById("trk").innerHTML=t;


/* Blog: topic chips + search */
(function(){var cs=document.querySelectorAll("#chips .chp"),ar=document.querySelectorAll("#bg .c"),q=document.getElementById("bq"),n=document.getElementById("bn"),e=document.getElementById("be"),cat="all";
function f(){var t=q.value.toLowerCase().trim(),k=0;ar.forEach(function(a){var ok=(cat==="all"||a.dataset.c===cat)&&a.textContent.toLowerCase().indexOf(t)>-1;a.style.display=ok?"":"none";if(ok)k++});
n.textContent=(cat==="all"&&!t)?"Explore all "+ar.length+" articles":k+(k===1?" article":" articles");e.style.display=k?"none":"block"}
cs.forEach(function(c){c.onclick=function(){cs.forEach(function(x){x.classList.remove("on")});c.classList.add("on");cat=c.dataset.c;f()}});q.oninput=f})();

/* Enquiry forms: send to /api/enquiry (api/enquiry.js), which emails SpotLight */
document.querySelectorAll("form.enq").forEach(function(f){f.onsubmit=function(e){e.preventDefault();
var m=f.querySelector(".fm"),btn=f.querySelector("button[type=submit]"),d={type:f.dataset.type};
new FormData(f).forEach(function(v,k){d[k]=v});d.consent=f.querySelector("[name=consent]").checked;
m.className="fm";m.textContent="Sending…";btn.disabled=true;
fetch("/api/enquiry",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(d)})
.then(function(r){return r.json().then(function(j){return r.ok&&j.ok},function(){return false})})
.then(function(ok){if(!ok)throw 0;m.textContent="Thank you! Your message has been sent. We will reply to "+d.email+" soon.";f.reset()})
.catch(function(){m.className="fm err";m.textContent="Sorry, we could not send your message right now. Please try again, email hellospotlite@gmail.com or message us on WhatsApp."})
.then(function(){btn.disabled=false})}});
