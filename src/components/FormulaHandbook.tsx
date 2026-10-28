import React, { useState } from 'react';
import { BookOpen, Search, Copy, Check, Sparkles, ArrowUpRight } from 'lucide-react';
import { MathView } from './MathView.tsx';

interface FormulaItem {
  id: string;
  name: string;
  subject: string;
  latex: string;
  description: string;
  exampleProblem: string;
}

const FORMULA_DATABASE: FormulaItem[] = [
  // Algebra
  {
    id: 'f-1',
    name: 'Quadratic Formula',
    subject: 'Algebra',
    latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
    description: 'Finds the roots of any quadratic equation $ax^2 + bx + c = 0$. Discriminant $D = b^2 - 4ac$.',
    exampleProblem: 'Solve 2x^2 - 4x - 6 = 0',
  },
  {
    id: 'f-2',
    name: "Vieta's Formulas (Quadratic)",
    subject: 'Algebra',
    latex: '\\alpha + \\beta = -\\frac{b}{a}, \\quad \\alpha\\beta = \\frac{c}{a}',
    description: 'Relates roots $\\alpha, \\beta$ of $ax^2 + bx + c = 0$ directly to polynomial coefficients.',
    exampleProblem: 'Find the sum and product of roots for 3x^2 + 9x - 12 = 0',
  },
  {
    id: 'f-3',
    name: 'Sum of Arithmetic Progression (AP)',
    subject: 'Algebra',
    latex: 'S_n = \\frac{n}{2}[2a + (n-1)d] = \\frac{n}{2}(a + l)',
    description: 'Calculates the sum of first $n$ terms in an arithmetic sequence with common difference $d$.',
    exampleProblem: 'Find the sum of first 20 terms of AP: 3, 7, 11, 15...',
  },
  {
    id: 'f-4',
    name: 'Logarithm Product and Power Rules',
    subject: 'Algebra',
    latex: '\\log_b(xy) = \\log_b(x) + \\log_b(y), \\quad \\log_b(x^k) = k\\log_b(x)',
    description: 'Fundamental algebraic transformations for simplifying logarithmic equations.',
    exampleProblem: 'Simplify log(100) + log(25)',
  },

  // Calculus
  {
    id: 'f-5',
    name: 'Power Rule for Differentiation',
    subject: 'Calculus',
    latex: '\\frac{d}{dx}[x^n] = n x^{n-1}',
    description: 'Differentiates any polynomial or power term with respect to $x$ for all real $n$.',
    exampleProblem: 'Find derivative of x^5 - 3x^2 + 4',
  },
  {
    id: 'f-6',
    name: 'Product Rule & Quotient Rule',
    subject: 'Calculus',
    latex: '(uv)\' = u\'v + uv\', \\quad \\left(\\frac{u}{v}\\right)\' = \\frac{u\'v - uv\'}{v^2}',
    description: 'Used for taking derivatives of products and quotients of two differentiable functions.',
    exampleProblem: 'Differentiate x^2 * sin(x)',
  },
  {
    id: 'f-7',
    name: 'Chain Rule',
    subject: 'Calculus',
    latex: '\\frac{d}{dx}[f(g(x))] = f\'(g(x)) \\cdot g\'(x)',
    description: 'Differentiates composite functions by taking outer derivative multiplied by inner derivative.',
    exampleProblem: 'Find derivative of sin(3x^2 + 1)',
  },
  {
    id: 'f-8',
    name: 'Integration by Parts',
    subject: 'Calculus',
    latex: '\\int u \\, dv = u v - \\int v \\, du',
    description: 'Fundamental technique for integrating the product of two functions (LIATE rule).',
    exampleProblem: 'Integrate x * e^x dx',
  },

  // Trigonometry
  {
    id: 'f-9',
    name: 'Pythagorean Trigonometric Identities',
    subject: 'Trigonometry',
    latex: '\\sin^2\\theta + \\cos^2\\theta = 1, \\quad 1 + \\tan^2\\theta = \\sec^2\\theta',
    description: 'Connects basic trigonometric functions derived from right triangle theorem.',
    exampleProblem: 'Prove sin^2(x) + cos^2(x) = 1',
  },
  {
    id: 'f-10',
    name: 'Double Angle Formulas',
    subject: 'Trigonometry',
    latex: '\\sin(2\\theta) = 2\\sin\\theta\\cos\\theta, \\quad \\cos(2\\theta) = \\cos^2\\theta - \\sin^2\\theta',
    description: 'Expands functions of double angles into products of single angle trigonometric ratios.',
    exampleProblem: 'Calculate sin(60) using sin(30) and cos(30)',
  },

  // Coordinate Geometry
  {
    id: 'f-11',
    name: 'Distance Formula in 2D Plane',
    subject: 'Coordinate Geometry',
    latex: 'd = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}',
    description: 'Finds Euclidean distance between two points $P(x_1, y_1)$ and $Q(x_2, y_2)$.',
    exampleProblem: 'Find distance between points (2, 3) and (7, 15)',
  },
  {
    id: 'f-12',
    name: 'Section Formula (Internal Division)',
    subject: 'Coordinate Geometry',
    latex: 'P(x, y) = \\left(\\frac{m x_2 + n x_1}{m + n}, \\frac{m y_2 + n y_1}{m + n}\\right)',
    description: 'Coordinates of point $P$ dividing segment $AB$ in ratio $m:n$.',
    exampleProblem: 'Find point dividing (1, 2) and (4, 8) in ratio 2:1',
  },

  // Matrices & Vectors
  {
    id: 'f-13',
    name: 'Determinant of 2×2 Matrix',
    subject: 'Matrices',
    latex: '\\det\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} = ad - bc',
    description: 'Scaling factor of linear transformation. If $\\det(A) \\neq 0$, the matrix is invertible.',
    exampleProblem: 'Calculate determinant of matrix [[3, 5], [1, 4]]',
  },
  {
    id: 'f-14',
    name: 'Vector Dot Product & Angle',
    subject: 'Vectors',
    latex: '\\vec{A} \\cdot \\vec{B} = |A||B|\\cos\\theta = A_x B_x + A_y B_y + A_z B_z',
    description: 'Measures projection of one vector onto another. Zero when vectors are orthogonal.',
    exampleProblem: 'Find dot product of (2i + 3j) and (4i - j)',
  },

  // Probability
  {
    id: 'f-15',
    name: "Bayes' Theorem",
    subject: 'Probability',
    latex: 'P(A|B) = \\frac{P(B|A) \\cdot P(A)}{P(B)}',
    description: 'Calculates posterior probability of event $A$ given prior knowledge of conditions related to event $B$.',
    exampleProblem: 'Find conditional probability P(A|B) given P(B|A)=0.8, P(A)=0.3, P(B)=0.4',
  },
];

