import {buildMailto,mailtoSubject} from './mailto.js';
import {icon} from './icons.js';
import {startMotion} from './motion.js';

const app=document.querySelector('#app');
const dialog=document.querySelector('#project');
const detail=document.querySelector('#detail');
const closeButton=dialog.querySelector('.close');
const showreelDialog=document.querySelector('#showreelDialog');
const showreelPlayer=showreelDialog.querySelector('video');
const systemReducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const savedEffects=localStorage.getItem('portfolio-effects');
let effectsEnabled=savedEffects==='on'||(savedEffects!=='off'&&!systemReducedMotion);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl=value=>{try{const url=new URL(value,location.origin);return ['http:','https:'].includes(url.protocol)?esc(value):'#';}catch{return '#';}};

let content,lang=initialLang();

function initialLang(){
  const requested=new URLSearchParams(location.search).get('lang');
  if(requested==='ar'||requested==='en')return requested;
  return localStorage.getItem('portfolio-language')==='ar'?'ar':'en';
}

/* Decorative copy ships with sensible fallbacks so an older content.json still renders. */
function decorations(t){
  const ticker=Array.isArray(t.ticker)&&t.ticker.length?t.ticker:['MOTION DESIGN','VISUAL STORYTELLING','AI VIDEO','EDITING & SOUND'];
  return {
    tagline:t.tagline||'MOTION & STORY',
    framesLabel:t.framesLabel||'01 / SELECTED FRAMES',
    filmCaption:t.filmCaption||'SELECTED WORK',
    filmCaptionText:t.filmCaptionText||'Five stories in motion.',
    badgeTitle:t.badgeTitle||'DESIGNED TO MOVE.',
    badgeSub:t.badgeSub||'Built to connect.',
    stageNote:t.stageNote||'MOTION / AI / VISUAL STORYTELLING',
    processLabel:t.processLabel||'THE PROCESS',
    skip:t.skip||'Skip to work',
    close:t.close||'Close',
    ticker
  };
}

function projectCard(project,index,t){
  return `<button class="project-card" type="button" data-project="${index}" data-cursor="${lang==='ar'?'شاهد':'VIEW'}" aria-label="${esc(project[lang].title)}"><div class="project-image"><img src="${safeUrl(project.image)}" alt="${esc(project[lang].subtitle||project.client)}" loading="lazy" decoding="async"><span class="client">${esc(project.client)}</span><span class="watch">${icon('play')} ${esc(t.play)}</span><span class="circle-arrow" aria-hidden="true">${icon('arrow')}</span></div><div class="project-caption"><div><h3>${esc(project[lang].title)}</h3><p>${esc(project[lang].subtitle)}</p></div><span class="project-number">${String(index+1).padStart(2,'0')}</span></div><span class="project-type">${esc(project.type)}</span></button>`;
}

