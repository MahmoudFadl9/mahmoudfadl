import {buildMailto,mailtoSubject} from './mailto.js';
import {icon} from './icons.js';
import {startMotion} from './motion.js';

const app=document.querySelector('#app');
const dialog=document.querySelector('#project');
const detail=document.querySelector('#detail');
const closeButton=dialog.querySelector('.close');
const showreelDialog=document.querySelector('#showreelDialog');
const showreelPlayer=showreelDialog.querySelector('video');
const soundStatus=document.querySelector('#soundStatus');
const systemReducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const savedEffects=localStorage.getItem('portfolio-effects');
let effectsEnabled=savedEffects==='on'||(savedEffects!=='off'&&!systemReducedMotion);
let soundEnabled=localStorage.getItem('portfolio-sound')!=='off';
let audioUnlocked=false,audioContext,masterGain,lastHoverAt=0,ambientVoices=[],ambientGain,ambientTimer,ambientTexture;
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl=value=>{try{const url=new URL(value,location.origin);return ['http:','https:'].includes(url.protocol)?esc(value):'#';}catch{return '#';}};

const soundIcon=()=>soundEnabled
  ?'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6a8 8 0 0 1 0 12"/></svg>'
  :'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="m17 9 5 6m0-6-5 6"/></svg>';
