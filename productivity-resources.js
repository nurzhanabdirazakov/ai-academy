const $=(selector,root=document)=>root.querySelector(selector);
const app=$("#app");
const page=document.body.dataset.page;
const safetyRule="Құпия немесе жеке деректерді қолданба. Нақты ақпарат жеткіліксіз болса, оны ойдан шығарма. Маңызды фактілерді тексеру қажеттігін белгіле.";

function node(tag,className,text){const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el}
function toast(message){const el=$("#toast");el.textContent=message;el.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove("show"),2200)}
async function copy(text){try{await navigator.clipboard.writeText(text);toast("Көшірілді!")}catch{toast("Мәтінді қолмен көшіріңіз")}}
function button(label,action,primary=false){const b=node("button",primary?"primary":"",label);b.type="button";b.addEventListener("click",action);return b}

const prompts=[
  ["Жоспарлау","Апталық жұмыс жоспары","Бір апталық міндеттерді басымдыққа бөліп, нақты жоспар құру.","Сен кәсіби өнімділік коучысың. Менің осы аптадағы міндеттерім: [МІНДЕТТЕР]. Уақыт шектеулерім: [ШЕКТЕУЛЕР]. Міндеттерді маңыздылық пен жеделдік бойынша жікте. Әр күнге 3 негізгі нәтиже, уақыт блоктары және ықтимал кедергілерді көрсет. Нәтижені кесте түрінде бер."],
  ["Жоспарлау","Күндік фокус","Күннің негізгі нәтижесін анықтап, алаңдататын істерді қысқарту.","Бүгінгі міндеттерім: [ТІЗІМ]. Қолжетімді уақытым: [САҒАТ]. Энергия деңгейім: [ДЕҢГЕЙ]. Бір негізгі нәтиже мен үш қосымша міндетті таңда. 25–50 минуттық жұмыс блоктарын және үзілістерді ұсын."],
  ["Коммуникация","Кәсіби email","Қысқа, сыпайы және нақты жұмыс хатын әзірлеу.","Сен іскерлік коммуникация редакторысың. Хаттың мақсаты: [МАҚСАТ]. Алушы: [АЛУШЫ]. Негізгі ақпарат: [АҚПАРАТ]. Қазақ тілінде 120 сөзден аспайтын кәсіби email жаз. Тақырып жолын, нақты әрекет сұрауын және сыпайы аяқталуын қос."],
  ["Коммуникация","Күрделі әңгімені дайындау","Кері байланыс немесе келіспеушілікке арналған бейтарап сценарий.","Мен [АДАМ/ТОП] адамымен [МӘСЕЛЕ] туралы сөйлесуім керек. Әңгіменің мақсаты: [НӘТИЖЕ]. Факті, әсер, сұрақ және келісілген келесі қадам құрылымымен бейтарап сөйлесу сценарийін жаса. Қорғаныс реакциясына жауап берудің 3 нұсқасын қос."],
  ["Кездесу","Кездесу күн тәртібі","Нәтижеге бағытталған қысқа жиналыс жоспары.","Кездесу тақырыбы: [ТАҚЫРЫП]. Қатысушылар: [ҚАТЫСУШЫЛАР]. Ұзақтығы: [УАҚЫТ]. Күтілетін шешім: [ШЕШІМ]. Минуттарға бөлінген күн тәртібін, талқылау сұрақтарын, шешім қабылдау тәсілін және follow-up үлгісін жаса."],
  ["Кездесу","Хаттаманы қорытындылау","Жиналыс жазбасынан шешімдер мен міндеттерді шығару.","Төмендегі кездесу жазбасын талда: [ЖАЗБА]. Тек мәтінде бар ақпаратқа сүйен. Шешімдер, ашық сұрақтар, міндет, жауапты адам, мерзім және тәуекел бағандары бар кесте жаса. Белгісіз жауапты немесе мерзімді «нақтылау қажет» деп белгіле."],
  ["Құжат","Есеп құрылымы","Басшылыққа арналған қысқа аналитикалық есеп дайындау.","Сен басқарушылық есептер редакторысың. Тақырып: [ТАҚЫРЫП]. Деректер: [ДЕРЕКТЕР]. Аудитория: [АУДИТОРИЯ]. Бір бетке сыйатын есеп құрылымын жаса: қысқаша түйін, негізгі көрсеткіштер, мәселе, ықтимал себептер, 3 ұсыныс, тәуекелдер және келесі қадамдар."],
  ["Құжат","Мәтінді қысқарту","Ұзын мәтінді мағынасын жоғалтпай ықшамдау.","Төмендегі мәтінді [СӨЗ САНЫ] сөзге дейін қысқарт: [МӘТІН]. Негізгі шешімдер, сандар, мерзімдер және тәуекелдерді сақта. Жаңа факт қоспа. Соңында алынып тасталған екінші деңгейлі ақпаратты бір жолмен көрсет."],
  ["Шешім","Нұсқаларды салыстыру","Бірнеше шешімді бірдей критериймен бағалау.","Салыстырылатын нұсқалар: [НҰСҚАЛАР]. Мақсат: [МАҚСАТ]. Шектеулер: [ШЕКТЕУЛЕР]. Баға, уақыт, әсер, тәуекел, енгізу күрделілігі және тұрақтылық критерийлері бойынша кесте жаса. Әр бағаны 1–5 аралығында негізде және соңғы таңдауды шарттарымен бірге ұсын."],
  ["Даму","Жеке даму жоспары","Дағдыны дамытуға арналған 30 күндік жоспар.","Мен дамытқым келетін дағды: [ДАҒДЫ]. Қазіргі деңгейім: [ДЕҢГЕЙ]. Күніне бөлетін уақытым: [УАҚЫТ]. 30 күндік жоспар жаса: апталық мақсат, күнделікті микроәрекет, практика, кері байланыс және прогресті өлшеу көрсеткіші."],
  ["Даму","Кері байланысты талдау","Кері байланысты нақты даму әрекетіне айналдыру.","Маған берілген кері байланыс: [КЕРІ БАЙЛАНЫС]. Оны эмоциясыз талда. Нақты бақылауларды, болжамдарды және әрекетке болатын тұстарды ажырат. 3 даму қадамын, өлшеу көрсеткішін және жетекшіге қоятын нақтылау сұрақтарын ұсын."],
  ["Автоматтандыру","Процесті оңтайландыру","Қайталанатын жұмыс процесін жеңілдету.","Процесс: [ПРОЦЕСС СИПАТТАМАСЫ]. Қадамдар: [ҚАДАМДАР]. Уақыт шығыны: [УАҚЫТ]. Қателер: [ҚАТЕЛЕР]. Артық қадамдарды, автоматтандыру мүмкіндігін және стандарттауға болатын шаблондарды анықта. Қауіпсіздік пен адам бақылауын сақтайтын жаңа процесс ұсын."]
];