function render(){
  const t=content[lang],d=decorations(t);
  const visibleProjects=content.projects.map((project,index)=>({project,index})).filter(({project})=>project.visible!==false);
  document.documentElement.classList.toggle('effects-on',effectsEnabled);
  document.documentElement.classList.toggle('effects-off',!effectsEnabled);
  document.documentElement.lang=lang;
  document.documentElement.dir=lang==='ar'?'rtl':'ltr';
  document.title=`${t.name} — ${d.tagline}`;
  document.querySelector('meta[name="description"]')?.setAttribute('content',`${t.name} — ${t.aboutSmall||t.eyebrow}. ${t.intro}`.slice(0,300));
  closeButton.setAttribute('aria-label',d.close);
  const headerNav=`<a href="#work">${esc(t.navWork)}</a><a href="#services">${esc(t.navServices)}</a><a href="#about">${esc(t.navAbout)}</a>`;
  const mobileNav=`${headerNav}<a href="#contact">${esc(t.cta)}</a>`;
  app.innerHTML=`
<a class="skip" href="#work">${esc(d.skip)}</a>
<header><a class="brand" href="#"><img class="brand-mark" src="/assets/mahmoud-mark-transparent.svg" alt=""><span>${esc(t.name)}<small>${esc(d.tagline)}</small></span></a><nav aria-label="${esc(t.navWork)}">${headerNav}</nav><div class="header-actions"><button class="effects-toggle" type="button" aria-pressed="${effectsEnabled}" aria-label="${effectsEnabled?(lang==='ar'?'إيقاف التأثيرات':'Turn effects off'):(lang==='ar'?'تشغيل التأثيرات':'Turn effects on')}" title="${effectsEnabled?(lang==='ar'?'إيقاف التأثيرات':'Turn effects off'):(lang==='ar'?'تشغيل التأثيرات':'Turn effects on')}">${icon('spark')} <span>${effectsEnabled?(lang==='ar'?'الحركة تعمل':'Motion on'):(lang==='ar'?'شغّل الحركة':'Motion off')}</span></button><button class="lang" type="button" aria-label="${lang==='en'?'التبديل إلى العربية':'Switch to English'}">${lang==='en'?'العربية':'EN'}</button><a class="pill small" href="#contact">${esc(t.cta)} ${icon('arrow')}</a></div></header>
<nav class="mobile-nav" aria-label="${esc(t.cta)}">${mobileNav}</nav>
<main>
<section class="hero"><div class="hero-copy"><p class="eyebrow"><i></i>${esc(t.eyebrow)}</p><h1>${esc(t.heroTop)}<br><em>${esc(t.heroBottom)}</em></h1><p class="intro">${esc(t.intro)}</p><div class="actions"><a class="pill" href="#work">${esc(t.viewWork)} ${icon('down')}</a><a class="text-link" href="${safeUrl(content.calendar)}" target="_blank" rel="noopener">${icon('calendar')} ${esc(t.book)} ${icon('arrow')}</a></div></div>
<div class="hero-stage"><div class="orbits" aria-hidden="true"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div></div>
<div class="film-window"><div class="film-toolbar"><span>${esc(d.framesLabel)}</span><span>MF®</span></div><div class="film-media"><img class="film-poster" src="/assets/showreel-five.webp" alt=""><video id="heroVideo" muted loop playsinline preload="auto" poster="/assets/showreel-five.webp" ${effectsEnabled?'autoplay':''} src="/assets/showreel-five.mp4"></video><button class="showreel-open" type="button" aria-label="${lang==='ar'?'شاهد الشو ريل':'Watch the showreel'}">${icon('play')} <span>${lang==='ar'?'شاهد الشو ريل':'Watch showreel'}</span></button></div><div class="film-bottom"><span>${esc(d.filmCaption)}<br><b>${esc(d.filmCaptionText)}</b></span><button id="motion" type="button" aria-label="${esc(t.pause)}">${icon('pause')}</button></div></div>
<div class="glass-badge"><span class="star" aria-hidden="true">✳</span><div>${esc(d.badgeTitle)}<br><strong>${esc(d.badgeSub)}</strong></div></div>
<div class="stage-note">${esc(d.stageNote)}</div></div>
<div class="hero-foot"><span>${esc(t.since)}</span><span>${esc(t.remote)} <i class="dot"></i></span><a href="#work" aria-label="${esc(t.viewWork)}">${icon('down')}</a></div></section>
<div class="ticker" aria-hidden="true"><div class="ticker-track">${[0,1].map(()=>`<span>${d.ticker.map(item=>`<span>${esc(item)}</span>`).join('<b>✳</b>')}</span>`).join('')}</div></div>
<section id="work" class="section"><div class="section-heading"><div><p class="eyebrow">01 / ${esc(t.navWork)}</p><h2>${esc(t.selected)}</h2></div><p>${esc(t.workIntro)}</p></div><div class="projects">${visibleProjects.slice(0,3).map(({project,index})=>projectCard(project,index,t)).join('')}</div>${visibleProjects.length>3?`<details class="project-archive"><summary>${lang==='ar'?'اعرض كل الفيديوهات':'View all videos'} <span>${String(visibleProjects.length-3).padStart(2,'0')} ${icon('down')}</span></summary><div class="archive-grid">${visibleProjects.slice(3).map(({project,index})=>projectCard(project,index,t)).join('')}</div></details>`:''}</section>
<section id="services" class="section services"><div class="section-heading"><div><p class="eyebrow">02 / ${esc(t.navServices)}</p><h2>${esc(t.expertise)}</h2></div><span class="big-star" aria-hidden="true">✳</span></div><div class="service-grid">${t.services.map((service,index)=>`<article><span class="service-num">0${index+1} /</span><h3>${esc(service.title)}</h3><p>${esc(service.desc)}</p><small>${esc(service.tag)}</small><strong>${esc(service.price)} ${icon('arrow')}</strong></article>`).join('')}</div></section>
<section id="about" class="section about"><div class="portrait"><img src="/assets/mahmoud.webp" loading="lazy" decoding="async" alt="${esc(t.name)}"><span>${esc(t.since)} ↗</span></div><div><p class="eyebrow">03 / ${esc(t.navAbout)}</p><h2>${esc(t.aboutTitle)}</h2><p>${esc(t.about)}</p><div class="signature">${esc(t.name)}<span aria-hidden="true">✳</span></div><small>${esc(t.aboutSmall)}</small></div></section>
<section class="section process"><p class="eyebrow">04 / ${esc(d.processLabel)}</p><h2>${esc(t.processTitle)}</h2><div class="steps">${t.steps.map((step,index)=>`<article><span>0${index+1}</span><h3>${esc(step.title)}</h3><p>${esc(step.desc)}</p></article>`).join('')}</div></section>
<section class="section faq"><h2>${esc(t.faqTitle)}</h2><div>${t.faqs.map(item=>`<details><summary>${esc(item.q)}<span aria-hidden="true">+</span></summary><p>${esc(item.a)}</p></details>`).join('')}</div></section>
<section id="contact" class="section contact"><div><p class="eyebrow"><i></i> ${esc(t.cta)}</p><h2>${esc(t.contactTitle)}</h2><p>${esc(t.contactIntro)}</p><a class="email" href="mailto:${esc(content.email)}">${icon('mail')} ${esc(content.email)} ${icon('arrow')}</a><div class="actions"><a class="text-link" href="https://wa.me/${esc(String(content.phone).replace(/\D/g,''))}" target="_blank" rel="noopener">${icon('message')} ${esc(t.whatsapp)} ${icon('arrow')}</a><a class="text-link" href="${safeUrl(content.calendar)}" target="_blank" rel="noopener">${icon('calendar')} ${esc(t.book)} ${icon('arrow')}</a></div></div>
<form id="brief"><div class="form-row"><label>${esc(t.yourName)}<input name="name" autocomplete="name" required maxlength="100"></label><label>${esc(t.yourEmail)}<input name="email" type="email" autocomplete="email" required maxlength="200"></label></div><label>${esc(t.yourBrief)}<textarea name="brief" placeholder="${esc(t.briefHint)}" required rows="4" maxlength="3000"></textarea></label><div class="form-row"><label>${esc(t.yourDeadline)}<input name="deadline" type="date"></label><label>${esc(t.yourBudget)}<input name="budget" type="text" maxlength="60" inputmode="text"></label></div><button class="pill" type="submit">${esc(t.send)} ${icon('arrow')}</button><p id="formStatus" class="form-status" role="status" aria-live="polite"></p><small>${esc(t.formNote)}</small></form></section>
</main><footer><a class="brand" href="#" aria-label="${esc(t.name)}"><img class="brand-mark" src="/assets/mahmoud-mark-transparent.svg" alt=""></a><span>© ${new Date().getFullYear()} ${esc(t.name)}</span><span>${esc(t.footer)}</span><a href="/admin" target="_blank" rel="noopener">${lang==='ar'?'لوحة الإدارة':'Admin'} ${icon('arrow')}</a></footer>
`;
}

