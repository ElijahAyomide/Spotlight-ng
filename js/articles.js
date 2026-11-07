/* SpotLight blog articles (sample content).
   To add an article: copy one entry, give it a new key (letters, numbers and hyphens only), then link to it with href="#post-your-key".
   Body blocks: a plain string = paragraph, {h:"..."} = subheading, {ul:[...]} = bullet list, {q:"..."} = highlighted callout. */
var ARTICLES={
"clicking-to-creating":{tag:"Digital skills",cat:"Featured",title:"From clicking to creating: make digital skills hands-on",meta:"Teaching perspective",min:6,img:"assets/images/hero.jpg",
desc:"A small, purposeful project can connect design thinking, web development and reflection.",
body:["Most students are confident users of technology. Fewer have the chance to make something with it. Moving from clicking to creating is the heart of hands-on digital learning.",
{h:"Start small and purposeful"},"A project does not need to be big. A single web page, a simple app idea or a short prompt-built prototype can connect design thinking, web development and reflection, as long as it exists for a real reason.",
{h:"Connect three skills"},{ul:["Design: decide who it is for and sketch it on paper","Build: turn the sketch into a working page with HTML and CSS","Reflect: test it with someone else and improve it"]},
{h:"Let students explain"},"Ask students to present what they made and why. Explaining design choices shows understanding far better than a finished screen does.",
{q:"A good project is one students can explain, test and improve."},
"SpotLight partners with schools to bring this kind of project into the classroom. If you would like to explore a pathway for your school, start with an enquiry."]},
"start-with-a-sketch":{tag:"UI/UX design",cat:"ds",title:"Start with a sketch, not a screen",meta:"Classroom activity",min:4,img:"assets/images/card-design.jpg",
desc:"A classroom activity that helps students turn a real problem into a simple app idea, one paper prototype at a time.",
body:["When students first meet product design, the temptation is to open a design tool and start decorating. Pencil and paper slow them down in the best way: they have to decide what the app is for before they decide what it looks like.",
{h:"Pick a real problem"},"Ask students to notice something slightly annoying at school: finding the library timetable, booking sports kit, remembering homework. A small, real problem gives every idea a purpose.",
{h:"Sketch the screens"},"Give each student a few blank screen outlines (a rectangle drawn on paper is enough) and ask them to sketch:",
{ul:["The first screen someone sees","The one main thing they can do there","What happens after they do it"]},
{h:"Test it with a classmate"},"Students swap sketches and “use” each other’s prototype by pointing at buttons while the designer explains what would happen. Watching someone get confused is the fastest way to learn about clarity.",
{q:"Try it in class: 30 minutes, paper and pencils, no devices needed."},
"Once the paper prototype makes sense, moving it into a digital tool becomes a much smaller step."]},
"first-website":{tag:"Web development",cat:"ds",title:"A first website with a real purpose",meta:"Project guide",min:5,img:"assets/images/card-web.jpg",
desc:"Help learners plan a school club page, organise its content and build it with HTML and CSS before adding complexity.",
body:["A first website works best when it exists for someone. A school club page, a class news board or a sports-day schedule gives students a reason to care about every heading and button.",
{h:"Plan the content first"},"Before any code, students list what visitors need to know: what the club does, when it meets and how to join. Grouping this on paper gives them the sections of their page.",
{h:"Build in small layers"},{ul:["HTML: headings, paragraphs, a list and an image, so the page works with no styling","CSS: colours, fonts and spacing, one change at a time","JavaScript (later): one small feature, such as a button that shows meeting times"]},
{h:"Keep complexity for later"},"Resist adding menus, animations and extras too soon. A plain page that is finished and shared teaches more than an ambitious page that never works.",
{q:"Checkpoint: can a classmate who has never heard of the club find the meeting time in under ten seconds?"}]},
"question-bank":{tag:"School assessments",cat:"sa",title:"Build a question bank you can return to",meta:"Practical guide",min:5,img:"assets/images/tool-assessly.jpg",
desc:"Organise questions by subject and topic, review the wording and keep useful questions ready for the next assessment.",
body:["Writing good questions takes time. A question bank means that time is spent once and reused every term.",
{h:"Organise by subject and topic"},"Label each question by subject, topic and difficulty. When you prepare a test, you can pull a balanced set instead of starting from a blank page.",
{h:"Review the wording"},{ul:["Is there one clearly correct answer?","Are the wrong options believable but clearly wrong?","Is the question understandable for the age group, without tricks?"]},
{h:"Keep what works"},"After each assessment, note which questions worked and which confused students for the wrong reasons. Edit or retire them. Over time the bank improves with every use.",
{q:"In Assessly, questions are kept in a question bank by subject and topic, ready to assign to a class when you create the next test or exam."}]},
"ai-classroom-routine":{tag:"Responsible AI",cat:"ai",title:"Ask, check, improve: an AI classroom routine",meta:"Teaching ideas",min:4,img:"assets/images/card-ai.jpg",
desc:"Use prompts as a starting point, not a final answer. Encourage students to check suggestions and explain their choices.",
body:["AI tools can help students get unstuck, but only if students stay in charge of the thinking. A simple three-step routine builds that habit.",
{h:"1. Ask"},"Students write a clear prompt: what they want, who it is for and any limits. Writing the prompt is already a thinking exercise.",
{h:"2. Check"},"Treat the answer as a draft. Students look for mistakes, missing parts and anything they cannot explain. If they cannot explain it, they do not use it.",
{h:"3. Improve"},"They revise the prompt or the result, then write one sentence about what they changed and why.",
{q:"Classroom rule of thumb: AI can suggest, students decide."},
"Before you start, agree school rules on accounts, privacy and what students may share with AI tools."]},
"prototype-feedback":{tag:"Student projects",cat:"sp",title:"Give useful feedback on a student prototype",meta:"Project reflection",min:4,img:"assets/images/card-design.jpg",
desc:"Move beyond “I like it” with questions about clarity, navigation and the person who will use the design.",
body:["“I like it” feels kind but does not help a designer improve. Better prompts lead to feedback students can act on.",
{h:"Ask about clarity"},"“What do you think this screen is for?” If the answer is wrong, the design has a clarity problem, not the viewer.",
{h:"Ask about navigation"},"“Where would you tap to go back?” Watching where a finger goes reveals confusing layouts quickly.",
{h:"Think about the person using it"},"Remind students who the design is for: a younger pupil, a teacher in a hurry, a parent on a phone.",
{h:"Sentence starters that help"},{ul:["I expected … but …","I was not sure what would happen if …","One thing that worked well was …"]}]},
"after-the-results":{tag:"School assessments",cat:"sa",title:"What to do after the results are in",meta:"Teaching guide",min:5,img:"assets/images/tool-more.jpg",
desc:"Look for topics to revisit, discuss common misunderstandings and turn an assessment into a plan for the next lesson.",
body:["Marking is not the end of an assessment. The results show where to go next.",
{h:"Look for topics to revisit"},"Scan for questions many students missed. A cluster of errors on one topic usually points to something to reteach, not to individual weakness.",
{h:"Discuss common misunderstandings"},"Take two or three frequently missed questions to class and ask students to explain the wrong answers. This is where much of the learning happens.",
{h:"Plan the next lesson"},{ul:["Pick one or two topics to reteach","Choose a different way to explain them","Plan a short follow-up check"]},
{q:"Having results by class and by student in one place, as in Assessly, makes this review much quicker."}]}
};

