╔══════════════════════════════════════════════════════════════╗
║            ECOSCAN — COMPLETE SETUP GUIDE                   ║
║            PS-02: Smart E-Waste & Bio-Waste Identifier      ║
╚══════════════════════════════════════════════════════════════╝

YOUR PROJECT FILES:
───────────────────
EcoScan/
├── index.html          ← Website (open this in browser)
├── style.css           ← Website styling
├── app.js              ← Website logic
├── app.py              ← Flask AI server (run this)
├── COLAB_TRAINING.py   ← Paste into Google Colab
├── ewaste_model.h5     ← ADD THIS after Colab training
└── class_labels.json   ← ADD THIS after Colab training


════════════════════════════════════════
STEP 1 — TRAIN AI IN GOOGLE COLAB
════════════════════════════════════════

1. Go to: https://colab.research.google.com
2. Click "New Notebook"
3. Enable GPU: Runtime → Change runtime type → T4 GPU → Save
4. Open COLAB_TRAINING.py and copy each CELL into Colab
5. Run cells 1 → 2 → 3 → 4 → 5 in order
6. After Cell 5, two files download to your PC:
   - ewaste_model.h5
   - class_labels.json
7. Move both files into your EcoScan folder


════════════════════════════════════════
STEP 2 — INSTALL PYTHON LIBRARIES
════════════════════════════════════════

Open Command Prompt (Win + R → type cmd → Enter)
Type this and press Enter:

    pip install flask tensorflow pillow flask-cors

Wait for it to finish (5-10 minutes)


════════════════════════════════════════
STEP 3 — RUN THE PROJECT
════════════════════════════════════════

In Command Prompt, navigate to your folder:

    cd Desktop\EcoScan

Start the AI server:

    python app.py

You should see:
    ✅ Model loaded. Classes: ['cardboard', 'glass', 'metal', 'paper', 'plastic', 'trash']
    * Running on http://127.0.0.1:5000

⚠️  KEEP THIS WINDOW OPEN — do not close it!


════════════════════════════════════════
STEP 4 — OPEN THE WEBSITE
════════════════════════════════════════

Double-click index.html to open in Chrome

You will see a GREEN dot saying "Model Ready" ✅


════════════════════════════════════════
FEATURES
════════════════════════════════════════

✅ Upload image from PC
✅ Live camera scanning with scan animation
✅ 6 waste categories: cardboard, glass, metal, paper, plastic, trash
✅ Bin colour + disposal instructions
✅ Full recycling description
✅ Do's and Don'ts for each waste type
✅ Environmental impact information
✅ AI confidence percentage + top 3 predictions
✅ Scan history (saved across sessions)
✅ Dark / Light mode toggle
✅ Professional competition-ready design


════════════════════════════════════════
TROUBLESHOOTING
════════════════════════════════════════

Problem: Red dot "Server Offline"
Fix: Make sure app.py is running in CMD

Problem: "Model Not Loaded"
Fix: Make sure ewaste_model.h5 is in EcoScan folder

Problem: pip is not recognized
Fix: Install Python from https://python.org
     During install → check "Add Python to PATH"

Problem: tensorflow install fails
Fix: Try: pip install tensorflow-cpu
