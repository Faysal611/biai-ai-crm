'use client';

import React, { useState } from 'react';
import { Enquiry, PipelineStatus } from '../lib/types';
import { 
  X, 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink, 
  Phone, 
  Calendar, 
  Tag, 
  AlertCircle,
  Trash2,
  Save,
  MessageSquare
} from 'lucide-react';

interface LeadDrawerProps {
  enquiry: Enquiry | null;
  onClose: () => void;
  onUpdate: (id: number, data: Partial<Enquiry>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const STAGES: PipelineStatus[] = ['New', 'Contacted', 'Interested', 'Paid', 'Lost'];

export const LeadDrawer: React.FC<LeadDrawerProps> = ({
  enquiry,
  onClose,
  onUpdate,
  onDelete,
}) => {
  if (!enquiry) return null;

  const [notes, setNotes] = useState(enquiry.notes || '');
  const [reply, setReply] = useState(enquiry.suggested_reply || '');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  // Format BD phone for WhatsApp wa.me link
  const getWhatsAppLink = () => {
    if (!enquiry.phone) return null;
    let cleanPhone = enquiry.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '88' + cleanPhone;
    }
    const encodedText = encodeURIComponent(reply || '');
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
  };

  const handleCopy = () => {
    if (reply) {
      navigator.clipboard.writeText(reply);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      await onUpdate(enquiry.id, { notes, suggested_reply: reply });
    } finally {
      setSaving(false);
    }
  };

  const handleStageChange = async (newStage: PipelineStatus) => {
    await onUpdate(enquiry.id, { status: newStage });
  };

  const waLink = getWhatsAppLink();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                {enquiry.channel}
              </span>
              <span className="text-xs text-slate-400">ID #{enquiry.id}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              {enquiry.sender_name || 'Anonymous Prospect'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 flex-1">
          {/* Quick Contact & Meta info */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
            <div className="flex items-center space-x-2 text-slate-600">
              <Phone className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="font-medium truncate">{enquiry.phone || 'No phone provided'}</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-600">
              <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="truncate">{enquiry.received_at || 'Recently'}</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-600">
              <Tag className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="font-semibold text-indigo-700">{enquiry.category}</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-600">
              <AlertCircle className="h-4 w-4 text-slate-400 shrink-0" />
              <span>Priority: <strong className="text-slate-800">{enquiry.priority}</strong></span>
            </div>
          </div>

          {/* Original Customer Message */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Original Message
            </label>
            <div className="p-3.5 bg-slate-100 rounded-xl text-xs text-slate-800 leading-relaxed border border-slate-200 font-mono whitespace-pre-wrap">
              {enquiry.raw_message}
            </div>
          </div>

          {/* Pipeline Stage Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Pipeline Stage
            </label>
            <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
              {STAGES.map((s) => (
                <button
                  key={s}
                  onClick={() => handleStageChange(s)}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all text-center ${
                    enquiry.status === s
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-white hover:text-slate-900'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* AI Suggested Reply */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-indigo-900 uppercase tracking-wide flex items-center space-x-1.5">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <span>AI Suggested Reply ({enquiry.detected_language})</span>
              </label>
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={handleCopy}
                  className="px-2 py-1 text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center space-x-1"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                {waLink && (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors flex items-center space-x-1"
                  >
                    <MessageSquare className="h-3 w-3 text-emerald-600" />
                    <span>WhatsApp</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                )}
              </div>
            </div>

            <textarea
              rows={4}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-indigo-200 bg-indigo-50/40 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans leading-relaxed"
              placeholder="Edit or customize the reply before sending..."
            />
          </div>

          {/* Staff Internal Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Internal Team Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add call notes, follow-up dates, or customer preferences..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this enquiry?')) {
                onDelete(enquiry.id);
                onClose();
              }
            }}
            className="flex items-center space-x-1 px-3 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </button>

          <button
            onClick={handleSaveNotes}
            disabled={saving}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
