const $=selector=>document.querySelector(selector),status=$('#status');
let state,content,dirty=false;

const labels={name:'الاسم',email:'البريد',phone:'رقم واتساب بالأرقام فقط',calendar:'رابط حجز الموعد',heroTop:'العنوان الرئيسي — السطر الأول',heroBottom:'العنوان الرئيسي — السطر الثاني',intro:'مقدمة الموقع',title:'العنوان',desc:'الوصف',price:'السعر',tag:'التخصصات',about:'نبذة عنّي',story:'قصة المشروع',role:'دورك',subtitle:'العنوان الفرعي',image:'رابط الغلاف',video:'رابط الفيديو',url:'رابط Behance',client:'اسم الجهة / العلامة',type:'نوع العمل',id:'معرّف فريد',q:'السؤال',a:'الإجابة',services:'الخدمات',steps:'خطوات العمل',faqs:'الأسئلة الشائعة',ticker:'الشريط المتحرك (عبارات قصيرة)',tagline:'الشعار المختصر',framesLabel:'تسمية إطار الفيديو الرئيسي',filmCaption:'سطر الفيلم الأول',filmCaptionText:'سطر الفيلم الثاني',badgeTitle:'عبارة البطاقة الأولى',badgeSub:'عبارة البطاقة الثانية',stageNote:'ملاحظة مسرح الصورة',processLabel:'تسمية قسم طريقة العمل',mediaNote:'ملاحظة الفيديو داخل نافذة المشروع',yourDeadline:'حقل الموعد',yourBudget:'حقل الميزانية',mailSubject:'موضوع رسالة البريد',mailNotice:'رسالة توضيح النموذج',skip:'رابط تجاوز المحتوى',close:'إغلاق النافذة',pause:'إيقاف الحركة',resume:'تشغيل الحركة',allWork:'عبارة الأعمال المختارة',external:'عبارة رابط Behance',roleLabel:'تسمية الدور',storyLabel:'تسمية القصة',footer:'نص التذييل',formNote:'ملاحظة أسفل النموذج',briefHint:'مثال توضيحي لمربع المشروع',yourBrief:'عنوان حقل المشروع',yourEmail:'عنوان حقل البريد',yourName:'عنوان حقل الاسم',send:'زر النموذج',whatsapp:'زر واتساب',book:'زر حجز المكالمة',viewWork:'زر استعراض الأعمال',cta:'دعوة التواصل',navWork:'قائمة: الأعمال',navServices:'قائمة: الخدمات',navAbout:'قائمة: عنّي',eyebrow:'السطر الصغير أعلى العنوان',since:'عبارة منذ 2017',remote:'عبارة العمل عن بُعد',selected:'عنوان قسم الأعمال',workIntro:'مقدمة قسم الأعمال',expertise:'عنوان قسم الخدمات',play:'عبارة مشاهدة الفيلم',aboutTitle:'عنوان قسم عنّي',aboutSmall:'سطر مهني مختصر',processTitle:'عنوان طريقة العمل',faqTitle:'عنوان الأسئلة الشائعة',contactTitle:'عنوان قسم التواصل',contactIntro:'مقدمة قسم التواصل'};

async function api(path,method='GET',data){
  const response=await fetch('/api/'+path,{method,headers:{'Content-Type':'application/json'},body:data?JSON.stringify(data):undefined});
  const payload=await response.json().catch(()=>({}));
  if(!response.ok)throw Error(payload.error||'تعذّر إكمال الطلب');
  return payload;
}

function field(parent,obj,key){
  const label=document.createElement('label');
  label.textContent=labels[key]||key;
  const input=document.createElement(String(obj[key]).length>90?'textarea':'input');
  input.value=obj[key];
  if(input.tagName==='TEXTAREA')input.rows=4;
  input.oninput=()=>{obj[key]=input.value;dirty=true;status.textContent='توجد تعديلات لم تُحفظ بعد.';};
  label.append(input);
  parent.append(label);
}

function stringField(parent,array,index,label){
  const wrapper=document.createElement('label');
  wrapper.textContent=label;
  const input=document.createElement('input');
  input.value=array[index];
  input.oninput=()=>{array[index]=input.value;dirty=true;status.textContent='توجد تعديلات لم تُحفظ بعد.';};
  wrapper.append(input);
  parent.append(wrapper);
}

function walk(parent,obj){
  for(const key of Object.keys(obj)){
    if(typeof obj[key]==='string'){field(parent,obj,key);continue;}
    if(typeof obj[key]==='boolean')continue;
    const details=document.createElement('details'),summary=document.createElement('summary');
    summary.textContent=labels[key]||key;
    details.append(summary);
    if(Array.isArray(obj[key])){
      obj[key].forEach((item,index)=>{
        if(typeof item==='string'){stringField(details,obj[key],index,`عبارة ${index+1}`);return;}
        const set=document.createElement('fieldset'),legend=document.createElement('legend');
        legend.textContent=item.title||item.q||String(index+1);
        set.append(legend);
        walk(set,item);
        details.append(set);
      });
    }else walk(details,obj[key]);
    parent.append(details);
  }
}

