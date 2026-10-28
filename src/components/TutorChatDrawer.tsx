import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, X, ChevronRight, HelpCircle, Lightbulb } from 'lucide-react';
import { MathSolution, ChatMessage } from '../types.ts';
import { MathView } from './MathView.tsx';

interface TutorChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  solution: MathSolution;
}

export const TutorChatDrawer: React.FC<TutorChatDrawerProps> = ({
  isOpen,
  onClose,
  solution,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am **Sharukh AI**, your personal maths tutor. I've walked through this solution for you. Do you have any questions about a specific step, want a simpler explanation, or would you like to try a similar practice question?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedFollowUps: [
        'Why did you perform step 1?',
        'Explain this more simply',
        'Give me a similar practice problem',
        'Give me a hint for another method',
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: solution.recognizedQuestion,
          solution,
          chatHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          message: query,
        }),
      });

      if (!response.ok) throw new Error('Tutor response failed');

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: 'reply-' + Date.now(),
        role: 'assistant',
        content: data.reply || 'Let me break this down further for you.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowUps: data.suggestedFollowUps || [
          'Explain another step',
          'Practice a similar problem',
        ],
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const errorReply: ChatMessage = {
        id: 'reply-err-' + Date.now(),
        role: 'assistant',
        content:
          'In this equation, we want to balance both sides using inverse operations. Which specific step would you like to review together?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowUps: ['Explain step 1', 'Show another method'],
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl h-full bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">Sharukh AI Interactive Tutor</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-xs text-indigo-300">Ask follow-up questions &amp; deepen understanding</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pinned problem context banner */}
        <div className="px-5 py-2.5 bg-indigo-950/40 border-b border-indigo-900/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 overflow-hidden">
            <Lightbulb className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="text-slate-400 truncate">
              Discussing: <strong className="text-indigo-200"><MathView content={solution.recognizedQuestion} /></strong>
            </span>
          </div>
          <span className="shrink-0 text-slate-400 font-mono text-[11px] bg-indigo-900/50 px-2 py-0.5 rounded">
            {solution.topic}
          </span>
        </div>

        {/* Chat message history */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-indigo-300" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-tr-none shadow-md'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700/70 rounded-tl-none shadow-md'
                }`}
              >
                <div className="space-y-2">
                  <MathView content={msg.content} />
                </div>

                <div
                  className={`mt-2 text-[10px] ${
                    msg.role === 'user' ? 'text-indigo-200 text-right' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>

                {/* Suggested follow-up chips from bot */}
                {msg.role === 'assistant' && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-700/60 flex flex-wrap gap-1.5">
                    {msg.suggestedFollowUps.map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(chip)}
                        className="text-xs text-indigo-300 hover:text-white bg-indigo-950/60 hover:bg-indigo-600/40 border border-indigo-800/60 rounded-full px-3 py-1 transition-all active:scale-95 flex items-center gap-1"
                      >
                        <ChevronRight className="w-3 h-3 text-indigo-400" />
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-slate-300" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 items-center text-slate-400 text-xs py-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                <Bot className="w-4 h-4 text-indigo-400 animate-bounce" />
              </div>
              <div className="bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                <span>Sharukh AI is formulating a pedagogical explanation...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything (e.g. 'Why did you subtract 5 from both sides?')..."
              className="flex-1 bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>Ask for shortcuts, alternate proofs, or hints</span>
            <span className="flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-indigo-400" /> Pedagogical AI
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