const soundLabel=()=>soundEnabled?(lang==='ar'?'إيقاف الصوت':'Turn sound off'):(lang==='ar'?'تشغيل الصوت':'Turn sound on');
function syncSoundToggle(){
  const button=document.querySelector('.sound-toggle');
  if(!button)return;
  button.disabled=!(window.AudioContext||window.webkitAudioContext);
  button.innerHTML=soundIcon();
  button.setAttribute('aria-pressed',String(soundEnabled));
  const label=button.disabled?(lang==='ar'?'الصوت غير مدعوم':'Sound unavailable'):soundLabel();
  button.setAttribute('aria-label',label);
  button.title=label;
}
function audio(){
  if(!soundEnabled||!audioUnlocked)return null;
  const AudioContextClass=window.AudioContext||window.webkitAudioContext;
  if(!AudioContextClass)return null;
  try{
    if(!audioContext){
      audioContext=new AudioContextClass();
      masterGain=audioContext.createGain();
      masterGain.gain.value=.65;
      masterGain.connect(audioContext.destination);
    }
    if(audioContext.state==='suspended')audioContext.resume().catch(()=>{});
    return audioContext;
  }catch{return null;}
}
function tone({from,to,duration,peak,attack=0.006,delay=0,type='sine'}){
  const context=audio();
  if(!context)return;
  const now=context.currentTime+delay;
  const oscillator=context.createOscillator(),gain=context.createGain();
  oscillator.type=type;
  oscillator.frequency.setValueAtTime(from,now);
  oscillator.frequency.exponentialRampToValueAtTime(to,now+duration);
  gain.gain.setValueAtTime(0.0001,now);
  gain.gain.exponentialRampToValueAtTime(peak*.35,now+attack);
  gain.gain.exponentialRampToValueAtTime(0.0001,now+duration);
  oscillator.connect(gain).connect(masterGain);
  oscillator.start(now);
  oscillator.stop(now+duration+0.005);
}
function startAmbient(){
  const context=audio();
  if(!context||document.hidden||ambientVoices.length)return;
  ambientGain=context.createGain();
  ambientGain.gain.setValueAtTime(0,context.currentTime);
  ambientGain.gain.linearRampToValueAtTime(.012,context.currentTime+4);
  ambientGain.connect(masterGain);
  // A soft, slowly breathing room tone, rather than a sequence of alert sounds.
  const chords=[[55,82.41,110],[58.27,87.31,116.54],[49,73.42,98],[55,82.41,110]];
  chords[0].forEach((frequency,index)=>{
    const voice=context.createOscillator(),level=context.createGain();
    voice.type='sine';
    voice.frequency.value=frequency;
    level.gain.value=index===0?.42:index===1?.22:.16;
    voice.connect(level).connect(ambientGain);
    voice.start();
    ambientVoices.push(voice);
  });
  if(context.createBuffer&&context.createBufferSource&&context.createBiquadFilter){
    const length=Math.round(context.sampleRate*3);
    const buffer=context.createBuffer(1,length,context.sampleRate);
    const samples=buffer.getChannelData(0);
    let softened=0;
    for(let i=0;i<length;i++){
      softened=(softened+(Math.random()*2-1)*.035)/1.035;
      samples[i]=softened;
    }
    const source=context.createBufferSource(),filter=context.createBiquadFilter(),level=context.createGain();
    source.buffer=buffer;source.loop=true;
    filter.type='lowpass';filter.frequency.value=850;
    level.gain.value=.11;
    source.connect(filter).connect(level).connect(ambientGain);
    source.start();ambientTexture=source;
  }
  let chord=0;
  ambientTimer=setInterval(()=>{
    if(!soundEnabled||document.hidden)return;
    chord=(chord+1)%chords.length;
    const now=context.currentTime;
    ambientVoices.forEach((voice,index)=>voice.frequency.exponentialRampToValueAtTime(chords[chord][index],now+7));
    ambientGain.gain.cancelScheduledValues(now);
    ambientGain.gain.setValueAtTime(ambientGain.gain.value,now);
    ambientGain.gain.linearRampToValueAtTime(chord%2?.009:.012,now+6);
  },11500);
}
function stopAmbient(){
  clearInterval(ambientTimer);ambientTimer=undefined;
  if(!audioContext||!ambientVoices.length)return;
  const voices=ambientVoices;
  ambientVoices=[];
  const texture=ambientTexture;
  ambientTexture=undefined;
  ambientGain.gain.cancelScheduledValues(audioContext.currentTime);
  ambientGain.gain.setTargetAtTime(0,audioContext.currentTime,.25);
  voices.forEach(voice=>{voice.stop(audioContext.currentTime+1.2);voice.onended=()=>voice.disconnect();});
  if(texture){texture.stop(audioContext.currentTime+1.2);texture.onended=()=>texture.disconnect();}
  ambientGain=undefined;
}
function playHover(){
  if(!soundEnabled)return;
  const now=performance.now();
  if(now-lastHoverAt<170)return;
  lastHoverAt=now;
  tone({from:720,to:540,duration:0.075,peak:0.026,attack:0.006});
  tone({from:1080,to:810,duration:0.095,peak:0.009,attack:0.009,delay:0.012});
}
function playTap(){
  tone({from:210,to:92,duration:0.105,peak:0.055,attack:0.005});
  tone({from:660,to:330,duration:0.045,peak:0.012,attack:0.003});
}
function playSwell(){
  tone({from:220,to:390,duration:0.48,peak:0.024,attack:0.13});
  tone({from:330,to:590,duration:0.42,peak:0.013,attack:0.15,delay:0.05});
}
function playArrival(){
  tone({from:310,to:470,duration:0.18,peak:0.014,attack:0.055});
  tone({from:465,to:705,duration:0.2,peak:0.008,attack:0.065,delay:0.045});
}
function playNavigate(){
  tone({from:480,to:740,duration:0.085,peak:0.015,attack:0.009});
  tone({from:720,to:980,duration:0.07,peak:0.005,attack:0.012,delay:0.035});
}
function playReveal(open){
  tone({from:open?290:520,to:open?490:280,duration:0.19,peak:0.019,attack:0.035});
  tone({from:open?440:660,to:open?660:390,duration:0.15,peak:0.006,attack:0.035,delay:0.035});
}
function playTransport(playing){
  tone({from:playing?360:550,to:playing?630:320,duration:0.13,peak:0.017,attack:0.018});
}
function playChoice(){
  tone({from:430,to:575,duration:0.09,peak:0.014,attack:0.008});
  tone({from:645,to:770,duration:0.075,peak:0.004,attack:0.012,delay:0.018});
}
let lastFloatSound=0;
function playFloat(){
  const now=performance.now();
  if(now-lastFloatSound<650)return;
  lastFloatSound=now;
  tone({from:360,to:300,duration:0.22,peak:0.004,attack:0.06});
}
function playClose(){tone({from:410,to:230,duration:0.11,peak:0.013,attack:0.012});}
function unlockAudio(){
  if(audioUnlocked)return;
  audioUnlocked=true;
  document.querySelector('.sound-entry')?.remove();
  if(soundEnabled){audio();startAmbient();}
}
document.addEventListener('pointerdown',unlockAudio,{once:true,capture:true});
document.addEventListener('touchend',unlockAudio,{once:true,capture:true});
document.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' ')unlockAudio();},{capture:true});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){audioContext?.suspend().catch(()=>{});}
  else if(soundEnabled&&audioUnlocked){audioContext?.resume().catch(()=>{});startAmbient();}
});
app.addEventListener('pointerover',event=>{
  if(event.pointerType!=='mouse'&&event.pointerType!=='pen')return;
  const control=event.target.closest('header nav a,header .pill,.mobile-nav a,.hero .actions a,.showreel-open,.project-archive>summary,.faq summary');
  if(control&&!control.contains(event.relatedTarget))playHover();
});

