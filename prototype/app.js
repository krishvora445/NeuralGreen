/* ════════════════════════════════════════════════════════
   EcoScan — app.js  HACKATHON FINAL
   All text now multilingual — reads from Flask response
   ════════════════════════════════════════════════════════ */

// ── HELPERS FIRST ─────────────────────────────────────────────
function capitalize(s){ return s ? s.charAt(0).toUpperCase() + s.slice(1) : ""; }
function $(id){ return document.getElementById(id); }

// ── Helper: get text from multilingual object ─────────────────
// Flask sends: { "en": "...", "hi": "...", "gu": "..." }
// This picks the right language, falls back to English
function pick(obj){
  if(!obj) return "";
  if(typeof obj === "string") return obj;
  return obj[lang] || obj["en"] || "";
}

// Same for arrays like do/dont
function pickArr(obj){
  if(!obj) return [];
  if(Array.isArray(obj)) return obj;
  return obj[lang] || obj["en"] || [];
}

const API = "http://127.0.0.1:5000";

// ── Language UI strings ───────────────────────────────────────
const LANG = {
  en:{
    heroTitle:"Scan Waste. Recycle Right.",
    heroDesc:"Upload a photo or use your camera — our AI instantly identifies waste and tells you how to dispose of it responsibly.",
    uploadTab:"Upload Image", cameraTab:"Camera",
    dropTitle:"Drag & drop waste image", dropSub:"or click to browse files",
    chooseFile:"Choose Image", startCamera:"Start Camera",
    capture:"Capture", stop:"Stop", analyse:"Analyse Waste",
    scanAgain:"Scan Another Item", ready:"Ready to Identify",
    readySub:"Upload an image or use your camera to get started.",
    analysing:"Analysing Waste…", disposalBin:"Disposal Bin",
    descTab:"Description", dosTab:"Do's & Don'ts", impactTab:"Impact",
    top3:"AI Confidence Breakdown", historyTitle:"Scan History",
    historyEmpty:"No scans yet. Analyse a waste item to see history here.",
    clearHistory:"Clear History", rewardsTitle:"Your Eco Rewards",
    pointsLabel:"Eco Points", scansLabel:"Total Scans",
    co2Label:"CO₂ Saved (g)", badgesLabel:"Badges Earned",
    speak:"Read Aloud", serverReady:"Model Ready", serverOffline:"Server Offline",
    doLabel:"✅ Do", dontLabel:"❌ Don't", badgeEarned:"Badge Earned!"
  },
  hi:{
    heroTitle:"कचरा स्कैन करें। सही रिसायकल करें।",
    heroDesc:"फोटो अपलोड करें या कैमरा उपयोग करें — हमारा AI तुरंत कचरे की पहचान करता है।",
    uploadTab:"छवि अपलोड करें", cameraTab:"कैमरा",
    dropTitle:"कचरे की छवि यहाँ छोड़ें", dropSub:"या फ़ाइल चुनने के लिए क्लिक करें",
    chooseFile:"छवि चुनें", startCamera:"कैमरा शुरू करें",
    capture:"फोटो लें", stop:"बंद करें", analyse:"विश्लेषण करें",
    scanAgain:"दूसरी वस्तु स्कैन करें", ready:"पहचानने के लिए तैयार",
    readySub:"शुरू करने के लिए छवि अपलोड करें या कैमरा उपयोग करें।",
    analysing:"विश्लेषण हो रहा है…", disposalBin:"निपटान डिब्बा",
    descTab:"विवरण", dosTab:"करें और न करें", impactTab:"प्रभाव",
    top3:"AI विश्वास विश्लेषण", historyTitle:"स्कैन इतिहास",
    historyEmpty:"अभी तक कोई स्कैन नहीं।",
    clearHistory:"इतिहास साफ करें", rewardsTitle:"आपके इको पुरस्कार",
    pointsLabel:"इको अंक", scansLabel:"कुल स्कैन",
    co2Label:"CO₂ बचाया (ग्राम)", badgesLabel:"बैज अर्जित",
    speak:"ज़ोर से पढ़ें", serverReady:"मॉडल तैयार", serverOffline:"सर्वर ऑफलाइन",
    doLabel:"✅ करें", dontLabel:"❌ न करें", badgeEarned:"बैज मिला!"
  },
  gu:{
    heroTitle:"કચરો સ્કેન કરો. સાચી રીતે રિસાઇકલ કરો.",
    heroDesc:"ફોટો અપલોડ કરો અથવા કેમેરા વાપરો — અમારી AI તરત જ કચરાની ઓળખ કરે છે.",
    uploadTab:"છબી અપલોડ કરો", cameraTab:"કેમેરા",
    dropTitle:"કચરાની છબી અહીં નાખો", dropSub:"અથવા ફાઇલ પસંદ કરવા ક્લિક કરો",
    chooseFile:"છબી પસંદ કરો", startCamera:"કેમેરા શરૂ કરો",
    capture:"ફોટો લો", stop:"બંધ કરો", analyse:"વિશ્લેષણ કરો",
    scanAgain:"બીજી વસ્તુ સ્કેન કરો", ready:"ઓળખ માટે તૈયાર",
    readySub:"શરૂ કરવા માટે છબી અપલોડ કરો અથવા કેમેરા વાપરો.",
    analysing:"વિશ્લેષણ થઈ રહ્યું છે…", disposalBin:"નિકાલ ડબ્બો",
    descTab:"વર્ણન", dosTab:"કરો અને ન કરો", impactTab:"અસર",
    top3:"AI વિશ્વાસ વિશ્લેષણ", historyTitle:"સ્કેન ઇતિહાસ",
    historyEmpty:"હજી કોઈ સ્કેન નથી.",
    clearHistory:"ઇતિહાસ સાફ કરો", rewardsTitle:"તમારા ઇકો પુરસ્કાર",
    pointsLabel:"ઇકો પોઇન્ટ", scansLabel:"કુલ સ્કેન",
    co2Label:"CO₂ બચ્યો (ગ્રામ)", badgesLabel:"બેજ મળ્યા",
    speak:"મોટેથી વાંચો", serverReady:"મોડેલ તૈયાર", serverOffline:"સર્વર ઓફલાઇન",
    doLabel:"✅ કરો", dontLabel:"❌ ન કરો", badgeEarned:"બેજ મળ્યો!"
  }
};

