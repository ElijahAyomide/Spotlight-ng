/* Home gallery slider and Gallery page. Photos come from content/gallery.json (edit them in the admin dashboard). */
function gCard(g,k,tag){var t=GTAG[g.cat]||"";return"<"+tag+(tag==="a"?' class="c" href="#gallery" data-c="'+esc(g.cat)+'" data-k="'+k+'"':' class="gs"')+'><img src="'+esc(g.img)+'" alt="'+esc(g.title)+'"><div class="t">'+esc(t.toUpperCase())+"</div><h3>"+esc(g.title)+"</h3><p>"+esc(g.cap)+"</p></"+tag+">"}
function initGallery(){
/* ---- Home slider: buttons, dots and swipe (slides move right to left) ---- */
var tr=document.getElementById("gt");
if(tr){var items=GALLERY.slice(0,6),i=0,pv=document.getElementById("gp"),nx=document.getElementById("gn"),dt=document.getElementById("gd");
if(!items.length)document.querySelector(".gsec").style.display="none";
tr.innerHTML=items.map(function(g,k){return gCard(g,k,"div")}).join("");
var vis=function(){return parseInt(getComputedStyle(tr).getPropertyValue("--v"))||1},max=function(){return Math.max(0,items.length-vis())};
var go=function(n){if(!tr.children.length)return;i=Math.min(Math.max(n,0),max());var gap=parseFloat(getComputedStyle(tr).columnGap)||20,w=tr.children[0].offsetWidth;
tr.style.transform="translateX("+(-i*(w+gap))+"px)";pv.disabled=i===0;nx.disabled=i===max();
var d="";for(var k=0;k<=max();k++)d+='<i class="'+(k===i?"on":"")+'" data-k="'+k+'"></i>';dt.innerHTML=d};
pv.onclick=function(){go(i-1)};nx.onclick=function(){go(i+1)};
dt.onclick=function(e){if(e.target.dataset.k)go(+e.target.dataset.k)};
var x0=null;tr.parentNode.addEventListener("touchstart",function(e){x0=e.touches[0].clientX},{passive:true});
tr.parentNode.addEventListener("touchend",function(e){if(x0===null)return;var dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>40)go(i+(dx<0?1:-1));x0=null});
window.addEventListener("resize",function(){go(i)});window.gGo=function(){go(i)};go(0)}
/* ---- Gallery page: grid, filters and photo viewer ---- */
var gg=document.getElementById("gg");if(!gg)return;
gg.innerHTML=GALLERY.map(function(g,k){return gCard(g,k,"a")}).join("");
var cs=document.querySelectorAll("#gchips .chp"),cn=document.getElementById("gcount"),cat="all";
cn.textContent="Showing all "+GALLERY.length+" moments";
cs.forEach(function(c){c.onclick=function(){cs.forEach(function(x){x.classList.remove("on")});c.classList.add("on");cat=c.dataset.c;var n=0;
gg.querySelectorAll(".c").forEach(function(a){var ok=cat==="all"||a.dataset.c===cat;a.style.display=ok?"":"none";if(ok)n++});
cn.textContent=cat==="all"?"Showing all "+GALLERY.length+" moments":"Showing "+n+(n===1?" moment":" moments")}});
var lb=document.getElementById("lb"),li=document.getElementById("lbi"),lc=document.getElementById("lbc"),list=[],pos=0;
function show(){var g=GALLERY[list[pos]];li.src=g.img;li.alt=g.title;lc.innerHTML="<b>"+esc(g.title)+"</b><br>"+esc(g.cap)}
function open(k){list=[];gg.querySelectorAll(".c").forEach(function(a){if(a.style.display!=="none")list.push(+a.dataset.k)});pos=list.indexOf(k);show();lb.hidden=false;document.body.style.overflow="hidden"}
function close(){lb.hidden=true;document.body.style.overflow=""}
function step(d){pos=(pos+d+list.length)%list.length;show()}
gg.onclick=function(e){var a=e.target.closest(".c");if(a){e.preventDefault();open(+a.dataset.k)}};
document.getElementById("lbx").onclick=close;document.getElementById("lbp").onclick=function(){step(-1)};document.getElementById("lbnx").onclick=function(){step(1)};
lb.onclick=function(e){if(e.target===lb)close()};
document.addEventListener("keydown",function(e){if(lb.hidden)return;if(e.key==="Escape")close();if(e.key==="ArrowLeft")step(-1);if(e.key==="ArrowRight")step(1)})}