function renderPrompts(){
  const categories=["Барлығы",...new Set(prompts.map(item=>item[0]))];
  app.innerHTML='<div class="toolbar"><input id="search" type="search" placeholder="Промптты іздеу…" aria-label="Промптты іздеу"><select id="category" aria-label="Санат"></select></div><div id="prompt-grid" class="grid"></div>';
  categories.forEach(value=>{const option=node("option",null,value);option.value=value;$("#category").append(option)});
  const draw=()=>{const query=$("#search").value.toLowerCase(),category=$("#category").value,grid=$("#prompt-grid");grid.replaceChildren();prompts.filter(item=>(category==="Барлығы"||item[0]===category)&&item.join(" ").toLowerCase().includes(query)).forEach(item=>{const card=node("article","card");card.append(node("small",null,item[0]),node("h2",null,item[1]),node("p",null,item[2]),node("pre","prompt",item[3]+"\n\n"+safetyRule));const actions=node("div","actions");actions.append(button("Промптты көшіру",()=>copy(item[3]+"\n\n"+safetyRule),true));card.append(actions);grid.append(card)});if(!grid.children.length)grid.append(node("p","empty","Сұраныс бойынша промпт табылмады."))};
  $("#search").addEventListener("input",draw);$("#category").addEventListener("change",draw);draw();
}

