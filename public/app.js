import {buildMailto,mailtoSubject} from './mailto.js';
import {icon} from './icons.js';
import {startMotion} from './motion.js';

const app=document.querySelector('#app');
const dialog=document.querySelector('#project');
const detail=document.querySelector('#detail');
const closeButton=dialog.querySelector('.close');
const systemReducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const savedEffects=localStorage.getItem('portfolio-effects');
let effectsEnabled=savedEffects==='on'||(savedEffects!=='off'&&!systemReducedMotion);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl=value=>{try{const url=new URL(value,location.origin);return ['http:','https:'].includes(url.protocol)?esc(value):'#';}catch{return '#';}};

let content={
  "email": "mahmoudfadlalnabi@gmail.com",
  "phone": "201014955678",
  "calendar": "https://calendar.app.google/QsiJwX6ezBYpc9cYA",
  "en": {
    "name": "Mahmoud Fadl",
    "navWork": "Selected work",
    "navServices": "Expertise",
    "navAbout": "About",
    "cta": "Let’s talk",
    "eyebrow": "INDEPENDENT MOTION DESIGNER · WORLDWIDE",
    "heroTop": "Complex ideas.",
    "heroBottom": "Unforgettable motion.",
    "intro": "I turn your message into visual stories that make people stop, understand, and connect. Motion design, AI video, and thoughtful editing — from the first frame to the last.",
    "viewWork": "Explore my work",
    "book": "Book a discovery call",
    "since": "CREATING SINCE 2017",
    "remote": "Based online. Working worldwide.",
    "selected": "A few stories, brought to life.",
    "workIntro": "Different worlds. One intention: make the message matter.",
    "play": "Watch the film",
    "mediaNote": "Sound is off until you press play.",
    "expertise": "Made to move your story forward.",
    "tagline": "MOTION & STORY",
    "framesLabel": "01 / SELECTED FRAMES",
    "filmCaption": "SELECTED WORK",
    "filmCaptionText": "Five stories in motion.",
    "badgeTitle": "DESIGNED TO MOVE.",
    "badgeSub": "Built to connect.",
    "stageNote": "MOTION / AI / VISUAL STORYTELLING",
    "ticker": [
      "MOTION DESIGN",
      "VISUAL STORYTELLING",
      "AI VIDEO",
      "EDITING & SOUND"
    ],
    "services": [
      {
        "title": "Motion design",
        "desc": "Explain the complex. Give your brand a visual rhythm. Product explainers, 2D and character animation, brand motion, and kinetic typography.",
        "tag": "EXPLAINERS / BRAND / CHARACTER",
        "price": "Custom quote"
      },
      {
        "title": "AI video & storytelling",
        "desc": "Bring ambitious concepts into view. AI-assisted scenes, visual development, compositing, and motion graphics shaped into a connected narrative.",
        "tag": "CONCEPT / AI VIDEO / COMPOSITING",
        "price": "Custom quote"
      },
      {
        "title": "Editing & sound",
        "desc": "Find the pace, emotion, and clarity in your footage. Video editing, sound design, colour finishing, and versions for social and advertising.",
        "tag": "EDIT / SOUND / SOCIAL",
        "price": "Simple edits from $300–500"
      }
    ],
    "aboutTitle": "A creative partner. From idea to final frame.",
    "about": "I’m Mahmoud, an independent senior motion designer and visual storyteller. Since 2017, I’ve been translating complex messages into character-led films, animated explanations, and AI-assisted stories. I work remotely with tech and SaaS companies, agencies, and marketing teams who care about both the idea and the craft.",
    "aboutSmall": "Motion designer · Visual storyteller · AI video specialist",
    "processLabel": "THE PROCESS",
    "processTitle": "Clear steps. Space for good ideas.",
    "steps": [
      {
        "title": "Discover",
        "desc": "Your audience, goal, materials, and the message that matters."
      },
      {
        "title": "Shape",
        "desc": "Concept, storyboard, and a visual direction we agree on."
      },
      {
        "title": "Make",
        "desc": "Animation, AI production, editing, and sound come together."
      },
      {
        "title": "Refine & deliver",
        "desc": "Two revision rounds, final exports, and 7 days of technical support."
      }
    ],
    "faqTitle": "Before we press play.",
    "faqs": [
      {
        "q": "What does a project cost?",
        "a": "Simple editing projects start at $300–500 depending on scope. Motion design and AI video receive a custom quote based on length, complexity, and deliverables."
      },
      {
        "q": "What is included in the quote?",
        "a": "Deliverables are agreed before production. Scriptwriting, voice-over, and licensed music are additional unless explicitly included in your proposal."
      },
      {
        "q": "How long does production take?",
        "a": "You’ll receive a timeline after the brief. Production starts once your materials are received and the visual direction is approved."
      },
      {
        "q": "Can you work with our team?",
        "a": "Yes. I collaborate remotely with agencies, tech companies, and marketing teams worldwide, either on a complete film or a defined production role."
      },
      {
        "q": "What about revisions and support?",
        "a": "Two revision rounds are included, plus 7 days of technical support for export or final-file issues after delivery. New creative directions sit outside that support and are quoted separately."
      }
    ],
    "contactTitle": "Your next story starts here.",
    "contactIntro": "Have a launch, a complex idea, or footage waiting for a story? Tell me what you have in mind.",
    "yourName": "Your name",
    "yourEmail": "Your email",
    "yourBrief": "What are we making?",
    "briefHint": "Your goal, audience, deadline, and approximate budget…",
    "yourDeadline": "Target date (optional)",
    "yourBudget": "Budget range (optional)",
    "send": "Continue in email",
    "mailSubject": "Project enquiry",
    "mailNotice": "Opening your email app. Nothing is sent automatically — press send there to reach me.",
    "whatsapp": "Chat on WhatsApp",
    "formNote": "Opens your email app with the brief ready to review and send.",
    "footer": "Independent craft. Global collaboration.",
    "roleLabel": "MY CONTRIBUTION",
    "storyLabel": "THE STORY",
    "external": "View on Behance",
    "allWork": "Selected work",
    "pause": "Pause motion",
    "resume": "Play motion",
    "skip": "Skip to work",
    "close": "Close"
  },
  "ar": {
    "name": "محمود فضل النبي",
    "navWork": "أعمال مختارة",
    "navServices": "الخدمات",
    "navAbout": "عنّي",
    "cta": "خلّينا نتكلم",
    "eyebrow": "مصمم موشن مستقل · أعمل معك من أي مكان",
    "heroTop": "أفكار معقدة.",
    "heroBottom": "حركة تترك أثرًا.",
    "intro": "أحوّل رسالتك إلى قصص بصرية تلفت الانتباه وتوصل الفكرة. موشن ديزاين، فيديو بالذكاء الاصطناعي، ومونتاج مدروس — من أول كادر لآخر لحظة.",
    "viewWork": "شاهد أعمالي",
    "book": "احجز مكالمة تعارف",
    "since": "أصنع القصص منذ 2017",
    "remote": "تعاون عن بُعد، في كل مكان.",
    "selected": "قصص مختلفة، تنبض بالحركة.",
    "workIntro": "عوالم متنوعة يجمعها هدف واحد: توصيل الرسالة بشكل مؤثر.",
    "play": "شاهد الفيلم",
    "mediaNote": "الصوت مغلق حتى تضغط تشغيل.",
    "expertise": "كل ما تحتاجه لتحريك قصتك.",
    "tagline": "موشن وحكاية",
    "framesLabel": "01 / إطارات مختارة",
    "filmCaption": "أعمال مختارة",
    "filmCaptionText": "خمس قصص تتحرّك.",
    "badgeTitle": "مصمَّم ليتحرّك.",
    "badgeSub": "ومبنيّ ليتواصل.",
    "stageNote": "موشن / ذكاء اصطناعي / سرد بصري",
    "ticker": [
      "موشن ديزاين",
      "سرد بصري",
      "فيديو بالذكاء الاصطناعي",
      "مونتاج وصوت"
    ],
    "services": [
      {
        "title": "موشن ديزاين",
        "desc": "تبسيط الأفكار المعقدة ومنح علامتك إيقاعًا بصريًا مميزًا. فيديوهات شرح، أنيميشن ثنائي الأبعاد وتحريك شخصيات وشعارات ونصوص.",
        "tag": "شرح / هوية متحركة / شخصيات",
        "price": "عرض سعر مخصص"
      },
      {
        "title": "فيديو AI وسرد بصري",
        "desc": "تحويل الأفكار الطموحة إلى مشاهد مترابطة، تجمع التوليد بالذكاء الاصطناعي والتطوير البصري والتركيب والموشن جرافيك.",
        "tag": "فكرة / فيديو AI / تركيب بصري",
        "price": "عرض سعر مخصص"
      },
      {
        "title": "مونتاج وتصميم صوت",
        "desc": "الإيقاع والإحساس والوضوح في كل لقطة. مونتاج، تصميم صوت، معالجة لونية، وتجهيز نسخ للسوشيال ميديا والإعلانات.",
        "tag": "مونتاج / صوت / سوشيال",
        "price": "المونتاج البسيط يبدأ من 300–500$"
      }
    ],
    "aboutTitle": "شريكك الإبداعي، من الفكرة لآخر كادر.",
    "about": "أنا محمود، مصمم موشن أول ومتخصص في السرد البصري. بدأت مهنيًا عام 2017، وأحوّل الرسائل المعقدة إلى قصص شخصيات وفيديوهات توضيحية وأعمال مدعومة بالذكاء الاصطناعي. أتعاون عن بُعد مع شركات التقنية وSaaS والوكالات وفرق التسويق المهتمة بالفكرة وجودة التنفيذ.",
    "aboutSmall": "موشن ديزاين · سرد بصري · فيديو بالذكاء الاصطناعي",
    "processLabel": "طريقة العمل",
    "processTitle": "خطوات واضحة، ومساحة للإبداع.",
    "steps": [
      {
        "title": "نفهم",
        "desc": "نحدد الجمهور والهدف والمواد المتاحة والرسالة الأساسية."
      },
      {
        "title": "نخطط",
        "desc": "فكرة وستوريبورد واتجاه بصري نتفق عليه قبل التنفيذ."
      },
      {
        "title": "نصنع",
        "desc": "نجمع التحريك وإنتاج AI والمونتاج والصوت في قصة واحدة."
      },
      {
        "title": "نراجع ونسلّم",
        "desc": "جولتان من التعديلات، ملفات نهائية، و7 أيام دعم فني للتصدير."
      }
    ],
    "faqTitle": "قبل ما نبدأ.",
    "faqs": [
      {
        "q": "كم تكلفة المشروع؟",
        "a": "المونتاج البسيط يبدأ من 300–500$ حسب النطاق. الموشن وفيديو AI لهما عرض سعر مخصص حسب المدة والتعقيد والمخرجات."
      },
      {
        "q": "ماذا يشمل عرض السعر؟",
        "a": "نتفق على المخرجات قبل الإنتاج. كتابة السكريبت والتعليق الصوتي والموسيقى المرخصة إضافات، إلا إذا ذُكرت ضمن العرض."
      },
      {
        "q": "ما مدة التنفيذ؟",
        "a": "أحدد جدولًا زمنيًا بعد فهم المشروع. تبدأ المدة بعد استلام المواد واعتماد الاتجاه البصري."
      },
      {
        "q": "هل تتعاون مع فريقنا؟",
        "a": "نعم، أعمل عن بُعد مع الوكالات وشركات التقنية وفرق التسويق عالميًا، لتنفيذ فيلم متكامل أو دور إنتاج محدد."
      },
      {
        "q": "كم جولة تعديل، وهل هناك دعم بعد التسليم؟",
        "a": "جولتان من التعديلات، و7 أيام من الدعم الفني البسيط لمشكلات الملف النهائي أو التصدير بعد التسليم. التغييرات الإبداعية الجديدة ليست ضمن الدعم وتُسعّر بشكل منفصل."
      }
    ],
    "contactTitle": "قصتك القادمة تبدأ هنا.",
    "contactIntro": "عندك إطلاق جديد أو فكرة معقدة أو لقطات تنتظر قصة؟ احكِ لي عن مشروعك.",
    "yourName": "اسمك",
    "yourEmail": "بريدك الإلكتروني",
    "yourBrief": "ما المشروع الذي نفكر فيه؟",
    "briefHint": "الهدف، الجمهور، الموعد المتوقع، والميزانية التقريبية…",
    "yourDeadline": "الموعد المطلوب (اختياري)",
    "yourBudget": "الميزانية التقديرية (اختياري)",
    "send": "متابعة عبر البريد",
    "mailSubject": "طلب مشروع",
    "mailNotice": "جارٍ فتح تطبيق البريد لديك. لا يُرسل شيء تلقائيًا — راجع الرسالة واضغط إرسال.",
    "whatsapp": "تواصل عبر واتساب",
    "formNote": "يفتح تطبيق البريد برسالة جاهزة للمراجعة والإرسال بنفسك.",
    "footer": "صناعة مستقلة، وتعاون بلا حدود.",
    "roleLabel": "دوري في المشروع",
    "storyLabel": "القصة",
    "external": "شاهد على Behance",
    "allWork": "أعمال مختارة",
    "pause": "إيقاف الحركة",
    "resume": "تشغيل الحركة",
    "skip": "تجاوز إلى الأعمال",
    "close": "إغلاق"
  },
  "projects": [
    {
      "id": "knauf",
      "client": "KNAUF AQUAPANEL",
      "type": "MOTION / CHARACTER",
      "image": "/assets/knauf.webp",
      "video": "/assets/knauf.mp4",
      "url": "https://www.behance.net/gallery/252856083/camp7-knauf",
      "en": {
        "title": "Bending the possibilities.",
        "subtitle": "Harald · Product explainer",
        "role": "Motion Designer, 2D & Character Animator, AI Video Artist, Video Editor & Sound Designer",
        "story": "A character-led explainer exploring the bendability of Knauf AQUAPANEL boards. Guided by Harald, the film connects a technical material property with architectural design possibilities through animated explanations and project imagery."
      },
      "ar": {
        "title": "مرونة تفتح آفاق التصميم.",
        "subtitle": "هارالد · فيلم توضيحي للمنتج",
        "role": "موشن ديزاين، تحريك ثنائي الأبعاد وشخصيات، فيديو AI، مونتاج وتصميم صوت",
        "story": "فيلم يشرح قابلية ألواح Knauf AQUAPANEL للانحناء من خلال شخصية هارالد. يربط خاصية تقنية بإمكانيات التصميم المعماري، باستخدام الشرح المتحرك وصور المشاريع."
      },
      "visible": true
    },
    {
      "id": "sarah",
      "client": "KNAUF",
      "type": "AI VIDEO / STORYTELLING",
      "image": "/assets/sarah.webp",
      "video": "/assets/sarah.mp4",
      "url": "https://www.behance.net/gallery/244511771/sarah",
      "en": {
        "title": "A journey. A connection.",
        "subtitle": "Sarah · Digital customer journey",
        "role": "Motion Designer & AI Video Artist; video editing",
        "story": "An AI-assisted visual story following Sarah’s digital journey with Knauf: discovering branded content, visiting the website, making an enquiry, and meeting the team. AI scenes, interface sequences, and motion graphics connect the stages of awareness, consideration, and purchase."
      },
      "ar": {
        "title": "رحلة عميل، وقصة تواصل.",
        "subtitle": "سارة · رحلة العميل الرقمية",
        "role": "موشن ديزاين وفيديو بالذكاء الاصطناعي ومونتاج",
        "story": "قصة مدعومة بالذكاء الاصطناعي تتبع رحلة سارة مع Knauf، من اكتشاف المحتوى وزيارة الموقع إلى الاستفسار ولقاء الفريق. مشاهد AI وواجهات وموشن جرافيك تربط مراحل الوعي والتفكير والشراء."
      },
      "visible": true
    },
    {
      "id": "who",
      "client": "WHO EMRO",
      "type": "MOTION / INFORMATION",
      "image": "/assets/who.webp",
      "video": "/assets/who.mp4",
      "url": "https://www.behance.net/gallery/252856489/Who-Emro",
      "en": {
        "title": "Making the message clear.",
        "subtitle": "Public health · Regional response",
        "role": "Motion Designer & Video Producer",
        "story": "A motion-led public health film presenting substance-use challenges and regional response efforts in the Eastern Mediterranean. Animated data, maps, typography, and filmed material structure a complex message around the challenge, the response, and the call to action."
      },
      "ar": {
        "title": "رسالة معقدة، رؤية أوضح.",
        "subtitle": "الصحة العامة · الاستجابة الإقليمية",
        "role": "مصمم موشن ومنتج فيديو",
        "story": "فيلم للصحة العامة يعرض تحديات تعاطي المواد وجهود الاستجابة في إقليم شرق المتوسط. يجمع بيانات متحركة وخرائط ونصوصًا ومواد مصورة لتنظيم الرسالة حول التحدي والاستجابة والدعوة للعمل."
      },
      "visible": true
    },
    {
      "id": "alzahbi",
      "client": "ALZAHABI GROUP",
      "type": "2D / CHARACTER / BRAND",
      "image": "/assets/alzahbi.webp",
      "video": "/assets/alzahbi.mp4",
      "url": "https://www.behance.net/gallery/253042803/-ALZAHBI",
      "en": {
        "title": "Everyday life. Animated.",
        "subtitle": "Neighbourhood shop · Episode 02",
        "role": "End-to-End Motion Designer & Video Producer",
        "story": "A character-driven branded animation set in a neighbourhood shop. Sudanese dialogue and everyday humour weave Alzahabi products into a familiar exchange between a shopkeeper and a customer, in a visual world suited to an ongoing series."
      },
      "ar": {
        "title": "حكايات يومية، بروح متحركة.",
        "subtitle": "دكان الحي · الحلقة الثانية",
        "role": "تنفيذ متكامل للموشن ديزاين وإنتاج الفيديو",
        "story": "أنيميشن لشخصيات داخل دكان في الحي، يمزج الحوار السوداني والمواقف اليومية الكوميدية بحضور منتجات الذهبي، من خلال حديث مألوف بين صاحب الدكان وزبونة، في عالم بصري يصلح لسلسلة مستمرة."
      },
      "visible": true
    },
    {
      "id": "knauf-camp4",
      "client": "KNAUF",
      "type": "ARCHITECTURE / MOTION",
      "image": "/assets/knauf-camp4.webp",
      "video": "/assets/knauf-camp4.mp4",
      "url": "",
      "visible": true,
      "en": {
        "title": "Future forms, made visible.",
        "subtitle": "KNAUF · Camp 4 architectural film",
        "role": "Motion editing and visual storytelling",
        "story": "A vertical architectural film that brings AQUAPANEL applications into futuristic built environments. Product imagery, spatial transitions and graphic information turn material specifications into a visual design journey."
      },
      "ar": {
        "title": "عمارة المستقبل في كادر واحد.",
        "subtitle": "Knauf · فيلم معماري عمودي",
        "role": "مونتاج موشن وسرد بصري",
        "story": "فيلم معماري عمودي يعرض استخدامات AQUAPANEL داخل بيئات تصميم مستقبلية. تجمع اللقطات بين صور المنتج والانتقالات المكانية والمعلومات البصرية لتحويل الخصائص التقنية إلى رحلة تصميم."
      }
    },
    {
      "id": "fawry",
      "client": "BANK OF KHARTOUM",
      "type": "2D / CHARACTER / FINANCE",
      "image": "/assets/fawry.webp",
      "video": "/assets/fawry.mp4",
      "url": "",
      "visible": true,
      "en": {
        "title": "Money moves. The story follows.",
        "subtitle": "Fawry · Banking explainer",
        "role": "Character animation and motion editing",
        "story": "A character-led animated explainer for Fawry money transfers. Friendly illustrated figures, a map and concise Arabic typography make the steps and reach of the service easy to follow."
      },
      "ar": {
        "title": "التحويل أسهل لما الحكاية تتحرك.",
        "subtitle": "فوري · شرح خدمة التحويلات",
        "role": "تحريك شخصيات ومونتاج موشن",
        "story": "فيلم توضيحي متحرك لخدمة تحويلات فوري. شخصيات مرسومة وخريطة ونصوص عربية مختصرة تساعد المشاهد على فهم الخدمة وانتشارها بخطوات واضحة."
      }
    },
    {
      "id": "bookify",
      "client": "BOOKIFY",
      "type": "PRODUCT / EDITING",
      "image": "/assets/bookify.webp",
      "video": "/assets/bookify.mp4",
      "url": "",
      "visible": true,
      "en": {
        "title": "A booking journey in motion.",
        "subtitle": "Bookify · Website walkthrough",
        "role": "Product video editing and interface presentation",
        "story": "A vertical walkthrough of the Bookify site, moving from the opening screen through search, guest details and payment. The edit focuses attention on the interface and the flow from discovery to reservation."
      },
      "ar": {
        "title": "رحلة حجز واضحة من أول نقرة.",
        "subtitle": "Bookify · استعراض للموقع",
        "role": "مونتاج فيديو منتج وعرض واجهات",
        "story": "استعراض عمودي لموقع Bookify، يبدأ من الصفحة الرئيسية ويمر بالبحث وبيانات الضيف والدفع. يبرز المونتاج الواجهة وتسلسل الخطوات من الاكتشاف إلى إتمام الحجز."
      }
    },
    {
      "id": "bushraa",
      "client": "BUSHRAA",
      "type": "BRAND / FILM",
      "image": "/assets/bushraa.webp",
      "video": "/assets/bushraa.mp4",
      "url": "",
      "visible": true,
      "en": {
        "title": "A familiar moment, told warmly.",
        "subtitle": "Bushraa · Lifestyle film",
        "role": "Video editing and story pacing",
        "story": "A warm lifestyle film built around home, food and everyday interaction. Close-up details and human moments give the brand story an intimate, lived-in feel."
      },
      "ar": {
        "title": "لحظة يومية، بقصة دافئة.",
        "subtitle": "بشرى · فيلم حياتي",
        "role": "مونتاج وإيقاع سردي",
        "story": "فيلم حياتي دافئ تدور لقطاته حول البيت والطعام والتفاعل اليومي. التفاصيل القريبة واللحظات الإنسانية تمنح قصة العلامة إحساسًا مألوفًا وقريبًا."
      }
    },
    {
      "id": "contentme-germany",
      "client": "CONTENTME",
      "type": "EVENT / BRAND FILM",
      "image": "/assets/contentme-germany.webp",
      "video": "/assets/contentme-germany.mp4",
      "url": "",
      "visible": true,
      "en": {
        "title": "The energy of an event, in one story.",
        "subtitle": "ContentMe Germany · Event film",
        "role": "Event editing and motion graphics",
        "story": "An event montage combining people, talks, activities and branded graphic frames. The edit captures the pace of the gathering and connects separate moments into a coherent recap."
      },
      "ar": {
        "title": "طاقة الفعالية في قصة واحدة.",
        "subtitle": "ContentMe Germany · فيلم فعالية",
        "role": "مونتاج فعاليات وموشن جرافيك",
        "story": "مونتاج يجمع الحضور والحوارات والأنشطة داخل إطارات جرافيكية مرتبطة بالهوية. ينقل إيقاع الفعالية ويربط لحظاتها المختلفة في ملخص متماسك."
      }
    },
    {
      "id": "melle",
      "client": "MELLE",
      "type": "PRODUCT / MOTION",
      "image": "/assets/melle.webp",
      "video": "/assets/melle.mp4",
      "url": "",
      "visible": true,
      "en": {
        "title": "A product world with a fresh pulse.",
        "subtitle": "Melle · Product visual",
        "role": "Motion editing and product presentation",
        "story": "A short product-focused film using a dark stage, animated ingredients and lively colour. The composition builds from a single bottle into a fresh, sensory brand world."
      },
      "ar": {
        "title": "منتج واحد، عالم بصري منعش.",
        "subtitle": "Melle · فيلم منتج",
        "role": "مونتاج موشن وعرض منتج",
        "story": "فيلم قصير يضع المنتج في مساحة داكنة تحيط بها المكونات المتحركة والألوان الحيوية. يتطور التكوين من عبوة واحدة إلى عالم بصري يعبر عن إحساس العلامة."
      }
    },
    {
      "id": "break-logic",
      "client": "BREAK LOGIC",
      "type": "PRODUCTION / SHOWCASE",
      "image": "/assets/break-logic.webp",
      "video": "/assets/break-logic.mp4",
      "url": "",
      "visible": true,
      "en": {
        "title": "Many stories. One creative pulse.",
        "subtitle": "Break Logic · Production showcase",
        "role": "Showcase editing and pacing",
        "story": "A showcase of filmed work that moves between people, locations and campaign moments. The sequence uses varied footage and energetic pacing to present the range of a production team."
      },
      "ar": {
        "title": "حكايات كثيرة بإيقاع إبداعي واحد.",
        "subtitle": "Break Logic · عرض أعمال",
        "role": "مونتاج عرض أعمال وإيقاع بصري",
        "story": "عرض لأعمال مصورة ينتقل بين الأشخاص والمواقع ولحظات الحملات. يوظف تنوع اللقطات والإيقاع النشط لإبراز اتساع إنتاج الفريق."
      }
    },
    {
      "id": "agb-eid",
      "client": "AFRICA & GULF BANK",
      "type": "BRAND / SEASONAL",
      "image": "/assets/agb-eid.webp",
      "video": "/assets/agb-eid.mp4",
      "url": "",
      "visible": true,
      "en": {
        "title": "A greeting shaped for Eid.",
        "subtitle": "Africa & Gulf Bank · Eid film",
        "role": "Brand film editing and graphic finishing",
        "story": "A compact Eid al-Adha brand film that brings a festive message to a clear closing identity. The square format is suited to social sharing and seasonal campaign placement."
      },
      "ar": {
        "title": "تهنئة عيد بهوية واضحة.",
        "subtitle": "بنك أفريقيا والخليج · فيلم العيد",
        "role": "مونتاج فيلم العلامة والتجهيز الجرافيكي",
        "story": "فيلم قصير لعيد الأضحى يصل برسالته الاحتفالية إلى خاتمة تحمل هوية البنك بوضوح. صيغته المربعة مناسبة للمشاركة على المنصات الاجتماعية والحملات الموسمية."
      }
    },
    {
      "id": "dr-zainab",
      "client": "DR. ZAINAB",
      "type": "SOCIAL / EDITING",
      "image": "/assets/dr-zainab.webp",
      "video": "/assets/dr-zainab.mp4",
      "url": "",
      "visible": true,
      "en": {
        "title": "A personal message, clearly framed.",
        "subtitle": "Dr. Zainab · Social video",
        "role": "Vertical video editing and on-screen typography",
        "story": "A vertical talking-head video that keeps the speaker at the centre while supporting key points with Arabic on-screen text. The pacing and framing suit direct viewing on mobile social platforms."
      },
      "ar": {
        "title": "رسالة شخصية في كادر واضح.",
        "subtitle": "د. زينب · فيديو اجتماعي",
        "role": "مونتاج عمودي ونصوص على الشاشة",
        "story": "فيديو عمودي يضع المتحدثة في قلب الصورة ويدعم الأفكار الأساسية بنصوص عربية على الشاشة. إيقاعه وتكوينه مناسبان للمشاهدة المباشرة على الهاتف ومنصات التواصل."
      }
    },
    {
      "id": "low-angle",
      "client": "AUTOMOTIVE STUDY",
      "type": "COMPOSITING / SHORT FORM",
      "image": "/assets/low-angle.webp",
      "video": "/assets/low-angle.mp4",
      "url": "",
      "visible": true,
      "en": {
        "title": "One angle. More attitude.",
        "subtitle": "Automotive · Low-angle study",
        "role": "Short-form editing and compositing",
        "story": "A compact automotive scene built around a low camera angle, a white car and a character reveal. The tight duration gives the movement and visual surprise a quick payoff."
      },
      "ar": {
        "title": "زاوية واحدة، حضور أكبر.",
        "subtitle": "مشهد سيارة · تجربة زاوية سفلية",
        "role": "مونتاج قصير وتركيب بصري",
        "story": "مشهد سيارة قصير يتمحور حول زاوية تصوير منخفضة وسيارة بيضاء وظهور شخصية. يمنح الزمن المكثف للحركة والمفاجأة البصرية أثرًا سريعًا."
      }
    },
    {
      "id": "tejarah",
      "client": "تجارة مع الله",
      "type": "TYPOGRAPHY / EDITING",
      "image": "/assets/tejarah.webp",
      "video": "/assets/tejarah.mp4",
      "url": "",
      "visible": true,
      "en": {
        "title": "A message carried by rhythm.",
        "subtitle": "Arabic message · Editorial motion",
        "role": "Video editing and Arabic typography",
        "story": "A text-led Arabic video that builds its message through paced typography, a restrained green palette and small graphic accents. The words remain central as the motion supports reading and emphasis."
      },
      "ar": {
        "title": "رسالة تحملها الكلمات والإيقاع.",
        "subtitle": "تجارة مع الله · مونتاج نصي",
        "role": "مونتاج وتحريك نصوص عربية",
        "story": "فيديو عربي تقوده الكلمات، يبني رسالته بإيقاع نصي ولوحة خضراء هادئة ولمسات جرافيكية صغيرة. تظل القراءة في المركز بينما تدعم الحركة الفهم والتأكيد."
      }
    }
  ]
};

