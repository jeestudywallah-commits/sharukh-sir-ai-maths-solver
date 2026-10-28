import React from 'react';
import { Globe, User, Atom, ChevronDown, BookOpen, Calculator, Brain, History, Compass } from 'lucide-react';
import { UserProfile } from '../types.ts';

interface NavbarProps {
  activeTab: 'solver' | 'practice' | 'formulas' | 'dashboard';
  setActiveTab: (tab: 'solver' | 'practice' | 'formulas' | 'dashboard') => void;
  userProfile: UserProfile;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, userProfile }) => {
  return (
    <header className="sticky top-0 z-50 w-full h-[88px] bg-[#FBF8EF] border-b border-[#E2D9C4] px-4 sm:px-12 flex items-center justify-between shadow-xs">
      {/* Left: Brand Logo & Tagline */}
      <div
        onClick={() => setActiveTab('solver')}
        className="flex items-center gap-3 cursor-pointer select-none group"
      >
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#07869A] to-[#066F80] flex items-center justify-center text-white shadow-md shadow-[#07869A]/20 group-hover:scale-105 transition-transform">
          <Atom className="w-6 h-6 animate-[spin_15s_linear_infinite]" />
        </div>
        <div>
          <div className="flex items-center text-lg sm:text-xl font-extrabold tracking-tight">
            <span className="text-[#07869A]">Sharukh Sir</span>
            <span className="text-[#E83B35] ml-1.5">AI Maths</span>
          </div>
          <p className="text-[11px] font-medium text-[#53635F] tracking-wide">
            Official Platform • Understand Maths. Solve Smarter.
          </p>
        </div>
      </div>

      {/* Center Navigation */}
      <nav className="hidden lg:flex items-center gap-8">
        {[
          { id: 'solver', label: 'Home', icon: Calculator },
          { id: 'learn', label: 'Learn', icon: Compass },
          { id: 'practice', label: 'Practice', icon: Brain },
          { id: 'formulas', label: 'Math Tools', icon: BookOpen },
          { id: 'dashboard', label: 'My Progress', icon: History },
        ].map((item) => {
          const isActive =
            (activeTab === 'solver' && item.id === 'solver') ||
            (activeTab === 'practice' && item.id === 'practice') ||
            (activeTab === 'formulas' && (item.id === 'formulas' || item.id === 'learn')) ||
            (activeTab === 'dashboard' && item.id === 'dashboard');

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'learn') setActiveTab('formulas');
                else setActiveTab(item.id as any);
              }}
              className={`relative py-7 text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                isActive ? 'text-[#07869A]' : 'text-[#53635F] hover:text-[#172321]'
              }`}
            >
              <span>{item.label}</span>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#07869A] rounded-t-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#53635F] cursor-pointer hover:text-[#172321] px-3 py-2 rounded-full border border-[#E2D9C4] bg-[#F5F0E2]/50">
          <Globe className="w-4 h-4 text-[#07869A]" />
          <span>EN</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </div>

        <button
          onClick={() => setActiveTab('dashboard')}
          className="hidden md:flex items-center gap-2 text-xs font-semibold text-[#172321] px-4 py-2.5 rounded-full hover:bg-[#E2D9C4]/40 transition-colors"
        >
          <User className="w-4 h-4 text-[#07869A]" />
          <span>{userProfile.name}</span>
        </button>

        <button
          onClick={() => setActiveTab('solver')}
          className="px-6 py-3 rounded-full bg-[#07869A] hover:bg-[#066F80] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#07869A]/20 transition-all active:scale-95 cursor-pointer"
        >
          Start Learning
        </button>
      </div>
    </header>
  );
};
