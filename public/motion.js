import {startDepthScene} from './depth-scene.js';

let dispose=()=>{};

export function startMotion({lang,enabled,onFloat}){
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
          stage.style.setProperty('--scroll-z',`${(-dive*100).toFixed(1)}px`);
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

  if(!reduced){
    const layer=document.createElement('div');
    layer.className='float-layer';
    layer.setAttribute('aria-hidden','true');
    const spots=[[.08,.19,'ring'],[.89,.16,'diamond'],[.77,.42,'spark'],[.14,.57,'diamond'],[.9,.7,'ring'],[.34,.85,'spark'],[.61,.79,'diamond']];
    const objects=spots.map(([x,y,shape],index)=>{
      const node=document.createElement('span');
      node.className=`float-object float-${shape}`;
      node.style.left=`${x*100}%`;
      node.style.top=`${y*100}%`;
      node.innerHTML='<i></i>';
      layer.append(node);
      return {node,x,y,phase:index*1.73,near:false,rx:0,ry:0};
    });
    document.body.append(layer);
    cleaners.push(()=>layer.remove());
    let point=null,frame=0,lastFrame=performance.now();
    if(fine){
      on(window,'pointermove',event=>{if(event.pointerType!=='touch')point={x:event.clientX,y:event.clientY};},{passive:true});
      on(document,'pointerleave',()=>{point=null;});
    }
    const animate=time=>{
      const dt=Math.min(.05,Math.max(.001,(time-lastFrame)/1000));
      lastFrame=time;
      for(const object of objects){
        const driftX=Math.sin(time*.00042+object.phase)*25+Math.sin(time*.00019+object.phase)*9;
        const driftY=Math.cos(time*.00036+object.phase)*24;
        const baseX=object.x*innerWidth+driftX,baseY=object.y*innerHeight+driftY;
        const dx=point?baseX-point.x:0,dy=point?baseY-point.y:0;
        const distance=point?Math.hypot(dx,dy):Infinity;
        const near=distance<185;
        const force=near?Math.pow(1-distance/185,1.3)*165:0;
        const angle=distance>1?Math.atan2(dy,dx):object.phase;
        const targetX=Math.cos(angle)*force,targetY=Math.sin(angle)*force;
        const easing=1-Math.exp(-dt*(near?12:5));
        object.rx+=(targetX-object.rx)*easing;
        object.ry+=(targetY-object.ry)*easing;
        object.node.style.transform=`translate3d(${(driftX+object.rx).toFixed(1)}px,${(driftY+object.ry).toFixed(1)}px,0)`;
        object.node.style.setProperty('--repel-x',`${object.rx.toFixed(1)}px`);
        object.node.style.setProperty('--repel-y',`${object.ry.toFixed(1)}px`);
        if(near&&!object.near)onFloat?.(baseX/innerWidth*2-1);
        object.near=near;
      }
      frame=requestAnimationFrame(animate);
    };
    frame=requestAnimationFrame(animate);
    cleaners.push(()=>cancelAnimationFrame(frame));
  }

  if(fine&&!reduced){
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
    let pointerX=-100,pointerY=-100,pointerFrame=false;
    const pointer=event=>{
      if(event.pointerType==='touch')return;
      pointerX=event.clientX;pointerY=event.clientY;
      const hidden=!!event.target.closest?.('input,textarea,select,[contenteditable="true"]');
      const watch=!!event.target.closest?.('[data-cursor],.project-card,.film-media,.showreel-open');
      const action=!watch&&!!event.target.closest?.('a,button,summary,[role="button"]');
      aura.classList.toggle('visible',!hidden);
      aura.classList.toggle('on-control',action);
      aura.classList.toggle('on-watch',watch);
      cursor.classList.toggle('active',watch&&!hidden);
      cursor.classList.toggle('watch',watch);
      cursor.textContent=watch?(lang==='ar'?'شاهد':'WATCH'):'';
      if(!pointerFrame){pointerFrame=true;requestAnimationFrame(()=>{
        pointerFrame=false;
        cursor.style.transform=`translate3d(${pointerX}px,${pointerY}px,0) translate(-50%,-50%) scale(var(--cursor-scale,1))`;
        aura.style.transform=`translate3d(${pointerX-15}px,${pointerY-15}px,0) scale(var(--aura-scale,1))`;
      });}
    };
    on(document,'pointermove',pointer,{passive:true});
    on(document,'pointerdown',()=>{cursor.classList.add('pressed');aura.classList.add('pressed');});
    on(document,'pointerup',()=>{cursor.classList.remove('pressed');aura.classList.remove('pressed');});
    on(document,'pointerleave',()=>{cursor.classList.remove('active');aura.classList.remove('visible');});
    cleaners.push(()=>{cursor.classList.remove('active','watch','pressed');aura.classList.remove('visible','on-control','on-watch','pressed');});
  }
  dispose=()=>{cleaners.forEach(clean=>clean());};
}
