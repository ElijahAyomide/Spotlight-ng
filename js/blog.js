/* Blog page, featured article and article page. Posts come from content/blog.json. */
function postTag(p){return(p.tag||CATS[p.cat]||"").toUpperCase()}
function postCard(p){return'<a class="c" data-c="'+esc(p.cat)+'" href="#post-'+esc(p.slug)+'"><img src="'+esc(p.img)+'" alt="" loading="lazy"><div class="t">'+esc(postTag(p))+"</div><h3>"+esc(p.title)+"</h3><p>"+esc(p.desc)+'</p><div class="mt"><span>'+esc(p.meta)+'</span><span class="rd">Read article ↗</span></div></a>'}
function buildBlog(){
var f=BLOG.filter(function(p){return p.featured})[0],rest=BLOG.filter(function(p){return!p.featured}),ft=document.getElementById("feat");
ft.innerHTML=f?'<div class="wrap sp" style="margin:0 auto"><img src="'+esc(f.img)+'" alt=""><div><span class="eb">Featured / '+esc(f.tag||CATS[f.cat])+'</span><h2 class="h2">'+esc(f.title)+'</h2><p class="sub" style="margin-bottom:14px">'+esc(f.desc)+'</p><small class="mut" style="display:block;margin-bottom:16px">'+esc(f.meta)+'</small><a class="btn b1 rb" href="#post-'+esc(f.slug)+'">Read the featured article</a></div></div>':"";
ft.style.display=f?"":"none";
var bg=document.getElementById("bg");bg.innerHTML=rest.map(postCard).join("");
var cs=document.querySelectorAll("#chips .chp"),ar=bg.querySelectorAll(".c"),q=document.getElementById("bq"),n=document.getElementById("bn"),e=document.getElementById("be"),cat="all";
function run(){var t=q.value.toLowerCase().trim(),k=0;ar.forEach(function(a){var ok=(cat==="all"||a.dataset.c===cat)&&a.textContent.toLowerCase().indexOf(t)>-1;a.style.display=ok?"":"none";if(ok)k++});
n.textContent=(cat==="all"&&!t)?"Explore all "+ar.length+" articles":k+(k===1?" article":" articles");e.style.display=k?"none":"block"}
cs.forEach(function(c){c.onclick=function(){cs.forEach(function(x){x.classList.remove("on")});c.classList.add("on");cat=c.dataset.c;run()}});q.oninput=run;run()}
function renderArticle(k){
var a=findPost(k),m="";if(!a)return;
document.getElementById("a-tag").textContent=(a.featured?"Featured / ":"")+(a.tag||CATS[a.cat]||"");
document.getElementById("a-title").textContent=a.title;
document.getElementById("a-meta").textContent=a.meta+" · "+a.min+" min read · By the SpotLight team";
var im=document.getElementById("a-img");im.src=a.img;im.alt=a.title;
document.getElementById("a-body").innerHTML=fmt(a.body);
BLOG.filter(function(p){return!p.featured&&p.slug!==k}).slice(0,3).forEach(function(p){m+=postCard(p)});
document.getElementById("a-more").innerHTML=m;
document.title=a.title+" | SpotLight"}
