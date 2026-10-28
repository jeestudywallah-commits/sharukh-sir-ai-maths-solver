import React, { useState, useEffect, useRef } from 'react';
import {
  Brain,
  Timer,
  Award,
  HelpCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Flame,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PracticeQuestion, SubjectType, DifficultyLevel } from '../types.ts';
import { MathView } from './MathView.tsx';

const TOPICS_BY_SUBJECT: Record<string, string[]> = {
  Algebra: ['Linear Equations', 'Quadratic Equations', 'Polynomials', 'Sequences & Series', 'Logarithms'],
  Calculus: ['Derivatives & Power Rule', 'Chain Rule & Product Rule', 'Definite Integrals', 'Limits & Continuity'],
  Trigonometry: ['Trigonometric Identities', 'Standard Angles & Ratios', 'Inverse Trigonometry', 'Heights & Distances'],
  Geometry: ['Circles & Tangents', 'Triangles & Similarity', 'Surface Areas & Volumes', 'Coordinate Distance & Midpoint'],
  'Matrices & Vectors': ['Matrix Multiplication', 'Determinants & Inverses', 'Vector Dot & Cross Product'],
  'Probability & Statistics': ['Probability & Bayes Theorem', 'Mean, Median & Standard Deviation', 'Permutations & Combinations'],
};

export const PracticeZone: React.FC<{ onSendToSolver?: (q: string) => void }> = ({ onSendToSolver }) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('Algebra');
  const [selectedTopic, setSelectedTopic] = useState<string>('Linear Equations');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('Intermediate');

  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Gamification & stats
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  // Timer
  const [isTimed, setIsTimed] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isTimed && !isSubmitted) {
      timerRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isTimed, isSubmitted]);

  // Load questions for topic
  const loadQuestions = async (topic: string, diff: DifficultyLevel) => {
    setIsLoading(true);
    setSelectedOption(null);
    setIsSubmitted(false);
    setShowHint(false);
    setSeconds(0);

    try {
      const res = await fetch('/api/practice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, difficulty: diff, count: 4 }),
      });
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setCurrentIndex(0);
      }
    } catch {
      // Fallback question
      setQuestions([
        {
          id: 'pq-fallback',
          topic,
          difficulty: diff,
          question: 'Solve for x: $4x + 12 = 36$',
          options: ['$x = 5$', '$x = 6$', '$x = 8$', '$x = 4$'],
          correctIndex: 1,
          hint: 'Subtract 12 from 36 first, then divide by 4.',
          fullExplanation: '1. Subtract 12: $4x = 36 - 12 = 24$.\n2. Divide by 4: $x = \\frac{24}{4} = 6$.',
        },
      ]);
      setCurrentIndex(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions(selectedTopic, selectedDifficulty);
  }, [selectedTopic, selectedDifficulty]);

  const currentQ = questions[currentIndex];

  const handleSubmit = () => {
    if (selectedOption === null || isSubmitted || !currentQ) return;
    setIsSubmitted(true);

    if (selectedOption === currentQ.correctIndex) {
      setScore((s) => s + 10);
      setStreak((st) => st + 1);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {
        // Safe if canvas-confetti is not loaded
      }
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
      setShowHint(false);
      setSeconds(0);
    } else {
      // Generate more
      loadQuestions(selectedTopic, selectedDifficulty);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Top Banner & Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Maths Practice &amp; Mastery Zone</h2>
              <p className="text-xs text-slate-400">
                Interactive topic-wise revision, hints &amp; step-by-step checks
              </p>
            </div>
          </div>

          {/* Gamification Stats */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-amber-300">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Score: {score}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-rose-300">
              <Flame className="w-4 h-4 text-rose-400" />
              <span>Streak: {streak}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsTimed(!isTimed)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                isTimed
                  ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                  : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:text-white'
              }`}
            >
              <Timer className="w-4 h-4" />
              <span>{isTimed ? `${seconds}s` : 'Timed Mode'}</span>
            </button>
          </div>
        </div>

        {/* Subject & Difficulty Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
          <div>
            <label className="text-[11px] font-semibold uppercase text-slate-400 mb-1.5 block">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => {
                const sub = e.target.value;
                setSelectedSubject(sub);
                setSelectedTopic(TOPICS_BY_SUBJECT[sub]?.[0] || 'Linear Equations');
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
            >
              {Object.keys(TOPICS_BY_SUBJECT).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase text-slate-400 mb-1.5 block">
              Topic
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
            >
              {(TOPICS_BY_SUBJECT[selectedSubject] || []).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase text-slate-400 mb-1.5 block">
              Difficulty
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-700">
              {(['Basic', 'Intermediate', 'Advanced'] as DifficultyLevel[]).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`py-1 text-center rounded-lg text-xs font-medium transition-all ${
                    selectedDifficulty === diff
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Question Card */}
      {isLoading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 flex flex-col items-center justify-center space-y-3 text-center">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-sm font-medium text-slate-200">
            Generating custom practice questions for {selectedTopic}...
          </p>
          <span className="text-xs text-slate-500">Checking mathematical correctness</span>
        </div>
      ) : currentQ ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Question Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <span className="text-xs font-mono font-medium text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Topic: <strong className="text-slate-200">{currentQ.topic}</strong>
            </span>
          </div>

          {/* Question Text */}
          <div className="text-lg sm:text-xl font-medium text-white leading-relaxed">
            <MathView content={currentQ.question} />
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = isSubmitted && idx === currentQ.correctIndex;
              const isWrong = isSubmitted && isSelected && idx !== currentQ.correctIndex;

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isSubmitted}
                  onClick={() => setSelectedOption(idx)}
                  className={`flex items-center justify-between p-4 rounded-2xl border text-left text-sm transition-all ${
                    isCorrect
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-500/10'
                      : isWrong
                      ? 'bg-rose-950/40 border-rose-500 text-rose-200 shadow-md shadow-rose-500/10'
                      : isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-200 hover:bg-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-400'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="font-medium text-sm sm:text-base">
                      <MathView content={opt} />
                    </span>
                  </div>

                  {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                  {isWrong && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Hint Section */}
          {showHint && currentQ.hint && (
            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in">
              <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300">Teacher&apos;s Hint: </strong>
                <MathView content={currentQ.hint} />
              </div>
            </div>
          )}

          {/* Step-by-Step Explanation After Submission */}
          {isSubmitted && (
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Full Step-by-Step Explanation</span>
              </div>
              <div className="text-sm text-slate-200 leading-relaxed">
                <MathView content={currentQ.fullExplanation} />
              </div>

              {onSendToSolver && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onSendToSolver(currentQ.question)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                  >
                    <span>Open in Full Step-by-Step Solver with Graph</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Action Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="text-xs text-slate-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>{showHint ? 'Hide Hint' : 'Need a Hint?'}</span>
            </button>

            <div className="flex items-center gap-3">
              {!isSubmitted ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={selectedOption === null}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Check Answer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all"
                >
                  <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'More Practice'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