const WASTE_NAMES = {
  en:{ cardboard:"Cardboard","brown-glass":"Brown Glass","green-glass":"Green Glass","white-glass":"White Glass",glass:"Glass",metal:"Metal",paper:"Paper",plastic:"Plastic",biological:"Biological",trash:"Trash",battery:"Battery",clothes:"Clothes",shoes:"Shoes" },
  hi:{ cardboard:"कार्डबोर्ड","brown-glass":"भूरा काँच","green-glass":"हरा काँच","white-glass":"सफेद काँच",glass:"काँच",metal:"धातु",paper:"कागज़",plastic:"प्लास्टिक",biological:"जैविक",trash:"कचरा",battery:"बैटरी",clothes:"कपड़े",shoes:"जूते" },
  gu:{ cardboard:"કાર્ડબોર્ડ","brown-glass":"ભૂરો કાચ","green-glass":"લીલો કાચ","white-glass":"સફેદ કાચ",glass:"કાચ",metal:"ધાતુ",paper:"કાગળ",plastic:"પ્લાસ્ટિક",biological:"જૈવિક",trash:"કચરો",battery:"બેટરી",clothes:"કપડાં",shoes:"જૂતા" }
};

const BADGES = [
  { id:"first", icon:"🌱", en:"First Step",      hi:"पहला कदम",        gu:"પ્રથમ પગલું",    desc:"Complete first scan",  req:s=>s.scans>=1  },
  { id:"eco5",  icon:"♻️", en:"Eco Starter",     hi:"इको स्टार्टर",    gu:"ઇકો સ્ટાર્ટર",  desc:"Scan 5 items",         req:s=>s.scans>=5  },
  { id:"eco10", icon:"🌿", en:"Green Warrior",   hi:"हरित योद्धा",     gu:"ગ્રીન વૉરિયર",   desc:"Scan 10 items",        req:s=>s.scans>=10 },
  { id:"eco25", icon:"🏆", en:"Eco Champion",    hi:"इको चैंपियन",    gu:"ઇકો ચેમ્પિયન",  desc:"Scan 25 items",        req:s=>s.scans>=25 },
  { id:"p100",  icon:"⭐", en:"Century",         hi:"शतक",            gu:"સેન્ચ્યુરી",     desc:"Earn 100 points",      req:s=>s.pts>=100  },
  { id:"p250",  icon:"🥇", en:"Master Recycler", hi:"मास्टर रिसाइकलर", gu:"માસ્ટર રિસાઇક્લર",desc:"Earn 250 points",     req:s=>s.pts>=250  }
];

