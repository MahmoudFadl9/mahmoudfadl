/**
 * Mahmoud Fadl — portfolio preview server.
 * No dependencies: static files + tiny JSON content API + password protected admin.
 * Data lives in ./data (override with DATA_DIR). Every save keeps a timestamped backup.
 */
import http from 'node:http';
import {readFile,writeFile,mkdir,rename,stat,readdir,unlink} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {randomBytes,scryptSync,timingSafeEqual} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const pub=path.join(root,'public');
const data=process.env.DATA_DIR?path.resolve(process.env.DATA_DIR):path.join(root,'data');
const backupDir=path.join(data,'backups');
const port=Number(process.env.PORT||4173);
const host=process.env.HOST||(process.env.NODE_ENV==='production'?'0.0.0.0':'127.0.0.1');
const maxBody=1_000_000, maxAttempts=10, attemptWindow=600000, sessionTtl=28800000, keepBackups=20;
await mkdir(backupDir,{recursive:true});

const sessions=new Map(), attempts=new Map();
const pageRoutes={'/':'/index.html','/index.html':'/index.html','/admin':'/admin.html','/admin/':'/admin.html'};
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon','.mp4':'video/mp4','.webm':'video/webm','.txt':'text/plain; charset=utf-8','.md':'text/markdown; charset=utf-8','.woff2':'font/woff2','.ttf':'font/ttf'};
const longCache=new Set(['.mp4','.webm','.webp','.png','.jpg','.jpeg','.svg','.woff2','.ttf']);
const securityHeaders={
  'X-Content-Type-Options':'nosniff',
  'X-Frame-Options':'SAMEORIGIN',
  'Referrer-Policy':'strict-origin-when-cross-origin',
  'Permissions-Policy':'geolocation=(), camera=(), microphone=()',
  'Content-Security-Policy':"default-src 'self' blob:; img-src 'self' data: blob:; media-src 'self' blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; font-src 'self'; frame-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'self'; object-src 'none'"
};

async function readJson(file){return JSON.parse(await readFile(file,'utf8'));}
async function jsonFile(name,fallback){try{return await readJson(path.join(data,name));}catch(e){if(e.code==='ENOENT')return fallback;if(e instanceof SyntaxError)throw new ContentProblem(`${name}: الملف غير صالح بصيغة JSON. راجع النسخ الاحتياطية في data/backups.`);throw e;}}
async function saveJson(name,value){const file=path.join(data,name);await writeFile(`${file}.tmp`,JSON.stringify(value,null,2));await rename(`${file}.tmp`,file);}
async function snapshot(name){
  const file=path.join(data,name);
  let current;
  try{current=await readFile(file,'utf8');}
  catch(error){
    if(error.code!=='ENOENT')throw error;
    try{current=await readFile(path.join(pub,name),'utf8');}
    catch{return;}
  }
  const stamp=new Date().toISOString().replace(/[:.]/g,'-');
  await writeFile(path.join(backupDir,`${name.replace(/\.json$/,'')}-${stamp}.json`),current);
  const files=(await readdir(backupDir)).filter(item=>item.endsWith('.json')).sort();
  for(const old of files.slice(0,Math.max(0,files.length-keepBackups)))await rm(path.join(backupDir,old));
}
async function rm(file){try{await unlink(file);}catch(e){if(e.code!=='ENOENT')throw e;}}

function reply(res,status,obj){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(obj));}
async function readBody(req){let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>maxBody)throw new ContentProblem('حجم البيانات المرسلة كبير جدًا.');}if(!raw)return {};try{return JSON.parse(raw);}catch{throw new ContentProblem('تعذّر قراءة البيانات المرسلة.');}}
function authenticated(req){
  const token=(req.headers.cookie||'').split(';').map(part=>part.trim()).find(part=>part.startsWith('session='))?.slice(8);
  const expiry=sessions.get(token);
  if(!expiry)return null;
  if(expiry<Date.now()){sessions.delete(token);return null;}
  return token;
}

/* ---------- content validation ---------- */
class ContentProblem extends Error{}
const fail=message=>{throw new ContentProblem(message);};
const text=(value,max)=>typeof value==='string'?value.replace(/\u0000/g,'').trim().slice(0,max):'';
const asset=value=>{const url=text(value,500);return /^(\/|https?:\/\/)/i.test(url)?url:'';};
const matchFile=(url,pattern,message)=>{if(!url)return '';const clean=url.split('?')[0].split('#')[0];return pattern.test(clean)?url:fail(`${message}: ${url}`);};
const videoFile=value=>matchFile(asset(value),/\.(mp4|webm|m4v)$/i,'رابط الفيديو لا يبدو ملفًا مباشرًا (mp4 أو webm)');
const imageFile=value=>matchFile(asset(value),/\.(webp|jpg|jpeg|png|avif)$/i,'رابط الغلاف لا يبدو صورة (webp أو jpg أو png)');

