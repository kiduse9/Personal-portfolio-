(() => {
  "use strict";
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const state = { z: 10, active: null, history: [], commandIndex: 0, commands: [] };
  let data;

  const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const safeUrl = value => { try { const u = new URL(value); return ["https:","http:"].includes(u.protocol) ? u.href : "#"; } catch { return "#"; } };

  async function loadData() {
    try {
      const response = await fetch("data.json", {cache:"no-store"});
      if (!response.ok) throw new Error("Unable to load portfolio data");
      data = await response.json();
    } catch (error) {
      console.error(error);
      data = {profile:{name:"Kidus Ermias",role:"Software Engineering Student & Developer",summary:"Building useful software through curiosity, practice, and thoughtful problem-solving.",location:"Addis Ababa, Ethiopia",availability:"Open to opportunities",email:"kiduse816@gmail.com",github:"https://github.com/kiduse9",instagram:"https://www.instagram.com/kiduse9",education:"HiLCoE School of Computer Science and Technology"},skills:[],projects:[],journey:[],socials:[]};
    }
  }

  function renderApps() {
    const p = data.profile || {};
    $("#about-content").innerHTML = `
      <div class="profile-hero"><div class="avatar-orbit"><div class="avatar">KE</div><span class="orbit-dot"></span></div><div><p class="eyebrow mono">HELLO, WORLD</p><h2 class="content-title">I'm ${escapeHTML(p.name || "Kidus Ermias")}.</h2><p class="accent-copy">${escapeHTML(p.role || "")}</p></div></div>
      <div class="content-card"><h3>A little about me</h3><p>${escapeHTML(p.summary || p.tagline || "")}</p></div>
      <div class="info-grid"><div class="info-card"><span>EDUCATION</span><strong>${escapeHTML(p.education || "Add education details")}</strong><a href="${safeUrl(p.educationUrl)}" target="_blank" rel="noreferrer">Visit institution ↗</a></div><div class="info-card"><span>LOCATION</span><strong>${escapeHTML(p.location || "Location not set")}</strong><small>East Africa · EAT (UTC+3)</small></div></div>
      <div class="content-card"><h3>What I enjoy working on</h3><p>Frontend experiences, backend development, databases, and turning ideas into working software.</p></div>`;
    const skills = data.skills || [];
    $("#skills-content").innerHTML = skills.length ? `<p class="eyebrow mono">MY TOOLKIT</p><h2 class="content-title">Skills & expertise</h2><div class="skill-grid">${skills.map(group=>`<section class="skill-card"><div class="skill-symbol">✳</div><h3>${escapeHTML(group.category)}</h3><p>${escapeHTML(group.description || "")}</p><div class="skill-tags">${(group.items||[]).map(item=>`<span>${escapeHTML(item)}</span>`).join("")}</div></section>`).join("")}</div>` : emptyState("Skills are being added.","The toolkit will appear here as the portfolio grows.");
    const projects = data.projects || [];
    $("#projects-content").innerHTML = `<p class="eyebrow mono">SELECTED WORK</p><h2 class="content-title">Projects</h2><p class="section-intro">A collection of things I've built, explored, and learned from.</p>` + (projects.length ? `<div class="project-grid">${projects.map(project=>`<article class="project-card"><div class="project-top"><span>PROJECT / ${escapeHTML(project.year || "—")}</span><span>↗</span></div><h3>${escapeHTML(project.name)}</h3><p>${escapeHTML(project.description)}</p><div class="skill-tags">${(project.technologies||[]).map(t=>`<span>${escapeHTML(t)}</span>`).join("")}</div><div class="project-links">${project.liveUrl?`<a href="${safeUrl(project.liveUrl)}" target="_blank" rel="noreferrer">Live demo ↗</a>`:""}${project.repoUrl?`<a href="${safeUrl(project.repoUrl)}" target="_blank" rel="noreferrer">Source code ↗</a>`:""}</div></article>`).join("")}</div>` : emptyState("No projects published yet.","Project cards will show up here when project details are added to data.json. I haven't filled this with made-up work."));
    const journey = data.journey || [];
    $("#journey-content").innerHTML = `<p class="eyebrow mono">THE ROAD SO FAR</p><h2 class="content-title">My journey</h2><div class="timeline">${journey.length ? journey.map(item=>`<article class="timeline-item"><span class="timeline-period">${escapeHTML(item.period)}</span><h3>${escapeHTML(item.title)}</h3><strong>${escapeHTML(item.organization || "")}</strong><p>${escapeHTML(item.description || "")}</p></article>`).join("") : emptyState("Journey coming soon.","More milestones will be added here.")}</div>`;
    const email = p.email || "";
    $("#contact-content").innerHTML = `<div class="contact-visual">✉</div><p class="eyebrow mono">LET'S CONNECT</p><h2 class="content-title">Have something in mind?</h2><p class="section-intro">${escapeHTML(p.contactMessage || "I'd love to hear from you.")}</p><a class="primary-link" href="mailto:${encodeURIComponent(email)}">Send me an email ↗</a><div class="social-list">${(data.socials||[]).map(s=>`<a href="${safeUrl(s.url)}" target="_blank" rel="noreferrer">${escapeHTML(s.label)} <span>↗</span></a>`).join("")}</div><p class="muted-note">Based in ${escapeHTML(p.location || "Ethiopia")}</p>`;
    $("#desktop-status").textContent = p.availability || "Open to opportunities";
    document.title = `KIDUS.OS — ${p.name || "Kidus Ermias"}`;
  }
  function emptyState(title, copy) { return `<div class="empty-state"><span>✧</span><h3>${escapeHTML(title)}</h3><p>${escapeHTML(copy)}</p></div>`; }

  function openWindow(name) {
    const win = document.querySelector(`[data-window="${name}"]`);
    if (!win) return;
    win.classList.remove("hidden","minimized");
    win.style.zIndex = ++state.z;
    state.active = name;
    $$(".dock-app").forEach(btn => btn.classList.toggle("active", btn.dataset.open === name));
    if (name === "terminal") $("#terminal-input").focus();
  }
  function closeWindow(win) {
    win.classList.add("hidden");
    const name = win.dataset.window;
    if (state.active === name) state.active = null;
    $$(".dock-app").forEach(btn => btn.classList.toggle("active", btn.dataset.open === name && !win.classList.contains("hidden")));
  }
  function initWindows() {
    $$("[data-open]").forEach(btn => btn.addEventListener("click", () => {
      const name = btn.dataset.open;
      if (btn.closest(".launcher")) $("#launcher").classList.add("hidden");
      openWindow(name);
    }));
    $$(".app-window").forEach(win => {
      win.addEventListener("pointerdown", () => win.style.zIndex = ++state.z);
      $("[data-close]", win).addEventListener("click", () => closeWindow(win));
      $("[data-minimize]", win).addEventListener("click", () => win.classList.add("minimized"));
      $("[data-maximize]", win).addEventListener("click", () => win.classList.toggle("maximized"));
      const bar = $("[data-drag]", win);
      let drag = null;
      bar.addEventListener("pointerdown", e => {
        if (e.target.closest("button") || win.classList.contains("maximized") || e.button !== 0) return;
        const rect = win.getBoundingClientRect();
        drag = {x:e.clientX,y:e.clientY,left:rect.left,top:rect.top};
        bar.setPointerCapture(e.pointerId);
      });
      bar.addEventListener("pointermove", e => {
        if (!drag) return;
        win.style.left = Math.max(8, drag.left + e.clientX-drag.x) + "px";
        win.style.top = Math.max(52, drag.top + e.clientY-drag.y) + "px";
      });
      const stop = () => drag = null;
      bar.addEventListener("pointerup", stop); bar.addEventListener("pointercancel", stop);
    });
  }
  function initLauncher() {
    $("#launcher-toggle").addEventListener("click", () => $("#launcher").classList.toggle("hidden"));
    $("#launcher-close").addEventListener("click", () => $("#launcher").classList.add("hidden"));
    $("#brand-home").addEventListener("click", () => $$(".app-window").forEach(w=>w.classList.add("hidden")));
    document.addEventListener("click", e => {
      if (!e.target.closest("#launcher") && !e.target.closest("#launcher-toggle")) $("#launcher").classList.add("hidden");
    });
  }

  const commandItems = [
    {name:"About me",key:"about",hint:"Open profile"},
    {name:"Projects",key:"projects",hint:"Explore selected work"},
    {name:"Skills",key:"skills",hint:"View technologies"},
    {name:"My journey",key:"journey",hint:"Education and experience"},
    {name:"Contact",key:"contact",hint:"Get in touch"},
    {name:"Terminal",key:"terminal",hint:"Run portfolio commands"}
  ];
  function renderCommandResults(query="") {
    const matches = commandItems.filter(item => (item.name+" "+item.hint).toLowerCase().includes(query.toLowerCase()));
    state.commands = matches; state.commandIndex = 0;
    $("#command-results").innerHTML = matches.map((item,i)=>`<button class="command-result ${i===0?"selected":""}" data-command="${item.key}"><span class="command-result-icon">${item.key==="terminal"?">_":"✧"}</span><span><b>${item.name}</b><small>${item.hint}</small></span><kbd>↵</kbd></button>`).join("") || '<p class="command-empty">No matching apps</p>';
    $$("[data-command]").forEach(btn=>btn.addEventListener("click",()=>{openWindow(btn.dataset.command);$("#command-palette").classList.add("hidden");}));
  }
  function initCommands() {
    const overlay=$("#command-palette"), input=$("#command-input");
    function show(){overlay.classList.remove("hidden");input.value="";renderCommandResults();input.focus();}
    document.addEventListener("keydown",e=>{
      if ((e.metaKey||e.ctrlKey) && e.key.toLowerCase()==="k"){e.preventDefault();show();}
      if (e.key==="Escape"){overlay.classList.add("hidden");$("#launcher").classList.add("hidden");}
      if (!overlay.classList.contains("hidden") && ["ArrowDown","ArrowUp","Enter"].includes(e.key)){
        e.preventDefault();
        if(e.key==="ArrowDown"||e.key==="ArrowUp"){
          state.commandIndex=(state.commandIndex+(e.key==="ArrowDown"?1:-1)+state.commands.length)%Math.max(1,state.commands.length);
          $$(".command-result").forEach((b,i)=>b.classList.toggle("selected",i===state.commandIndex));
        } else if(state.commands[state.commandIndex]){openWindow(state.commands[state.commandIndex].key);overlay.classList.add("hidden");}
      }
    });
    input.addEventListener("input",()=>renderCommandResults(input.value));
  }

  const terminalCommands = {
    help:()=>["Available commands:","  help       Show this help","  about      About Kidus","  skills     List technologies","  projects   View project section","  journey    Education and experience","  contact    Contact details","  github     Open GitHub profile","  clear      Clear terminal","  date       Show local date","  whoami     Who is logged in?"],
    about:()=>[data.profile.summary || data.profile.tagline || "Software engineering student and developer."],
    skills:()=> (data.skills||[]).flatMap(group=>[`${group.category}:`,...(group.items||[]).map(item=>"  • "+item)]),
    projects:()=>[(data.projects||[]).length ? (data.projects||[]).map(p=>"- "+p.name) : ["No public project entries yet. Check back soon."]],
    journey:()=> (data.journey||[]).map(item=>`${item.period} — ${item.title} / ${item.organization}`),
    contact:()=>[`Email: ${data.profile.email || "Not set"}`,`GitHub: ${data.profile.github || "Not set"}`],
    whoami:()=>[data.profile.name || "Guest","Software engineering student · Developer"],
    date:()=>[new Date().toString()],
    clear:()=>null,
    github:()=>{window.open(safeUrl(data.profile.github)," _blank","noopener");return ["Opening GitHub profile…"];}
  };
  function writeTerminal(lines, command="") {
    const output=$("#terminal-output");
    if(lines===null){output.innerHTML="";return;}
    if(command) output.insertAdjacentHTML("beforeend",`<p class="terminal-line"><span class="terminal-prompt">kidus@portfolio ~ $</span> ${escapeHTML(command)}</p>`);
    (Array.isArray(lines)?lines:[lines]).forEach(line=>output.insertAdjacentHTML("beforeend",`<p class="terminal-response">${escapeHTML(line)}</p>`));
    output.scrollTop=output.scrollHeight;
  }
  function initTerminal() {
    $("#terminal-form").addEventListener("submit",e=>{
      e.preventDefault();
      const input=$("#terminal-input"), raw=input.value.trim(), cmd=raw.toLowerCase(); input.value="";
      if(!raw)return;
      const action=terminalCommands[cmd];
      if(action) writeTerminal(action(),raw);
      else writeTerminal([`command not found: ${raw}`, "Type 'help' to see available commands."],raw);
    });
    writeTerminal(["KIDUS.OS interactive shell","A small command-line tour of this portfolio.","Type 'help' to get started." ]);
  }
  function clock() {
    const now=new Date();
    $("#top-time").textContent=new Intl.DateTimeFormat("en",{hour:"2-digit",minute:"2-digit"}).format(now);
    $("#top-date").textContent=new Intl.DateTimeFormat("en",{weekday:"short",month:"short",day:"numeric"}).format(now);
  }
  async function boot() {
    await loadData(); renderApps(); initWindows(); initLauncher(); initCommands(); initTerminal(); clock();
    setInterval(clock,15000);
    const status=$("#boot-status");
    status.textContent="Loading desktop…";
    setTimeout(()=>{$("#boot").classList.add("boot-done");$("#desktop").classList.remove("hidden");},550);
    setTimeout(()=>$("#boot").remove(),1100);
    if(window.matchMedia("(max-width: 720px)").matches) openWindow("about");
  }
  boot();
})();