function wire(){
  const t=content[lang];
  document.querySelector('.lang').onclick=()=>{
    lang=lang==='en'?'ar':'en';
    localStorage.setItem('portfolio-language',lang);
    const address=new URL(location.href);address.searchParams.set('lang',lang);history.replaceState(null,'',address);
    render();wire();
  };
  document.querySelector('.effects-toggle').onclick=()=>{
    effectsEnabled=!effectsEnabled;
    localStorage.setItem('portfolio-effects',effectsEnabled?'on':'off');
    render();wire();
    app.classList.remove('site-enter');
    if(effectsEnabled)requestAnimationFrame(()=>app.classList.add('site-enter'));
  };
  document.querySelectorAll('[data-project]').forEach(card=>{card.onclick=()=>openProject(Number(card.dataset.project));});
  const hero=document.querySelector('#heroVideo'),motion=document.querySelector('#motion'),filmMedia=document.querySelector('.film-media');
  const sync=()=>{
    motion.innerHTML=icon(hero.paused?'play':'pause');
    motion.setAttribute('aria-label',hero.paused?content[lang].resume:content[lang].pause);
    filmMedia.classList.toggle('is-playing',!hero.paused&&hero.readyState>=2);
  };
  hero.onplaying=sync;hero.onpause=sync;hero.onwaiting=()=>filmMedia.classList.remove('is-playing');hero.onerror=()=>filmMedia.classList.remove('is-playing');sync();
  motion.onclick=()=>{hero.paused?hero.play().catch(sync):hero.pause();};
  document.querySelector('.showreel-open').onclick=()=>{
    showreelDialog.setAttribute('aria-label',lang==='ar'?'الشو ريل':'Showreel');
    showreelDialog.querySelector('.close').setAttribute('aria-label',t.close||'Close');
    showreelDialog.showModal();
    document.body.classList.add('modal-open');
    showreelPlayer.play().catch(()=>{});
  };
  document.querySelector('#brief').onsubmit=event=>{
    event.preventDefault();
    const values=Object.fromEntries(new FormData(event.target).entries());
    document.querySelector('#formStatus').textContent=t.mailNotice||'';
    location.href=buildMailto({email:content.email,subject:mailtoSubject(t.mailSubject||'Project enquiry',values.name,lang),lang,from:values});
  };
  startMotion({lang,enabled:effectsEnabled});
}

