/* One continuous, low-resolution scene: scrolling moves the camera through it. */
let stopPrevious=()=>{};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const mix=(a,b,t)=>a+(b-a)*t;
const palettes=[
  {at:0,c:[22,59,53],light:[81,195,163]},
  {at:.17,c:[15,67,78],light:[65,181,207]},
  {at:.38,c:[53,39,83],light:[164,121,207]},
  {at:.57,c:[67,57,42],light:[200,167,105]},
  {at:.75,c:[34,54,80],light:[105,154,211]},
  {at:1,c:[24,75,57],light:[105,208,157]}
];

function makeWebGL(canvas){
  try{
    const gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,stencil:false,powerPreference:'high-performance'});
    if(!gl)return null;
    const shader=(type,source)=>{const item=gl.createShader(type);gl.shaderSource(item,source);gl.compileShader(item);if(!gl.getShaderParameter(item,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(item));return item;};
    const vertex=shader(gl.VERTEX_SHADER,'attribute vec2 p; void main(){gl_Position=vec4(p,0.,1.);}');
    const fragment=shader(gl.FRAGMENT_SHADER,`
      precision mediump float;
      uniform vec2 resolution, pointer;
      uniform float travel, seconds, active;
      uniform vec3 baseColor, lightColor;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/resolution;
        vec2 q=uv-.5;
        q.x*=resolution.x/resolution.y;
        vec2 focus=vec2((pointer.x-.5)*.19, (pointer.y-.5)*.12);
        focus.x+=sin(travel*.0013)*.08;
        focus.y+=cos(travel*.0011)*.05;
        vec2 v=q-focus;
        float radius=length(v);
        float angle=atan(v.y,v.x);
        float depth=log(radius+.065);
        float rings=pow(max(0.,.5+.5*cos(depth*10.5-travel*.004-seconds*.17+sin(angle*3.)*.12)),23.);
        float portal=exp(-radius*2.2);
        vec3 color=vec3(.035,.061,.069)+baseColor*(.16+.49*portal);
        color+=lightColor*rings*(.003+.017*portal)*active;
        float mist=exp(-pow(radius-(.28+.055*sin(travel*.0009+angle*2.)),2.)*16.);
        color+=lightColor*mist*.042*active;
        vec2 sun=vec2(.73+.15*sin(travel*.00042+seconds*.035),.53+.21*cos(travel*.00032));
        sun+=(pointer-.5)*vec2(.065,.045);
        float sunDistance=length((uv-sun)*vec2(resolution.x/resolution.y,1.));
        float sunRadius=.17+.025*sin(travel*.00055);
        float sunDisc=1.-smoothstep(sunRadius-.035,sunRadius+.035,sunDistance);
        float corona=exp(-sunDistance*sunDistance*8.);
        color+=lightColor*(sunDisc*.085+corona*.13)*active;
        vec2 grid=floor((uv+travel*.000014)*vec2(84.,54.));
        vec2 cell=fract((uv+travel*.000014)*vec2(84.,54.));
        float star=step(.993,hash(grid))*(1.-smoothstep(.02,.14,length(cell-.5)));
        color+=lightColor*star*.24*active;
        float mouse=exp(-length(uv-pointer)*5.5);
        color+=lightColor*mouse*.12*active;
        gl_FragColor=vec4(color,1.);
      }`);
    const program=gl.createProgram();gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
    const pos=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
    const uniforms=Object.fromEntries(['resolution','pointer','travel','seconds','active','baseColor','lightColor'].map(name=>[name,gl.getUniformLocation(program,name)]));
    return {gl,uniforms,destroy:()=>{gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.deleteShader(vertex);gl.deleteShader(fragment);}};
  }catch{return null;}
}

