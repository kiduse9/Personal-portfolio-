(() => {
  "use strict";
  const form=document.querySelector("#contact-form");
  const feedback=document.querySelector("#contact-feedback");
  const emailLink=document.querySelector("#direct-email");
  let recipient="kiduse816@gmail.com";
  fetch("data.json",{cache:"no-store"}).then(response=>{
    if(!response.ok) throw new Error("Profile data unavailable");
    return response.json();
  }).then(data=>{
    const candidate=data?.profile?.email;
    if(typeof candidate==="string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate)){
      recipient=candidate;
      emailLink.href="mailto:"+recipient;
      emailLink.textContent=recipient;
    }
  }).catch(()=>{});
  form.addEventListener("submit",event=>{
    event.preventDefault();
    if(!form.reportValidity()) return;
    const fields=new FormData(form);
    const name=String(fields.get("name")||"").trim();
    const sender=String(fields.get("email")||"").trim();
    const subject=String(fields.get("subject")||"").trim();
    const message=String(fields.get("message")||"").trim();
    const body="From: "+name+" ("+sender+")\n\n"+message;
    const href="mailto:"+recipient+"?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body);
    feedback.textContent="Opening your email application…";
    window.location.href=href;
  });
})();