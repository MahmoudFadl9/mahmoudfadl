import {startDepthScene} from './depth-scene.js';

let dispose=()=>{};

export function startMotion({lang,enabled}){
  dispose();
  const cleaners=[];
  const on=(target,type,listener,options)=>{target.addEventListener(type,listener,options);cleaners.push(()=>target.removeEventListener(type,listener,options));};
  const fine=matchMedia('(pointer:fine) and (hover:hover)').matches;
  const reduced=!enabled;
  startDepthScene({enabled});
  const sceneNodes=[['.hero','hero'],['#work','work'],['#services','services'],['#about','about'],['.process','process'],['.faq','process'],['#contact','contact']]
    .map(([selector,name])=>[document.querySelector(selector),name]).filter(([node])=>node);

  let progress=document.querySelector('.scroll-meter');
  if(!progress){progress=document.createElement('div');progress.className='scroll-meter';progress.setAttribute('aria-hidden','true');document.body.append(progress);}

  let scrollPending=false;
  const scroll=()=>{
    if(scrollPending)return;
    scrollPending=true;
    requestAnimationFrame(()=>{
      scrollPending=false;
      const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
      progress.style.setProperty('--scroll-progress',`${Math.min(100,scrollY/max*100)}%`);
      const middle=innerHeight*.48;
      let nearest='hero',distance=Infinity;
      for(const [node,name] of sceneNodes){const rect=node.getBoundingClientRect(),d=Math.abs((rect.top+rect.bottom)/2-middle);if(d<distance){distance=d;nearest=name;}}
      document.body.dataset.scene=nearest;
      if(!reduced){
        const hero=document.querySelector('.hero');
        const stage=hero?.querySelector('.hero-stage');
        if(stage){
          const box=hero.getBoundingClientRect();
          const dive=Math.max(0,Math.min(1,-box.top/Math.max(1,box.height*.85)));
          stage.style.setProperty('--scroll-z',`${(-dive*230).toFixed(1)}px`);
          stage.style.setProperty('--scroll-y',`${(dive*42).toFixed(1)}px`);
        }
        const portrait=document.querySelector('.portrait');
        if(portrait){const box=portrait.getBoundingClientRect();if(box.bottom>0&&box.top<innerHeight)portrait.style.setProperty('--portrait-shift',`${((box.top+box.height/2-innerHeight/2)/innerHeight*-17).toFixed(1)}px`);}
      }
    });
  };
  on(window,'scroll',scroll,{passive:true});on(window,'resize',scroll,{passive:true});scroll();

  if(!reduced&&'IntersectionObserver' in window){
    const targets=[...document.querySelectorAll('.section-heading,.project-card,.service-grid article,.about>div,.steps article,.faq details,.contact>div,.contact form')];
    const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target);}}},{threshold:.09,rootMargin:'0px 0px -30px 0px'});
    targets.forEach((node,index)=>{node.style.setProperty('--reveal-delay',`${Math.min(index%4,3)*65}ms`);node.classList.add('reveal-ready');observer.observe(node);});
    cleaners.push(()=>observer.disconnect());
  }

  if(fine&&!reduced){
    document.body.classList.add('has-custom-pointer');
    const hero=document.querySelector('.hero-stage');
    if(hero){
      let heroRect,heroFrame=0,heroPoint;
      const refreshHero=()=>{heroRect=undefined;};
      const heroMove=event=>{
        heroPoint={x:event.clientX,y:event.clientY};
        if(heroFrame)return;
        heroFrame=requestAnimationFrame(()=>{
          heroFrame=0;
          const rect=heroRect||(heroRect=hero.getBoundingClientRect());
          const x=Math.max(-.5,Math.min(.5,(heroPoint.x-rect.left)/rect.width-.5));
          const y=Math.max(-.5,Math.min(.5,(heroPoint.y-rect.top)/rect.height-.5));
          hero.style.setProperty('--tilt-x',`${(-y*28).toFixed(2)}deg`);
          hero.style.setProperty('--tilt-y',`${(x*34).toFixed(2)}deg`);
          hero.style.setProperty('--film-x',`${(x*66).toFixed(1)}px`);
          hero.style.setProperty('--film-y',`${(y*46).toFixed(1)}px`);
          hero.style.setProperty('--pointer-z',`${(-y*210).toFixed(1)}px`);
          hero.style.setProperty('--badge-x',`${(-x*38).toFixed(1)}px`);
          hero.style.setProperty('--badge-y',`${(-y*28).toFixed(1)}px`);
          hero.style.setProperty('--depth-x',`${(x*44).toFixed(1)}px`);
          hero.style.setProperty('--depth-y',`${(y*32).toFixed(1)}px`);
          hero.style.setProperty('--depth-back-x',`${(-x*18).toFixed(1)}px`);
          hero.style.setProperty('--depth-back-y',`${(-y*14).toFixed(1)}px`);
        });
      };
      const heroReset=()=>{cancelAnimationFrame(heroFrame);heroFrame=0;for(const key of ['--tilt-x','--tilt-y','--film-x','--film-y','--pointer-z','--badge-x','--badge-y','--depth-x','--depth-y','--depth-back-x','--depth-back-y'])hero.style.removeProperty(key);};
      on(hero,'pointerenter',refreshHero);on(hero,'pointermove',heroMove);on(hero,'pointerleave',heroReset);
      on(window,'scroll',refreshHero,{passive:true});on(window,'resize',refreshHero,{passive:true});
      cleaners.push(()=>cancelAnimationFrame(heroFrame));
    }
    for(const card of document.querySelectorAll('.project-card')){
      const image=card.querySelector('.project-image');
      let cardRect,cardFrame=0,cardPoint;
      const move=event=>{
        cardPoint={x:event.clientX,y:event.clientY};
        if(cardFrame)return;
        cardFrame=requestAnimationFrame(()=>{
          cardFrame=0;
          const rect=cardRect||(cardRect=card.getBoundingClientRect());
          const x=Math.max(-.5,Math.min(.5,(cardPoint.x-rect.left)/rect.width-.5));
          const y=Math.max(-.5,Math.min(.5,(cardPoint.y-rect.top)/Math.max(1,image.offsetHeight)-.5));
          image.style.setProperty('--card-rx',`${(-y*15).toFixed(2)}deg`);
          image.style.setProperty('--card-ry',`${(x*17).toFixed(2)}deg`);
          image.style.setProperty('--glow-x',`${((x+.5)*100).toFixed(1)}%`);
          image.style.setProperty('--glow-y',`${((y+.5)*100).toFixed(1)}%`);
        });
      };
      const reset=()=>{cancelAnimationFrame(cardFrame);cardFrame=0;cardRect=undefined;image.style.removeProperty('--card-rx');image.style.removeProperty('--card-ry');};
      on(card,'pointerenter',()=>{cardRect=undefined;});on(card,'pointermove',move);on(card,'pointerleave',reset);
      cleaners.push(()=>cancelAnimationFrame(cardFrame));
    }
    let cursor=document.querySelector('.custom-cursor');
    if(!cursor){cursor=document.createElement('div');cursor.className='custom-cursor';cursor.setAttribute('aria-hidden','true');document.body.append(cursor);}
    let aura=document.querySelector('.pointer-aura');
    if(!aura){aura=document.createElement('div');aura.className='pointer-aura';aura.setAttribute('aria-hidden','true');document.body.append(aura);}
    aura.classList.add('visible');
    let pointerX=-100,pointerY=-100,pointerFrame=false,activeUnderlay=null;
    const clearUnderlay=()=>{
      activeUnderlay?.classList.remove('pointer-underlay');
      activeUnderlay=null;
      aura.classList.remove('behind-control');
    };
    const pointer=event=>{
      pointerX=event.clientX;pointerY=event.clientY;
      const target=event.target.closest?.('[data-cursor],.project-card,.pill,.text-link');
      const control=event.target.closest?.('.pill,.text-link,.effects-toggle,.lang,.mobile-nav a,header nav a,.project-archive>summary,.hero-foot a,.email,#motion,.faq summary');
      if(control!==activeUnderlay){clearUnderlay();activeUnderlay=control||null;activeUnderlay?.classList.add('pointer-underlay');}
      if(activeUnderlay){
        const rect=activeUnderlay.getBoundingClientRect();
        activeUnderlay.style.setProperty('--underlay-x',`${event.clientX-rect.left}px`);
        activeUnderlay.style.setProperty('--underlay-y',`${event.clientY-rect.top}px`);
      }
      aura.classList.toggle('behind-control',!!activeUnderlay);
      cursor.classList.toggle('active',!!target&&!activeUnderlay);
      cursor.textContent=target?.dataset.cursor||(target?.classList.contains('project-card')?(lang==='ar'?'شاهد':'VIEW'):(lang==='ar'?'افتح':'OPEN'));
      if(!pointerFrame){pointerFrame=true;requestAnimationFrame(()=>{pointerFrame=false;cursor.style.transform=`translate3d(${pointerX-41}px,${pointerY-41}px,0)`;aura.style.transform=`translate3d(${pointerX-15}px,${pointerY-15}px,0)`;});}
    };
    on(document,'pointermove',pointer,{passive:true});
    on(document,'pointerdown',()=>cursor.classList.add('pressed'));
    on(document,'pointerup',()=>cursor.classList.remove('pressed'));
    on(document,'pointerleave',()=>{cursor.classList.remove('active');clearUnderlay();});
    cleaners.push(()=>{document.body.classList.remove('has-custom-pointer');cursor.classList.remove('active');aura.classList.remove('visible');clearUnderlay();});
  }
  if(!fine&&!reduced){
    let touchAura=document.querySelector('.touch-aura');
    if(!touchAura){touchAura=document.createElement('div');touchAura.className='touch-aura';touchAura.setAttribute('aria-hidden','true');document.body.append(touchAura);}
    let hideTimer;
    const follow=event=>{
      const point=event.touches?.[0];if(!point)return;
      touchAura.style.transform=`translate3d(${point.clientX-34}px,${point.clientY-34}px,0)`;
      touchAura.classList.add('visible');
      clearTimeout(hideTimer);
      hideTimer=setTimeout(()=>touchAura.classList.remove('visible'),700);
    };
    on(window,'touchstart',follow,{passive:true});on(window,'touchmove',follow,{passive:true});
    on(window,'touchend',()=>{clearTimeout(hideTimer);hideTimer=setTimeout(()=>touchAura.classList.remove('visible'),450);},{passive:true});
    cleaners.push(()=>{clearTimeout(hideTimer);touchAura.classList.remove('visible');});
  }
  dispose=()=>{cleaners.forEach(clean=>clean());};
}