let content,lang=initialLang(),briefChoices=[],briefStepIndex=0;

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
  return `<button class="project-card" type="button" data-project="${index}" data-cursor="${lang==='ar'?'شاهد':'WATCH'}" aria-label="${esc(project[lang].title)}"><div class="project-image"><img src="${safeUrl(project.image)}" alt="${esc(project[lang].subtitle||project.client)}" loading="lazy" decoding="async"><span class="client">${esc(project.client)}</span><span class="watch">${icon('play')} ${esc(t.play)}</span><span class="circle-arrow" aria-hidden="true">${icon('arrow')}</span></div><div class="project-caption"><div><h3>${esc(project[lang].title)}</h3><p>${esc(project[lang].subtitle)}</p></div><span class="project-number">${String(index+1).padStart(2,'0')}</span></div><span class="project-type">${esc(project.type)}</span></button>`;
}

function briefQuestion(t,step){
  const base=t.briefQuestions[step];
  const previous=briefChoices[step-1];
  const branch=step>0?t.briefBranches?.[step-1]?.[previous]:null;
  return {q:branch||base.q,options:base.options};
}
function renderBriefFlow(){
  const t=content[lang],flow=document.querySelector('#briefFlow');
  if(!flow)return;
  const done=briefChoices.length===7&&briefStepIndex===7;
  const count=done?7:briefStepIndex+1;
  const back=briefStepIndex>0?`<button class="brief-back" type="button" data-brief-back>${lang==='ar'?'← السؤال السابق':'← Previous question'}</button>`:'';
  if(done){
    const recap=t.briefQuestions.map((_,index)=>{
      const question=briefQuestion(t,index);
      return `<li><span>${esc(question.q)}</span><strong>${esc(question.options[briefChoices[index]])}</strong></li>`;
    }).join('');
    flow.innerHTML=`<p class="brief-count">${lang==='ar'?'اكتمل المسار':'BRIEF COMPLETE'} · 07 / 07</p><div class="brief-progress" role="progressbar" aria-valuenow="7" aria-valuemin="0" aria-valuemax="7"><i style="width:100%"></i></div><h3>${lang==='ar'?'هذه صورة مشروعك حتى الآن':'Your project, at a glance'}</h3><ol class="brief-review">${recap}</ol>${back}`;
  }else{
    const question=briefQuestion(t,briefStepIndex);
    flow.innerHTML=`<p class="brief-count">${lang==='ar'?'السؤال':'QUESTION'} ${String(count).padStart(2,'0')} / 07</p><div class="brief-progress" role="progressbar" aria-valuenow="${briefStepIndex}" aria-valuemin="0" aria-valuemax="7"><i style="width:${briefStepIndex/7*100}%"></i></div><h3 id="briefQuestion">${esc(question.q)}</h3><div class="brief-options" role="group" aria-labelledby="briefQuestion">${question.options.map((option,index)=>`<button type="button" data-brief-choice="${index}"${briefChoices[briefStepIndex]===index?' class="selected"':''}><span>${String(index+1).padStart(2,'0')}</span>${esc(option)}</button>`).join('')}</div>${back}`;
  }
  const extra=document.querySelector('.brief-extra'),send=document.querySelector('.brief-send');
  extra.hidden=!done;send.hidden=!done;
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
<header><a class="brand" href="#"><img class="brand-mark" src="/assets/mahmoud-mark-transparent.svg" alt=""><span>${esc(t.name)}<small>${esc(d.tagline)}</small></span></a><nav aria-label="${esc(t.navWork)}">${headerNav}</nav><div class="header-actions"><button class="effects-toggle" type="button" aria-pressed="${effectsEnabled}" aria-label="${effectsEnabled?(lang==='ar'?'إيقاف التأثيرات':'Turn effects off'):(lang==='ar'?'تشغيل التأثيرات':'Turn effects on')}" title="${effectsEnabled?(lang==='ar'?'إيقاف التأثيرات':'Turn effects off'):(lang==='ar'?'تشغيل التأثيرات':'Turn effects on')}">${icon('spark')} <span>${effectsEnabled?(lang==='ar'?'الحركة تعمل':'Motion on'):(lang==='ar'?'شغّل الحركة':'Motion off')}</span></button><button class="sound-toggle" type="button" aria-pressed="${soundEnabled}" aria-label="${soundLabel()}" title="${soundLabel()}">${soundIcon()}</button><button class="lang" type="button" aria-label="${lang==='en'?'التبديل إلى العربية':'Switch to English'}">${lang==='en'?'العربية':'EN'}</button><a class="pill small" href="#contact">${esc(t.cta)} ${icon('arrow')}</a></div></header>
<nav class="mobile-nav" aria-label="${esc(t.cta)}">${mobileNav}</nav>
<main>
<section class="hero"><div class="hero-copy"><p class="eyebrow"><i></i>${esc(t.eyebrow)}</p><h1>${esc(t.heroTop)}<br><em>${esc(t.heroBottom)}</em></h1><p class="intro">${esc(t.intro)}</p><div class="actions"><a class="pill" href="#work">${esc(t.viewWork)} ${icon('down')}</a><a class="text-link" href="${safeUrl(content.calendar)}" target="_blank" rel="noopener">${icon('calendar')} ${esc(t.book)} ${icon('arrow')}</a></div>${soundEnabled&&!audioUnlocked?`<button class="sound-entry" type="button">${lang==='ar'?'✦ المس لتبدأ التجربة بالصوت':'✦ Tap to enter with sound'}</button>`:''}</div>
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
<form id="brief"><div class="form-row"><label>${esc(t.yourName)}<input name="name" autocomplete="name" required maxlength="100"></label><label>${esc(t.yourEmail)}<input name="email" type="email" autocomplete="email" required maxlength="200"></label></div><fieldset class="brief-questions"><legend>${esc(t.yourBrief)}</legend><div id="briefFlow" aria-live="polite"></div></fieldset><div class="brief-extra" hidden><label>${esc(t.briefNote||'Anything else I should know? (optional)')}<textarea name="brief" placeholder="${esc(t.briefHint)}" rows="3" maxlength="1200"></textarea></label><div class="form-row"><label>${esc(t.yourDeadline)}<input name="deadline" type="date"></label><label>${esc(t.yourBudget)}<input name="budget" type="text" maxlength="60" inputmode="text"></label></div></div><button class="pill brief-send" type="submit" hidden>${esc(t.send)} ${icon('arrow')}</button><p id="formStatus" class="form-status" role="status" aria-live="polite"></p><small>${esc(t.formNote)}</small></form></section>
</main><footer><a class="brand" href="#" aria-label="${esc(t.name)}"><img class="brand-mark" src="/assets/mahmoud-mark-transparent.svg" alt=""></a><span>© ${new Date().getFullYear()} ${esc(t.name)}</span><span>${esc(t.footer)}</span><a href="/admin" target="_blank" rel="noopener">${lang==='ar'?'لوحة الإدارة':'Admin'} ${icon('arrow')}</a></footer>
`;
}

function wire(){
  const t=content[lang];
  syncSoundToggle();
  document.querySelector('.lang').onclick=()=>{
    playNavigate();
    lang=lang==='en'?'ar':'en';
    localStorage.setItem('portfolio-language',lang);
    const address=new URL(location.href);address.searchParams.set('lang',lang);history.replaceState(null,'',address);
    render();wire();
  };
  document.querySelector('.effects-toggle').onclick=()=>{
    playTransport(!effectsEnabled);
    effectsEnabled=!effectsEnabled;
    localStorage.setItem('portfolio-effects',effectsEnabled?'on':'off');
    render();wire();
    app.classList.remove('site-enter');
    if(effectsEnabled)requestAnimationFrame(()=>app.classList.add('site-enter'));
  };
  document.querySelector('.sound-toggle').onclick=()=>{
    soundEnabled=!soundEnabled;
    localStorage.setItem('portfolio-sound',soundEnabled?'on':'off');
    if(soundEnabled){
      unlockAudio();
      if(masterGain)masterGain.gain.setTargetAtTime(1,audioContext.currentTime,0.01);
      startAmbient();
      playArrival();
    }else{
      stopAmbient();
      document.querySelector('.sound-entry')?.remove();
      if(masterGain)masterGain.gain.setTargetAtTime(0,audioContext.currentTime,0.01);
    }
    syncSoundToggle();
    soundStatus.textContent=soundEnabled?(lang==='ar'?'الصوت يعمل':'Sound on'):(lang==='ar'?'الصوت مكتوم':'Sound muted');
  };
  document.querySelectorAll('[data-project]').forEach(card=>{card.onclick=()=>{playTap();openProject(Number(card.dataset.project));};});
  const hero=document.querySelector('#heroVideo'),motion=document.querySelector('#motion'),filmMedia=document.querySelector('.film-media');
  const sync=()=>{
    motion.innerHTML=icon(hero.paused?'play':'pause');
    motion.setAttribute('aria-label',hero.paused?content[lang].resume:content[lang].pause);
    filmMedia.classList.toggle('is-playing',!hero.paused&&hero.readyState>=2);
  };
  hero.onplaying=sync;hero.onpause=sync;hero.onwaiting=()=>filmMedia.classList.remove('is-playing');hero.onerror=()=>filmMedia.classList.remove('is-playing');sync();
  motion.onclick=()=>{playTransport(hero.paused);hero.paused?hero.play().catch(sync):hero.pause();};
  document.querySelector('.showreel-open').onclick=()=>{
    playSwell();
    showreelDialog.setAttribute('aria-label',lang==='ar'?'الشو ريل':'Showreel');
    showreelDialog.querySelector('.close').setAttribute('aria-label',t.close||'Close');
    showreelDialog.showModal();
    document.body.classList.add('modal-open');
    showreelPlayer.play().catch(()=>{});
  };
  app.querySelectorAll('a[href^="#"]').forEach(link=>{link.addEventListener('click',()=>playNavigate());});
  app.querySelectorAll('.project-archive,.faq details').forEach(section=>{
    section.querySelector('summary')?.addEventListener('click',()=>playReveal(!section.open));
  });
  renderBriefFlow();
  document.querySelector('#briefFlow').onclick=event=>{
    const choice=event.target.closest('[data-brief-choice]');
    if(choice){
      const selected=Number(choice.dataset.briefChoice);
      if(briefChoices[briefStepIndex]!==selected)briefChoices.length=briefStepIndex;
      briefChoices[briefStepIndex]=selected;
      briefStepIndex++;
      playChoice();
      renderBriefFlow();
      return;
    }
    if(event.target.closest('[data-brief-back]')){
      briefStepIndex=Math.max(0,briefStepIndex-1);
      playClose();
      renderBriefFlow();
    }
  };
  document.querySelector('#brief').onsubmit=event=>{
    event.preventDefault();
    if(briefChoices.length!==7){
      document.querySelector('#formStatus').textContent=lang==='ar'?'أكمل الأسئلة السبعة أولًا.':'Please complete the seven questions first.';
      document.querySelector('#briefFlow').scrollIntoView({block:'center',behavior:'smooth'});
      return;
    }
    const values=Object.fromEntries(new FormData(event.target).entries());
    const questions=t.briefQuestions.map((_,index)=>{
      const question=briefQuestion(t,index);
      values[`answer${index+1}`]=question.options[briefChoices[index]];
      return {q:question.q};
    });
    document.querySelector('#formStatus').textContent=t.mailNotice||'';
    location.href=buildMailto({email:content.email,subject:mailtoSubject(t.mailSubject||'Project enquiry',values.name,lang),lang,from:values,questions});
  };
  startMotion({lang,enabled:effectsEnabled,onFloat:playFloat});
}

function openProject(index){
  const project=content.projects[index],t=content[lang];
  detail.innerHTML=`<p class="eyebrow">${esc(project.client)} / ${esc(project.type)}</p><h2>${esc(project[lang].title)}</h2><video controls playsinline preload="metadata" poster="${safeUrl(project.image)}" src="${safeUrl(project.video)}"></video><p class="detail-hint">${esc(t.mediaNote||'')}</p><div class="detail-columns"><div><p class="eyebrow">${esc(t.storyLabel)}</p><p>${esc(project[lang].story)}</p></div><div><p class="eyebrow">${esc(t.roleLabel)}</p><p>${esc(project[lang].role)}</p>${project.url?`<a class="text-link" href="${safeUrl(project.url)}" target="_blank" rel="noopener">${esc(t.external)} ${icon('arrow')}</a>`:''}</div></div>`;
  dialog.setAttribute('aria-label',project[lang].title);
  dialog.showModal();
  document.body.classList.add('modal-open');
}

closeButton.onclick=()=>{playClose();dialog.close();};
dialog.onclick=event=>{if(event.target===dialog)dialog.close();};
dialog.onclose=()=>{detail.querySelector('video')?.pause();document.body.classList.remove('modal-open');};
showreelDialog.querySelector('.close').onclick=()=>{playClose();showreelPlayer.pause();showreelDialog.close();};
showreelDialog.onclick=event=>{if(event.target===showreelDialog){showreelPlayer.pause();showreelDialog.close();}};
showreelDialog.onclose=()=>{showreelPlayer.pause();showreelPlayer.currentTime=0;document.body.classList.remove('modal-open');};

async function loadContent(){
  let lastError;
  for(const source of ['/api/content','/content.json']){
    try{
      const response=await fetch(source,{cache:'no-store'});
      if(!response.ok)throw new Error(`${source}: HTTP ${response.status}`);
      const data=await response.json();
      if(!Array.isArray(data?.projects)||!data.en||!data.ar)throw new Error(`${source}: invalid content`);
      return data;
    }catch(error){lastError=error;}
  }
  throw lastError;
}

async function boot(){
  try{
    content=await loadContent();
    render();wire();
    if(effectsEnabled)requestAnimationFrame(()=>app.classList.add('site-enter'));
  }catch(error){
    console.error(error);
    app.innerHTML='<div class="load-error"><h1>Mahmoud Fadl — Motion &amp; Story</h1><p>Unable to load the portfolio content. / تعذّر تحميل محتوى الموقع.</p><p><a class="text-link" href="mailto:mahmoudfadlalnabi@gmail.com">mahmoudfadlalnabi@gmail.com</a></p></div>';
  }
}
boot();