function draw(){
  const fields=$('#fields');
  fields.replaceChildren();
  const contacts=document.createElement('fieldset');
  contacts.innerHTML='<legend>بيانات التواصل</legend>';
  for(const key of ['email','phone','calendar'])field(contacts,content,key);
  fields.append(contacts);
  for(const lang of ['en','ar']){
    const set=document.createElement('fieldset');
    set.innerHTML=`<legend>${lang==='en'?'English content':'المحتوى العربي'}</legend>`;
    set.dir=lang==='ar'?'rtl':'ltr';
    walk(set,content[lang]);
    fields.append(set);
  }
  const projects=document.createElement('fieldset');
  projects.innerHTML='<legend>المشاريع</legend><p class="muted">اكتب رابط فيديو مباشر ينتهي بـ mp4 أو webm (ملف داخل public/assets يبدأ بـ /assets/…). روابط يوتيوب لا تعمل كرابط تشغيل مباشر.</p>';
  content.projects.forEach((project,index)=>{
    const details=document.createElement('details'),summary=document.createElement('summary');
    summary.textContent=`${project.visible===false?'مخفي · ':'ظاهر · '}${project.client} — ${project.en.title||''}`;
    details.append(summary);
    const visibility=document.createElement('label');
    visibility.className='visibility-control';
    const toggle=document.createElement('input');
    toggle.type='checkbox';
    toggle.checked=project.visible!==false;
    toggle.onchange=()=>{project.visible=toggle.checked;summary.textContent=`${toggle.checked?'ظاهر · ':'مخفي · '}${project.client} — ${project.en.title||''}`;dirty=true;status.textContent='توجد تعديلات لم تُحفظ بعد.';};
    visibility.append(toggle,document.createTextNode(' إظهار هذا الفيديو في الموقع'));
    details.append(visibility);
    walk(details,project);
    const remove=document.createElement('button');
    remove.type='button';
    remove.className='secondary';
    remove.textContent='حذف المشروع';
    remove.onclick=()=>{
      if(confirm('حذف المشروع من القائمة؟ لن تُحذف ملفات الفيديو.')){content.projects.splice(index,1);dirty=true;draw();}
    };
    details.append(remove);
    projects.append(details);
  });
  const add=document.createElement('button');
  add.type='button';
  add.className='secondary';
  add.textContent='+ إضافة مشروع';
  add.onclick=()=>{
    content.projects.push({id:'project-'+Date.now(),client:'New project',type:'MOTION',image:'/assets/knauf.webp',video:'',url:'',visible:true,en:{title:'New project',subtitle:'',role:'',story:''},ar:{title:'مشروع جديد',subtitle:'',role:'',story:''}});
    dirty=true;
    draw();
  };
  projects.append(add);
  fields.append(projects);
}

async function load(){
  state=await api('status');
  $('#login').style.display=state.authenticated?'none':'block';
  $('#editor').style.display=state.authenticated?'block':'none';
  $('#loginTitle').textContent=state.setup?'إنشاء كلمة مرور الإدارة':'تسجيل الدخول';
  $('#login button').textContent=state.setup?'إنشاء كلمة المرور والدخول':'دخول';
  $('#password').setAttribute('autocomplete',state.setup?'new-password':'current-password');
  $('#password').minLength=12;
  if(state.authenticated){content=await api('content');draw();}
}

$('#login').onsubmit=async event=>{
  event.preventDefault();
  const button=$('#login button');
  if(button)button.disabled=true;
  try{
    /* A fast visitor can press Enter before /api/status answers: load the state on demand. */
    if(!state)await load();
    const settingUp=state.setup;
    await api(settingUp?'setup':'login','POST',{password:$('#password').value});
    $('#password').value='';
    status.textContent=settingUp?'تم إنشاء كلمة المرور وتسجيل الدخول.':'تم تسجيل الدخول.';
    await load();
  }catch(error){status.textContent=error.message;}
  finally{if(button)button.disabled=false;}
};

$('#editor').onsubmit=async event=>{
  event.preventDefault();
  const button=event.submitter;
  if(button)button.disabled=true;
  try{
    await api('content','PUT',content);
    dirty=false;
    status.textContent='تم الحفظ في data/content.json، ونسخة احتياطية في data/backups. حدّث صفحة المعاينة لرؤية التعديلات.';
  }catch(error){status.textContent=error.message;}
  finally{if(button)button.disabled=false;}
};

$('#logout').onclick=async()=>{
  if(dirty&&!confirm('هناك تعديلات لم تُحفظ. هل تريد الخروج؟'))return;
  await api('logout','POST');
  dirty=false;
  await load();
  status.textContent='تم تسجيل الخروج.';
};

$('#export').onclick=()=>{
  const url=URL.createObjectURL(new Blob([JSON.stringify(content,null,2)],{type:'application/json'}));
  const link=document.createElement('a');
  link.href=url;
  link.download='mahmoud-content.json';
  link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
};

window.onbeforeunload=event=>{if(dirty){event.preventDefault();event.returnValue='';}};
load().catch(error=>{status.textContent=error.message;});