// ── App State ─────────────────────────────────────────────────
let lang          = localStorage.getItem("ecoscan_lang")    || "en";
let currentBase64 = null;
let cameraStream  = null;
let lastData      = null;
let game          = JSON.parse(localStorage.getItem("ecoscan_game")    || '{"pts":0,"scans":0,"co2":0,"badges":[]}');
let scanHistory   = JSON.parse(localStorage.getItem("ecoscan_history") || "[]");

function t(k){ return (LANG[lang]||LANG.en)[k] || LANG.en[k] || k; }
function wName(label){
  const key=(label||"").toLowerCase();
  return (WASTE_NAMES[lang]||WASTE_NAMES.en)[key]||WASTE_NAMES.en[key]||capitalize(label);
}

// ── Boot ──────────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", ()=>{
  applyLang();
  setupTheme();
  renderRewards();
  renderHistory();
  showState("empty");
  $("cameraWrap").classList.add("hidden");
  checkHealth();
  setInterval(checkHealth, 12000);
});

// ── Language ──────────────────────────────────────────────────
function applyLang(){
  if($("heroTitle"))   $("heroTitle").innerHTML  = t("heroTitle").replace("Recycle Right.", "<em>Recycle Right.</em>");
  if($("heroDesc"))    $("heroDesc").textContent  = t("heroDesc");
  if($("lblUploadTab"))  $("lblUploadTab").textContent  = t("uploadTab");
  if($("lblCameraTab"))  $("lblCameraTab").textContent  = t("cameraTab");
  if($("lblDropTitle"))  $("lblDropTitle").textContent  = t("dropTitle");
  if($("lblDropSub"))    $("lblDropSub").textContent    = t("dropSub");
  if($("lblChooseFile")) $("lblChooseFile").textContent = t("chooseFile");
  if($("lblCapture"))    $("lblCapture").textContent    = t("capture");
  if($("lblStop"))       $("lblStop").textContent       = t("stop");
  if($("lblStartCamera"))$("lblStartCamera").textContent= t("startCamera");
  if($("lblCameraPermission")) $("lblCameraPermission").textContent = t("cameraTab");
  if($("lblAnalyse"))    $("lblAnalyse").textContent    = t("analyse");
  if($("lblScanAgain"))  $("lblScanAgain").textContent  = t("scanAgain");
  if($("lblReady"))      $("lblReady").textContent      = t("ready");
  if($("lblReadySub"))   $("lblReadySub").textContent   = t("readySub");
  if($("lblAnalysing"))  $("lblAnalysing").textContent  = t("analysing");
  if($("lblDisposalBin"))$("lblDisposalBin").textContent= t("disposalBin");
  if($("lblSpeak"))      $("lblSpeak").textContent      = t("speak");
  if($("lblDescTab"))    $("lblDescTab").textContent    = t("descTab");
  if($("lblDosTab"))     $("lblDosTab").textContent     = t("dosTab");
  if($("lblImpactTab"))  $("lblImpactTab").textContent  = t("impactTab");
  if($("lblTop3"))       $("lblTop3").textContent       = t("top3");
  if($("lblDo"))         $("lblDo").textContent         = t("doLabel");
  if($("lblDont"))       $("lblDont").textContent       = t("dontLabel");
  if($("lblHistoryTitle"))  $("lblHistoryTitle").textContent  = t("historyTitle");
  if($("lblHistoryEmpty"))  $("lblHistoryEmpty").textContent  = t("historyEmpty");
  if($("lblRewardsTitle"))  $("lblRewardsTitle").textContent  = t("rewardsTitle");
  if($("lblPointsLabel"))   $("lblPointsLabel").textContent   = t("pointsLabel");
  if($("lblScansLabel"))    $("lblScansLabel").textContent    = t("scansLabel");
  if($("lblCO2Label"))      $("lblCO2Label").textContent      = t("co2Label");
  if($("lblBadgesLabel"))   $("lblBadgesLabel").textContent   = t("badgesLabel");
  const dot=$("statusDot");
  if(dot&&dot.classList.contains("online"))  $("statusText").textContent=t("serverReady");
  if(dot&&dot.classList.contains("offline")) $("statusText").textContent=t("serverOffline");
  document.querySelectorAll(".lang-btn").forEach(b=>{
    b.classList.toggle("active", b.dataset.lang===lang);
  });

  // ✅ If result is showing, re-render with new language
  if(lastData) renderResult(lastData);
  renderRewards();
  renderHistory();
}