/* Show the article page for #post-<key> */
function renderArticle(k){
var a=ARTICLES[k],b="";
a.body.forEach(function(x){
if(typeof x==="string")b+="<p>"+x+"</p>";
else if(x.h)b+="<h2>"+x.h+"</h2>";
else if(x.ul)b+="<ul>"+x.ul.map(function(i){return"<li>"+i+"</li>"}).join("")+"</ul>";
else if(x.q)b+='<div class="ql">'+x.q+"</div>"});
document.getElementById("a-tag").textContent=(a.cat==="Featured"?"Featured / ":"")+a.tag;
document.getElementById("a-title").textContent=a.title;
document.getElementById("a-meta").textContent=a.meta+" · "+a.min+" min read · By the SpotLight team";
var im=document.getElementById("a-img");im.src=a.img;im.alt=a.title;
document.getElementById("a-body").innerHTML=b;
var m="";Object.keys(ARTICLES).filter(function(x){return x!==k&&x!=="clicking-to-creating"}).slice(0,3).forEach(function(x){var r=ARTICLES[x];
m+='<a class="c" href="#post-'+x+'"><img src="'+r.img+'" alt=""><div class="t">'+r.tag.toUpperCase()+"</div><h3>"+r.title+"</h3><p>"+r.desc+'</p><div class="mt"><span>'+r.meta+'</span><span class="rd">Read article ↗</span></div></a>'});
document.getElementById("a-more").innerHTML=m;
document.title=a.title+" | SpotLight"}
