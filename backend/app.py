import os
import json
import base64
import io
import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import numpy as np

# Set environment variable to suppress TensorFlow logs before importing
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
import tensorflow as tf

app = Flask(__name__)
# Enable CORS for frontend running on Vite's dev server (localhost:5173) defaults
CORS(app)

MODEL_PATH = "ewaste_model.h5"
LABELS_PATH = "class_labels.json"

model = None
class_labels = {}

# ══════════════════════════════════════════════════════════════
# ALL WASTE DATA — description/tip/do/dont in EN + HI + GU
# ══════════════════════════════════════════════════════════════
WASTE_DATA = {
    "cardboard": {"icon": "📦", "category": {"en":"Recyclable", "hi":"रिसायकल योग्य", "gu":"રિસાઇકલ કરી શકાય"}, "bin_color": "#8B6914", "bin_name": {"en":"Blue Recycling Bin", "hi":"नीला रिसायकलिंग डिब्बा", "gu":"વાદળી રિસાઇક્લિંગ ડબ્બો"}, "tip": {"en":"Flatten all boxes before placing in the recycling bin.", "hi":"रिसायकलिंग डिब्बे में रखने से पहले सभी बक्से चपटे करें।", "gu":"રિસાઇક્લિંગ ડબ્બામાં મૂકતા પહેલા બધા બૉક્સ સપાટ કરો."}, "description": {"en":"Cardboard can be recycled 5 to 7 times. Always remove tape, staples, and plastic packaging. Wet or greasy cardboard like pizza boxes should go to compost instead.", "hi":"कार्डबोर्ड को 5 से 7 बार रिसायकल किया जा सकता है। हमेशा टेप, स्टेपल और प्लास्टिक लगाएं। गीला या चिकना कार्डबोर्ड जैसे पिज्जा बॉक्स कम्पोस्ट में जाना चाहिए।", "gu":"કાર્ડબોર્ડ 5 થી 7 વખત રિસાઇકલ થઈ શકે છે. હંમેશા ટેપ, સ્ટેપ્લ અને પ્લાસ્ટિક દૂર કરો. ભીનો અથવા ચીકણો કાર્ડબોર્ડ જેવા કે પિઝ્ઝા બૉક્સ કમ્પોસ્ટમાં જવો જોઈએ."}, "do": {"en":["Flatten all boxes","Remove tape and staples","Keep dry","Bundle neatly"], "hi":["सभी बक्से चपटे करें","टेप और स्टेपल हटाएं","सूखा रखें","साफ बांधें"], "gu":["બધા બૉક્સ સપાટ કરો","ટેપ અને સ્ટેપ્લ દૂર કરો","સૂકો રાખો","સુઘડ બાંધો"]}, "dont": {"en":["Recycle greasy cardboard","Leave plastic attached","Mix with general waste"], "hi":["चिकने कार्डबोर्ड को रिसायकल करें","प्लास्टिक लगा छोड़ें","सामान्य कचरे में मिलाएं"], "gu":["ચીકણો કાર્ડબોર્ડ રિસાઇકલ કરો","પ્લાસ્ટિક લગાડેલ છોડો","સામાન્ય કચરામાં ભેળવો"]}, "impact": {"en":"Recycling 1 tonne of cardboard saves 17 trees and 7,000 litres of water.", "hi":"1 टन कार्डबोर्ड रिसायकल करने से 17 पेड़ और 7,000 लीटर पानी बचता है।", "gu":"1 ટન કાર્ડબોર્ડ રિસાઇકલ કરવાથી 17 ઝાડ અને 7,000 લિટર પાણી બચે છે."}, "voice": {"en":"This is Cardboard. Flatten all boxes, remove tape and staples, and place in the Blue Recycling Bin.", "hi":"यह कार्डबोर्ड है। सभी बक्से चपटे करें, टेप हटाएं और नीले रिसायकलिंग डिब्बे में डालें।", "gu":"આ કાર્ડબોર્ડ છે. બધા બૉક્સ સપાટ કરો, ટેપ દૂર કરો અને વાદળી રિસાઇક્લિંગ ડબ્બામાં નાખો."}},
    "glass": {"icon": "🫙", "category": {"en":"Recyclable", "hi":"रिसायकल योग्य", "gu":"રિસાઇકલ કરી શકાય"}, "bin_color": "#4AA5D1", "bin_name": {"en":"Green Glass Bin", "hi":"हरा काँच डिब्बा", "gu":"લીલો કાચ ડબ્બો"}, "tip": {"en":"Rinse bottles and jars. Never mix broken glass with recycling.", "hi":"बोतलें और जार धोएं। टूटे काँच को रिसायकलिंग में न मिलाएं।", "gu":"બોટલો અને જાર ધોઈ નાખો. તૂટેલ કાચ રિસાઇક્લિંગ સાથે ન ભેળવો."}, "description": {"en":"Glass is 100% recyclable endlessly. Rinse bottles and jars, remove lids. Ceramics, pyrex and mirrors are NOT accepted as they have different melting points.", "hi":"काँच 100% अनंत बार रिसायकल हो सकता है। बोतलें धोएं, ढक्कन हटाएं। सिरेमिक, पाइरेक्स और दर्पण स्वीकार नहीं किए जाते।", "gu":"કાચ 100% અનંત વખત રિસાઇકલ થઈ શકે છે. બોટલ ધોઈ, ઢાંકણ દૂર કરો. સિરામિક, પાઇરેક્સ અને અરીસા સ્વીકારાતા નથી."}, "do": {"en":["Rinse bottles clean","Remove lids and caps","Separate by colour if possible"], "hi":["बोतलें साफ धोएं","ढक्कन हटाएं","रंग के अनुसार अलग करें"], "gu":["બોટલ સ્વચ્છ ધોઈ","ઢાંકણ દૂર કરો","શક્ય હોય તો રંગ પ્રમાણે અલગ કરો"]}, "dont": {"en":["Include broken glass loose","Recycle ceramics or mirrors","Leave food residue"], "hi":["टूटा काँच खुला रखें","सिरेमिक या दर्पण रिसायकल करें","खाने के अवशेष छोड़ें"], "gu":["તૂટેલ કાચ ખુલ્લો રાખો","સિરામિક અથવા અરીસો રિસાઇકલ કરો","ખોરાકના અવશેષ છોડો"]}, "impact": {"en":"Recycling one glass bottle saves enough energy to power a laptop for 25 minutes.", "hi":"एक काँच की बोतल रिसायकल करने से 25 मिनट के लिए लैपटॉप चलाने की ऊर्जा बचती है।", "gu":"એક કાચની બોટલ રિસાઇકલ કરવાથી 25 મિનિટ માટે લૅપટૉપ ચલાવવાની ઊર્જા બચે છે."}, "voice": {"en":"This is Glass waste. Rinse bottles and jars, remove lids, and place in the Green Glass Bin.", "hi":"यह काँच का कचरा है। बोतलें धोएं, ढक्कन हटाएं और हरे काँच के डिब्बे में डालें।", "gu":"આ કાચનો કચરો છે. બોટલ ધોઈ, ઢાંકણ દૂર કરો અને લીલા કાચના ડબ્બામાં નાખો."}},
    "brown-glass": {"icon": "🍺", "category": {"en":"Recyclable", "hi":"रिसायकल योग्य", "gu":"રિસાઇકલ કરી શકાય"}, "bin_color": "#795548", "bin_name": {"en":"Brown Glass Bin", "hi":"भूरा काँच डिब्बा", "gu":"ભૂરો કાચ ડબ્બો"}, "tip": {"en":"Rinse brown glass bottles. Remove caps before recycling.", "hi":"भूरी बोतलें धोएं। रिसायकल करने से पहले ढक्कन हटाएं।", "gu":"ભૂરી બોટલ ધોઈ. રિસાઇકલ કરતા પહેલા ઢાંકણ દૂર કરો."}, "description": {"en":"Brown glass is used for beer and medicine bottles. Rinse clean and keep separate from clear and green glass where possible.", "hi":"भूरा काँच बीयर और दवाई की बोतलों के लिए उपयोग होता है। साफ धोएं और साफ व हरे काँच से अलग रखें।", "gu":"ભૂરો કાચ બિઅર અને દવાની બોટલ માટે વપરાય છે. સ્વચ્છ ધોઈ અને સ્વચ્છ તથા લીલા કાચથી અલગ રાખો."}, "do": {"en":["Rinse bottles thoroughly","Remove all caps","Separate from other glass"], "hi":["बोतलें अच्छी तरह धोएं","सभी ढक्कन हटाएं","अन्य काँच से अलग करें"], "gu":["બોટલ સારી રીતે ધોઈ","બધા ઢાંકણ દૂર કરો","અન્ય કાચથી અલગ કરો"]}, "dont": {"en":["Mix with clear or green glass","Leave liquid inside","Include broken glass loose"], "hi":["साफ या हरे काँच में मिलाएं","अंदर तरल छोड़ें","टूटा काँच खुला रखें"], "gu":["સ્વચ્છ અથવા લીલા કાચ સાથે ભેળવો","અંદર પ્રવાહી છોડો","તૂટેલ કાચ ખુલ્લો રાખો"]}, "impact": {"en":"Recycling brown glass saves energy and reduces raw material extraction.", "hi":"भूरा काँच रिसायकल करने से ऊर्जा बचती है और कच्चे माल का निष्कर्षण कम होता है।", "gu":"ભૂરો કાચ રિસાઇકલ કરવાથી ઊર્જા બચે છે અને કાચા માલના ઉત્ખનનમાં ઘટાડો થાય છે."}, "voice": {"en":"This is Brown Glass. Rinse the bottle, remove the cap, and place in the Brown Glass Bin.", "hi":"यह भूरा काँच है। बोतल धोएं, ढक्कन हटाएं और भूरे काँच के डिब्बे में डालें।", "gu":"આ ભૂરો કાચ છે. બોટલ ધોઈ, ઢાંકણ દૂર કરો અને ભૂરા કાચના ડબ્બામાં નાખો."}},
    "green-glass": {"icon": "🍾", "category": {"en":"Recyclable", "hi":"रिसायकल योग्य", "gu":"રિસાઇકલ કરી શકાય"}, "bin_color": "#388E3C", "bin_name": {"en":"Green Glass Bin", "hi":"हरा काँच डिब्बा", "gu":"લીલો કાચ ડબ્બો"}, "tip": {"en":"Rinse wine and olive oil bottles. Remove corks and caps.", "hi":"वाइन और जैतून के तेल की बोतलें धोएं। कॉर्क और ढक्कन हटाएं।", "gu":"વાઇન અને ઑલિવ ઑઇલ બોટલ ધોઈ. કૉર્ક અને ઢાંકણ દૂર કરો."}, "description": {"en":"Green glass is used for wine and olive oil bottles. Fully recyclable. Remove corks, caps and rinse thoroughly before recycling.", "hi":"हरा काँच वाइन और जैतून के तेल की बोतलों के लिए उपयोग होता है। पूरी तरह रिसायकल होता है। कॉर्क, ढक्कन हटाएं और अच्छी तरह धोएं।", "gu":"લીલો કાચ વાઇન અને ઑલિવ ઑઇલ બોટલ માટે વપરાય છે. સંપૂર્ણ રિસાઇકલ થઈ શકે છે. કૉર્ક, ઢાંકણ દૂર કરો અને સારી રીતે ધોઈ."}, "do": {"en":["Rinse bottles clean","Remove corks and caps","Separate from other glass"], "hi":["बोतलें साफ धोएं","कॉर्क और ढक्कन हटाएं","अन्य काँच से अलग करें"], "gu":["બોટલ સ્વચ્છ ધોઈ","કૉર્ક અને ઢાંકણ દૂર કરો","અન્ય કાચથી અલગ કરો"]}, "dont": {"en":["Include window or mirror glass","Leave residue inside","Mix with other colours"], "hi":["खिड़की या दर्पण काँच शामिल करें","अंदर अवशेष छोड़ें","अन्य रंगों में मिलाएं"], "gu":["બારી અથવા અરીસાનો કાચ શામેલ કરો","અંદર અવશેષ છોડો","અન્ય રંગો સાથે ભેળવો"]}, "impact": {"en":"Every tonne of recycled green glass saves over 300kg of CO₂ emissions.", "hi":"हर टन हरे काँच को रिसायकल करने से 300 किलो से अधिक CO₂ उत्सर्जन बचता है।", "gu":"દરેક ટન લીલા કાચ રિસાઇકલ કરવાથી 300 કિલોથી વધુ CO₂ ઉત્સર્જન બચે છે."}, "voice": {"en":"This is Green Glass. Rinse the bottle, remove corks and caps, and place in the Green Glass Bin.", "hi":"यह हरा काँच है। बोतल धोएं, कॉर्क और ढक्कन हटाएं और हरे काँच के डिब्बे में डालें।", "gu":"આ લીલો કાચ છે. બોટલ ધોઈ, કૉર્ક અને ઢાંકણ દૂર કરો અને લીલા કાચના ડબ્બામાં નાખો."}},
    "white-glass": {"icon": "🥛", "category": {"en":"Recyclable", "hi":"रिसायकल योग्य", "gu":"રિસાઇકલ કરી શકાય"}, "bin_color": "#90A4AE", "bin_name": {"en":"Clear Glass Bin", "hi":"साफ काँच डिब्बा", "gu":"સ્વચ્છ કાચ ડબ્બો"}, "tip": {"en":"Clear glass is the most valuable for recycling. Rinse and remove all lids.", "hi":"साफ काँच रिसायकलिंग के लिए सबसे मूल्यवान है। धोएं और सभी ढक्कन हटाएं।", "gu":"સ્વચ્છ કાચ રિસાઇક્લિંગ માટે સૌથી મૂલ્યવાન છે. ધોઈ અને બધા ઢાંકણ દૂર કરો."}, "description": {"en":"Clear glass is the most versatile for recycling — it can become any colour. Common items: jam jars, water bottles, food containers. Rinse and remove lids.", "hi":"साफ काँच रिसायकलिंग के लिए सबसे बहुमुखी है — यह कोई भी रंग बन सकता है। सामान्य वस्तुएं: जैम जार, पानी की बोतलें। धोएं और ढक्कन हटाएं।", "gu":"સ્વચ્છ કાચ રિસાઇક્લિંગ માટે સૌથી બહુમુખી છે — કોઈ પણ રંગ બની શકે. સામાન્ય વસ્તુઓ: જૅમ જાર, પાણીની બોટલ. ધોઈ ઢાંકણ દૂર કરો."}, "do": {"en":["Rinse jars and bottles","Remove all lids","Recycle jam jars and food jars"], "hi":["जार और बोतलें धोएं","सभी ढक्कन हटाएं","जैम जार और फूड जार रिसायकल करें"], "gu":["જાર અને બોટલ ધોઈ","બધા ઢાંકણ દૂર કરો","જૅમ જાર અને ફૂડ જાર રિસાઇકલ કરો"]}, "dont": {"en":["Include light bulbs","Recycle drinking glasses or pyrex","Leave food residue"], "hi":["बल्ब शामिल करें","पीने के गिलास या पाइरेक्स रिसायकल करें","खाने के अवशेष छोड़ें"], "gu":["બલ્બ શામેલ કરો","પીવાના ગ્લાસ અથવા પાઇરેક્સ રિસાઇકલ કરો","ખોરાકના અવશેષ છોડો"]}, "impact": {"en":"Each recycled clear glass jar saves enough energy to light a bulb for 4 hours.", "hi":"हर रिसायकल किए गए साफ काँच के जार से 4 घंटे बल्ब जलाने की ऊर्जा बचती है।", "gu":"દરેક રિસાઇકલ સ્વચ્છ કાચ જારથી 4 કલાક માટે બલ્બ સળગાવવાની ઊર્જા બચે છે."}, "voice": {"en":"This is Clear Glass. Rinse all jars and bottles, remove lids, and place in the Clear Glass Bin.", "hi":"यह साफ काँच है। सभी जार और बोतलें धोएं, ढक्कन हटाएं और साफ काँच के डिब्बे में डालें।", "gu":"આ સ્વચ્છ કાચ છે. બધા જાર અને બોટલ ધોઈ, ઢાંકણ દૂર કરો અને સ્વચ્છ કાચ ડબ્બામાં નાખો."}},
    "metal": {"icon": "🥫", "category": {"en":"Recyclable", "hi":"रिसायकल योग्य", "gu":"રિસાઇકલ કરી શકાય"}, "bin_color": "#78909C", "bin_name": {"en":"Blue Recycling Bin", "hi":"नीला रिसायकलिंग डिब्बा", "gu":"વાદળી રિસાઇક્લિંગ ડબ્બો"}, "tip": {"en":"Rinse food cans. Aluminium foil and trays are also recyclable.", "hi":"खाने के कैन धोएं। एल्युमीनियम फॉयल और ट्रे भी रिसायकल होती हैं।", "gu":"ફૂડ કૅન ધોઈ. એલ્યુમિનિયમ ફૉઇલ અને ટ્રે પણ રિસાઇકલ થઈ શકે."}, "description": {"en":"Metal is infinitely recyclable. Aluminium cans are back on shelves in 60 days. Steel cans, foil, trays all accepted. Empty aerosols completely before recycling.", "hi":"धातु अनंत बार रिसायकल होती है। एल्युमीनियम कैन 60 दिनों में वापस शेल्फ पर होते हैं। स्टील कैन, फॉयल, ट्रे सभी स्वीकार होते हैं।", "gu":"ધાતુ અનંત વખત રિસાઇકલ થઈ શકે. એલ્યુમિનિયમ કૅન 60 દિવસમાં ફરી શેલ્ફ પર. સ્ટીલ કૅન, ફૉઇલ, ટ્રે બધા સ્વીકારાય."}, "do": {"en":["Rinse all food cans","Crush cans to save space","Include aluminium foil"], "hi":["सभी खाने के कैन धोएं","जगह बचाने के लिए कैन कुचलें","एल्युमीनियम फॉयल शामिल करें"], "gu":["બધા ફૂડ કૅન ધોઈ","જગ્યા બચાવવા કૅન ચગદો","એલ્યુમિનિયમ ફૉઇલ શામેલ કરો"]}, "dont": {"en":["Include paint tins","Leave food residue","Pierce aerosol cans"], "hi":["पेंट के डिब्बे शामिल करें","खाने के अवशेष छोड़ें","एरोसोल कैन में छेद करें"], "gu":["પેઇન્ટ ટિન શામેલ કરો","ખોરાકના અવશેષ છોડો","એરોસૉલ કૅન વીંધો"]}, "impact": {"en":"Recycling aluminium uses 95% less energy. One recycled can saves energy to run a TV for 3 hours.", "hi":"एल्युमीनियम रिसायकल करने से 95% कम ऊर्जा लगती है। एक कैन रिसायकल करने से 3 घंटे TV चलाने की ऊर्जा बचती है।", "gu":"એલ્યુમિનિયમ રિસાઇકલ કરવામાં 95% ઓછી ઊર્જા. એક કૅન રિસાઇકલ કરવાથી 3 કલાક TV ચલાવવાની ઊર્જા બચે."}, "voice": {"en":"This is Metal waste. Rinse all cans and place in the Blue Recycling Bin. Aluminium can be recycled back on shelves in just 60 days.", "hi":"यह धातु का कचरा है। सभी कैन धोएं और नीले रिसायकलिंग डिब्बे में डालें। एल्युमीनियम 60 दिनों में रिसायकल हो सकता है।", "gu":"આ ધાતુ કચરો છે. બધા કૅન ધોઈ વાદળી ડબ્બામાં નાખો. એલ્યુમિનિયમ 60 દિવસમાં ફરી ઉપયોગ થઈ શકે."}},
    "paper": {"icon": "📄", "category": {"en":"Recyclable", "hi":"रिसायकल योग्य", "gu":"રિસાઇકલ કરી શકાય"}, "bin_color": "#E8C87A", "bin_name": {"en":"Blue Recycling Bin", "hi":"नीला रिसायकलिंग डिब्बा", "gu":"વાદળી રિસાઇક્લિંગ ડબ્બો"}, "tip": {"en":"Keep paper dry. Do not recycle tissue paper or paper towels.", "hi":"कागज़ सूखा रखें। टिश्यू पेपर या पेपर टॉवल रिसायकल न करें।", "gu":"કાગળ સૂકો રાખો. ટિશ્યુ પેપર અથવા પેપર ટૉવેલ રિસાઇકલ ન કરો."}, "description": {"en":"Paper can be recycled 4-6 times. Newspapers, magazines, office paper and envelopes are accepted. Tissue paper, paper towels and food-soiled paper cannot be recycled.", "hi":"कागज़ 4-6 बार रिसायकल हो सकता है। अखबार, पत्रिकाएं, ऑफिस पेपर स्वीकार होते हैं। टिश्यू पेपर और खाने से सना कागज़ रिसायकल नहीं होता।", "gu":"કાગળ 4-6 વખત રિસાઇકલ થઈ શકે. અખબાર, સામયિક, ઑફિસ પેપર સ્વીકારાય. ટિશ્યુ પેપર અને ખોરાકથી ભરેલ કાગળ રિસાઇકલ ન થઈ શકે."}, "do": {"en":["Recycle newspapers and magazines","Include windowed envelopes","Keep paper dry"], "hi":["अखबार और पत्रिकाएं रिसायकल करें","विंडो वाले लिफाफे शामिल करें","कागज़ सूखा रखें"], "gu":["અખબાર અને સામયિક રિસાઇકલ કરો","વિન્ડો એન્વેલપ શામેલ કરો","કાગળ સૂકો રાખો"]}, "dont": {"en":["Recycle tissue or paper towels","Include waxed paper","Recycle food-soiled paper"], "hi":["टिश्यू या पेपर टॉवल रिसायकल करें","मोम वाला कागज़ शामिल करें","खाने से सना कागज़ रिसायकल करें"], "gu":["ટિશ્યુ અથવા પેપર ટૉવેલ રિસાઇકલ કરો","મીણ કાગળ શામેલ કરો","ખોરાકથી ભરેલ કાગળ રિસાઇકલ કરો"]}, "impact": {"en":"Recycling 1 tonne of paper saves 24 trees and 26,000 litres of water.", "hi":"1 टन कागज़ रिसायकल करने से 24 पेड़ और 26,000 लीटर पानी बचता है।", "gu":"1 ટન કાગળ રિસાઇકલ કરવાથી 24 ઝાડ અને 26,000 લિટર પાણી બચે."}, "voice": {"en":"This is Paper waste. Keep paper dry and place in the Blue Recycling Bin. Do not recycle tissue paper or paper towels.", "hi":"यह कागज़ का कचरा है। कागज़ सूखा रखें और नीले डिब्बे में डालें। टिश्यू पेपर रिसायकल न करें।", "gu":"આ કાગળ કચરો છે. કાગળ સૂકો રાખી વાદળી ડબ્બામાં નાખો. ટિશ્યુ પેપર રિસાઇકલ ન કરો."}},
    "plastic": {"icon": "🧴", "category": {"en":"Recyclable", "hi":"रिसायकल योग्य", "gu":"રિસાઇકલ કરી શકાય"}, "bin_color": "#EF5350", "bin_name": {"en":"Yellow Recycling Bin", "hi":"पीला रिसायकलिंग डिब्बा", "gu":"પીળો રિસાઇક્લિંગ ડબ્બો"}, "tip": {"en":"Check the resin code (1-7) on the bottom. Rinse all containers.", "hi":"नीचे रेज़िन कोड (1-7) देखें। सभी कंटेनर धोएं।", "gu":"તળિયે રેઝિન કોડ (1-7) તપાસો. બધા કન્ટેઇનર ધોઈ."}, "description": {"en":"Not all plastics are same. Types 1 and 2 are most widely recycled. Take plastic bags to supermarket collection points.", "hi":"सभी प्लास्टिक एक समान नहीं हैं। टाइप 1 और 2 सबसे ज्यादा रिसायकल होते हैं।", "gu":"બધી પ્લાસ્ટિક સરખી નથી. પ્રકાર 1 અને 2 સૌથી વધુ રિસાઇકલ."}, "do": {"en":["Rinse all containers","Check resin code 1 and 2","Squash bottles to save space"], "hi":["सभी कंटेनर धोएं","रेज़िन कोड 1 और 2 देखें","जगह बचाने के लिए बोतलें दबाएं"], "gu":["બધા કન્ટેઇનર ધોઈ","રેઝિન કોડ 1 અને 2 તપાસો","જગ્યા બચાવવા બોટલ ચપ્પટ કરો"]}, "dont": {"en":["Include plastic bags","Recycle black plastic","Include polystyrene foam"], "hi":["प्लास्टिक बैग शामिल करें","काली प्लास्टिक रिसायकल करें","पॉलीस्टायरीन फोम शामिल करें"], "gu":["પ્લાસ્ટિક બૅગ શામેલ કરો","કાળી પ્લાસ્ટિક રિસાઇકલ કરો","પૉલિસ્ટાઇરિન ફોમ શામેલ કરો"]}, "impact": {"en":"Recycling plastic bottles reduces energy use by 70% compared to making new plastic.", "hi":"प्लास्टिक बोतलें रिसायकल करने से 70% कम ऊर्जा लगती है।", "gu":"પ્લાસ્ટિક બોટલ રિસાઇકલ કરવાથી 70% ઓછી ઊર્જા."}, "voice": {"en":"This is Plastic waste. Check the resin code — types 1 and 2 are widely recyclable. Rinse and place in the Yellow Recycling Bin.", "hi":"यह प्लास्टिक का कचरा है। रेज़िन कोड देखें — टाइप 1 और 2 रिसायकल होते हैं। धोएं और पीले डिब्बे में डालें।", "gu":"આ પ્લાસ્ટિક કચરો છે. રેઝિન કોડ તપાસો — પ્રકાર 1 અને 2 રિસાઇકલ. ધોઈ પીળા ડબ્બામાં નાખો."}},
    "biological": {"icon": "🥦", "category": {"en":"Organic / Bio-Waste", "hi":"जैविक कचरा", "gu":"જૈવિક કચરો"}, "bin_color": "#66BB6A", "bin_name": {"en":"Brown Compost Bin", "hi":"भूरा कम्पोस्ट डिब्बा", "gu":"ભૂરો કમ્પોસ્ટ ડબ્બો"}, "tip": {"en":"Compost food scraps to create nutrient-rich soil.", "hi":"पोषक मिट्टी बनाने के लिए खाने के अवशेष कम्पोस्ट करें।", "gu":"પોષક માટી બનાવવા ખોરાકના અવશેષ કમ્પોસ્ટ કરો."}, "description": {"en":"Biological waste includes food scraps, vegetable peels, coffee grounds and garden cuttings. Composting converts this into free fertiliser.", "hi":"जैविक कचरे में खाने के अवशेष, सब्जियों के छिलके शामिल हैं। कम्पोस्टिंग इसे मुफ्त खाद में बदलती है।", "gu":"જૈવિક કચરામાં ખોરાકના અવશેષ શામેલ. કમ્પોસ્ટિંગ ખાતરમાં ફેરવે."}, "do": {"en":["Compost fruit and vegetable peels","Add coffee grounds and tea bags","Include eggshells"], "hi":["फल और सब्जियों के छिलके कम्पोस्ट करें","कॉफी ग्राउंड और टी बैग डालें","अंडे के छिलके शामिल करें"], "gu":["ફળ અને શાકભાજીની છાલ કમ્પોસ્ટ કરો","કૉફી ગ્રાઉન્ડ અને ટી બૅગ ઉમેરો","ઈંડાની છાલ શામેલ કરો"]}, "dont": {"en":["Add cooked meat to open compost","Include dairy products","Mix with recyclables"], "hi":["पके मांस को खुले कम्पोस्ट में डालें","डेयरी उत्पाद शामिल करें","रिसायकल योग्य में मिलाएं"], "gu":["રાંધेल  માંસ ખુલ્લા કમ્પોસ્ટમાં નાખો","ડેઇરી ઉત્પાદ શામેલ કરો","રિસાઇકલ સાથે ભેળવો"]}, "impact": {"en":"Composting reduces landfill methane emissions and creates free fertiliser for gardens.", "hi":"कम्पोस्टिंग से लैंडफिल मीथेन उत्सर्जन कम होता है और मुफ्त खाद बनती है।", "gu":"કમ્પોસ્ટિંગ લૅન્ડફિલ મિથેન ઘટાડે અને મફત ખાતર બનાવે."}, "voice": {"en":"This is Biological or Organic waste. Place food scraps and vegetable peels in the Brown Compost Bin.", "hi":"यह जैविक कचरा है। खाने के अवशेष भूरे कम्पोस्ट डिब्बे में डालें।", "gu":"આ જૈવિક કચરો છે. ખોરાકના અવશેષ ભૂરા કમ્પોસ્ટ ડબ્બામાં નાખો."}},
    "battery": {"icon": "🔋", "category": {"en":"E-Waste / Hazardous", "hi":"ई-कचरा / खतरनाक", "gu":"ઇ-વેસ્ટ / જોખમી"}, "bin_color": "#FF7043", "bin_name": {"en":"E-Waste Collection Point", "hi":"ई-वेस्ट संग्रह केंद्र", "gu":"ઇ-વેસ્ટ સંગ્રહ કેન્દ્ર"}, "tip": {"en":"NEVER throw batteries in any household bin!", "hi":"बैटरी को किसी भी घरेलू डिब्बे में कभी न डालें!", "gu":"બેટરી ક્યારેય ઘરેલું ડબ્બામાં ન નાખો!"}, "description": {"en":"Batteries contain toxic chemicals that contaminate soil and water. All batteries must go to specialist collection points.", "hi":"बैटरी में विषाक्त रसायन होते हैं। सभी बैटरी विशेष संग्रह केंद्रों पर जानी चाहिए।", "gu":"બેટરીમાં ઝેરી રાસાયણ છે. બધી બેટરી વિશેષ સંગ્રહ કેન્દ્ર પર જવી જોઈએ."}, "do": {"en":["Take to supermarket battery banks","Use rechargeable batteries","Find nearest e-waste point"], "hi":["सुपरमार्केट बैटरी बैंक पर ले जाएं","रिचार्जेबल बैटरी उपयोग करें","नजदीकी ई-वेस्ट केंद्र खोजें"], "gu":["સુપરમાર્કેટ બેટરી બૅન્ક પર લઈ જાઓ","રિચાર્જેબલ બેટરી વાપરો","નજીકનું ઇ-વેસ્ટ કેન્દ્ર શોધો"]}, "dont": {"en":["Throw in any household bin","Puncture or dismantle batteries","Store loose batteries together"], "hi":["किसी घरेलू डिब्बे में डालें","बैटरी में छेद करें या तोड़ें","ढीली बैटरी एक साथ रखें"], "gu":["ઘરેલું ડબ્બામાં નાખો","બેટરી વીંધો અથવા તોડો","ઢીલી બેટરી એકસાથે રાખો"]}, "impact": {"en":"Proper battery recycling recovers lithium and cobalt and prevents toxic contamination.", "hi":"बैटरी रिसायकलिंग से लिथियम और कोबाल्ट मिलता है और विषाक्त प्रदूषण रुकता है।", "gu":"બેટરી રિસાઇક્લિંગ લિથિયમ અને કોબાલ્ટ પ્રાપ્ત કરાવે અને ઝેરી પ્રદૂષણ અટકાવે."}, "voice": {"en":"Warning! This is a Battery. NEVER throw batteries in any bin. Take to your nearest e-waste collection point immediately.", "hi":"चेतावनी! यह बैटरी है। बैटरी कभी भी किसी डिब्बे में न डालें। तुरंत ई-वेस्ट केंद्र पर ले जाएं।", "gu":"ચેતવણી! આ બેટરી છે. બેટરી ક્યારેય ડબ્બામાં ન નાખો. તરત ઇ-વેસ્ટ કેન્દ્ર પર લઈ જાઓ."}},
    "clothes": {"icon": "👕", "category": {"en":"Textile Waste", "hi":"कपड़े का कचरा", "gu":"કાપડ કચરો"}, "bin_color": "#AB47BC", "bin_name": {"en":"Textile Recycling Bank", "hi":"टेक्सटाइल रिसायकलिंग बैंक", "gu":"ટેક્સટાઇલ રિસાઇક્લિંગ બૅન્ક"}, "tip": {"en":"Donate usable clothes. Even worn clothing can go to textile banks.", "hi":"पहनने योग्य कपड़े दान करें। पुराने कपड़े भी टेक्सटाइल बैंक में जा सकते हैं।", "gu":"પહેરી શકાય તેવા કપડાં દાન કરો. જૂના કપડાં પણ ટેક્સટાઇલ બૅન્કમાં જઈ શકે."}, "description": {"en":"Clothes should never go to landfill. Donate wearable items to charity. Worn clothing goes to textile banks.", "hi":"कपड़े कभी लैंडफिल में नहीं जाने चाहिए। पहनने योग्य चैरिटी को दान करें।", "gu":"કપડાં ક્યારેય લૅન્ડફિલ ન જવા. પહેરી શકાય ચૅરિટીને."}, "do": {"en":["Donate wearable clothes","Use textile recycling banks","Sell good quality items online"], "hi":["पहनने योग्य कपड़े दान करें","टेक्सटाइल रिसायकलिंग बैंक उपयोग करें","अच्छे कपड़े ऑनलाइन बेचें"], "gu":["પહેરી શકાય દાન","ટેક્સટાઇલ બૅન્ક ઉપયોગ","સારા કપડાં ઑનલાઇન વેચો"]}, "dont": {"en":["Throw clothes in general waste","Put wet clothes in textile banks","Burn old textiles"], "hi":["कपड़े सामान्य कचरे में डालें","गीले कपड़े टेक्सटाइल बैंक में डालें","पुराने कपड़े जलाएं"], "gu":["સામાન્ય કચરામાં નાખો","ભીના કપડાં ટેક્સટાઇલ બૅન્કમાં","જૂના કાપડ બાળો"]}, "impact": {"en":"Recycling 1kg of clothing saves 3.6kg of CO₂ and reduces demand for virgin cotton.", "hi":"1 किलो कपड़े रिसायकल करने से 3.6 किलो CO₂ बचता है।", "gu":"1 કિલો કપડાં રિસાઇકલ 3.6 કિલો CO₂ બચાવે."}, "voice": {"en":"This is Clothing waste. Never throw clothes in the bin. Donate wearable items or use a Textile Recycling Bank.", "hi":"यह कपड़े का कचरा है। कपड़े डिब्बे में न फेंकें। दान करें।", "gu":"આ કપડાં કચરો છે. ડબ્બામાં ન નાખો. દાન અથવા ટેક્સટાઇલ રિસાઇક્લિંગ."}},
    "shoes": {"icon": "👟", "category": {"en":"Textile Waste", "hi":"कपड़े का कचरा", "gu":"કાપડ કચરો"}, "bin_color": "#7E57C2", "bin_name": {"en":"Textile Recycling Bank", "hi":"टेक्सटाइल रिसायकलिंग बैंक", "gu":"ટેક્સટાઇલ રિસાઇક્લિંગ બૅન્ક"}, "tip": {"en":"Tie pairs of shoes together before donating.", "hi":"दान करने से पहले जूतों के जोड़े बांधें।", "gu":"દાન કરતા પહેલા જૂતાના જોડ બાંધો."}, "description": {"en":"Old shoes should never go to landfill. Donate wearable shoes to charity.", "hi":"पुराने जूते लैंडफिल में नहीं जाने चाहिए। दान करें।", "gu":"જૂના જૂતા ક્યારેય લૅન્ડફિલ ન જવા. દાન કરો."}, "do": {"en":["Donate wearable shoes","Tie pairs together","Use brand recycling programmes"], "hi":["पहनने योग्य जूते दान करें","जोड़े बांधें","ब्रांड रिसायकलिंग प्रोग्राम उपयोग करें"], "gu":["પહેરી શકાય ચૅરિટીને","જોડ બાંધો","બ્રૅન્ડ રિસાઇક્લિંગ પ્રોગ્રામ ઉપયોગ"]}, "dont": {"en":["Throw shoes in general waste","Separate pairs before donating","Put in standard recycling bins"], "hi":["जूते सामान्य कचरे में डालें","दान से पहले जोड़े अलग करें","मानक रिसायकलिंग बिन में डालें"], "gu":["સામાન્ય કચરામાં નાખો","દાન પહેલા જોડ અલગ","સ્ટાન્ડર્ડ ડબ્બામાં નાખો"]}, "impact": {"en":"Recycled shoes are ground down to create sports surfaces and playground flooring.", "hi":"रिसायकल किए गए जूतों को पीसकर खेल सतह बनाई जाती है।", "gu":"રિસાઇકલ જૂતા રમત સ્થળ બનાવવા ઉપયોગ."}, "voice": {"en":"This is Shoe waste. Never throw shoes in the bin. Donate wearable shoes or use a sports store recycling programme.", "hi":"यह जूते का कचरा है। डिब्बे में न फेंकें। दान करें।", "gu":"આ જૂતા કચરો છે. ડબ્બામાં ન નાખો. દાન કરો."}},
    "trash": {"icon": "🗑️", "category": {"en":"General Waste", "hi":"सामान्य कचरा", "gu":"સામાન્ય કચરો"}, "bin_color": "#546E7A", "bin_name": {"en":"Black General Waste Bin", "hi":"काला सामान्य कचरा डिब्बा", "gu":"કાળો સામાન્ય કચરો ડબ્બો"}, "tip": {"en":"This cannot be recycled. Try to reduce usage of such items.", "hi":"यह रिसायकल नहीं हो सकता। उपयोग कम करें।", "gu":"આ રિસાઇકલ ન થઈ શકે. ઓછી ઉપયોગ કરો."}, "description": {"en":"General waste cannot be recycled through standard collection. Before disposing, ask: Can it be repaired? Can it be donated?", "hi":"सामान्य कचरा मानक संग्रह से रिसायकल नहीं हो सकता।", "gu":"સામાન્ય કચરો સ્ટાન્ડર્ડ સંગ્રહ દ્વારા રિસાઇકલ ન થઈ શકે."}, "do": {"en":["Check for specialist recycling option","Consider repair or reuse","Choose minimal packaging products"], "hi":["विशेष रिसायकलिंग विकल्प खोजें","मरम्मत या पुनः उपयोग सोचें","कम पैकेजिंग उत्पाद चुनें"], "gu":["વિશેષ રિસાઇક્લિંગ વિકલ્પ","સુધારો અથવા ફરી ઉપયોગ","ઓછી પૅકેજિંગ ઉત્પાદ"]}, "dont": {"en":["Mix hazardous waste with general trash","Throw items that could be donated","Burn waste at home"], "hi":["खतरनाक कचरे को सामान्य में मिलाएं","दान योग्य वस्तुएं फेंकें","घर पर कचरा जलाएं"], "gu":["જોખમી કચરો સામાન્ય સાથે","દાન થઈ શકે ન ફેંકો","ઘરે કચરો બાળો"]}, "impact": {"en":"Reducing general waste by 10% significantly decreases methane emissions from landfill.", "hi":"सामान्य कचरे को 10% कम करने से मीथेन उत्सर्जन में काफी कमी आती है।", "gu":"સામાન્ય કચરો 10% ઘટાડવાથી લૅન્ડફિલ મિથેન ઉત્સર્જનમાં નોંધપાત્ર ઘટાડો."}, "voice": {"en":"This is General Waste. Place in the Black General Waste Bin. Before disposing, consider if it can be repaired, donated or specially recycled.", "hi":"यह सामान्य कचरा है। काले डिब्बे में डालें।", "gu":"આ સામાન્ય કચરો છે. કાળા ડબ્બામાં નાખો."}}
}

