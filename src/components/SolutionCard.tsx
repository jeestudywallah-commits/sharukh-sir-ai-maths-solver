import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  Bookmark,
  Share2,
  MessageSquare,
  TrendingUp,
  Lightbulb,
  ShieldCheck,
  Compass,
  ArrowRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import { MathSolution, MethodType } from '../types.ts';
import { MathView } from './MathView.tsx';
import { GraphVisualizer } from './GraphVisualizer.tsx';

interface SolutionCardProps {
  solution: MathSolution;
  onOpenTutor: () => void;
  onSolveMethod?: (method: MethodType) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export const SolutionCard: React.FC<SolutionCardProps> = ({
  solution,
  onOpenTutor,
  onSolveMethod,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const [copied, setCopied] = useState(false);
  const [showGraph, setShowGraph] = useState(Boolean(solution.graphData?.hasGraph));
  const [selectedMethod, setSelectedMethod] = useState<string>('Standard');

  const handleCopy = () => {
    const text = `Sharukh AI Maths Solver Solution:\nQuestion: ${solution.recognizedQuestion}\nFinal Answer: ${solution.finalAnswer}\nTopic: ${solution.topic}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
      {/* Header & Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
            {solution.subject}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
            {solution.topic}
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
              solution.difficulty === 'Basic'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : solution.difficulty === 'Intermediate'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
            }`}
          >
            {solution.difficulty} Level
          </span>
          {solution.isVerified && (
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Verified Solution
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {onToggleFavorite && (
            <button
              type="button"
              onClick={onToggleFavorite}
              className={`p-2 rounded-xl border transition-all ${
                isFavorite
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-white'
              }`}
              title={isFavorite ? 'Saved in Starred' : 'Save to Starred Solutions'}
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-400 hover:text-white transition-all"
            title="Copy Solution"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onOpenTutor}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all active:scale-95"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Ask Sharukh AI Tutor</span>
          </button>
        </div>
      </div>

      {/* 1. Recognized Problem Statement */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
        <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-indigo-400" />
          <span>Recognised Problem</span>
        </div>
        <div className="text-base sm:text-lg font-medium text-white leading-relaxed">
          <MathView content={solution.recognizedQuestion} />
        </div>
      </div>

      {/* 2. Given Information Pills */}
      {solution.givenInfo && solution.givenInfo.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Given Information &amp; Constraints
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {solution.givenInfo.map((info, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/50 border border-slate-700/40 text-xs text-slate-300"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                <MathView content={info} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Methods Switcher Bar */}
      {solution.methods && solution.methods.length > 1 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-violet-400" />
              Solving Methods Available
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {solution.methods.map((m, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSelectedMethod(m.name);
                  if (onSolveMethod) {
                    const methodKey = m.name.toLowerCase().includes('quick')
                      ? 'quick'
                      : m.name.toLowerCase().includes('graph')
                      ? 'graphical'
                      : m.name.toLowerCase().includes('formula')
                      ? 'formula'
                      : 'standard';
                    onSolveMethod(methodKey);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  selectedMethod === m.name
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/25 border border-transparent'
                    : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600'
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Core Concept & Formula Box */}
      {solution.conceptFormula && (
        <div className="p-4 sm:p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Lightbulb className="w-4 h-4" />
            <span>Mathematical Concept &amp; Key Formula</span>
          </div>
          <div className="text-sm text-indigo-100 leading-relaxed font-normal">
            <MathView content={solution.conceptFormula} />
          </div>
        </div>
      )}

      {/* 4 & 5. Step-by-Step Solution Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            Step-by-Step Derivation
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {solution.steps?.length || 0} logical steps
          </span>
        </div>

        <div className="space-y-3.5">
          {solution.steps?.map((step) => (
            <div
              key={step.stepNumber}
              className="group relative rounded-2xl p-4 sm:p-5 bg-slate-950/60 hover:bg-slate-950/90 border border-slate-800 hover:border-indigo-500/40 transition-all space-y-3"
            >
              {/* Step Title Header */}
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {step.stepNumber}
                </span>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-slate-100">{step.title}</h4>
                </div>
              </div>

              {/* Calculation Box */}
              {step.calculation && (
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/80 overflow-x-auto text-indigo-200 text-sm sm:text-base font-mono">
                  <MathView content={step.calculation} block />
                </div>
              )}

              {/* Explanation (Why this step is valid) */}
              {step.explanation && (
                <div className="flex items-start gap-2 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-1" />
                  <p>
                    <strong className="text-slate-100">Why this works: </strong>
                    <MathView content={step.explanation} />
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 6. Final Answer Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-violet-950/40 to-slate-950 border-2 border-indigo-500/50 shadow-lg shadow-indigo-600/10 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-xs uppercase tracking-wider font-bold text-indigo-300">
              Final Answer
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="text-xs text-indigo-300 hover:text-white flex items-center gap-1"
          >
            {copied ? 'Copied!' : 'Copy Result'}
          </button>
        </div>
        <div className="text-xl sm:text-2xl font-bold text-white pt-1">
          <MathView content={solution.finalAnswer} block />
        </div>
      </div>

      {/* 7. Verification Proof */}
      {solution.verification && (
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Mathematical Verification &amp; Self-Check</span>
          </div>
          <div className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
            <MathView content={solution.verification} />
          </div>
        </div>
      )}

      {/* 8. Learning Tip & Shortcut */}
      {solution.learningTip && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/20 border border-amber-500/20 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Sharukh&apos;s Pro Tip &amp; Common Pitfalls</span>
          </div>
          <div className="text-xs sm:text-sm text-amber-200/90 leading-relaxed">
            <MathView content={solution.learningTip} />
          </div>
        </div>
      )}

      {/* Interactive Visual Graph Section */}
      {solution.graphData?.hasGraph && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Visual Curve &amp; Graphing
            </span>
            <button
              type="button"
              onClick={() => setShowGraph(!showGraph)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              {showGraph ? 'Hide Graph' : 'Show Interactive Graph'}
            </button>
          </div>
          {showGraph && <GraphVisualizer graphData={solution.graphData} />}
        </div>
      )}

      {/* Follow-up CTA */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <span>Need more help understanding this derivation?</span>
        <button
          type="button"
          onClick={onOpenTutor}
          className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-semibold"
        >
          <span>Chat with Sharukh AI Tutor</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
