/* SpotLight gallery.
   Every photo in the home slider and on the Gallery page comes from this list.
   To add a photo: save it in assets/gallery/ (JPG, about 800px wide) and add a line below.
   cat must be one of: class (Classrooms), proj (Projects), tools (Tools).
   The home slider shows the first 6 entries; the Gallery page shows all of them. */
var GALLERY=[
{img:"assets/gallery/gal-1-spaces.jpg",title:"Hands-on learning spaces",tag:"Classrooms",cat:"class",cap:"Start with the learners, the space and the tools you have. Build from there."},
{img:"assets/gallery/gal-2-prototypes.jpg",title:"Student-led prototypes",tag:"Projects",cat:"proj",cap:"A classroom activity that helps students turn a real problem into a simple app idea, one paper prototype at a time."},
{img:"assets/gallery/gal-3-assessly.jpg",title:"Assessly in use",tag:"Tools",cat:"tools",cap:"Create tests and exams, add students by class, and see results in one place."},
{img:"assets/gallery/gal-4-lab.jpg",title:"Ready for the next lesson",tag:"Classrooms",cat:"class",cap:"A shared computer lab gives every learner a place to practise, explore and build confidence."},
{img:"assets/gallery/gal-5-code.jpg",title:"From an idea to a web page",tag:"Projects",cat:"proj",cap:"Small steps in HTML, CSS and JavaScript turn a blank screen into a working student project."},
{img:"assets/gallery/gal-6-ai.jpg",title:"Exploring AI responsibly",tag:"Tools",cat:"tools",cap:"Ask better questions, check suggestions and use AI as a starting point for original thinking."},
{img:"assets/gallery/gal-7-together.jpg",title:"Space to work together",tag:"Classrooms",cat:"class",cap:"Shared desks, simple materials and open conversation make room for collaborative learning."},
{img:"assets/gallery/gal-8-sketch.jpg",title:"Sketch, test, improve",tag:"Projects",cat:"proj",cap:"Paper screens help learners map an app, discuss their choices and refine the next version."},
{img:"assets/gallery/gal-1-spaces.jpg",title:"A workspace for building",tag:"Tools",cat:"tools",cap:"From planning a lesson to trying a new idea, a focused digital workspace keeps the next step within reach."}
];
function gCard(g,k,tag){return'<'+tag+(tag==="a"?' class="c" href="#gallery" data-c="'+g.cat+'" data-k="'+k+'"':' class="gs"')+'><img src="'+g.img+'" alt="'+g.title+'"><div class="t">'+g.tag.toUpperCase()+"</div><h3>"+g.title+"</h3><p>"+g.cap+"</p></"+tag+">"}

/* ---- Home slider: buttons, dots and swipe (slides move right to left) ---- */
(function(){var tr=document.getElementById("gt");if(!tr)return;
var items=GALLERY.slice(0,6),i=0,pv=document.getElementById("gp"),nx=document.getElementById("gn"),dt=document.getElementById("gd");
tr.innerHTML=items.map(function(g,k){return gCard(g,k,"div")}).join("");
function vis(){return parseInt(getComputedStyle(tr).getPropertyValue("--v"))||1}
function max(){return Math.max(0,items.length-vis())}
function go(n){i=Math.min(Math.max(n,0),max());var gap=parseFloat(getComputedStyle(tr).columnGap)||20,w=tr.children[0].offsetWidth;
tr.style.transform="translateX("+(-i*(w+gap))+"px)";pv.disabled=i===0;nx.disabled=i===max();
var d="";for(var k=0;k<=max();k++)d+='<i class="'+(k===i?"on":"")+'" data-k="'+k+'"></i>';dt.innerHTML=d}
pv.onclick=function(){go(i-1)};nx.onclick=function(){go(i+1)};
dt.onclick=function(e){if(e.target.dataset.k)go(+e.target.dataset.k)};
var x0=null;tr.parentNode.addEventListener("touchstart",function(e){x0=e.touches[0].clientX},{passive:true});
tr.parentNode.addEventListener("touchend",function(e){if(x0===null)return;var dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>40)go(i+(dx<0?1:-1));x0=null});
window.addEventListener("resize",function(){go(i)});window.gGo=function(){go(i)};go(0)})();

/* ---- Gallery page: grid, filters and photo viewer ---- */
(function(){var gg=document.getElementById("gg");if(!gg)return;
gg.innerHTML=GALLERY.map(function(g,k){return gCard(g,k,"a")}).join("");
var cs=document.querySelectorAll("#gchips .chp"),cn=document.getElementById("gcount"),cat="all";
cs.forEach(function(c){c.onclick=function(){cs.forEach(function(x){x.classList.remove("on")});c.classList.add("on");cat=c.dataset.c;var n=0;
gg.querySelectorAll(".c").forEach(function(a){var ok=cat==="all"||a.dataset.c===cat;a.style.display=ok?"":"none";if(ok)n++});
cn.textContent=cat==="all"?"Showing all "+GALLERY.length+" moments":"Showing "+n+(n===1?" moment":" moments")}});
var lb=document.getElementById("lb"),li=document.getElementById("lbi"),lc=document.getElementById("lbc"),list=[],pos=0;
function show(){var g=GALLERY[list[pos]];li.src=g.img;li.alt=g.title;lc.innerHTML="<b>"+g.title+"</b><br>"+g.cap}
function open(k){list=[];gg.querySelectorAll(".c").forEach(function(a){if(a.style.display!=="none")list.push(+a.dataset.k)});pos=list.indexOf(k);show();lb.hidden=false;document.body.style.overflow="hidden"}
function close(){lb.hidden=true;document.body.style.overflow=""}
function step(d){pos=(pos+d+list.length)%list.length;show()}
gg.onclick=function(e){var a=e.target.closest(".c");if(a){e.preventDefault();open(+a.dataset.k)}};
document.getElementById("lbx").onclick=close;document.getElementById("lbp").onclick=function(){step(-1)};document.getElementById("lbnx").onclick=function(){step(1)};
lb.onclick=function(e){if(e.target===lb)close()};
document.addEventListener("keydown",function(e){if(lb.hidden)return;if(e.key==="Escape")close();if(e.key==="ArrowLeft")step(-1);if(e.key==="ArrowRight")step(1)})})();