DEFAULT_WASTE = {
    "icon": "♻️", "category": {"en":"Unknown", "hi":"अज्ञात", "gu":"અજ્ઞાત"}, "bin_color": "#78909C", "bin_name": {"en":"Check Local Guidelines", "hi":"स्थानीय दिशानिर्देश देखें", "gu":"સ્થાનિક માર્ગદર્શિકા તપાસો"}, "tip": {"en":"Please consult local waste guidelines.", "hi":"कृपया स्थानीय दिशानिर्देश देखें।", "gu":"માર્ગદર્શિકા તપાસો."}, "description": {"en":"Could not classify this item. Check local guidelines.", "hi":"इस वस्तु को वर्गीकृत नहीं किया जा सका।", "gu":"ઓળખી ન શકી."}, "do": {"en":["Check local guidelines"], "hi":["दिशानिर्देश देखें"], "gu":["માર્ગદર્શિકા"]}, "dont": {"en":["Guess which bin to use"], "hi":["कोई भी डिब्बा"], "gu":["કોઈ પણ ડબ્બો"]}, "impact": {"en":"Correct disposal reduces contamination.", "hi":"सही निपटान से प्रदूषण कम होता है।", "gu":"સાચો નિકાલ પ્રદૂષણ ઘટાડે."}, "voice": {"en":"Waste type unclear. Check local guidelines.", "hi":"कचरा अस्पष्ट है।", "gu":"અસ્પષ્ટ."}
}