const textLimits={name:80,navWork:40,navServices:40,navAbout:40,cta:60,eyebrow:140,heroTop:140,heroBottom:140,intro:700,viewWork:60,book:60,since:60,remote:90,selected:220,workIntro:220,play:60,expertise:220,tagline:60,framesLabel:90,filmCaption:90,filmCaptionText:90,badgeTitle:60,badgeSub:60,stageNote:140,aboutTitle:220,about:2400,aboutSmall:220,processLabel:60,processTitle:220,faqTitle:200,contactTitle:220,contactIntro:700,yourName:60,yourEmail:60,yourBrief:60,yourDeadline:60,yourBudget:60,briefHint:240,send:60,whatsapp:60,formNote:450,mailNotice:300,mailSubject:90,footer:220,roleLabel:60,storyLabel:60,external:60,allWork:60,pause:60,resume:60,skip:60,close:60};
const serviceFields={title:80,desc:600,tag:90,price:120},stepFields={title:80,desc:320},faqFields={q:170,a:750},projectText={title:140,subtitle:140,role:260,story:950};

function listOf(input,fields,label,{min=0,max=12}={}){
  if(!Array.isArray(input))fail(`${label}: يجب أن تكون قائمة.`);
  if(input.length>max)fail(`${label}: العدد أكبر من الحد المسموح (${max}).`);
  const items=input.map((item,index)=>{
    if(!item||typeof item!=='object'||Array.isArray(item))fail(`${label}: العنصر رقم ${index+1} غير صحيح.`);
    const out={};
    for(const [key,limit] of Object.entries(fields))out[key]=text(item[key],limit);
    return out;
  });
  if(items.length<min)fail(`${label}: أضف عنصرًا واحدًا على الأقل.`);
  return items;
}

