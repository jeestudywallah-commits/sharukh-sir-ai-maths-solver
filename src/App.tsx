import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Camera,
  ArrowRight,
  Calculator,
  Search,
  BookOpen,
  Brain,
  History,
  Layers,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Atom,
  HelpCircle,
  Lightbulb,
  Compass,
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  ChevronRight,
} from 'lucide-react';
import { MathSolution, HistoryItem, UserProfile, MethodType, SubjectType, ChatMessage } from './types.ts';
import { Navbar } from './components/Navbar.tsx';
import { MathView } from './components/MathView.tsx';
import { MathKeyboard } from './components/MathKeyboard.tsx';
import { ImageOcrModal } from './components/ImageOcrModal.tsx';
import { SolutionCard } from './components/SolutionCard.tsx';
import { PracticeZone } from './components/PracticeZone.tsx';
import { FormulaHandbook } from './components/FormulaHandbook.tsx';
import { HistoryDashboard } from './components/HistoryDashboard.tsx';

const TOPIC_CARDS = [
  {
    title: 'Linear Equations',
    category: 'Algebra',
    desc: 'Master single and simultaneous linear equations with graphical and algebraic balancing.',
    formula: '$$ax + b = c$$',
    difficulty: 'Basic',
    time: '15 mins',
  },
  {
    title: 'Quadratic Functions',
    category: 'Algebra',
    desc: 'Explore parabolas, discriminant analysis, factoring, and the quadratic formula.',
    formula: '$$ax^2 + bx + c = 0$$',
    difficulty: 'Intermediate',
    time: '20 mins',
  },
  {
    title: 'Coordinate Geometry',
    category: 'Geometry',
    desc: 'Calculate distances, midpoints, slopes, and straight-line equations in the 2D plane.',
    formula: '$$d = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$$',
    difficulty: 'Basic',
    time: '18 mins',
  },
  {
    title: 'Trigonometric Identities',
    category: 'Trigonometry',
    desc: 'Understand sine, cosine, Pythagorean identities, and angle transformation rules.',
    formula: '$$\\sin^2(x) + \\cos^2(x) = 1$$',
    difficulty: 'Intermediate',
    time: '25 mins',
  },
  {
    title: 'Calculus Differentiation',
    category: 'Calculus',
    desc: 'Learn power rule, product rule, quotient rule, and chain rule with graphical tangents.',
    formula: '$$\\frac{d}{dx}[x^n] = n x^{n-1}$$',
    difficulty: 'Advanced',
    time: '30 mins',
  },
  {
    title: 'Probability & Bayes',
    category: 'Statistics',
    desc: 'Compute conditional probabilities, combinations, permutations, and expected values.',
    formula: '$$P(A|B) = \\frac{P(B|A)P(A)}{P(B)}$$',
    difficulty: 'Advanced',
    time: '22 mins',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'solver' | 'practice' | 'formulas' | 'dashboard'>('solver');
  const [questionInput, setQuestionInput] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('All Grades');
  const [selectedCategory, setSelectedCategory] = useState('All Topics');
  const [selectedMethod, setSelectedMethod] = useState<MethodType>('standard');
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isOcrOpen, setIsOcrOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Floating AI Tutor Widget state
  const [isAiWidgetOpen, setIsAiWidgetOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      role: 'assistant',
      content: 'Hello! I am your **MathVik AI Tutor**. Ask me any maths question, request a hint, or ask why a formula works!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedFollowUps: ['Explain quadratic formula', 'Give me a calculus tip', 'How to solve linear equations?'],
    },
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const aiChatEndRef = useRef<HTMLDivElement>(null);

  // Active solution
  const [currentSolution, setCurrentSolution] = useState<MathSolution | null>(null);

  // History
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('mathvik_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      name: 'Ananya Sharma',
      grade: 'Class 11–12 (Higher Secondary)',
      isGuest: true,
      preferredSubject: 'Algebra',
      streakCount: 5,
      problemsSolved: 24,
    };
  });

  useEffect(() => {
    const local = localStorage.getItem('mathvik_history');
    if (local) {
      try {
        setHistory(JSON.parse(local));
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (isAiWidgetOpen) {
      aiChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiMessages, isAiWidgetOpen]);

  const saveHistoryItem = (solution: MathSolution, query: string) => {
    const newItem: HistoryItem = {
      id: solution.id || 'hist-' + Date.now(),
      question: query,
      recognizedQuestion: solution.recognizedQuestion,
      subject: solution.subject,
      topic: solution.topic,
      finalAnswer: solution.finalAnswer,
      timestamp: new Date().toISOString(),
      isFavorite: false,
      solution,
    };

    setHistory((prev) => {
      const updated = [newItem, ...prev.filter((h) => h.id !== newItem.id)].slice(0, 50);
      try {
        localStorage.setItem('mathvik_history', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setUserProfile((prev) => {
      const updated = { ...prev, problemsSolved: prev.problemsSolved + 1 };
      try {
        localStorage.setItem('mathvik_user', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  /**
   * Real API call to the backend computational math engine (/api/solve).
   * Submits the user's mathematical query and method preference, receives
   * structured step-by-step logic, proofs, final answers, and graph data,
   * and updates the UI state to render the complete SolutionCard.
   */
  const handleSolve = async (overrideQuery?: string, overrideMethod?: MethodType) => {
    const query = (overrideQuery || questionInput).trim();
    if (!query) {
      setErrorMessage('Please type a maths equation or problem statement first.');
      return;
    }

    const methodToUse = overrideMethod || selectedMethod;
    setIsLoading(true);
    setErrorMessage(null);
    setCurrentSolution(null);

    try {
      // Real API fetch call to backend computational math engine
      const response = await fetch('/api/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          method: methodToUse,
          gradeLevel: userProfile.grade,
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend computation endpoint returned status ${response.status}`);
      }

      const data = await response.json();
      
      if (data && data.solution) {
        // Update UI state with the step-by-step solution
        setCurrentSolution(data.solution);
        saveHistoryItem(data.solution, query);
        
        // Smoothly scroll down to render the SolutionCard in the UI
        setTimeout(() => {
          const solutionElement = document.getElementById('solution-card-view');
          if (solutionElement) {
            solutionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            window.scrollTo({ top: 600, behavior: 'smooth' });
          }
        }, 100);
      } else {
        throw new Error('Invalid mathematical response payload received from server.');
      }
    } catch (err: any) {
      console.error('Error in handleSolve backend API call:', err);
      setErrorMessage('Unable to connect to the backend computation engine. Please verify your query.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAiWidgetSend = async (textToSend?: string) => {
    const msg = (textToSend || aiInput).trim();
    if (!msg || isAiLoading) return;

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: msg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setAiMessages((prev) => [...prev, userMsg]);
    setAiInput('');
    setIsAiLoading(true);

    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          question: 'General math query',
          solution: currentSolution || { finalAnswer: 'N/A', conceptFormula: 'Mathematical reasoning' },
          chatHistory: aiMessages,
        }),
      });
      const data = await res.json();
      const botMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        role: 'assistant',
        content: data.reply || 'That is a wonderful mathematical question! Let me break it down for you step-by-step.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowUps: data.suggestedFollowUps || ['Show example', 'Explain formula'],
      };
      setAiMessages((prev) => [...prev, botMsg]);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: 'bot-err-' + Date.now(),
        role: 'assistant',
        content: 'In mathematics, keeping expressions balanced on both sides is key. How can I help you simplify your equation?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowUps: ['Solve linear equation', 'Derivative rules'],
      };
      setAiMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleInsertSymbol = (symbol: string) => {
    setQuestionInput((prev) => prev + symbol);
  };

  const handleConfirmOcrQuestion = (recognized: string) => {
    setQuestionInput(recognized);
    handleSolve(recognized);
  };

  const toggleFavorite = (id: string) => {
    setHistory((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      );
      try {
        localStorage.setItem('mathvik_history', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const deleteHistoryItem = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem('mathvik_history', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearAllHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('mathvik_history');
    } catch {}
  };

  const selectHistoryItem = (item: HistoryItem) => {
    if (item.solution) {
      setCurrentSolution(item.solution);
      setQuestionInput(item.question);
      setActiveTab('solver');
      window.scrollTo({ top: 600, behavior: 'smooth' });
    } else {
      setQuestionInput(item.question);
      setActiveTab('solver');
      handleSolve(item.question);
    }
  };

  const filteredTopics = TOPIC_CARDS.filter(
    (t) => selectedCategory === 'All Topics' || t.category === selectedCategory
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F0E2] text-[#172321] selection:bg-[#07869A]/20 selection:text-[#07869A]">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userProfile={userProfile}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-[1700px] mx-auto px-4 sm:px-12 py-8 space-y-16">
        {activeTab === 'solver' && (
          <div className="space-y-16">
            {/* HERO SECTION — Asymmetric Two-Column */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-4 pb-12">
              {/* Left Column (49% width on desktop -> 7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <span className="inline-block text-xs font-bold tracking-widest text-[#07869A] uppercase bg-[#07869A]/10 px-3 py-1 rounded-full border border-[#07869A]/20">
                  YOUR PERSONAL MATHEMATICS WORKSPACE
                </span>

                <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-extrabold tracking-tight text-[#172321] leading-[1.08]">
                  Understand Maths.{' '}
                  <span className="text-[#07869A]">Master Every</span>{' '}
                  Problem.
                </h1>

                <p className="text-base sm:text-lg text-[#53635F] max-w-[650px] leading-relaxed">
                  From your first equation to advanced calculus, explore interactive lessons, understand every step, visualize mathematical ideas, and build the confidence to solve anything.
                </p>

                {/* Main Search and Action Bar (~82px tall) */}
                <div className="bg-[#FBF8EF] border border-[#E2D9C4] rounded-full p-2.5 shadow-md flex flex-col sm:flex-row items-center gap-2 max-w-2xl">
                  <div className="flex items-center gap-3 px-4 py-2 w-full flex-1">
                    <Search className="w-5 h-5 text-[#07869A] shrink-0" />
                    <input
                      type="text"
                      value={questionInput}
                      onChange={(e) => setQuestionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSolve();
                      }}
                      placeholder="What do you want to solve today? (e.g. 2x + 5 = 17)"
                      className="w-full bg-transparent text-sm sm:text-base text-[#172321] placeholder-[#53635F]/75 outline-none font-sans"
                    />
                  </div>

                  <div className="hidden md:block w-[1px] h-8 bg-[#E2D9C4]" />

                  {/* Grade Selector */}
                  <div className="hidden md:flex items-center gap-2 px-3 text-xs font-semibold text-[#53635F]">
                    <select
                      value={selectedGrade}
                      onChange={(e) => setSelectedGrade(e.target.value)}
                      className="bg-transparent text-[#172321] outline-none cursor-pointer"
                    >
                      <option value="All Grades">All Grades</option>
                      <option value="Class 9–10">Class 9–10</option>
                      <option value="Class 11–12">Class 11–12</option>
                      <option value="JEE / Competitive">JEE / Competitive</option>
                    </select>
                  </div>

                  <button
                    onClick={() => handleSolve()}
                    disabled={isLoading}
                    className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#07869A] hover:bg-[#066F80] text-white text-sm font-bold shadow-md shadow-[#07869A]/25 transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Solving...</span>
                      </>
                    ) : (
                      <>
                        <span>Explore Maths</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                {/* Quick-Access Action Pills */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => setQuestionInput('Solve x^2 - 5x + 6 = 0')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#E2D9C4] bg-[#FBF8EF] hover:bg-[#E2D9C4]/30 text-xs font-bold text-[#172321] transition-colors shadow-2xs"
                  >
                    <Calculator className="w-3.5 h-3.5 text-[#07869A]" />
                    <span>Solve an Equation</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('practice')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#E2D9C4] bg-[#FBF8EF] hover:bg-[#E2D9C4]/30 text-xs font-bold text-[#172321] transition-colors shadow-2xs"
                  >
                    <Brain className="w-3.5 h-3.5 text-[#07869A]" />
                    <span>Practice Questions</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('formulas')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#E2D9C4] bg-[#FBF8EF] hover:bg-[#E2D9C4]/30 text-xs font-bold text-[#172321] transition-colors shadow-2xs"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#07869A]" />
                    <span>Formula Library</span>
                  </button>

                  <button
                    onClick={() => setIsOcrOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#07869A]/40 bg-[#07869A]/10 hover:bg-[#07869A]/20 text-xs font-bold text-[#07869A] transition-colors shadow-2xs"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Scan Problem Photo</span>
                  </button>
                </div>

                {errorMessage && (
                  <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>

              {/* Right Hero Visual Panel (43% width -> 5 cols) */}
              <div className="lg:col-span-5">
                <div className="relative rounded-[32px] bg-[#E5F0E6] border border-[#E2D9C4] p-6 sm:p-8 shadow-xl overflow-hidden flex flex-col justify-between min-h-[440px]">
                  {/* Decorative backdrop elements */}
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#07869A]/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex items-center justify-between pb-4 border-b border-[#07869A]/15">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#E83B35]" />
                      <span className="w-3 h-3 rounded-full bg-amber-400" />
                      <span className="w-3 h-3 rounded-full bg-[#247A58]" />
                    </div>
                    <span className="text-xs font-mono font-bold text-[#07869A] bg-[#FBF8EF] px-3 py-1 rounded-full border border-[#E2D9C4]">
                      MathVik Engine v2.5
                    </span>
                  </div>

                  {/* Central Mathematical Composition */}
                  <div className="my-6 space-y-4">
                    <div className="p-4 rounded-2xl bg-[#FBF8EF] border border-[#E2D9C4] shadow-sm space-y-1">
                      <div className="text-[11px] uppercase tracking-wider text-[#53635F] font-semibold">
                        Quadratic Vertex Analysis
                      </div>
                      <div className="text-lg font-bold text-[#07869A]">
                        <MathView content="$$f(x) = ax^2 + bx + c$$" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-2xl bg-[#FBF8EF] border border-[#E2D9C4] shadow-sm">
                        <div className="text-[10px] text-[#53635F] uppercase font-bold">Pythagoras</div>
                        <div className="text-sm font-bold text-[#172321] mt-0.5">
                          <MathView content="$$x^2 + y^2 = r^2$$" />
                        </div>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-[#FBF8EF] border border-[#E2D9C4] shadow-sm">
                        <div className="text-[10px] text-[#53635F] uppercase font-bold">Calculus Limit</div>
                        <div className="text-sm font-bold text-[#172321] mt-0.5">
                          <MathView content="$$\\lim_{h \\to 0} \\frac{df}{dx}$$" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#07869A] text-white flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                        ✓
                      </div>
                      <div>
                        <div className="text-xs font-bold">Instant Step-by-Step Proofs</div>
                        <div className="text-[11px] text-white/80">Verified by symbolic math solver</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold bg-white text-[#07869A] px-2.5 py-1 rounded-lg">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Active Solution Result if solved */}
            {currentSolution && (
              <div className="pt-4">
                <SolutionCard
                  solution={currentSolution}
                  onOpenTutor={() => setIsAiWidgetOpen(true)}
                  onSolveMethod={(m) => handleSolve(questionInput, m)}
                />
              </div>
            )}

            {/* SECONDARY SECTION — MATHEMATICS EXPLORER */}
            <section className="space-y-8 pt-8 border-t border-[#E2D9C4]">
              <div className="space-y-2 text-center max-w-2xl mx-auto">
                <span className="text-xs font-bold tracking-widest text-[#07869A] uppercase">
                  EXPLORE YOUR POTENTIAL
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#172321]">
                  Every Topic. One Clear Path.
                </h2>
                <p className="text-sm sm:text-base text-[#53635F]">
                  Find the right concept, learn the method, and practise until it clicks.
                </p>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center justify-center gap-2 overflow-x-auto py-2">
                {[
                  'All Topics',
                  'Arithmetic',
                  'Algebra',
                  'Geometry',
                  'Trigonometry',
                  'Calculus',
                  'Statistics',
                ].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#07869A] text-white shadow-md shadow-[#07869A]/20'
                        : 'bg-[#FBF8EF] text-[#53635F] hover:text-[#172321] border border-[#E2D9C4]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Topic Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                {filteredTopics.map((topic, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setQuestionInput(`Solve ${topic.title}`);
                      handleSolve(`Solve ${topic.title}`);
                    }}
                    className="group bg-[#FBF8EF] border border-[#E2D9C4] hover:border-[#07869A] rounded-[24px] p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#07869A] bg-[#07869A]/10 px-3 py-1 rounded-full border border-[#07869A]/20">
                          {topic.category}
                        </span>
                        <span className="text-xs font-medium text-[#53635F]">
                          {topic.time}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-[#172321] group-hover:text-[#07869A] transition-colors">
                        {topic.title}
                      </h3>

                      <p className="text-xs text-[#53635F] leading-relaxed">
                        {topic.desc}
                      </p>

                      <div className="p-3 rounded-xl bg-[#F5F0E2] border border-[#E2D9C4] text-center text-sm font-mono text-[#07869A]">
                        <MathView content={topic.formula} />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E2D9C4] flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#172321]">
                        Difficulty: {topic.difficulty}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#07869A] group-hover:translate-x-1 transition-transform">
                        <span>Explore Topic</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'practice' && <PracticeZone />}
        {activeTab === 'formulas' && <FormulaHandbook />}
        {activeTab === 'dashboard' && (
          <HistoryDashboard
            history={history}
            userProfile={userProfile}
            onUpdateProfile={(updated) => {
              setUserProfile((prev) => {
                const next = { ...prev, ...updated };
                try {
                  localStorage.setItem('mathvik_user', JSON.stringify(next));
                } catch {}
                return next;
              });
            }}
            onSelectHistoryItem={selectHistoryItem}
            onDeleteHistoryItem={deleteHistoryItem}
            onClearAllHistory={clearAllHistory}
          />
        )}
      </main>

      {/* FLOATING MATH AI TUTOR WIDGET */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isAiWidgetOpen ? (
          <button
            onClick={() => setIsAiWidgetOpen(true)}
            className="flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-[#07869A] hover:bg-[#066F80] text-white font-bold shadow-2xl shadow-[#07869A]/30 transition-all hover:scale-105 active:scale-95 cursor-pointer border border-white/20"
          >
            <Bot className="w-5 h-5" />
            <span className="text-sm">Math AI Tutor</span>
          </button>
        ) : (
          <div className="w-[360px] sm:w-[400px] h-[520px] bg-[#FBF8EF] border border-[#E2D9C4] rounded-[28px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-5 py-4 bg-[#07869A] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">MathVik AI Tutor</h4>
                  <p className="text-[11px] text-white/80">Always online &amp; ready to help</p>
                </div>
              </div>
              <button
                onClick={() => setIsAiWidgetOpen(false)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#F5F0E2]/40">
              {aiMessages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg bg-[#07869A]/20 flex items-center justify-center text-[#07869A] shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-[#07869A] text-white rounded-tr-none shadow-sm'
                        : 'bg-[#FBF8EF] text-[#172321] border border-[#E2D9C4] rounded-tl-none shadow-sm'
                    }`}
                  >
                    <MathView content={m.content} />

                    {m.role === 'assistant' && m.suggestedFollowUps && m.suggestedFollowUps.length > 0 && (
                      <div className="mt-2.5 pt-2.5 border-t border-[#E2D9C4] flex flex-wrap gap-1">
                        {m.suggestedFollowUps.map((chip, i) => (
                          <button
                            key={i}
                            onClick={() => handleAiWidgetSend(chip)}
                            className="text-[11px] text-[#07869A] bg-[#07869A]/10 hover:bg-[#07869A]/20 px-2.5 py-1 rounded-full font-semibold transition-colors"
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {m.role === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-[#172321] text-white flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {isAiLoading && (
                <div className="flex items-center gap-2 text-xs text-[#53635F] py-2">
                  <Loader2 className="w-4 h-4 text-[#07869A] animate-spin" />
                  <span>Thinking through the mathematical proof...</span>
                </div>
              )}
              <div ref={aiChatEndRef} />
            </div>

            {/* Input Box */}
            <div className="p-3 bg-[#FBF8EF] border-t border-[#E2D9C4]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAiWidgetSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Ask a question or request a hint..."
                  className="flex-1 bg-[#F5F0E2] border border-[#E2D9C4] rounded-full px-4 py-2.5 text-xs text-[#172321] placeholder-[#53635F] outline-none focus:border-[#07869A]"
                />
                <button
                  type="submit"
                  disabled={isAiLoading || !aiInput.trim()}
                  className="p-2.5 rounded-full bg-[#07869A] hover:bg-[#066F80] text-white disabled:opacity-50 transition-all shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-[#E2D9C4] bg-[#FBF8EF] py-8 px-6 text-center text-xs text-[#53635F]">
        <div className="max-w-[1700px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Atom className="w-4 h-4 text-[#07869A]" />
            <span className="font-bold text-[#172321]">Sharukh Sir AI Maths Solver</span>
            <span>— Think Clearly. Solve Smarter.</span>
          </div>
          <div className="flex items-center gap-4 text-[#53635F]">
            <span>Class 6–12 &amp; Competitive Exams</span>
            <span>•</span>
            <span>Algebra • Calculus • Trigonometry • Geometry</span>
          </div>
        </div>
      </footer>

      {/* Image OCR Modal */}
      <ImageOcrModal
        isOpen={isOcrOpen}
        onClose={() => setIsOcrOpen(false)}
        onConfirmQuestion={handleConfirmOcrQuestion}
      />
    </div>
  );
}