document.addEventListener("click", e=>{
  const btn=e.target.closest(".lang-btn");
  if(!btn) return;
  lang=btn.dataset.lang;
  localStorage.setItem("ecoscan_lang", lang);
  applyLang();
  // ✅ Re-speak in new language automatically
  if(lastData) setTimeout(()=>speakResult(lastData), 400);
});

// ── Theme ─────────────────────────────────────────────────────
function setupTheme(){
  const saved=localStorage.getItem("ecoscan_theme")||"dark";
  document.documentElement.setAttribute("data-theme", saved);
  updateThemeIcon(saved);
}
function updateThemeIcon(th){
  const ic=$("themeToggle")&&$("themeToggle").querySelector(".theme-icon");
  if(ic) ic.textContent=th==="dark"?"☀️":"🌙";
}
$("themeToggle").addEventListener("click", ()=>{
  const curr=document.documentElement.getAttribute("data-theme");
  const next=curr==="dark"?"light":"dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("ecoscan_theme", next);
  updateThemeIcon(next);
});

document.querySelectorAll(".nav-link").forEach(a=>{
  a.addEventListener("click", e=>{
    e.preventDefault();
    document.querySelector(a.getAttribute("href"))?.scrollIntoView({behavior:"smooth"});
  });
});

// ── Health check ──────────────────────────────────────────────
async function checkHealth(){
  try{
    const r=await fetch(`${API}/health`,{signal:AbortSignal.timeout(3000)});
    const d=await r.json();
    const ok=d.status==="ok"&&d.model_loaded;
    $("statusDot").className   =`status-dot ${ok?"online":""}`;
    $("statusText").textContent=ok?t("serverReady"):"Model Not Loaded";
  }catch{
    $("statusDot").className   ="status-dot offline";
    $("statusText").textContent=t("serverOffline");
  }
}

// ── Tabs ──────────────────────────────────────────────────────
function switchTab(tab){
  $("tabUpload").classList.toggle("active", tab==="upload");
  $("tabCamera").classList.toggle("active", tab==="camera");
  $("panelUpload").classList.toggle("hidden", tab!=="upload");
  $("panelCamera").classList.toggle("hidden", tab!=="camera");
  if(tab!=="camera") stopCamera();
}
window.switchTab=switchTab;

// ── Upload ────────────────────────────────────────────────────
$("fileInput").addEventListener("change", e=>{
  if(e.target.files[0]) loadImage(e.target.files[0]);
});
const dropZone=$("dropZone");
dropZone.addEventListener("dragover",  e=>{e.preventDefault();dropZone.classList.add("drag-over");});
dropZone.addEventListener("dragleave", ()=>dropZone.classList.remove("drag-over"));
dropZone.addEventListener("drop", e=>{
  e.preventDefault(); dropZone.classList.remove("drag-over");
  if(e.dataTransfer.files[0]) loadImage(e.dataTransfer.files[0]);
});
// ✅ Fix double file dialog
dropZone.addEventListener("click", e=>{
  if(e.target.closest("label")) return;
  $("fileInput").click();
});