const models=[
  {name:"РАҚМЕТ",letters:["Р","А","Қ","М","Е","Т"],desc:"Рөл, анықтау, қадамдар, мақсат, егжей-тегжей және тексеру арқылы толық промпт құру.",use:"Күрделі кәсіби міндеттер мен маңызды құжаттарға."},
  {name:"SMART",letters:["S","M","A","R","T"],desc:"Нақты, өлшенетін, қолжетімді, маңызды және мерзімі бар нәтиже құру.",use:"Мақсаттар, жоспарлар және KPI әзірлеуге."},
  {name:"CLEAR",letters:["C","L","E","A","R"],desc:"Контекст, шектеулер, мысал, әрекет және нәтиже форматын анықтау.",use:"Күнделікті жұмыс пен коммуникацияға."},
  {name:"CO-STAR",letters:["C","O","S","T","A","R"],desc:"Контекст, мақсат, стиль, тон, аудитория және жауап форматын біріктіру.",use:"Email, есеп, презентация және контентке."},
  {name:"PREP",letters:["P","R","E","P"],desc:"Позиция, себеп, мысал және қорытынды позиция арқылы ойды дәлелдеу.",use:"Баяндама, пікір және басқарушылық ұсынысқа."}
];

function renderModels(){
  app.innerHTML='<div id="model-grid" class="grid"></div><h2 class="section-title">Промпт конструкторы</h2><section class="builder"><div class="builder-fields"><label><span>Модель</span><select id="model-select"></select></label><label><span>Міндет</span><input id="task" placeholder="Мысалы: апталық есеп дайындау"></label><label><span>Контекст</span><textarea id="context" placeholder="Аудитория, бастапқы ақпарат, шектеулер"></textarea></label><label><span>Нәтиже форматы</span><select id="format"><option>Құрылымды жоспар</option><option>Кесте</option><option>Іскерлік хат</option><option>Аналитикалық есеп</option><option>Презентация жоспары</option></select></label></div><div><pre id="model-preview" class="preview"></pre><div class="actions"><button id="copy-model" class="primary" type="button">Промптты көшіру</button></div></div></section>';
  models.forEach((model,index)=>{const card=node("article","card");card.append(node("small",null,"PROMPT MODEL"),node("h2",null,model.name));const letters=node("div","model-letters");model.letters.forEach(letter=>letters.append(node("i",null,letter)));card.append(letters,node("p",null,model.desc),node("p",null,model.use));$("#model-grid").append(card);const option=node("option",null,model.name);option.value=index;$("#model-select").append(option)});
  const update=()=>{const model=models[Number($("#model-select").value)],task=$("#task").value.trim()||"[МІНДЕТ]",context=$("#context").value.trim()||"[КОНТЕКСТ ЖӘНЕ ШЕКТЕУЛЕР]",format=$("#format").value;$("#model-preview").textContent=`${model.name} моделін қолданып жұмыс істе.\n\nМіндет: ${task}.\nКонтекст: ${context}.\n\nЖауапты логикалық қадамдарға бөл. Нәтиже форматы: ${format}. Нақты ұсыныстар, басымдықтар және келесі әрекеттерді көрсет.\n\n${safetyRule}`};
  ["model-select","task","context","format"].forEach(id=>$("#"+id).addEventListener("input",update));$("#copy-model").addEventListener("click",()=>copy($("#model-preview").textContent));update();
}

const guides=[
  ["ChatGPT Edu-мен кәсіби жұмысты бастау","Интерфейс, алғашқы сұраныс, файлдар және қауіпсіздік.",["Нақты міндетті жазу","Контекст пен форматты көрсету","Нәтижені тексеру","Құпия деректерді енгізбеу"]],
  ["Жеке өнімділік гайды","Жоспарлау, басымдық қою және уақытты басқару.",["Апталық шолу","Күннің 3 нәтижесі","Уақыт блоктары","Рефлексия"]],
  ["Кәсіби коммуникация","Email, кездесу және күрделі әңгімені дайындау.",["Аудиторияны анықтау","Негізгі ойды қысқарту","Әрекет сұрауын көрсету","Тонды тексеру"]],
  ["Құжаттармен жұмыс","Есеп, хаттама және ұзын құжаттарды өңдеу.",["Файл мақсатын түсіндіру","Қажетті бөлімді көрсету","Жаңа факт қоспау","Нәтижені түпнұсқамен салыстыру"]],
  ["РАҚМЕТ моделі: кәсіби нұсқа","Құрылымды промптты күнделікті міндетке бейімдеу.",["Рөл беру","Контекст анықтау","Қадамдар","Мақсат","Егжей-тегжей","Тексеру"]],
  ["AI Safety жұмыс чеклисті","Кәсіби ортада жауапты AI қолдану.",["Құпиялылық","Факт-чек","Авторлық құқық","Адам бақылауы"]]
];

