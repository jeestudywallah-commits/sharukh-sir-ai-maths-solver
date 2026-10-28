import React, { useState } from 'react';
import {
  User,
  History,
  Bookmark,
  Trash2,
  ExternalLink,
  PieChart,
  Award,
  Settings,
  Shield,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { HistoryItem, UserProfile } from '../types.ts';
import { MathView } from './MathView.tsx';

interface HistoryDashboardProps {
  history: HistoryItem[];
  userProfile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onSelectHistoryItem: (item: HistoryItem) => void;
  onDeleteHistoryItem: (id: string) => void;
  onClearAllHistory: () => void;
}

export const HistoryDashboard: React.FC<HistoryDashboardProps> = ({
  history,
  userProfile,
  onUpdateProfile,
  onSelectHistoryItem,
  onDeleteHistoryItem,
  onClearAllHistory,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempName, setTempName] = useState(userProfile.name);
  const [tempGrade, setTempGrade] = useState(userProfile.grade);

  const starredItems = history.filter((h) => h.isFavorite);
  const displayItems = activeTab === 'favorites' ? starredItems : history;

  // Calculate subject counts
  const subjectBreakdown = history.reduce((acc: Record<string, number>, item) => {
    const sub = item.subject || 'General';
    acc[sub] = (acc[sub] || 0) + 1;
    return acc;
  }, {});

  const handleSaveProfile = () => {
    onUpdateProfile({
      name: tempName.trim() || 'Student',
      grade: tempGrade,
      isGuest: false,
    });
    setIsEditingProfile(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Profile Header & Stats */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 text-xl font-bold">
              {userProfile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{userProfile.name}</h2>
                <span className="text-[11px] font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">
                  {userProfile.grade}
                </span>
                {userProfile.isGuest && (
                  <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    Guest Mode
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Personalized Learning Space • Sharukh AI Maths Solver
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Profile Edit Form */}
        {isEditingProfile && (
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-700/80 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in">
            <div>
              <label className="text-[11px] uppercase font-semibold text-slate-400 mb-1 block">
                Display Name
              </label>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-[11px] uppercase font-semibold text-slate-400 mb-1 block">
                Class / Target
              </label>
              <select
                value={tempGrade}
                onChange={(e) => setTempGrade(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 outline-none focus:border-indigo-500"
              >
                <option value="Class 6–8 (Middle School)">Class 6–8 (Middle School)</option>
                <option value="Class 9–10 (Secondary)">Class 9–10 (Secondary)</option>
                <option value="Class 11–12 (Higher Secondary)">Class 11–12 (Higher Secondary)</option>
                <option value="JEE / Competitive Exam Aspirant">JEE / Competitive Exam Aspirant</option>
                <option value="College / University Math">College / University Math</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleSaveProfile}
                className="w-full py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <History className="w-3.5 h-3.5 text-indigo-400" /> Total Solved
            </span>
            <div className="text-xl font-bold text-white">{history.length}</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <Bookmark className="w-3.5 h-3.5 text-amber-400" /> Starred
            </span>
            <div className="text-xl font-bold text-amber-300">{starredItems.length}</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <Award className="w-3.5 h-3.5 text-emerald-400" /> Practice Score
            </span>
            <div className="text-xl font-bold text-emerald-300">{userProfile.streakCount * 10} pts</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <Shield className="w-3.5 h-3.5 text-cyan-400" /> Privacy
            </span>
            <div className="text-xs font-semibold text-slate-300">Client Encrypted</div>
          </div>
        </div>

        {/* Subject Breakdown Visualizer */}
        {Object.keys(subjectBreakdown).length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5 text-indigo-400" /> Subject Activity
            </span>
            <div className="flex flex-wrap gap-2">
              {Object.entries(subjectBreakdown).map(([sub, count]) => (
                <div
                  key={sub}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-200"
                >
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span>{sub}</span>
                  <span className="text-xs font-mono font-bold text-indigo-400">({count})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* History List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Questions ({history.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('favorites')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'favorites'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Starred Solutions ({starredItems.length})
            </button>
          </div>

          {history.length > 0 && (
            <button
              type="button"
              onClick={onClearAllHistory}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {displayItems.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <History className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-medium">No solved questions here yet.</p>
            <p className="text-xs text-slate-500">
              Solve a maths question using the homepage solver to automatically save it.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {displayItems.map((item) => (
              <div
                key={item.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-slate-800/30 px-3 rounded-2xl transition-colors"
              >
                <div
                  onClick={() => onSelectHistoryItem(item)}
                  className="flex-1 cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-md border border-indigo-500/20">
                      {item.subject}
                    </span>
                    <span className="text-xs text-slate-400">{item.topic}</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="text-sm font-medium text-slate-100 group-hover:text-indigo-200 transition-colors">
                    <MathView content={item.recognizedQuestion || item.question} />
                  </div>

                  <div className="text-xs text-emerald-400">
                    Ans: <MathView content={item.finalAnswer} />
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => onSelectHistoryItem(item)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Solution</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteHistoryItem(item.id)}
                    className="p-2 rounded-xl hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
