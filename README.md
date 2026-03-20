╔══════════════════════════════════════════════════════════════════╗
║           NEURALGREEN — COMPLETE SETUP GUIDE                     ║
║           PS-02: Smart Waste & Recycling Identifier              ║
╚══════════════════════════════════════════════════════════════════╝

YOUR PROJECT STRUCTURE:
───────────────────────
NeuralGreen/
├── backend/
│   ├── app.py              ← Flask AI server (run this)
│   ├── run.py              ← Alternative entry point
│   ├── requirements.txt    ← Python dependencies
│   ├── ewaste_model.h5     ← Keras/TensorFlow model
│   ├── best.pt             ← YOLO model (alternative)
│   └── class_labels.json   ← Waste class label map
└── frontend/
    ├── src/
    │   ├── App.tsx          ← Root React component
    │   ├── components/      ← Scanner, ResultCard, Guide, Rewards, History, Header
    │   └── lib/             ← i18n, gamification, wasteData, utils
    ├── package.json
    └── vite.config.ts       ← Vite dev server (proxies /api → localhost:5001)


════════════════════════════════════════
STEP 1 — INSTALL PYTHON DEPENDENCIES
════════════════════════════════════════

Open Command Prompt (Win + R → type cmd → Enter)
Navigate to the backend folder:

    cd path\to\NeuralGreen\backend

Install required libraries:

    pip install -r requirements.txt

Or manually:

    pip install flask flask-cors pillow numpy tensorflow


════════════════════════════════════════
STEP 2 — RUN THE BACKEND SERVER
════════════════════════════════════════

Inside the backend folder, start the Flask server:

    python app.py

Or use the alternative entry point:

    python run.py

You should see:
    Starting NeuralGreen Backend Server...
    ✅ Model loaded. Classes: ['battery', 'biological', 'brown-glass', ...]
    * Running on http://0.0.0.0:5001

⚠️  KEEP THIS WINDOW OPEN — do not close it!

Backend API endpoints:
    GET  http://localhost:5001/health   ← Model status check
    POST http://localhost:5001/predict  ← Accepts base64 image, returns prediction


════════════════════════════════════════
STEP 3 — RUN THE FRONTEND
════════════════════════════════════════

Open a NEW Command Prompt window and navigate to the frontend folder:

    cd path\to\NeuralGreen\frontend

Install Node dependencies (first time only):

    npm install

Start the Vite dev server:

    npm run dev

Open your browser and go to:

    http://localhost:5173

You should see a GREEN dot saying "Model Ready" ✅

Note: The frontend automatically proxies all /api/* requests to the
backend at http://localhost:5001 via Vite's proxy config.


════════════════════════════════════════
STEP 4 — AI MODEL (IF NOT PRESENT)
════════════════════════════════════════

If ewaste_model.h5 or class_labels.json are missing, train on Google Colab:

1. Go to: https://colab.research.google.com
2. Click "New Notebook"
3. Enable GPU: Runtime → Change runtime type → T4 GPU → Save
4. Train the model and download:
   - ewaste_model.h5
   - class_labels.json
5. Place both files inside: NeuralGreen/backend/

The model classifies 12 waste categories:
    battery, biological, brown-glass, cardboard, clothes,
    green-glass, metal, paper, plastic, shoes, trash, white-glass


════════════════════════════════════════
FEATURES
════════════════════════════════════════

✅ Upload image from PC (drag & drop or file picker)
✅ Live camera scanning — capture snapshot or enable Live Mode
✅ Live Mode — auto-scans every 5 seconds with real-time results
✅ Voice Search — speak a waste item name to get disposal info
✅ Text-to-Speech — results read aloud in the selected language
✅ Multilingual — English, Hindi (हिंदी), Gujarati (ગુજરાતી)
✅ 12 waste categories with bin colour + disposal instructions
✅ Full recycling description per category
✅ Do's and Don'ts for each waste type
✅ Environmental impact facts per category
✅ AI confidence percentage + top 3 predictions breakdown
✅ Scan history — last 20 scans saved across sessions
✅ Gamification — Eco Points, CO₂ saved tracker, badge system
✅ 6 unlockable badges (First Step, Eco Starter, Green Warrior, etc.)
✅ Waste Disposal Guide panel
✅ Dark / Light mode toggle
✅ Offline fallback — uses mock prediction if server is unreachable


════════════════════════════════════════
TECH STACK
════════════════════════════════════════

Backend:
    Python 3.x, Flask, Flask-CORS
    TensorFlow / Keras (ewaste_model.h5, 224×224 input)
    Pillow, NumPy
    Runs on port 5001

Frontend:
    React 19 + TypeScript
    Vite 7 (dev server on port 5173)
    Tailwind CSS v4
    Lucide React (icons)
    Browser Web Speech API (voice search + TTS)


════════════════════════════════════════
TROUBLESHOOTING
════════════════════════════════════════

Problem: Red dot "Server Offline"
Fix: Make sure app.py is running in CMD on port 5001

Problem: "Model not loaded" in health check
Fix: Ensure ewaste_model.h5 and class_labels.json are in the backend folder

Problem: pip is not recognized
Fix: Install Python from https://python.org
     During install → check "Add Python to PATH"

Problem: tensorflow install fails
Fix: Try: pip install tensorflow-cpu

Problem: npm not found
Fix: Install Node.js from https://nodejs.org (LTS version)

Problem: Camera not working
Fix: Open the app via http://localhost:5173 (not file://)
     Camera APIs require a localhost or HTTPS origin

Problem: Voice search not working
Fix: Allow microphone permissions in the browser
     Use Chrome or Edge (Firefox has limited Web Speech API support)