function loadImage(file){
  if(!file.type.startsWith("image/")) return;
  const reader=new FileReader();
  reader.onload=e=>{
    currentBase64=e.target.result;
    $("previewImg").src=currentBase64;
    $("previewBadge").textContent="Ready to scan";
    $("previewPanel").classList.remove("hidden");
    showState("empty");
  };
  reader.readAsDataURL(file);
}

// ── Camera ────────────────────────────────────────────────────
$("startCameraBtn").addEventListener("click", startCamera);
$("stopCameraBtn").addEventListener("click",  stopCamera);
$("captureBtn").addEventListener("click",     captureFrame);

async function startCamera(){
  try{
    cameraStream=await navigator.mediaDevices.getUserMedia({
      video:{facingMode:"environment",width:{ideal:1280},height:{ideal:720}}
    });
    $("cameraFeed").srcObject=cameraStream;
    $("cameraStart").classList.add("hidden");
    $("cameraWrap").classList.remove("hidden");
  }catch{ alert("Camera access denied. Please allow camera permission."); }
}
function stopCamera(){
  if(cameraStream){cameraStream.getTracks().forEach(t=>t.stop());cameraStream=null;}
  $("cameraStart").classList.remove("hidden");
  $("cameraWrap").classList.add("hidden");
}
function captureFrame(){
  const v=$("cameraFeed");
  const c=document.createElement("canvas");
  c.width=v.videoWidth; c.height=v.videoHeight;
  c.getContext("2d").drawImage(v,0,0);
  currentBase64=c.toDataURL("image/jpeg",0.9);
  $("previewImg").src=currentBase64;
  $("previewBadge").textContent="Captured!";
  $("previewPanel").classList.remove("hidden");
  showState("empty");
  stopCamera(); switchTab("upload");
}

// ── Reset ─────────────────────────────────────────────────────
function resetAll(){
  currentBase64=null; lastData=null;
  $("previewImg").src=""; $("fileInput").value="";
  $("previewPanel").classList.add("hidden");
  const fill=$("confFill"); if(fill) fill.style.width="0";
  showState("empty");
  if(window.speechSynthesis) speechSynthesis.cancel();
}
["clearBtn","scanAgainBtn","errorRetryBtn"].forEach(id=>{
  const el=$(id); if(el) el.addEventListener("click",resetAll);
});

// ── Analyse ───────────────────────────────────────────────────
$("analyzeBtn").addEventListener("click", async ()=>{
  if(!currentBase64) return;
  showState("loading");
  animateLoadingSteps();
  try{
    const res=await fetch(`${API}/predict`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({image:currentBase64})
    });
    if(!res.ok) throw new Error((await res.json().catch(()=>({}))).error||`Server error ${res.status}`);
    const data=await res.json();
    lastData=data;
    renderResult(data);
    addToHistory(data);
    awardPoints(data);
    showState("result");
    setTimeout(()=>speakResult(data), 600);
  }catch(err){
    $("errorMsg").textContent=err.message||"Could not connect to server.";
    showState("error");
  }
});

function animateLoadingSteps(){
  const steps=[$("ls1"),$("ls2"),$("ls3")];
  steps.forEach(s=>{if(s){s.classList.remove("active","done");}});
  if(steps[0]) steps[0].classList.add("active");
  setTimeout(()=>{
    if(steps[0]){steps[0].classList.remove("active");steps[0].classList.add("done");}
    if(steps[1]) steps[1].classList.add("active");
  },600);
  setTimeout(()=>{
    if(steps[1]){steps[1].classList.remove("active");steps[1].classList.add("done");}
    if(steps[2]) steps[2].classList.add("active");
  },1200);
}