function renderGuides(){const grid=node("div","grid");guides.forEach((guide,index)=>{const card=node("article","card");const cover=node("div","guide-cover");cover.append(node("b",null,guide[0]));card.append(cover,node("small",null,`${18+index*2} БЕТ · BEGINNER`),node("h2",null,guide[0]),node("p",null,guide[1]));const details=node("div","details");details.hidden=true;guide[2].forEach((line,i)=>details.append(node("div",null,`${i+1}. ${line}`)));const actions=node("div","actions");actions.append(button("Онлайн оқу",()=>{details.hidden=!details.hidden}),button("Материалды жүктеу",()=>downloadGuide(guide),true));card.append(details,actions);grid.append(card)});app.append(grid)}
function downloadGuide(guide){const text=`${guide[0]}\n\n${guide[1]}\n\n${guide[2].map((x,i)=>`${i+1}. ${x}`).join("\n")}\n\nAI Academy · ChatGPT Edu`;const blob=new Blob([text],{type:"text/plain;charset=utf-8"});const link=document.createElement("a");link.href=URL.createObjectURL(blob);link.download=guide[0].replace(/\s+/g,"-").toLowerCase()+".txt";link.click();URL.revokeObjectURL(link.href);toast("Материал жүктелді")}

function renderTrainings(){app.innerHTML='<section class="video-grid"><article class="video-card"><iframe src="https://www.youtube.com/embed/SNgRPeEZQ-A" title="ChatGPT Edu кәсіби жұмыс тренингі" allowfullscreen></iframe><div><h2>ChatGPT Edu: тиімді жұмысты бастау</h2><p>Промпт жазу, күнделікті міндеттерді жоспарлау және нәтижені нақтылау тәсілдері.</p></div></article><article class="video-card"><iframe src="https://www.youtube.com/embed/_B7nXd5o478" title="ChatGPT Edu практикалық тренинг" allowfullscreen></iframe><div><h2>Файлдар, құжаттар және кәсіби коммуникация</h2><p>Құжаттарды талдау, есеп дайындау және қауіпсіз жұмыс бойынша практикалық сабақ.</p></div></article></section>'}

const checks={
  "Құпиялылық":["Жеке және құпия деректер енгізілген жоқ.","Ұйымның ішкі ақпараты ашылған жоқ.","Файлдардан идентификаторлар жойылды.","Деректерді қолдануға рұқсат бар."],
  "Дәлдік":["Негізгі фактілер тәуелсіз тексерілді.","Сандар, күндер және атаулар салыстырылды.","Болжамдар фактіден бөлек белгіленді.","Маңызды шешімді адам қайта қарады."],
  "Авторлық құқық":["Дереккөздер мен сілтемелер тексерілді.","Ойдан шығарылған сілтеме қолданылған жоқ.","Авторлық материал рұқсатқа сай пайдаланылды.","AI көмегі қажет жерде көрсетілді."],
  "Кәсіби жауапкершілік":["Нәтижеде кемсітуші тұжырым жоқ.","Шектеулер мен тәуекелдер көрсетілді.","Ұйым саясаты сақталды.","Соңғы шешімді жауапты маман қабылдады."]
};
function renderSafety(){app.innerHTML='<section class="progress-panel"><strong id="check-count">0 / 16</strong><div class="track"><i id="check-bar"></i></div><strong id="check-percent">0%</strong></section><form id="safety-form" class="checklist"></form><div class="actions"><button id="reset-checks" type="button">Қайта бастау</button></div>';const saved=JSON.parse(localStorage.getItem("productivity-safety")||"[]");let index=0;Object.entries(checks).forEach(([title,items])=>{const group=node("section","check-group");group.append(node("h2",null,title));items.forEach(item=>{const label=node("label");const input=document.createElement("input");input.type="checkbox";input.checked=Boolean(saved[index++]);label.append(input,node("span",null,item));group.append(label)});$("#safety-form").append(group)});const update=()=>{const boxes=[...document.querySelectorAll('#safety-form input')],done=boxes.filter(x=>x.checked).length,percent=Math.round(done/boxes.length*100);$("#check-count").textContent=`${done} / ${boxes.length}`;$("#check-percent").textContent=`${percent}%`;$("#check-bar").style.width=percent+"%";localStorage.setItem("productivity-safety",JSON.stringify(boxes.map(x=>x.checked)));if(done===boxes.length)toast("Чеклист аяқталды!")};$("#safety-form").addEventListener("change",update);$("#reset-checks").addEventListener("click",()=>{document.querySelectorAll('#safety-form input').forEach(x=>x.checked=false);update()});update()}

