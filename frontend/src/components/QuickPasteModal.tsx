'use client';

import React, { useState } from 'react';
import { AIExtractionResult, PipelineStatus } from '../lib/types';
import { parseMessageWithAI } from '../lib/api';
import { X, Sparkles, Plus, CheckCircle, ArrowRight, User, Phone } from 'lucide-react';

interface QuickPasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (enquiryData: any) => Promise<void>;
}

const SAMPLE_TEMPLATES = [
  {
    label: 'Banglish Sample',
    text: 'Assalamualaikum, apnader generative ai bootcamp er fee koto? Ami class 11 e pori, amar jonno ki thik hobe? Contact: 01712999888 (Tanvir)',
    channel: 'WhatsApp',
  },
  {
    label: 'Bangla Sample',
    text: 'আসসালামু আলাইকুম। আপনাদের এআই ফেলোশিপে ভর্তির শেষ তারিখ কবে? আমি একজন সফটওয়্যার ইঞ্জিনিয়ার। ফোন: ০১৭১১১২২২৩৩ (রাকিব)',
    channel: 'Facebook Messenger',
  },
  {
    label: 'Corporate Sample',
    text: 'We are a logistics company with 60 staff in Chittagong. We want corporate AI training on workflow automation. Please call MD Mr. Faruk at 01811444555.',
    channel: 'Website form',
  },
];

export const QuickPasteModal: React.FC<QuickPasteModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [rawText, setRawText] = useState('');
  const [channel, setChannel] = useState('WhatsApp');
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AIExtractionResult | null>(null);
  const [senderName, setSenderName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAnalyze = async () => {
    if (!rawText.trim()) return;
    setAnalyzing(true);
    try {
      const res = await parseMessageWithAI(rawText, channel);
      setAiResult(res);
      if (res.sender_name) setSenderName(res.sender_name);
      if (res.phone) setPhone(res.phone);
    } catch (err) {
      alert('Error analyzing message: ' + err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveToPipeline = async () => {
    if (!rawText.trim()) return;
    setSaving(true);
    try {
      await onSave({
        raw_message: rawText,
        channel,
        sender_name: senderName || aiResult?.sender_name || 'Anonymous Prospect',
        phone: phone || aiResult?.phone || null,
        category: aiResult?.category || 'General Inquiry',
        detected_language: aiResult?.detected_language || 'English',
        priority: aiResult?.priority || 'Normal',
        suggested_reply: aiResult?.suggested_reply || '',
        status: 'New' as PipelineStatus,
        received_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
      });
      // Reset form
      setRawText('');
      setAiResult(null);
      setSenderName('');
      setPhone('');
      onClose();
    } catch (err) {
      alert('Error saving lead: ' + err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Paste New Customer Message</h3>
              <p className="text-xs text-slate-500">AI automatically detects language, course intent, and drafts a reply</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Demo Templates */}
        <div className="my-3 flex items-center space-x-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
            Quick Fill Demo:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.label}
                type="button"
                onClick={() => {
                  setRawText(tmpl.text);
                  setChannel(tmpl.channel);
                  setAiResult(null);
                }}
                className="px-2 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 transition-colors border border-slate-200"
              >
                {tmpl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Channel</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full text-xs p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="WhatsApp">WhatsApp</option>
                <option value="Facebook Messenger">Facebook Messenger</option>
                <option value="Website form">Website form</option>
                <option value="Phone call note">Phone call note</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pasted Message (Bangla, Banglish, or English)
            </label>
            <textarea
              rows={4}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste raw WhatsApp text, Facebook comment, or enquiry form submission here..."
              className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={analyzing || !rawText.trim()}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm shadow-indigo-200 disabled:opacity-50"
          >
            <Sparkles className={`h-4 w-4 ${analyzing ? 'animate-spin' : ''}`} />
            <span>{analyzing ? 'AI Analyzing with Gemini / Heuristic...' : 'Extract & Draft Reply with AI'}</span>
          </button>

          {/* AI Extracted Result Card */}
          {aiResult && (
            <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
                <span className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>AI Extracted Details</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] bg-indigo-200 text-indigo-800 font-semibold">
                  {aiResult.detected_language}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold">Prospect Name</label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Enter or confirm name"
                    className="w-full mt-0.5 p-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 017..."
                    className="w-full mt-0.5 p-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold">Category: </span>
                  <span className="font-bold text-slate-800">{aiResult.category}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold">Priority: </span>
                  <span className="font-bold text-slate-800">{aiResult.priority}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 font-semibold block mb-1">
                  Suggested Reply ({aiResult.detected_language}):
                </span>
                <div className="p-2.5 bg-white rounded-lg text-xs text-slate-700 border border-indigo-100 italic">
                  {aiResult.suggested_reply || 'No reply suggested (e.g. Spam).'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveToPipeline}
            disabled={saving || !rawText.trim()}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm shadow-emerald-200 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            <span>{saving ? 'Saving...' : 'Add to Pipeline (New)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
