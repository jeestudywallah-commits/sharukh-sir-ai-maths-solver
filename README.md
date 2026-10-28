# Sharukh AI Maths Solver
> **Understand Maths. Solve Smarter.**

Sharukh AI Maths Solver is an intelligent, full-stack mathematics problem-solving and digital learning platform designed for school students (Class 6–12), higher secondary learners, and competitive-exam aspirants (e.g. JEE, Olympiads, and STEM tests).

---

## 🌟 Core Features

1. **Intelligent Mathematical Solver**
   - Natural language questions, mathematical equations, and formulas.
   - Rigorous step-by-step mathematical derivations with clear algebraic reasoning ("Why this works").
   - KaTeX rendering for sharp LaTeX display math ($$...$$) and inline math ($...$).
   - Multiple solving methods: Standard Algebraic, Quick/Shortcut, Formula-based, Graphical Analysis, and Alternative Proofs.
   - Verification and self-check proof (e.g. substituting roots back into LHS/RHS, Vieta's formulas, dimensional checking).
   - Sharukh's Learning Tips, shortcuts, and common student traps to avoid.

2. **Visual Image/Camera OCR Problem Scanner**
   - Upload textbook snapshots, worksheets, or handwritten notes (JPG, PNG, WebP).
   - High-precision OCR powered by Gemini 3.8 Flash Vision.
   - Interactive review step allowing students to inspect, edit, and confirm recognized text before solving.
   - Confidence scoring and ambiguity alerts.

3. **Interactive Graph & Function Visualizer**
   - Real-time coordinate plane with axes, grid lines, and numerical ticks.
   - Traces functions $y = f(x)$ with sub-pixel rendering.
   - Identifies roots (x-intercepts), vertices (extrema), y-intercepts, and critical points with markers.
   - Interactive mouse crosshair coordinate inspection, zoom in/out, pan, reset view, and live expression editing.

4. **Interactive AI Tutor Follow-up Chat**
   - Conversational pedagogical assistant attached to each solved problem.
   - Supports natural follow-ups:
     - *"Why did you subtract 5 from both sides?"*
     - *"Explain this step more simply."*
     - *"Give me a hint without revealing the answer."*
     - *"Give me a similar practice question."*
     - *"Check my answer."*

5. **Practice & Mastery Zone**
   - Topic-wise question generator across Algebra, Calculus, Trigonometry, Geometry, Matrices, and Statistics.
   - Adjustable difficulty: Basic, Intermediate, Advanced.
   - Progressive hints without spoiling answers.
   - Instant feedback, score and streak counters, confetti animations, and optional timed stopwatch practice.

6. **Formula Handbook**
   - Searchable reference of high-frequency formulas and theorems.
   - One-click "Copy LaTeX" and "Solve Example Problem" buttons.

7. **User Dashboard & History**
   - Tracks all solved problems with full session persistence.
   - Starred / favorite questions.
   - Subject-wise activity breakdown.
   - Guest mode & student grade personalization.

---

## 🛠 Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, KaTeX, Lucide React, Canvas Confetti.
- **Backend:** Node.js, Express, tsx.
- **AI Engine:** Google Gemini 3.8 Flash (`@google/genai` TypeScript SDK).
- **Algorithmic Fallback:** Local mathematical solver for linear, quadratic, geometry, and calculus operations.

---

## 🚀 Getting Started

### 1. Environment Variables
Create a `.env` file (copied from `.env.example`):
```env
GEMINI_API_KEY="your-gemini-api-key"
PORT=3000
```

### 2. Development
```bash
npm run dev
```
Open `http://localhost:3000` to interact with Sharukh AI Maths Solver.

### 3. Build & Production
```bash
npm run build
npm start
```

### 4. Deploy to Railway
1. Push this project to a GitHub repository and create a new Railway project from that repository.
2. In the Railway service's **Variables**, add `GEMINI_API_KEY` with your Google AI Studio API key.
3. Deploy the service. Railway uses `railway.json` to install dependencies, build the app, and start the server.
4. In **Settings → Networking**, generate a public domain and open that URL.