const cases=[
  ["Апталық жоспар","Жоспар жаса.","Менің міндеттерім: [ТІЗІМ]. Мерзімдер: [МЕРЗІМ]. Апталық жоспарды маңыздылық, уақыт блогы және күтілетін нәтиже бойынша кестеге бөл."],
  ["Кәсіби email","Хат жаз.","[АЛУШЫҒА] [МАҚСАТ] туралы 120 сөзден аспайтын кәсіби email жаз. Негізгі контекст: [АҚПАРАТ]. Нақты әрекет сұрауын және мерзімді көрсет."],
  ["Кездесу","Жиналыс жоспарын жаса.","[ТАҚЫРЫП] бойынша [30 МИНУТТЫҚ] кездесу күн тәртібін жаса. Қатысушылар: [ТОП]. Негізгі шешім, талқылау сұрақтары және жауапты әрекеттерді көрсет."],
  ["Есеп","Есепті жаз.","[ДЕРЕКТЕР] негізінде басшылыққа арналған бір беттік есеп құрастыр. Түйін, негізгі көрсеткіш, мәселе, 3 ұсыныс, тәуекел және келесі қадам бөлімдері болсын."],
  ["Кері байланыс","Кері байланыс бер.","[ЖАҒДАЙ] бойынша SBI құрылымымен кері байланыс дайында: жағдай, байқалған мінез-құлық, әсер және келісілетін келесі әрекет. Тон бейтарап әрі құрметті болсын."],
  ["Шешім қабылдау","Қайсысы жақсы?", "[A] және [B] нұсқаларын баға, уақыт, әсер, тәуекел және енгізу күрделілігі бойынша салыстыр. Әр критерийді 1–5 бағалап, ұсынысты шарттарымен түсіндір."],
  ["Даму жоспары","Дағдыны дамытуға көмектес.","[ДАҒДЫ] дағдысын қазіргі [ДЕҢГЕЙДЕН] дамытуға арналған 30 күндік жоспар жаса. Апталық мақсат, практика, ресурс және өлшеу көрсеткішін бер."],
  ["Процесті оңтайландыру","Осы процесті жақсарт.","[ПРОЦЕСС] қадамдарын уақыт, қайталану, қате және автоматтандыру мүмкіндігі бойынша талда. Адам бақылауын сақтайтын жаңа процесс пен енгізу жоспарын ұсын."]
];
function renderCases(){const grid=node("div","grid");cases.forEach(item=>{const card=node("article","card case-card");const head=node("div","case-head");head.append(node("small",null,"BEFORE / AFTER"),node("h2",null,item[0]));const compare=node("div","compare"),before=node("div","before"),after=node("div","after");before.append(node("strong",null,"ДЕЙІН"),node("pre",null,item[1]));after.append(node("strong",null,"КЕЙІН"),node("pre",null,item[2]+"\n\n"+safetyRule));const actions=node("div","actions");actions.append(button("Сапалы промптты көшіру",()=>copy(item[2]+"\n\n"+safetyRule),true));after.append(actions);compare.append(before,after);card.append(head,compare);grid.append(card)});app.append(grid)}