function openProject(index){
  const project=content.projects[index],t=content[lang];
  detail.innerHTML=`<p class="eyebrow">${esc(project.client)} / ${esc(project.type)}</p><h2>${esc(project[lang].title)}</h2><video controls playsinline preload="metadata" poster="${safeUrl(project.image)}" src="${safeUrl(project.video)}"></video><p class="detail-hint">${esc(t.mediaNote||'')}</p><div class="detail-columns"><div><p class="eyebrow">${esc(t.storyLabel)}</p><p>${esc(project[lang].story)}</p></div><div><p class="eyebrow">${esc(t.roleLabel)}</p><p>${esc(project[lang].role)}</p>${project.url?`<a class="text-link" href="${safeUrl(project.url)}" target="_blank" rel="noopener">${esc(t.external)} ${icon('arrow')}</a>`:''}</div></div>`;
  dialog.setAttribute('aria-label',project[lang].title);
  dialog.showModal();
  document.body.classList.add('modal-open');
}

closeButton.onclick=()=>dialog.close();
dialog.onclick=event=>{if(event.target===dialog)dialog.close();};
dialog.onclose=()=>{detail.querySelector('video')?.pause();document.body.classList.remove('modal-open');};
showreelDialog.querySelector('.close').onclick=()=>{showreelPlayer.pause();showreelDialog.close();};
showreelDialog.onclick=event=>{if(event.target===showreelDialog){showreelPlayer.pause();showreelDialog.close();}};
showreelDialog.onclose=()=>{showreelPlayer.pause();showreelPlayer.currentTime=0;document.body.classList.remove('modal-open');};

async function boot(){
  try{
    const response=await fetch('/api/content',{cache:'no-store'});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    content=await response.json();
    render();wire();
    if(effectsEnabled)requestAnimationFrame(()=>app.classList.add('site-enter'));
  }catch(error){
    console.error(error);
    app.innerHTML='<div class="load-error"><h1>Mahmoud Fadl — Motion &amp; Story</h1><p>Unable to load the portfolio content. / تعذّر تحميل محتوى الموقع.</p><p><a class="text-link" href="mailto:mahmoudfadlalnabi@gmail.com">mahmoudfadlalnabi@gmail.com</a></p></div>';
  }
}
boot();