export function startDepthScene({enabled}){
  stopPrevious();
  let canvas=document.querySelector('.depth-scene');
  if(!canvas){canvas=document.createElement('canvas');canvas.className='depth-scene';canvas.setAttribute('aria-hidden','true');document.body.prepend(canvas);}
  const gpu=makeWebGL(canvas);
  const ctx=gpu?null:canvas.getContext('2d',{alpha:false,desynchronized:true});
  if(!gpu&&!ctx)return;
  canvas.dataset.renderer=gpu?'webgl':'canvas';
  let width=0,height=0,scale=1,last=0,visible=!document.hidden,lastActivity=performance.now();
  let targetScroll=scrollY,scroll=scrollY,targetX=.5,targetY=.5,pointerX=.5,pointerY=.5;
  let lastScroll=scrollY,velocity=0,phase=0,raf=0;
  const particles=Array.from({length:innerWidth<700?30:62},(_,i)=>({
    angle:i*2.39996,radius:Math.sqrt((i+.5)/62),depth:(i*.618033)%1,size:i%9===0?1.8:.8
  }));
  const resize=()=>{
    width=innerWidth;height=innerHeight;
    scale=Math.min(devicePixelRatio||1,width<700?1:gpu?1.15:1);
    canvas.width=Math.round(width*scale);canvas.height=Math.round(height*scale);
    if(gpu)gpu.gl.viewport(0,0,canvas.width,canvas.height);
    else ctx.setTransform(scale,0,0,scale,0,0);
    if(!enabled)draw(0);
  };
  const onScroll=()=>{targetScroll=scrollY;velocity=clamp(targetScroll-lastScroll,-100,100);lastScroll=targetScroll;lastActivity=performance.now();};
  const onPointer=e=>{targetX=e.clientX/Math.max(1,width);targetY=e.clientY/Math.max(1,height);lastActivity=performance.now();};
  const onTouch=e=>{if(e.touches?.[0])onPointer(e.touches[0]);};
  const onVisibility=()=>{visible=!document.hidden;if(visible&&enabled&&!raf)raf=requestAnimationFrame(tick);};

  function draw(time){
    const progress=clamp(scroll/Math.max(1,document.documentElement.scrollHeight-height),0,1);
    let next=1;while(next<palettes.length-1&&progress>palettes[next].at)next++;
    const a=palettes[next-1],b=palettes[next],t=clamp((progress-a.at)/(b.at-a.at),0,1);
    const color=a.c.map((v,i)=>Math.round(mix(v,b.c[i],t)));
    const light=a.light.map((v,i)=>Math.round(mix(v,b.light[i],t)));
    if(gpu){
      const {gl,uniforms:u}=gpu;
      gl.uniform2f(u.resolution,canvas.width,canvas.height);
      gl.uniform2f(u.pointer,pointerX,1-pointerY);
      gl.uniform1f(u.travel,scroll);
      gl.uniform1f(u.seconds,time*.001);
      gl.uniform1f(u.active,enabled?1:0);
      gl.uniform3f(u.baseColor,...color.map(v=>v/255));
      gl.uniform3f(u.lightColor,...light.map(v=>v/255));
      gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
      return;
    }
    const rgb=(c,alpha)=>`rgba(${c[0]},${c[1]},${c[2]},${alpha})`;
    ctx.fillStyle='#0a1112';ctx.fillRect(0,0,width,height);
    const centerX=width*(.5+(pointerX-.5)*.12)+Math.sin(progress*9)*width*.06;
    const centerY=height*(.49+(pointerY-.5)*.10)+Math.cos(progress*7)*height*.05;
    const wash=ctx.createRadialGradient(centerX,centerY,0,centerX,centerY,Math.max(width,height)*.82);
    wash.addColorStop(0,rgb(color,.70));wash.addColorStop(.48,rgb(color,.29));wash.addColorStop(1,'rgba(10,17,18,0)');
    ctx.fillStyle=wash;ctx.fillRect(0,0,width,height);
    if(!enabled)return;

    const sunX=width*(.73+.15*Math.sin(scroll*.00042+time*.000035)+(pointerX-.5)*.065);
    const sunY=height*(.47+.21*Math.cos(scroll*.00032)-(pointerY-.5)*.045);
    const sunSize=Math.min(width,height)*.55;
    const sun=ctx.createRadialGradient(sunX,sunY,0,sunX,sunY,sunSize);
    sun.addColorStop(0,rgb(light,.19));sun.addColorStop(.35,rgb(light,.11));sun.addColorStop(1,rgb(light,0));
    ctx.fillStyle=sun;ctx.fillRect(0,0,width,height);

    // Perspective frames flow past the visitor instead of restarting at each section.
    ctx.save();ctx.translate(centerX,centerY);ctx.rotate(Math.sin(progress*8)*.11+(pointerX-.5)*.06);
    const travel=scroll*.00125+time*.000055;
    for(let i=13;i>=0;i--){
      const z=((i/14+travel)%1+1)%1;
      const depth=Math.pow(z,2.1);
      const rx=mix(22,width*.86,depth),ry=mix(15,height*.90,depth);
      ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2);
      ctx.strokeStyle=rgb(light,(1-z)*.07+.008);ctx.lineWidth=mix(.5,1.5,depth);ctx.stroke();
    }
    ctx.restore();

    const drift=scroll*.00027+time*.000018;
    for(const p of particles){
      const depth=(p.depth+drift)%1,spread=Math.pow(depth,1.6);
      const x=centerX+Math.cos(p.angle+progress*3)*spread*width*.8;
      const y=centerY+Math.sin(p.angle+progress*3)*spread*height*.8;
      if(x<0||x>width||y<0||y>height)continue;
      ctx.fillStyle=rgb(light,(1-depth)*.38+.05);
      ctx.beginPath();ctx.arc(x,y,p.size*(.5+depth*1.6),0,Math.PI*2);ctx.fill();
    }

    // A soft field and orbit follow the pointer across the entire page.
    const px=pointerX*width,py=pointerY*height;
    const halo=ctx.createRadialGradient(px,py,0,px,py,Math.min(width,height)*.35);
    halo.addColorStop(0,rgb(light,.13));halo.addColorStop(1,rgb(light,0));
    ctx.fillStyle=halo;ctx.fillRect(px-400,py-400,800,800);
    ctx.beginPath();ctx.arc(px,py,23+Math.sin(time*.003)*4,0,Math.PI*2);
    ctx.strokeStyle=rgb(light,.36);ctx.lineWidth=1;ctx.stroke();
  }
  function tick(time){
    raf=0;if(!visible)return;
    const active=time-lastActivity<1400;
    if(time-last>=(gpu?(active?14:32):active?30:48)){
      const dt=Math.min(2.5,(time-last)/16.7||1);last=time;
      scroll=mix(scroll,targetScroll,1-Math.pow(.86,dt));
      pointerX=mix(pointerX,targetX,1-Math.pow(.83,dt));
      pointerY=mix(pointerY,targetY,1-Math.pow(.83,dt));
      phase+=velocity*.0001;velocity*=.86;
      draw(time+phase*100);
    }
    raf=requestAnimationFrame(tick);
  }
  resize();
  window.addEventListener('resize',resize,{passive:true});
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('pointermove',onPointer,{passive:true});
  window.addEventListener('touchstart',onTouch,{passive:true});
  window.addEventListener('touchmove',onTouch,{passive:true});
  document.addEventListener('visibilitychange',onVisibility);
  if(enabled)raf=requestAnimationFrame(tick);
  stopPrevious=()=>{
    cancelAnimationFrame(raf);window.removeEventListener('resize',resize);
    window.removeEventListener('scroll',onScroll);window.removeEventListener('pointermove',onPointer);
    window.removeEventListener('touchstart',onTouch);window.removeEventListener('touchmove',onTouch);
    document.removeEventListener('visibilitychange',onVisibility);
    gpu?.destroy();
  };
}