let lang=initialLang();

function initialLang(){
  const requested=new URLSearchParams(location.search).get('lang');
  if(requested==='ar'||requested==='en')return requested;
  return localStorage.getItem('portfolio-language')==='ar'?'ar':'en';
}

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
<header><a class="brand" href="#"><img class="brand-mark" src="/assets/mahmoud-mark-mint.png" alt=""><span>${esc(t.name)}<small>${esc(d.tagline)}</small></span></a><nav aria-label="${esc(t.navWork)}">${headerNav}</nav><div class="header-actions"><button class="effects-toggle" type="button" aria-pressed="${effectsEnabled}" aria-label="${effectsEnabled?(lang==='ar'?'إيقاف التأثيرات':'Turn effects off'):(lang==='ar'?'تشغيل التأثيرات':'Turn effects on')}" title="${effectsEnabled?(lang==='ar'?'إيقاف التأثيرات':'Turn effects off'):(lang==='ar'?'تشغيل التأثيرات':'Turn effects on')}">${icon('spark')} <span>${effectsEnabled?(lang==='ar'?'الحركة تعمل':'Motion on'):(lang==='ar'?'شغّل الحركة':'Motion off')}</span></button><button class="lang" type="button" aria-label="${lang==='en'?'التبديل إلى العربية':'Switch to English'}">${lang==='en'?'العربية':'EN'}</button><a class="pill small" href="#contact">${esc(t.cta)} ${icon('arrow')}</a></div></header>
<nav class="mobile-nav" aria-label="${esc(t.cta)}">${mobileNav}</nav>
<main>
<section class="hero"><div class="hero-copy"><p class="eyebrow"><i></i>${esc(t.eyebrow)}</p><h1>${esc(t.heroTop)}<br><em>${esc(t.heroBottom)}</em></h1><p class="intro">${esc(t.intro)}</p><div class="actions"><a class="pill" href="#work">${esc(t.viewWork)} ${icon('down')}</a><a class="text-link" href="${safeUrl(content.calendar)}" target="_blank" rel="noopener">${icon('calendar')} ${esc(t.book)} ${icon('arrow')}</a></div></div>
<div class="hero-stage"><div class="orbits" aria-hidden="true"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div></div>
<div class="film-window"><div class="film-toolbar"><span>${esc(d.framesLabel)}</span><span>MF®</span></div><video id="heroVideo" muted loop playsinline preload="metadata" poster="/assets/showreel-five.webp" ${effectsEnabled?'autoplay':''} src="/assets/showreel-five.mp4"></video><div class="film-bottom"><span>${esc(d.filmCaption)}<br><b>${esc(d.filmCaptionText)}</b></span><button id="motion" type="button" aria-label="${esc(t.pause)}">${icon('pause')}</button></div></div>
<div class="glass-badge"><span class="star" aria-hidden="true">✳</span><div>${esc(d.badgeTitle)}<br><strong>${esc(d.badgeSub)}</strong></div></div>
<div class="stage-note">${esc(d.stageNote)}</div></div>
<div class="hero-foot"><span>${esc(t.since)}</span><span>${esc(t.remote)} <i class="dot"></i></span><a href="#work" aria-label="${esc(t.viewWork)}">${icon('down')}</a></div></section>
<div class="ticker" aria-hidden="true"><div class="ticker-track">${[0,1].map(()=>`<span>${d.ticker.map(item=>`<span>${esc(item)}</span>`).join('<b>✳</b>')}</span>`).join('')}</div></div>
<section id="work" class="section"><div class="section-heading"><div><p class="eyebrow">01 / ${esc(t.navWork)}</p><h2>${esc(t.selected)}</h2></div><p>${esc(t.workIntro)}</p></div><div class="projects">${visibleProjects.slice(0,3).map(({project,index})=>projectCard(project,index,t)).join('')}</div>${visibleProjects.length>3?`<details class="project-archive"><summary>${lang==='ar'?'اعرض كل الفيديوهات':'View all videos'} <span>${String(visibleProjects.length-3).padStart(2,'0')}${icon('down')}</span></summary><div class="archive-grid">${visibleProjects.slice(3).map(({project,index})=>projectCard(project,index,t)).join('')}</div></details>`:''}</section>
<section id="services" class="section services"><div class="section-heading"><div><p class="eyebrow">02 / ${esc(t.navServices)}</p><h2>${esc(t.expertise)}</h2></div><span class="big-star" aria-hidden="true">✳</span></div><div class="service-grid">${t.services.map((service,index)=>`<article><span class="service-num">0${index+1} /</span><h3>${esc(service.title)}</h3><p>${esc(service.desc)}</p><small>${esc(service.tag)}</small><strong>${esc(service.price)}${icon('arrow')}</strong></article>`).join('')}</div></section>
<section id="about" class="section about"><div class="portrait"><img src="/assets/mahmoud.webp" loading="lazy" decoding="async" alt="${esc(t.name)}"><span>${esc(t.since)} ↗</span></div><div><p class="eyebrow">03 / ${esc(t.navAbout)}</p><h2>${esc(t.aboutTitle)}</h2><p>${esc(t.about)}</p><div class="signature">${esc(t.name)}<span aria-hidden="true">✳</span></div><small>${esc(t.aboutSmall)}</small></div></section>
<section class="section process"><p class="eyebrow">04 / ${esc(d.processLabel)}</p><h2>${esc(t.processTitle)}</h2><div class="steps">${t.steps.map((step,index)=>`<article><span>0${index+1}</span><h3>${esc(step.title)}</h3><p>${esc(step.desc)}</p></article>`).join('')}</div></section>
<section class="section faq"><h2>${esc(t.faqTitle)}</h2><div>${t.faqs.map(item=>`<details><summary>${esc(item.q)}<span aria-hidden="true">+</span></summary><p>${esc(item.a)}</p></details>`).join('')}</div></section>
<section id="contact" class="section contact"><div><p class="eyebrow"><i></i> ${esc(t.cta)}</p><h2>${esc(t.contactTitle)}</h2><p>${esc(t.contactIntro)}</p><a class="email" href="mailto:${esc(content.email)}">${icon('mail')} ${esc(content.email)} ${icon('arrow')}</a><div class="actions"><a class="text-link" href="https://wa.me/${esc(String(content.phone).replace(/\D/g,''))}" target="_blank" rel="noopener">${icon('message')} ${esc(t.whatsapp)} ${icon('arrow')}</a><a class="text-link" href="${safeUrl(content.calendar)}" target="_blank" rel="noopener">${icon('calendar')} ${esc(t.book)} ${icon('arrow')}</a></div></div>
<form id="brief"><div class="form-row"><label>${esc(t.yourName)}<input name="name" autocomplete="name" required maxlength="100"></label><label>${esc(t.yourEmail)}<input name="email" type="email" autocomplete="email" required maxlength="200"></label></div><label>${esc(t.yourBrief)}<textarea name="brief" placeholder="${esc(t.briefHint)}" required rows="4" maxlength="3000"></textarea></label><div class="form-row"><label>${esc(t.yourDeadline)}<input name="deadline" type="date"></label><label>${esc(t.yourBudget)}<input name="budget" type="text" maxlength="60" inputmode="text"></label></div><button class="pill" type="submit">${esc(t.send)} ${icon('arrow')}</button><p id="formStatus" class="form-status" role="status" aria-live="polite"></p><small>${esc(t.formNote)}</small></form></section>
</main><footer><a class="brand" href="#" aria-label="${esc(t.name)}"><img class="brand-mark" src="/assets/mahmoud-mark-mint.png" alt=""></a><span>© ${new Date().getFullYear()} ${esc(t.name)}</span><span>${esc(t.footer)}</span></footer>
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
  const hero=document.querySelector('#heroVideo'),motion=document.querySelector('#motion');
  const sync=()=>{motion.innerHTML=icon(hero.paused?'play':'pause');motion.setAttribute('aria-label',hero.paused?content[lang].resume:content[lang].pause);};
  hero.onplay=sync;hero.onpause=sync;sync();
  motion.onclick=()=>{hero.paused?hero.play():hero.pause();};
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
  detail.innerHTML=`<p class="eyebrow">${esc(project.client)} / ${esc(project.type)}</p><h2>${esc(project[lang].title)}</h2><video controls playsinline preload="metadata" poster="${safeUrl(project.image)}" src="${safeUrl(project.video)}"></video><p class="detail-hint">${esc(t.mediaNote||'')}</p><div class="detail-columns"><div><p class="eyebrow">${esc(t.storyLabel)}</p><p>${esc(project[lang].story)}</p></div><div><p class="eyebrow">${esc(t.roleLabel)}</p><p>${esc(project[lang].role)}</p>${project.url?`<a class="text-link" href="${safeUrl(project.url)}" target="_blank" rel="noopener">${esc(t.external)}${icon('arrow')}</a>`:''}</div></div>`;
  dialog.setAttribute('aria-label',project[lang].title);
  dialog.showModal();
  document.body.classList.add('modal-open');
}

closeButton.onclick=()=>dialog.close();
dialog.onclick=event=>{if(event.target===dialog)dialog.close();};
dialog.onclose=()=>{detail.querySelector('video')?.pause();document.body.classList.remove('modal-open');};

function boot(){
  render();
  wire();
  if(effectsEnabled)requestAnimationFrame(()=>app.classList.add('site-enter'));
}
boot();