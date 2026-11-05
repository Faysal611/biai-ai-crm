'use client';

import React from 'react';
import { Sparkles, FileText, RotateCcw, Database, Bot } from 'lucide-react';

interface NavbarProps {
  onOpenPaste: () => void;
  onOpenSummary: () => void;
  onResetData: () => void;
  loading: boolean;
  health: { status?: string; database_type?: string; active_ai_provider?: string } | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenPaste,
  onOpenSummary,
  onResetData,
  loading,
  health,
}) => {
  const isOnline = health?.status === 'online';

  return (
    <header className="border-b border-slate-200/90 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-2xs">
      <div className="max-w-[1840px] mx-auto px-3 sm:px-5 lg:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3.5">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-200/60 ring-2 ring-indigo-50">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight">
                BIAI CRM
              </span>
              <span className="px-2.5 py-0.5 text-[11px] font-bold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200/80 shadow-2xs">
                AI Powered
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Multi-Channel Inquiries &bull; Bangla & Banglish AI Engine
            </p>
          </div>
        </div>

        {/* Database & AI Engine Pill */}
        <div className="hidden lg:flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200/90 text-xs shadow-2xs">
          <span className={`inline-block h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <Database className="h-3.5 w-3.5 text-slate-500" />
          <span className="text-slate-700 font-semibold">
            {isOnline ? `${health?.database_type || 'MySQL'}` : 'Connecting...'}
          </span>
          <span className="text-slate-300 font-light">|</span>
          <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
          <span className="text-indigo-700 font-semibold truncate max-w-[200px]">
            {health?.active_ai_provider || 'AI Ready'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={onResetData}
            disabled={loading}
            title="Reload 20 Sample Enquiries from CSV with AI tags"
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-xl hover:bg-slate-50 transition-all shadow-2xs active:scale-98 disabled:opacity-50"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">Reset Sample Data</span>
          </button>

          <button
            onClick={onOpenSummary}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 rounded-xl transition-all shadow-2xs active:scale-98"
          >
            <FileText className="h-3.5 w-3.5 text-indigo-600" />
            <span className="hidden sm:inline">AI Weekly Summary</span>
          </button>

          <button
            onClick={onOpenPaste}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm shadow-indigo-200 hover:shadow-indigo-300 active:scale-98"
          >
            <Sparkles className="h-4 w-4" />
            <span>Paste Message (AI)</span>
          </button>
        </div>
      </div>
    </header>
  );
};
