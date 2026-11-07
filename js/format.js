/* Shared helpers (used by the website and the admin dashboard).
   esc()  makes any text safe to show on a page.
   fmt()  turns an article's plain text into HTML. How to write an article:
          - a blank line starts a new paragraph
          - a line starting with "## " is a subheading
          - lines starting with "- " make a bullet list
          - a line starting with "> " is a highlighted tip */
var CATS={ds:"Digital skills",sp:"Student projects",sa:"School assessments",ai:"Responsible AI"};
var GTAG={"class":"Classrooms",proj:"Projects",tools:"Tools"};
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function fmt(body){
var out="",L=String(body||"").replace(/\r/g,"").split("\n"),i=0;
while(i<L.length){var l=L[i];
if(!l.trim()){i++;continue}
if(/^##\s+/.test(l)){out+="<h2>"+esc(l.replace(/^##\s+/,""))+"</h2>";i++;continue}
if(/^-\s+/.test(l)){var li="";while(i<L.length&&/^-\s+/.test(L[i])){li+="<li>"+esc(L[i].replace(/^-\s+/,""))+"</li>";i++}out+="<ul>"+li+"</ul>";continue}
if(/^>/.test(l)){var q=[];while(i<L.length&&/^>/.test(L[i])){q.push(L[i].replace(/^>\s?/,""));i++}out+='<div class="ql">'+esc(q.join(" "))+"</div>";continue}
var p=[];while(i<L.length&&L[i].trim()&&!/^(##\s+|-\s+|>)/.test(L[i])){p.push(L[i]);i++}out+="<p>"+esc(p.join(" "))+"</p>"}
return out}
