'use client';

import React, { useState, useEffect } from 'react';
import { fetchWeeklySummary } from '../lib/api';
import { X, Sparkles, Copy, Check, FileText } from 'lucide-react';

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({ isOpen, onClose }) => {
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSummary();
    }
  }, [isOpen]);

  const loadSummary = async () => {
    setLoading(true);
    try {
      const data = await fetchWeeklySummary();
      setSummary(data.summary);
    } catch (err) {
      setSummary('Failed to load summary: ' + err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">AI Executive Weekly Summary</h3>
              <p className="text-xs text-slate-500">Auto-generated breakdown of pipeline metrics & high-value leads</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="my-4 flex-1 overflow-y-auto p-4 bg-slate-50 rounded-xl border border-slate-200">
          {loading ? (
            <div className="h-48 flex flex-col items-center justify-center space-y-2 text-indigo-600 text-xs font-semibold">
              <Sparkles className="h-6 w-6 animate-spin" />
              <span>Synthesizing Executive Summary with AI...</span>
            </div>
          ) : (
            <div className="prose prose-xs max-w-none text-slate-800 whitespace-pre-wrap font-sans text-xs leading-relaxed">
              {summary}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={loadSummary}
            disabled={loading}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Regenerate Summary
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              disabled={loading || !summary}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Report'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
