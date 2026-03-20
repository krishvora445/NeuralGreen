export interface WasteCategory {
  icon: string;
  bin_color: string;
  category: { en: string; hi: string; gu: string };
  bin_name: { en: string; hi: string; gu: string };
  tip: { en: string; hi: string; gu: string };
  description: { en: string; hi: string; gu: string };
  do: { en: string[]; hi: string[]; gu: string[] };
  dont: { en: string[]; hi: string[]; gu: string[] };
  impact: { en: string; hi: string; gu: string };
  voice: { en: string; hi: string; gu: string };
}

export interface WasteData {
  label: string;
  label_display: string;
  confidence: number;
  top3: { label: string; confidence: number }[];
  timestamp: string;
  icon: string;
  bin_color: string;
  category: { en: string; hi: string; gu: string };
  bin_name: { en: string; hi: string; gu: string };
  tip: { en: string; hi: string; gu: string };
  description: { en: string; hi: string; gu: string };
  do: { en: string[]; hi: string[]; gu: string[] };
  dont: { en: string[]; hi: string[]; gu: string[] };
  impact: { en: string; hi: string; gu: string };
  voice: { en: string; hi: string; gu: string };
}

export const WASTE_DATA: Record<string, WasteCategory> = {
  cardboard: {
    icon: "📦", bin_color: "#8B6914",
    category: { en: "Recyclable", hi: "रिसायकल योग्य", gu: "રિસાઇકલ કરી શકાય" },
    bin_name: { en: "Blue Recycling Bin", hi: "नीला रिसायकलिंग डिब्बा", gu: "વાદળી રિસાઇક્લિંગ ડબ્બો" },
    tip: { en: "Flatten all boxes before placing in the recycling bin.", hi: "रिसायकलिंग डिब्बे में रखने से पहले सभी बक्से चपटे करें।", gu: "રિસાઇક્લિંગ ડબ્બામાં મૂકતા પહેલા બધા બૉક્સ સપાટ કરો." },
    description: { en: "Cardboard can be recycled 5 to 7 times. Always remove tape, staples, and plastic packaging. Wet or greasy cardboard like pizza boxes should go to compost instead.", hi: "कार्डबोर्ड को 5 से 7 बार रिसायकल किया जा सकता है। हमेशा टेप, स्टेपल और प्लास्टिक हटाएं।", gu: "કાર્ડબોર્ડ 5 થી 7 વખત રિસાઇકલ. ટેપ, સ્ટેપ્લ, પ્લાસ્ટિક દૂર કરો." },
    do: { en: ["Flatten all boxes", "Remove tape and staples", "Keep dry", "Bundle neatly"], hi: ["सभी बक्से चपटे करें", "टेप और स्टेपल हटाएं", "सूखा रखें", "साफ बांधें"], gu: ["બધા બૉક્સ સપાટ", "ટેપ દૂર", "સૂકો", "સુઘડ"] },
    dont: { en: ["Recycle greasy cardboard", "Leave plastic attached", "Mix with general waste"], hi: ["चिकने कार्डबोर्ड को रिसायकल करें", "प्लास्टिक लगा छोड़ें", "सामान्य कचरे में मिलाएं"], gu: ["ચીકણો ન", "પ્લાસ્ટિક ન", "સામાન્ય ન"] },
    impact: { en: "Recycling 1 tonne of cardboard saves 17 trees and 7,000 litres of water.", hi: "1 टन कार्डबोर्ड रिसायकल करने से 17 पेड़ और 7,000 लीटर पानी बचता है।", gu: "1 ટન = 17 ઝાડ + 7,000 લિ. પાણી." },
    voice: { en: "This is Cardboard. Flatten all boxes, remove tape and staples, place in the Blue Recycling Bin.", hi: "यह कार्डबोर्ड है। सभी बक्से चपटे करें और नीले डिब्बे में डालें।", gu: "આ કાર્ડબોર્ડ. સ્પાટ, ટેપ, વાદળી ડબ્બો." }
  },
  glass: {
    icon: "🫙", bin_color: "#4AA5D1",
    category: { en: "Recyclable", hi: "रिसायकल योग्य", gu: "રિસાઇકલ" },
    bin_name: { en: "Green Glass Bin", hi: "हरा काँच डिब्बा", gu: "લીલો કાચ ડબ્બો" },
    tip: { en: "Rinse bottles and jars. Never mix broken glass with recycling.", hi: "बोतलें और जार धोएं। टूटे काँच को रिसायकलिंग में न मिलाएं।", gu: "ધોઈ. તૂટેલ ન ભેળવો." },
    description: { en: "Glass is 100% recyclable endlessly. Rinse and remove lids. Ceramics and mirrors are NOT accepted.", hi: "काँच 100% बार-बार रिसायकल। बोतलें धोएं, ढक्कन हटाएं। सिरेमिक नहीं।", gu: "100% અનંત. ધોઈ, ઢાંકણ. સિરામિક નહિ." },
    do: { en: ["Rinse bottles", "Remove lids", "Separate by colour"], hi: ["बोतलें धोएं", "ढक्कन हटाएं", "रंग से अलग करें"], gu: ["ધોઈ", "ઢાંકણ", "રંગ"] },
    dont: { en: ["Include broken glass loose", "Recycle ceramics or mirrors", "Leave food residue"], hi: ["टूटा काँच", "सिरेमिक", "खाना छोड़ें"], gu: ["તૂટેલ", "સિરામિક", "ખોરાક"] },
    impact: { en: "Recycling one glass bottle saves enough energy to power a laptop for 25 minutes.", hi: "एक बोतल = 25 मिनट लैपटॉप ऊर्जा।", gu: "1 બોટલ = 25 મિ. લૅપટૉપ." },
    voice: { en: "This is Glass waste. Rinse bottles and jars, remove lids, place in Green Glass Bin.", hi: "यह काँच है। बोतलें धोएं, ढक्कन हटाएं, हरे डिब्बे में।", gu: "આ કાચ. ધોઈ, ઢાંકણ, લીલો ડબ્બો." }
  },
  "brown-glass": {
    icon: "🍺", bin_color: "#795548",
    category: { en: "Recyclable", hi: "रिसायकल योग्य", gu: "રિસાઇકલ" },
    bin_name: { en: "Brown Glass Bin", hi: "भूरा काँच डिब्बा", gu: "ભૂરો કાચ ડબ્બો" },
    tip: { en: "Rinse brown glass bottles. Remove caps before recycling.", hi: "भूरी बोतलें धोएं।", gu: "ભૂરી ધોઈ." },
    description: { en: "Brown glass is used for beer and medicine bottles. Rinse and keep separate from clear and green glass.", hi: "भूरा काँच बीयर/दवाई। साफ धोएं।", gu: "ભૂરો — બિઅર/દવા. ધોઈ." },
    do: { en: ["Rinse thoroughly", "Remove all caps", "Separate from other glass"], hi: ["अच्छी तरह धोएं", "ढक्कन हटाएं", "अलग करें"], gu: ["ધોઈ", "ઢાંકણ", "અલગ"] },
    dont: { en: ["Mix with clear or green glass", "Leave liquid inside", "Include broken glass"], hi: ["मिलाएं", "तरल छोड़ें", "टूटा काँच"], gu: ["ભેળવો", "પ્રવાહી", "તૂટેલ"] },
    impact: { en: "Recycling brown glass saves energy and reduces raw material extraction.", hi: "ऊर्जा बचती है।", gu: "ઊર્જા બચે." },
    voice: { en: "This is Brown Glass. Rinse, remove cap, place in Brown Glass Bin.", hi: "यह भूरा काँच है। धोएं, ढक्कन हटाएं।", gu: "ભૂરો કાચ. ધોઈ, ઢાંકણ, ભૂરો ડબ્બો." }
  },
  "green-glass": {
    icon: "🍾", bin_color: "#388E3C",
    category: { en: "Recyclable", hi: "रिसायकल योग्य", gu: "રિસાઇકલ" },
    bin_name: { en: "Green Glass Bin", hi: "हरा काँच डिब्बा", gu: "લીલો કાચ ડબ્બો" },
    tip: { en: "Rinse wine and olive oil bottles. Remove corks and caps.", hi: "वाइन बोतलें धोएं। कॉर्क हटाएं।", gu: "ધોઈ. કૉર્ક." },
    description: { en: "Green glass is used for wine and olive oil. Fully recyclable. Remove corks, caps, rinse.", hi: "हरा काँच वाइन/जैतून। पूरी तरह रिसायकल।", gu: "વાઇન/ઑઇલ. સંપૂર્ણ." },
    do: { en: ["Rinse bottles", "Remove corks and caps", "Separate from other glass"], hi: ["धोएं", "कॉर्क हटाएं", "अलग करें"], gu: ["ધોઈ", "કૉર્ક", "અલગ"] },
    dont: { en: ["Include window glass", "Leave residue", "Mix with other colours"], hi: ["खिड़की काँच", "अवशेष", "मिलाएं"], gu: ["બારી", "અવશેષ", "ભેળવો"] },
    impact: { en: "Every tonne of recycled green glass saves over 300kg of CO₂.", hi: "1 टन = 300 किलो CO₂ कम।", gu: "1 ટન = 300 kg CO₂." },
    voice: { en: "This is Green Glass. Rinse, remove corks and caps, place in Green Glass Bin.", hi: "हरा काँच। धोएं, कॉर्क हटाएं।", gu: "લીલો. ધોઈ, કૉર્ક, ડબ્બો." }
  },
  "white-glass": {
    icon: "🥛", bin_color: "#90A4AE",
    category: { en: "Recyclable", hi: "रिसायकल योग्य", gu: "રિસાઇકલ" },
    bin_name: { en: "Clear Glass Bin", hi: "साफ काँच डिब्बा", gu: "સ્વચ્છ કાચ ડબ્બો" },
    tip: { en: "Clear glass is most valuable for recycling. Rinse and remove all lids.", hi: "सबसे मूल्यवान। धोएं, ढक्कन हटाएं।", gu: "સૌથી મૂલ્યવાન. ધોઈ." },
    description: { en: "Clear glass is most versatile — it can become any colour. Jam jars, water bottles, food containers. Rinse and remove lids.", hi: "सबसे बहुमुखी। जैम जार, पानी बोतलें।", gu: "બહુમુખી. જૅમ, પાણી." },
    do: { en: ["Rinse jars and bottles", "Remove all lids", "Recycle jam and food jars"], hi: ["जार धोएं", "ढक्कन हटाएं", "जैम जार"], gu: ["ધોઈ", "ઢાંકણ", "જૅમ"] },
    dont: { en: ["Include light bulbs", "Recycle drinking glasses or pyrex", "Leave food residue"], hi: ["बल्ब", "पीने के गिलास", "खाना"], gu: ["બલ્બ", "ગ્લાસ", "ખોરાક"] },
    impact: { en: "Each recycled clear glass jar saves enough energy to light a bulb for 4 hours.", hi: "एक जार = 4 घंटे बल्ब।", gu: "1 જાર = 4 કલાક." },
    voice: { en: "This is Clear Glass. Rinse all jars and bottles, remove lids, place in Clear Glass Bin.", hi: "साफ काँच। धोएं, ढक्कन हटाएं।", gu: "સ્વચ્છ. ધોઈ, ઢાંકણ, ડબ્બો." }
  },
  metal: {
    icon: "🥫", bin_color: "#78909C",
    category: { en: "Recyclable", hi: "रिसायकल योग्य", gu: "રિસાઇકલ" },
    bin_name: { en: "Blue Recycling Bin", hi: "नीला रिसायकलिंग डिब्बा", gu: "વાદળી ડબ્બો" },
    tip: { en: "Rinse food cans. Aluminium foil and trays are also recyclable.", hi: "खाने के कैन धोएं।", gu: "ફૂડ કૅન ધોઈ." },
    description: { en: "Metal is infinitely recyclable. Aluminium cans back on shelves in 60 days. Steel cans, foil, trays all accepted.", hi: "अनंत बार। 60 दिन में वापस।", gu: "અનંત. 60 દિ." },
    do: { en: ["Rinse all food cans", "Crush cans to save space", "Include aluminium foil"], hi: ["कैन धोएं", "कुचलें", "फॉयल"], gu: ["ધોઈ", "ચગદો", "ફૉઇલ"] },
    dont: { en: ["Include paint tins", "Leave food residue", "Pierce aerosol cans"], hi: ["पेंट टिन", "खाना", "एरोसोल"], gu: ["પેઇન્ટ", "ખોરાક", "એરોસૉલ"] },
    impact: { en: "Recycling aluminium uses 95% less energy. One can = 3 hours TV energy.", hi: "95% कम ऊर्जा। 3 घंटे TV।", gu: "95% ઓછી. 3 કલાક TV." },
    voice: { en: "This is Metal waste. Rinse all cans and place in the Blue Recycling Bin. Aluminium can be recycled back on shelves in 60 days.", hi: "धातु कचरा। कैन धोएं। 60 दिन।", gu: "ધાતુ. ધોઈ, વાદળી. 60 દિ." }
  },
  paper: {
    icon: "📄", bin_color: "#E8C87A",
    category: { en: "Recyclable", hi: "रिसायकल योग्य", gu: "રિસાઇકલ" },
    bin_name: { en: "Blue Recycling Bin", hi: "नीला रिसायकलिंग डिब्बा", gu: "વાદળી ડબ્બો" },
    tip: { en: "Keep paper dry. Do not recycle tissue paper or paper towels.", hi: "सूखा रखें। टिश्यू नहीं।", gu: "સૂકો. ટિશ્યુ ન." },
    description: { en: "Paper can be recycled 4-6 times. Newspapers, magazines, office paper accepted. Tissue, paper towels, food-soiled paper cannot.", hi: "4-6 बार। अखबार, पत्रिकाएं हां। टिश्यू नहीं।", gu: "4-6 વખત. અખ. ટિ. ન." },
    do: { en: ["Recycle newspapers and magazines", "Include windowed envelopes", "Keep paper dry"], hi: ["अखबार", "लिफाफे", "सूखा"], gu: ["અખ", "એન્વ", "સૂ"] },
    dont: { en: ["Recycle tissue or paper towels", "Include waxed paper", "Recycle food-soiled paper"], hi: ["टिश्यू", "मोम", "खाना"], gu: ["ટિ", "મીણ", "ખ"] },
    impact: { en: "Recycling 1 tonne of paper saves 24 trees and 26,000 litres of water.", hi: "1 टन = 24 पेड़ + 26,000 लीटर।", gu: "1 ટન = 24 ઝ + 26k લિ." },
    voice: { en: "This is Paper waste. Keep paper dry and place in the Blue Recycling Bin. Do not recycle tissue paper.", hi: "कागज़। सूखा रखें। नीले डिब्बे में।", gu: "કાગળ. સૂ, વાદળી. ટિ. ન." }
  },
  plastic: {
    icon: "🧴", bin_color: "#EF5350",
    category: { en: "Recyclable", hi: "रिसायकल योग्य", gu: "રિસાઇકલ" },
    bin_name: { en: "Yellow Recycling Bin", hi: "पीला रिसायकलिंग डिब्बा", gu: "પીળો ડબ્બો" },
    tip: { en: "Check the resin code (1-7) on the bottom. Rinse all containers.", hi: "रेज़िन कोड देखें। धोएं।", gu: "કોડ. ધોઈ." },
    description: { en: "Not all plastics are the same. Types 1 and 2 most widely recycled. Take plastic bags to supermarket collection points.", hi: "1 और 2 सबसे रिसायकल। बैग सुपरमार्केट।", gu: "1,2 વધુ. બૅગ સુ." },
    do: { en: ["Rinse all containers", "Check resin code 1 and 2", "Squash bottles"], hi: ["धोएं", "कोड 1,2", "दबाएं"], gu: ["ધ", "1,2", "ચ"] },
    dont: { en: ["Include plastic bags", "Recycle black plastic", "Include polystyrene foam"], hi: ["बैग", "काली", "फोम"], gu: ["બ", "કા", "ફ"] },
    impact: { en: "Recycling plastic bottles reduces energy use by 70% compared to making new plastic.", hi: "70% कम ऊर्जा।", gu: "70% ઓછી." },
    voice: { en: "This is Plastic waste. Check resin code — types 1 and 2 are widely recyclable. Rinse and place in the Yellow Recycling Bin.", hi: "प्लास्टिक। कोड 1,2। पीले डिब्बे में।", gu: "પ્લા. 1,2. ધ, પીળો." }
  },
  biological: {
    icon: "🥦", bin_color: "#66BB6A",
    category: { en: "Organic / Bio-Waste", hi: "जैविक कचरा", gu: "જૈવિક કચરો" },
    bin_name: { en: "Brown Compost Bin", hi: "भूरा कम्पोस्ट डिब्बा", gu: "ભૂરો કમ્પોસ્ટ ડબ્બો" },
    tip: { en: "Compost food scraps to create nutrient-rich soil.", hi: "खाने के अवशेष कम्पोस्ट करें।", gu: "ખ. ક." },
    description: { en: "Biological waste includes food scraps, vegetable peels, coffee grounds, garden cuttings. Composting converts to free fertiliser.", hi: "खाना, सब्जियां, कॉफी। कम्पोस्ट = मुफ्त खाद।", gu: "ખ, શ, ક. ક = ખ." },
    do: { en: ["Compost fruit and vegetable peels", "Add coffee grounds and tea bags", "Include eggshells"], hi: ["छिलके", "कॉफी", "अंडे"], gu: ["ફ", "ક", "ઈ"] },
    dont: { en: ["Add cooked meat to open compost", "Include dairy products", "Mix with recyclables"], hi: ["पका मांस", "डेयरी", "रिसायकल"], gu: ["મ", "ડ", "ર"] },
    impact: { en: "Composting reduces landfill methane emissions and creates free fertiliser.", hi: "मीथेन कम + मुफ्त खाद।", gu: "મ ↓ + ખ." },
    voice: { en: "This is Biological or Organic waste. Place food scraps and vegetable peels in the Brown Compost Bin.", hi: "जैविक। खाना, छिलके भूरे डिब्बे में।", gu: "જૈ. ખ, શ, ભૂ." }
  },
  battery: {
    icon: "🔋", bin_color: "#FF7043",
    category: { en: "E-Waste / Hazardous", hi: "ई-कचरा / खतरनाक", gu: "ઇ-વેસ્ટ / જોખ" },
    bin_name: { en: "E-Waste Collection Point", hi: "ई-वेस्ट संग्रह केंद्र", gu: "ઇ-વેસ્ટ કેન્દ્ર" },
    tip: { en: "NEVER throw batteries in any household bin!", hi: "कभी घरेलू डिब्बे में नहीं!", gu: "ક્યારેય ઘ. ન!" },
    description: { en: "Batteries contain toxic chemicals — mercury, cadmium, lead, lithium — that contaminate soil and water. All batteries must go to specialist collection points.", hi: "विषाक्त रसायन। विशेष केंद्र पर।", gu: "ઝ. ર. ક." },
    do: { en: ["Take to supermarket battery banks", "Use rechargeable batteries", "Find nearest e-waste point"], hi: ["सुपरमार्केट", "रिचार्जेबल", "ई-वेस्ट केंद्र"], gu: ["સ", "ર", "ઇ"] },
    dont: { en: ["Throw in any household bin", "Puncture or dismantle", "Store loose batteries together"], hi: ["घरेलू डिब्बा", "छेद करें", "ढीली बैटरी"], gu: ["ઘ", "વ", "ઢ"] },
    impact: { en: "Proper battery recycling recovers lithium and cobalt and prevents toxic contamination.", hi: "लिथियम, कोबाल्ट वापसी + प्रदूषण रोकें।", gu: "Li, Co + ↓ p." },
    voice: { en: "Warning! This is a Battery. NEVER throw batteries in any bin. Take to your nearest e-waste collection point immediately.", hi: "चेतावनी! बैटरी। कभी नहीं। ई-वेस्ट केंद्र।", gu: "ચ! ઇ-ક. ઘ. ન!" }
  },
  clothes: {
    icon: "👕", bin_color: "#AB47BC",
    category: { en: "Textile Waste", hi: "कपड़े का कचरा", gu: "કા. ક." },
    bin_name: { en: "Textile Recycling Bank", hi: "टेक्सटाइल रिसायकलिंग बैंक", gu: "ટ. ર. બ." },
    tip: { en: "Donate usable clothes. Even worn clothing can go to textile banks.", hi: "दान करें। पुराने भी।", gu: "દ. જ." },
    description: { en: "Clothes should never go to landfill. Donate wearable items. Worn clothing goes to textile banks and is recycled into rags or new fabric.", hi: "लैंडफिल नहीं। दान करें।", gu: "લ ન. દ." },
    do: { en: ["Donate wearable clothes", "Use textile recycling banks", "Sell good quality items online"], hi: ["दान", "टेक्सटाइल बैंक", "ऑनलाइन बेचें"], gu: ["દ", "ટ", "વ"] },
    dont: { en: ["Throw clothes in general waste", "Put wet clothes in textile banks", "Burn old textiles"], hi: ["सामान्य", "गीले", "जलाएं"], gu: ["સ", "ભ", "બ"] },
    impact: { en: "Recycling 1kg of clothing saves 3.6kg of CO₂ and reduces demand for virgin cotton.", hi: "1 किलो = 3.6 किलो CO₂ कम।", gu: "1 kg = 3.6 kg CO₂." },
    voice: { en: "This is Clothing waste. Never throw clothes in the bin. Donate wearable items or use a Textile Recycling Bank.", hi: "कपड़े। डिब्बे में नहीं। दान करें।", gu: "ક. ન. દ." }
  },
  shoes: {
    icon: "👟", bin_color: "#7E57C2",
    category: { en: "Textile Waste", hi: "कपड़े का कचरा", gu: "ક. ક." },
    bin_name: { en: "Textile Recycling Bank", hi: "टेक्सटाइल रिसायकलिंग बैंक", gu: "ટ. ર. બ." },
    tip: { en: "Tie pairs of shoes together before donating.", hi: "जोड़े बांधें।", gu: "જ. બ." },
    description: { en: "Old shoes should never go to landfill. Donate wearable shoes. Nike and Adidas run recycling programmes. Worn shoes are ground to make sports surfaces.", hi: "लैंडफिल नहीं। दान करें। Nike, Adidas।", gu: "ન. N, A." },
    do: { en: ["Donate wearable shoes", "Tie pairs together", "Use brand recycling programmes"], hi: ["दान", "जोड़े", "ब्रांड"], gu: ["દ", "જ", "બ"] },
    dont: { en: ["Throw in general waste", "Separate pairs before donating", "Put in standard recycling bins"], hi: ["सामान्य", "अलग", "रिसायकलिंग बिन"], gu: ["સ", "અ", "ર"] },
    impact: { en: "Recycled shoes are ground down to create sports surfaces and playground flooring.", hi: "खेल सतह बनती है।", gu: "ર. ઉ." },
    voice: { en: "This is Shoe waste. Never throw shoes in the bin. Donate wearable shoes or use a sports store recycling programme.", hi: "जूते। डिब्बे में नहीं। दान करें।", gu: "જ. ન. દ." }
  },
  trash: {
    icon: "🗑️", bin_color: "#546E7A",
    category: { en: "General Waste", hi: "सामान्य कचरा", gu: "સ. ક." },
    bin_name: { en: "Black General Waste Bin", hi: "काला सामान्य कचरा डिब्बा", gu: "ક. ડ." },
    tip: { en: "This cannot be recycled. Try to reduce usage of such items.", hi: "रिसायकल नहीं। उपयोग कम करें।", gu: "ન. ↓." },
    description: { en: "General waste cannot be recycled through standard collection. Ask: Can it be repaired? Donated? Specialist recycled?", hi: "रिसायकल नहीं। ठीक कर सकते? दान?", gu: "ન. સ? દ?" },
    do: { en: ["Check for specialist recycling", "Consider repair or reuse", "Choose minimal packaging"], hi: ["विशेष रिसायकल", "मरम्मत", "कम पैकेजिंग"], gu: ["વ", "સ", "↓"] },
    dont: { en: ["Mix hazardous waste", "Throw items that could be donated", "Burn waste at home"], hi: ["खतरनाक", "दान योग्य", "जलाएं"], gu: ["ખ", "દ", "બ"] },
    impact: { en: "Reducing general waste by 10% significantly decreases methane emissions from landfill.", hi: "10% कम = मीथेन कम।", gu: "10% ↓ = M ↓." },
    voice: { en: "This is General Waste. Place in the Black General Waste Bin. Consider if it can be repaired, donated or specially recycled.", hi: "सामान्य कचरा। काले डिब्बे में। दान सोचें।", gu: "સ. ક. ડ. સ." }
  }
};

export function getMockPrediction(): WasteData {
  const keys = Object.keys(WASTE_DATA);
  const label = keys[Math.floor(Math.random() * keys.length)];
  const meta = WASTE_DATA[label];
  const confidence = Math.round(75 + Math.random() * 20);
  const top3 = [
    { label, confidence },
    ...keys
      .filter(k => k !== label)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2)
      .map(k => ({ label: k, confidence: Math.round(Math.random() * 30) }))
  ];

  return {
    label,
    label_display: label.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    confidence,
    top3,
    timestamp: new Date().toLocaleString(),
    icon: meta.icon,
    bin_color: meta.bin_color,
    category: meta.category,
    bin_name: meta.bin_name,
    tip: meta.tip,
    description: meta.description,
    do: meta.do,
    dont: meta.dont,
    impact: meta.impact,
    voice: meta.voice,
  };
}