const ideas=[
  ["AI жұмыс серіктесі","Күн басында басымдықтарды бірге анықтап, күн соңында рефлексия жасаңыз."],
  ["Кездесу симуляторы","Маңызды кездесуді әртүрлі қатысушы рөлдерімен алдын ала сынаңыз."],
  ["Кері байланыс зертханасы","Бір хабарламаның жұмсақ, тікелей және коучинг нұсқаларын салыстырыңыз."],
  ["Шешімдер кеңесі","Қаржы, HR, клиент және тәуекел маманының көзқарасын модельдеңіз."],
  ["Болашақтағы жұмыс күні","Процестің 3 жылдан кейінгі тиімді нұсқасын сценарий ретінде құрыңыз."],
  ["Email тон редакторы","Бір мәтінді басшыға, әріптеске және серіктеске бейімдеңіз."],
  ["Кәсіби дағды квесті","30 күндік дамуды миссиялар мен прогресс нүктелеріне айналдырыңыз."],
  ["Анти-жиналыс","Кездесудің қай бөлігін хатпен немесе асинхронды форматпен алмастыруға болатынын табыңыз."],
  ["Процесс детективі","Уақыт жоғалатын қадамдарды дәлелдер арқылы анықтаңыз."],
  ["Бір мәселе — бес рөл","Мәселені қызметкер, басшы, клиент, қаржы және этика тұрғысынан талдаңыз."],
  ["Презентация трейлері","Ұсынысты 60 секундтық әсерлі кіріспе сценарийіне айналдырыңыз."],
  ["Апталық ретроспектива","Жетістік, кедергі, сабақ және келесі эксперимент форматында қорытынды жасаңыз."]
];
function renderCreative(){app.innerHTML='<section class="builder creative-builder"><div class="builder-fields"><label><span>Тақырып немесе міндет</span><input id="creative-topic" placeholder="Мысалы: командадағы коммуникация"></label><label><span>Шығармашылық формат</span><select id="creative-format"></select></label><label><span>Аудитория</span><input id="creative-audience" placeholder="Команда, басшылар, әріптестер"></label></div><div><pre id="creative-preview" class="preview"></pre><div class="actions"><button id="creative-copy" class="primary" type="button">Промптты көшіру</button><button id="creative-random" type="button">Кездейсоқ идея</button></div></div></section><div id="idea-grid" class="creative-grid"></div>';ideas.forEach((idea,index)=>{const option=node("option",null,idea[0]);option.value=index;$("#creative-format").append(option);const card=node("article","idea");card.append(node("b",null,idea[0]),node("p",null,idea[1]));card.addEventListener("click",()=>{$("#creative-format").value=index;updateCreative();window.scrollTo({top:280,behavior:"smooth"})});$("#idea-grid").append(card)});const updateCreative=()=>{const topic=$("#creative-topic").value.trim()||"[КӘСІБИ МІНДЕТ]",audience=$("#creative-audience").value.trim()||"[АУДИТОРИЯ]",idea=ideas[Number($("#creative-format").value)];$("#creative-preview").textContent=`Сен кәсіби фасилитатор және өнімділік коучысың.\n\n${topic} тақырыбын «${idea[0]}» форматына айналдыр. Аудитория: ${audience}.\n\nИдея: ${idea[1]} Қадамдарды, қажетті рөлдерді, 20 минуттық жұмыс тәртібін, күтілетін нәтижені және 3 рефлексия сұрағын көрсет.\n\n${safetyRule}`};["creative-topic","creative-format","creative-audience"].forEach(id=>$("#"+id).addEventListener("input",updateCreative));$("#creative-copy").addEventListener("click",()=>copy($("#creative-preview").textContent));$("#creative-random").addEventListener("click",()=>{$("#creative-format").value=Math.floor(Math.random()*ideas.length);updateCreative()});updateCreative()}

({prompts:renderPrompts,models:renderModels,guides:renderGuides,trainings:renderTrainings,safety:renderSafety,cases:renderCases,creative:renderCreative}[page]||(()=>app.append(node("p","empty","Бөлім табылмады."))))();
