/**
 * Builds the "continue in email" link for the contact form.
 * The site never sends anything on its own: this only prepares a draft in the visitor's mail app.
 */
export const MAILTO_BODY_LIMIT=1800;

const LABELS={
  en:{intro:'Project details from the website',brief:'Project brief',name:'Name',email:'Email',deadline:'Target date',budget:'Budget range'},
  ar:{intro:'تفاصيل المشروع من الموقع',brief:'وصف المشروع',name:'الاسم',email:'البريد الإلكتروني',deadline:'الموعد المطلوب',budget:'الميزانية التقديرية'}
};

const clean=(value,max=600)=>String(value??'').replace(/\r?\n/g,' ').trim().slice(0,max);

export function buildMailto({email='',subject='',lang='en',from={}}={}){
  const labels=LABELS[lang]||LABELS.en;
  const name=clean(from.name,80),reply=clean(from.email,120),brief=String(from.brief??'').trim().slice(0,1200);
  const deadline=clean(from.deadline,40),budget=clean(from.budget,60);
  const lines=[labels.intro,''];
  if(brief)lines.push(`${labels.brief}:`,brief,'');
  if(name)lines.push(`${labels.name}: ${name}`);
  if(reply)lines.push(`${labels.email}: ${reply}`);
  if(deadline)lines.push(`${labels.deadline}: ${deadline}`);
  if(budget)lines.push(`${labels.budget}: ${budget}`);
  let body=lines.join('\r\n');
  if(body.length>MAILTO_BODY_LIMIT)body=body.slice(0,MAILTO_BODY_LIMIT).trimEnd();
  const query=[subject?`subject=${encodeURIComponent(clean(subject,120))}`:'',`body=${encodeURIComponent(body)}`].filter(Boolean).join('&');
  return `mailto:${clean(email,200)}?${query}`;
}

export function mailtoSubject(base,name,lang='en'){
  const who=clean(name,60);
  if(!who)return clean(base,120);
  return `${clean(base,120)}${lang==='ar'?' — ':' — '}${who}`;
}