// ══════════════════════════════════════════════════════════════
// ✅ RENDER RESULT — uses pick() to show correct language
// ══════════════════════════════════════════════════════════════
function renderResult(data){
  $("resultEmoji").textContent         = data.icon||"♻️";
  $("resultCategoryBadge").textContent = pick(data.category);       // ✅ multilingual
  $("resultName").textContent          = wName(data.label);
  $("confPct").textContent             = data.confidence+"%";
  $("binName").textContent             = pick(data.bin_name);       // ✅ multilingual
  $("resultDesc").textContent          = pick(data.description);    // ✅ multilingual
  $("resultTip").textContent           = pick(data.tip);            // ✅ multilingual
  $("resultImpact").textContent        = pick(data.impact);         // ✅ multilingual
  $("binColorDot").style.background    = data.bin_color||"#78909C";

  setTimeout(()=>{
    const fill=$("confFill");
    if(fill) fill.style.width=Math.min(data.confidence,100)+"%";
  },100);

  // ✅ Do list — multilingual
  $("dosList").innerHTML="";
  pickArr(data.do).forEach(item=>{
    const li=document.createElement("li"); li.textContent=item; $("dosList").appendChild(li);
  });

  // ✅ Dont list — multilingual
  $("dontsList").innerHTML="";
  pickArr(data.dont).forEach(item=>{
    const li=document.createElement("li"); li.textContent=item; $("dontsList").appendChild(li);
  });

  // Top 3
  $("top3List").innerHTML="";
  (data.top3||[]).forEach(item=>{
    const div=document.createElement("div"); div.className="top3-item";
    div.innerHTML=`
      <span class="top3-name">${wName(item.label.toLowerCase())}</span>
      <div class="top3-bar"><div class="top3-fill" style="width:${item.confidence}%"></div></div>
      <span class="top3-pct">${item.confidence}%</span>`;
    $("top3List").appendChild(div);
  });
  showRTab("desc");
}

function showRTab(tab){
  document.querySelectorAll(".rtab").forEach((b,i)=>{
    b.classList.toggle("active",["desc","dos","impact"][i]===tab);
  });
  $("rtabDesc").classList.toggle("hidden",  tab!=="desc");
  $("rtabDos").classList.toggle("hidden",   tab!=="dos");
  $("rtabImpact").classList.toggle("hidden",tab!=="impact");
}
window.showRTab=showRTab;

// ══════════════════════════════════════════════════════════════
// ✅ VOICE — uses Flask voice data in correct language
// ══════════════════════════════════════════════════════════════
function speakResult(data){
  if(!window.speechSynthesis) return;
  speechSynthesis.cancel();

  // ✅ Get voice text in current language from Flask
  const text = pick(data.voice);
  if(!text) return;

  const langCodes={en:"en-US", hi:"hi-IN", gu:"gu-IN"};
  const voices=speechSynthesis.getVoices();
  const targetLang=langCodes[lang]||"en-US";

  // Find best matching voice
  const voice = voices.find(v=>v.lang===targetLang)
             || voices.find(v=>v.lang.startsWith(lang==="en"?"en":lang==="hi"?"hi":"gu"))
             || null;

  const u=new SpeechSynthesisUtterance(text);
  u.lang  =targetLang;
  u.rate  =0.88;
  u.pitch =1;
  u.volume=1;
  if(voice) u.voice=voice;
  speechSynthesis.speak(u);
}

document.addEventListener("click", e=>{
  if(e.target.closest("#speakBtn")&&lastData) speakResult(lastData);
});

// ── State ─────────────────────────────────────────────────────
function showState(s){
  ["emptyState","loadingState","resultState","errorState"].forEach(id=>{
    const el=$(id); if(el) el.classList.add("hidden");
  });
  const map={empty:"emptyState",loading:"loadingState",result:"resultState",error:"errorState"};
  const target=$(map[s]); if(target) target.classList.remove("hidden");
}

