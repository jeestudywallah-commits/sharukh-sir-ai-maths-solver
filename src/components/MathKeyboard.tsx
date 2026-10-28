import React, { useState } from 'react';
import { Keyboard, X, Sparkles } from 'lucide-react';

interface MathKeyboardProps {
  onInsert: (symbol: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const MathKeyboard: React.FC<MathKeyboardProps> = ({ onInsert, isOpen, onToggle }) => {
  const [activeTab, setActiveTab] = useState<'algebra' | 'calculus' | 'trig' | 'symbols' | 'matrices'>('algebra');

  const symbols = {
    algebra: [
      { label: 'x²', insert: '^2' },
      { label: 'xⁿ', insert: '^{' },
      { label: '√x', insert: '\\sqrt{' },
      { label: 'a/b', insert: '\\frac{a}{b}' },
      { label: '±', insert: '\\pm ' },
      { label: '(', insert: '(' },
      { label: ')', insert: ')' },
      { label: '≠', insert: '\\neq ' },
      { label: '≤', insert: '\\le ' },
      { label: '≥', insert: '\\ge ' },
      { label: 'x', insert: 'x' },
      { label: 'y', insert: 'y' },
      { label: '|x|', insert: '|x|' },
      { label: 'f(x)', insert: 'f(x)' },
      { label: '=', insert: ' = ' },
    ],
    calculus: [
      { label: 'd/dx', insert: '\\frac{d}{dx}' },
      { label: '∫', insert: '\\int ' },
      { label: '∫ₐᵇ', insert: '\\int_{a}^{b} ' },
      { label: 'lim', insert: '\\lim_{x \\to 0} ' },
      { label: '∑', insert: '\\sum_{i=1}^{n} ' },
      { label: '∏', insert: '\\prod ' },
      { label: '∂/∂x', insert: '\\frac{\\partial}{\\partial x}' },
      { label: "f'(x)", insert: "f'(x)" },
      { label: 'dx', insert: 'dx' },
      { label: 'dt', insert: 'dt' },
      { label: '∞', insert: '\\infty' },
      { label: 'Δx', insert: '\\Delta x' },
    ],
    trig: [
      { label: 'sin', insert: '\\sin(' },
      { label: 'cos', insert: '\\cos(' },
      { label: 'tan', insert: '\\tan(' },
      { label: 'sin⁻¹', insert: '\\arcsin(' },
      { label: 'cos⁻¹', insert: '\\arccos(' },
      { label: 'tan⁻¹', insert: '\\arctan(' },
      { label: 'θ', insert: '\\theta' },
      { label: 'π', insert: '\\pi' },
      { label: '°', insert: '^\\circ' },
      { label: 'sec', insert: '\\sec(' },
      { label: 'csc', insert: '\\csc(' },
      { label: 'cot', insert: '\\cot(' },
    ],
    symbols: [
      { label: 'α', insert: '\\alpha' },
      { label: 'β', insert: '\\beta' },
      { label: 'γ', insert: '\\gamma' },
      { label: 'λ', insert: '\\lambda' },
      { label: 'μ', insert: '\\mu' },
      { label: 'σ', insert: '\\sigma' },
      { label: '∈', insert: '\\in ' },
      { label: '∉', insert: '\\notin ' },
      { label: '⊂', insert: '\\subset ' },
      { label: '∪', insert: '\\cup ' },
      { label: '∩', insert: '\\cap ' },
      { label: '≈', insert: '\\approx ' },
      { label: '∝', insert: '\\propto ' },
      { label: '∠', insert: '\\angle ' },
      { label: '⊥', insert: '\\perp ' },
    ],
    matrices: [
      { label: '2×2 Matrix', insert: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
      { label: '3×3 Matrix', insert: '\\begin{pmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{pmatrix}' },
      { label: '2×1 Vector', insert: '\\begin{pmatrix} x \\\\ y \\end{pmatrix}' },
      { label: '|A| Det', insert: '\\det(A)' },
      { label: 'A⁻¹', insert: 'A^{-1}' },
      { label: 'Aᵀ', insert: 'A^T' },
      { label: 'î, ĵ, k̂', insert: '\\hat{i} + \\hat{j} + \\hat{k}' },
      { label: 'A · B', insert: '\\vec{A} \\cdot \\vec{B}' },
      { label: 'A × B', insert: '\\vec{A} \\times \\vec{B}' },
    ],
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700/60 transition-colors shadow-sm"
        title="Open Virtual Math Keyboard"
      >
        <Keyboard className="w-3.5 h-3.5 text-indigo-400" />
        <span>Math Symbols</span>
      </button>
    );
  }

  return (
    <div className="w-full bg-slate-900/95 border border-indigo-500/30 rounded-xl p-3 shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-1 overflow-x-auto text-xs py-0.5">
          {(['algebra', 'calculus', 'trig', 'symbols', 'matrices'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-2.5 py-1 rounded-md font-medium capitalize transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Close keyboard"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-1.5 max-h-36 overflow-y-auto pr-1">
        {symbols[activeTab].map((btn, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onInsert(btn.insert)}
            className="flex items-center justify-center p-2 rounded-lg bg-slate-800/90 hover:bg-indigo-600/30 border border-slate-700/60 hover:border-indigo-400/50 text-slate-200 hover:text-white text-xs sm:text-sm font-mono font-medium transition-all active:scale-95 shadow-sm"
          >
            {btn.label}
          </button>
        ))}
      </div>

      <div className="mt-2 pt-2 border-t border-slate-800/70 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1 text-indigo-300">
          <Sparkles className="w-3 h-3" />
          Click any symbol to insert into equation
        </span>
        <span className="hidden sm:inline text-slate-500">Sharukh AI Math Input Engine</span>
      </div>
    </div>
  );
};