export const FormulaHandbook: React.FC<{ onSelectFormula?: (example: string) => void }> = ({
  onSelectFormula,
}) => {
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const subjects = ['All', 'Algebra', 'Calculus', 'Trigonometry', 'Coordinate Geometry', 'Matrices', 'Vectors', 'Probability'];

  const filtered = FORMULA_DATABASE.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.description.toLowerCase().includes(search.toLowerCase()) ||
      f.subject.toLowerCase().includes(search.toLowerCase());
    const matchesSub = selectedSubject === 'All' || f.subject === selectedSubject;
    return matchesSearch && matchesSub;
  });

  const handleCopy = (id: string, latex: string) => {
    navigator.clipboard.writeText(latex);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Mathematics Formula Handbook</h2>
              <p className="text-xs text-slate-400">
                Essential theorems, definitions &amp; identities for Class 6–12 &amp; competitive exams
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            {filtered.length} Formulas Available
          </span>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by theorem, formula, topic (e.g. 'Quadratic', 'Chain rule', 'Distance')..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {subjects.map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => setSelectedSubject(sub)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  selectedSubject === sub
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Formula Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="group rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 p-5 shadow-xl transition-all space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <span className="text-xs font-semibold text-white">{item.name}</span>
                <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                  {item.subject}
                </span>
              </div>

              {/* Latex Formula Display */}
              <div className="py-3 px-4 my-2 rounded-xl bg-slate-950 border border-slate-800/80 text-center overflow-x-auto text-indigo-200">
                <MathView content={`$$${item.latex}$$`} block />
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed">
                <MathView content={item.description} />
              </p>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleCopy(item.id, item.latex)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-colors"
              >
                {copiedId === item.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy LaTeX</span>
                  </>
                )}
              </button>

              {onSelectFormula && (
                <button
                  type="button"
                  onClick={() => onSelectFormula(item.exampleProblem)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <span>Solve Example Problem</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