// ── Gamification ──────────────────────────────────────────────
function awardPoints(data){
  game.pts+=10; game.scans+=1; game.co2+=25;
  const nb=[];
  BADGES.forEach(b=>{
    if(!game.badges.includes(b.id)&&b.req(game)){game.badges.push(b.id);nb.push(b);}
  });
  localStorage.setItem("ecoscan_game",JSON.stringify(game));
  renderRewards();
  showPointsPopup(10);
  if(nb.length) setTimeout(()=>showBadgePopup(nb[0]),1500);
}

function showPointsPopup(pts){
  const el=document.createElement("div");
  el.className="points-popup"; el.textContent=`+${pts} pts`;
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),2200);
}

function showBadgePopup(b){
  const name=lang==="hi"?b.hi:lang==="gu"?b.gu:b.en;
  const el=document.createElement("div"); el.className="badge-popup";
  el.innerHTML=`<div class="bp-icon">${b.icon}</div><div class="bp-text"><strong>${t("badgeEarned")}</strong><span>${name}</span></div>`;
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),3600);
}

function renderRewards(){
  if($("statPoints")) $("statPoints").textContent=game.pts;
  if($("statScans"))  $("statScans").textContent =game.scans;
  if($("statCO2"))    $("statCO2").textContent   =game.co2;
  if($("statBadges")) $("statBadges").textContent=game.badges.length;
  if($("miniPoints")) $("miniPoints").textContent=game.pts+" pts";
  const grid=$("badgesGrid"); if(!grid) return;
  grid.innerHTML="";
  BADGES.forEach(b=>{
    const earned=game.badges.includes(b.id);
    const name=lang==="hi"?b.hi:lang==="gu"?b.gu:b.en;
    const div=document.createElement("div");
    div.className=`badge-card ${earned?"earned":"locked"}`;
    div.innerHTML=`<div class="badge-icon">${earned?b.icon:"🔒"}</div><div class="badge-name">${name}</div><div class="badge-desc">${b.desc}</div>`;
    grid.appendChild(div);
  });
}

// ── History ───────────────────────────────────────────────────
function addToHistory(data){
  scanHistory.unshift({
    icon:data.icon||"♻️", label:data.label,
    category:pick(data.category), confidence:data.confidence,
    bin:pick(data.bin_name), timestamp:new Date().toLocaleString(), pts:10
  });
  if(scanHistory.length>20) scanHistory=scanHistory.slice(0,20);
  localStorage.setItem("ecoscan_history",JSON.stringify(scanHistory));
  renderHistory();
}

function renderHistory(){
  const empty=scanHistory.length===0;
  $("historyEmpty").classList.toggle("hidden",!empty);
  $("historyGrid").innerHTML="";
  scanHistory.forEach(entry=>{
    const div=document.createElement("div"); div.className="history-item";
    div.innerHTML=`
      <div class="hi-top">
        <span class="hi-emoji">${entry.icon}</span>
        <div><div class="hi-name">${wName(entry.label)}</div><div class="hi-cat">${entry.category}</div></div>
        <span class="hi-conf">${entry.confidence}%</span>
      </div>
      <div class="hi-bottom">
        <span class="hi-bin">${entry.bin}</span>
        <span class="hi-pts">+${entry.pts||10} pts</span>
      </div>
      <div class="hi-time">${entry.timestamp}</div>`;
    $("historyGrid").appendChild(div);
  });
}

$("clearHistoryBtn").addEventListener("click",()=>{
  scanHistory=[]; localStorage.removeItem("ecoscan_history"); renderHistory();
});

// ── Demo Reset Ctrl+Shift+R ───────────────────────────────────
function resetDemo(){
  if(!confirm("Reset all points, badges and history for demo?")) return;
  localStorage.removeItem("ecoscan_game");
  localStorage.removeItem("ecoscan_history");
  game={pts:0,scans:0,co2:0,badges:[]};
  scanHistory=[];
  renderRewards(); renderHistory(); resetAll();
  const el=document.createElement("div");
  el.className="points-popup"; el.textContent="✅ Demo Reset!";
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),2000);
}
document.addEventListener("keydown", e=>{
  if(e.ctrlKey&&e.shiftKey&&e.key==="R"){ e.preventDefault(); resetDemo(); }
});