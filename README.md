<div align="center">

<img src="https://img.shields.io/badge/NeuralGreen-PS--02-2d6a4f?style=for-the-badge&logo=leaf&logoColor=white" alt="NeuralGreen" height="40"/>

# 🌿 NeuralGreen — Smart Waste & Recycling Identifier

**AI-powered waste classification to make recycling effortless and rewarding.**

[![Python](https://img.shields.io/badge/Python-3.x-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-5001-000000?style=flat-square&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5173-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-Keras-FF6F00?style=flat-square&logo=tensorflow&logoColor=white)](https://tensorflow.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Step 1 — Install Python Dependencies](#step-1--install-python-dependencies)
  - [Step 2 — Run the Backend](#step-2--run-the-backend)
  - [Step 3 — Run the Frontend](#step-3--run-the-frontend)
  - [Step 4 — AI Model Setup](#step-4--ai-model-setup-if-missing)
- [Waste Categories](#-waste-categories)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Troubleshooting](#-troubleshooting)

---

## 🌱 Overview

NeuralGreen PS-02 is a full-stack AI application that identifies waste types from images and provides intelligent disposal guidance. Point your camera at any waste item and get instant classification, recycling instructions, environmental impact data, and eco-points — all in your language.

---

## 📁 Project Structure

```
NeuralGreen/
├── backend/
│   ├── app.py                  ← Flask AI server (run this)
│   ├── run.py                  ← Alternative entry point
│   ├── requirements.txt        ← Python dependencies
│   ├── ewaste_model.h5         ← Keras/TensorFlow model (224×224)
│   ├── best.pt                 ← YOLO model (alternative)
│   └── class_labels.json       ← Waste class label map
│
└── frontend/
    ├── src/
    │   ├── App.tsx              ← Root React component
    │   ├── components/          ← Scanner, ResultCard, Guide, Rewards, History, Header
    │   └── lib/                 ← i18n, gamification, wasteData, utils
    ├── package.json
    └── vite.config.ts           ← Proxies /api → localhost:5001
```

---

## 🚀 Getting Started

### Step 1 — Install Python Dependencies

Open **Command Prompt** and navigate to the backend folder:

```bash
cd path\to\NeuralGreen\backend
```

Install all required libraries:

```bash
pip install -r requirements.txt
```

> Or install manually:
> ```bash
> pip install flask flask-cors pillow numpy tensorflow
> ```

---

### Step 2 — Run the Backend

Still inside the `backend/` folder, start the Flask server:

```bash
python app.py
```

> **Alternative entry point:**
> ```bash
> python run.py
> ```

You should see:

```
Starting NeuralGreen Backend Server...
✅ Model loaded. Classes: ['battery', 'biological', 'brown-glass', ...]
 * Running on http://0.0.0.0:5001
```

> ⚠️ **Keep this terminal window open** — the backend must stay running.

**API Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/health` | Model status check |
| `POST` | `/predict` | Accepts base64 image, returns prediction |

---

### Step 3 — Run the Frontend

Open a **new terminal window** and navigate to the frontend folder:

```bash
cd path\to\NeuralGreen\frontend
```

Install Node dependencies *(first time only)*:

```bash
npm install
```

Start the Vite dev server:

```bash
npm run dev
```

Then open your browser at:

```
http://localhost:5173
```

You should see a 🟢 **"Model Ready"** indicator in the top bar.

> The frontend automatically proxies all `/api/*` requests to `http://localhost:5001` via Vite's proxy config.

---

### Step 4 — AI Model Setup *(if missing)*

If `ewaste_model.h5` or `class_labels.json` are missing from the `backend/` folder, train the model on Google Colab:

1. Go to [colab.research.google.com](https://colab.research.google.com) → **New Notebook**
2. Enable GPU: `Runtime → Change runtime type → T4 GPU → Save`
3. Train the model and download both files:
   - `ewaste_model.h5`
   - `class_labels.json`
4. Place both files inside `NeuralGreen/backend/`

---

## 🗂️ Waste Categories

The model classifies **12 waste categories**:

| Category | Category | Category |
|----------|----------|----------|
| 🔋 Battery | 🌿 Biological | 🟤 Brown Glass |
| 📦 Cardboard | 👕 Clothes | 🟢 Green Glass |
| 🔩 Metal | 📄 Paper | 🧴 Plastic |
| 👟 Shoes | 🗑️ Trash | ⬜ White Glass |

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📸 **Image Upload** | Drag & drop or file picker from your device |
| 📷 **Live Camera Scan** | Capture snapshot or enable auto-scan every 5s |
| 🎙️ **Voice Search** | Speak a waste item name to get disposal info |
| 🔊 **Text-to-Speech** | Results read aloud in selected language |
| 🌐 **Multilingual** | English, Hindi (हिंदी), Gujarati (ગુજરાતી) |
| 🎯 **AI Confidence** | Percentage score + top 3 predictions breakdown |
| ♻️ **Disposal Guide** | Bin colour, instructions, Do's & Don'ts per category |
| 🌍 **Eco Impact** | Environmental impact facts per waste type |
| 📜 **Scan History** | Last 20 scans saved across sessions |
| 🏅 **Gamification** | Eco Points, CO₂ saved tracker, 6 unlockable badges |
| 🌗 **Dark / Light Mode** | Toggle between themes |
| 📡 **Offline Fallback** | Mock prediction if server is unreachable |

**Unlockable Badges:** First Step · Eco Starter · Green Warrior · and more

---

## 🛠️ Tech Stack

**Backend**

| Technology | Role |
|------------|------|
| Python 3.x | Runtime |
| Flask + Flask-CORS | REST API server (port 5001) |
| TensorFlow / Keras | Model inference (`ewaste_model.h5`, 224×224 input) |
| Pillow + NumPy | Image preprocessing |

**Frontend**

| Technology | Role |
|------------|------|
| React 19 + TypeScript | UI framework |
| Vite 7 | Dev server (port 5173) |
| Tailwind CSS v4 | Styling |
| Lucide React | Icons |
| Web Speech API | Voice search + text-to-speech |

---

## 🔧 Troubleshooting

| Problem | Fix |
|---------|-----|
| 🔴 **"Server Offline"** red dot | Make sure `app.py` is running on port `5001` |
| ❌ **"Model not loaded"** | Ensure `ewaste_model.h5` and `class_labels.json` are in `backend/` |
| ❌ **`pip` not recognized** | [Install Python](https://python.org) and check **"Add Python to PATH"** during setup |
| ❌ **TensorFlow install fails** | Try `pip install tensorflow-cpu` instead |
| ❌ **`npm` not found** | [Install Node.js LTS](https://nodejs.org) |
| 📷 **Camera not working** | Open via `http://localhost:5173`, not `file://` — camera needs localhost or HTTPS |
| 🎙️ **Voice search not working** | Allow microphone permissions; use **Chrome** or **Edge** (Firefox has limited Web Speech API support) |

---

<div align="center">

Made with 💚 for a greener planet · **NeuralGreen PS-02**

</div>