function normalizeContent(input){
  if(!input||typeof input!=='object'||Array.isArray(input))fail('صيغة المحتوى غير صحيحة.');
  const email=text(input.email,200),phone=text(input.phone,40).replace(/\D/g,''),calendar=text(input.calendar,400);
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))fail('البريد الإلكتروني غير صحيح.');
  if(phone.length<8||phone.length>15)fail('رقم واتساب غير صحيح. اكتبه بالأرقام مع رمز الدولة.');
  if(calendar&&!/^https:\/\//i.test(calendar))fail('رابط حجز الموعد يجب أن يبدأ بـ https://');
  const out={email,phone,calendar};
  for(const lang of ['en','ar']){
    const source=input[lang];
    if(!source||typeof source!=='object'||Array.isArray(source))fail(`قسم اللغة (${lang}) مفقود.`);
    const block={};
    for(const [key,limit] of Object.entries(textLimits))block[key]=text(source[key],limit);
    if(!block.name)fail(`الاسم في قسم (${lang}) مطلوب.`);
    block.ticker=Array.isArray(source.ticker)?source.ticker.slice(0,8).map(item=>text(item,60)).filter(Boolean):[];
    block.services=listOf(source.services,serviceFields,`خدمات (${lang})`,{min:1,max:6});
    block.steps=listOf(source.steps,stepFields,`خطوات العمل (${lang})`,{min:1,max:8});
    block.faqs=listOf(source.faqs,faqFields,`الأسئلة الشائعة (${lang})`,{max:14});
    out[lang]=block;
  }
  if(!Array.isArray(input.projects))fail('قائمة المشاريع غير صحيحة.');
  if(input.projects.length>40)fail('عدد المشاريع أكبر من الحد المسموح (40).');
  out.projects=input.projects.map((project,index)=>{
    if(!project||typeof project!=='object')fail(`المشروع رقم ${index+1} غير صحيح.`);
    const item={
      id:text(project.id,40).replace(/[^a-zA-Z0-9_-]/g,'-').replace(/^-+|-+$/g,'')||`project-${index+1}`,
      client:text(project.client,70),type:text(project.type,60),
      image:imageFile(project.image),video:videoFile(project.video),url:asset(project.url),
      visible:project.visible!==false
    };
    if(!item.client)fail(`المشروع رقم ${index+1}: اسم الجهة مطلوب.`);
    if(item.url&&!/^https?:\/\//i.test(item.url))fail(`المشروع رقم ${index+1}: رابط Behance يجب أن يبدأ بـ https://`);
    for(const lang of ['en','ar']){
      const block=project[lang];
      if(!block||typeof block!=='object')fail(`المشروع رقم ${index+1}: المحتوى (${lang}) مفقود.`);
      item[lang]={};
      for(const [key,limit] of Object.entries(projectText))item[lang][key]=text(block[key],limit);
      if(!item[lang].title)fail(`المشروع رقم ${index+1}: العنوان في (${lang}) مطلوب.`);
    }
    return item;
  });
  return out;
}



/* ---------- request handling ---------- */
async function sendFile(req,res,file,size,modified){
  const etag=`W/"${size.toString(16)}-${Math.round(modified.getTime()).toString(16)}"`;
  res.setHeader('Accept-Ranges','bytes');
  res.setHeader('Last-Modified',modified.toUTCString());
  res.setHeader('ETag',etag);
  if(req.headers['if-none-match']===etag){res.writeHead(304);return res.end();}
  let start=0,end=size-1,status=200;
  const range=req.headers.range;
  if(range){
    const match=/^bytes=(\d*)-(\d*)$/.exec(range);
    if(!match||(match[1]===''&&match[2]===''))return reply(res,416,{error:'Invalid range'});
    const [,from,to]=match;
    if(from===''){const tail=Math.min(Number(to),size);start=size-tail;}
    else{start=Number(from);end=to===''?end:Math.min(Number(to),end);}
    if(start>end||start<0||start>=size)return reply(res,416,{error:'Invalid range'});
    status=206;
    res.setHeader('Content-Range',`bytes ${start}-${end}/${size}`);
  }
  res.writeHead(status,{'Content-Length':end-start+1});
  if(req.method==='HEAD')return res.end();
  createReadStream(file,{start,end}).pipe(res);
}

const server=http.createServer(async(req,res)=>{
  try{
    for(const [name,value] of Object.entries(securityHeaders))res.setHeader(name,value);
    const url=new URL(req.url,'http://localhost'),pathname=url.pathname,method=req.method||'GET';
    const origin=req.headers.origin;
    if(!['GET','HEAD'].includes(method)&&origin!==`http://${req.headers.host}`&&origin!==`https://${req.headers.host}`)return reply(res,403,{error:'طلب من مصدر غير معروف.'});

    if(pathname==='/api/status')return reply(res,200,{setup:!await jsonFile('auth.json',null),authenticated:!!authenticated(req)});
    if(pathname==='/api/content'&&method==='GET'){
      let stored=null;
      try{stored=await jsonFile('content.json',null);}catch(error){console.warn(`[content] ${error.message}`);}
      return reply(res,200,stored||await readJson(path.join(pub,'content.json')));
    }
    if((pathname==='/api/setup'||pathname==='/api/login')&&method==='POST'){
      const payload=await readBody(req);
      const address=req.socket.remoteAddress||'local',now=Date.now();
      const attempt=attempts.get(address)||{count:0,until:0};
      if(attempt.until<now){attempt.count=0;attempt.until=now+attemptWindow;}
      attempt.count++;
      attempts.set(address,attempt);
      if(attempt.count>maxAttempts)return reply(res,429,{error:'محاولات كثيرة. حاول بعد عشر دقائق.'});
      const stored=await jsonFile('auth.json',null);
      const password=payload.password;
      if(typeof password!=='string'||password.length<12||password.length>256)return reply(res,400,{error:'كلمة المرور يجب أن تكون بين 12 و256 حرفًا.'});
      if(pathname==='/api/setup'){
        if(stored)return reply(res,409,{error:'لوحة الإدارة مُعدّة بالفعل. سجّل الدخول.'});
        const salt=randomBytes(16).toString('hex');
        await saveJson('auth.json',{salt,hash:scryptSync(password,salt,64).toString('hex'),created:new Date().toISOString()});
      }else if(!stored||!timingSafeEqual(scryptSync(password,stored.salt,64),Buffer.from(stored.hash,'hex'))){
        return reply(res,401,{error:'كلمة المرور غير صحيحة.'});
      }
      const token=randomBytes(32).toString('hex');
      sessions.set(token,now+sessionTtl);
      res.setHeader('Set-Cookie',`session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${sessionTtl/1000}`);
      return reply(res,200,{ok:true});
    }
    if(pathname==='/api/logout'&&method==='POST'){
      sessions.delete(authenticated(req));
      res.setHeader('Set-Cookie','session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');
      return reply(res,200,{ok:true});
    }
    if(pathname==='/api/content'&&method==='PUT'){
      if(!authenticated(req))return reply(res,401,{error:'سجّل الدخول أولًا.'});
      if(!/application\/json/.test(req.headers['content-type']||''))return reply(res,415,{error:'نوع البيانات غير مدعوم. استخدم JSON.'});
      const content=normalizeContent(await readBody(req));
      await snapshot('content.json');
      await saveJson('content.json',content);
      return reply(res,200,{ok:true});
    }
    if(pathname.startsWith('/api/'))return reply(res,404,{error:'Not found'});
    if(!['GET','HEAD'].includes(method))return reply(res,405,{error:'Method not allowed'});

    const target=pageRoutes[pathname]||decodeURIComponent(pathname);
    const file=path.resolve(pub,'.'+target);
    if(file!==pub&&!file.startsWith(pub+path.sep))return reply(res,403,{error:'Forbidden'});
    const info=await stat(file);
    if(!info.isFile())return reply(res,404,{error:'Not found'});
    const ext=path.extname(file).toLowerCase();
    res.setHeader('Content-Type',mime[ext]||'application/octet-stream');
    res.setHeader('Cache-Control',longCache.has(ext)?'public, max-age=604800':'no-cache');
    return sendFile(req,res,file,info.size,info.mtime);
  }catch(error){
    if(error instanceof ContentProblem)return reply(res,400,{error:error.message});
    if(error.code==='ENOENT')return reply(res,404,{error:'Not found'});
    console.error('[error]',error);
    return reply(res,500,{error:'تعذّر إكمال الطلب.'});
  }
});
server.listen(port,host,()=>console.log(`Portfolio preview: http://${host}:${server.address().port}`));