def load_model_file():
    global model, class_labels
    if not os.path.exists(MODEL_PATH):
        print(f"⚠️  {MODEL_PATH} not found.")
        return False
    if not os.path.exists(LABELS_PATH):
        print(f"⚠️  {LABELS_PATH} not found.")
        return False
    
    print("Loading model…")
    # Load the Keras model
    model = tf.keras.models.load_model(MODEL_PATH)
    
    # Load the class labels mapping
    with open(LABELS_PATH) as f:
        class_labels = json.load(f)
        
    print(f"✅ Model loaded. Classes: {list(class_labels.values())}")
    return True

def preprocess(image_bytes):
    # Decode image from bytes, convert to RGB
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    # Resize to match model's expected input shape (224x224)
    img = img.resize((224, 224))
    # Convert to float numpy array and normalize [0, 1]
    arr = np.array(img, dtype=np.float32) / 255.0
    # Add batch dimension: (1, 224, 224, 3)
    return np.expand_dims(arr, axis=0)

# Load the model upon starting up
load_model_file()

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "ok",
        "model_loaded": model is not None,
        "classes": list(class_labels.values()) if class_labels else []
    })

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({"error": "Model not loaded."}), 503
        
    data = request.json
    if not data or 'image' not in data:
        return jsonify({'error': 'No image provided'}), 400

    try:
        # Extract base64 image string (removing header if present)
        base64_str = data['image']
        if ',' in base64_str:
            base64_str = base64_str.split(',')[1]
            
        # Decode the image
        img_bytes = base64.b64decode(base64_str)
        # Preprocess for the model
        img_array = preprocess(img_bytes)
        
        # Run inference
        preds = model.predict(img_array, verbose=0)[0]
        
        # Get the top prediction
        top_idx = int(np.argmax(preds))
        confidence = float(preds[top_idx]) * 100
        
        # Map to class label (default to 'trash' if not found)
        # class_labels keys are strings "0", "1", "2"...
        label = class_labels.get(str(top_idx), "trash").lower()

        # Get top 3 predictions for the UI
        top3 = sorted(
            [{"label": class_labels.get(str(i), str(i)), "confidence": round(float(p) * 100, 1)}
             for i, p in enumerate(preds)],
            key=lambda x: x["confidence"], reverse=True
        )[:3]

        meta = WASTE_DATA.get(label, DEFAULT_WASTE)

        return jsonify({
            "label":         label,
            "label_display": label.replace("-"," ").title(),
            "confidence":    round(confidence, 1),
            "top3":          top3,
            "timestamp":     datetime.datetime.now().strftime("%d %b %Y, %I:%M %p"),
            "icon":          meta["icon"],
            "bin_color":     meta["bin_color"],
            "category":      meta["category"],
            "bin_name":      meta["bin_name"],
            "tip":           meta["tip"],
            "description":   meta["description"],
            "do":            meta["do"],
            "dont":          meta["dont"],
            "impact":        meta["impact"],
            "voice":         meta["voice"],
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Run the Flask development server on the port specified by environment or default 5001
    port = int(os.environ.get("PORT", 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
