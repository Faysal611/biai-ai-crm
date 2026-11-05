'use client';

import React, { useState } from 'react';
import { Enquiry, PipelineStatus } from '../lib/types';
import { 
  MessageSquare, 
  Phone, 
  Globe, 
  PhoneCall, 
  AlertCircle, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  Copy,
  Check,
  Clock
} from 'lucide-react';

interface EnquiryCardProps {
  enquiry: Enquiry;
  onSelect: (enquiry: Enquiry) => void;
  onMoveStage: (id: number, nextStatus: PipelineStatus) => void;
}

const STAGES: PipelineStatus[] = ['New', 'Contacted', 'Interested', 'Paid', 'Lost'];

export const EnquiryCard: React.FC<EnquiryCardProps> = ({
  enquiry,
  onSelect,
  onMoveStage,
}) => {
  const [copied, setCopied] = useState(false);

  const currentIndex = STAGES.indexOf(enquiry.status);
  const canMoveLeft = currentIndex > 0;
  const canMoveRight = currentIndex < STAGES.length - 1;

  const handleCopyReply = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (enquiry.suggested_reply) {
      navigator.clipboard.writeText(enquiry.suggested_reply);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getChannelBadge = (ch: string) => {
    const lower = ch.toLowerCase();
    if (lower.includes('whatsapp')) {
      return (
        <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shrink-0">
          <MessageSquare className="h-3 w-3 text-emerald-600 shrink-0" />
          <span className="truncate max-w-[80px]">WhatsApp</span>
        </span>
      );
    }
    if (lower.includes('facebook')) {
      return (
        <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 shrink-0">
          <MessageSquare className="h-3 w-3 text-blue-600 shrink-0" />
          <span className="truncate max-w-[80px]">Facebook</span>
        </span>
      );
    }
    if (lower.includes('phone')) {
      return (
        <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 shrink-0">
          <PhoneCall className="h-3 w-3 text-amber-600 shrink-0" />
          <span className="truncate max-w-[80px]">Phone</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200/80 shrink-0">
        <Globe className="h-3 w-3 text-purple-600 shrink-0" />
        <span className="truncate max-w-[80px]">Form</span>
      </span>
    );
  };

  const getPriorityBadge = (p: string) => {
    if (p === 'Urgent') {
      return (
        <span className="inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-100 text-rose-700 animate-pulse border border-rose-300 shrink-0">
          <AlertCircle className="h-2.5 w-2.5" />
          <span>URGENT</span>
        </span>
      );
    }
    if (p === 'High') {
      return (
        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
          HIGH
        </span>
      );
    }
    return null;
  };

  const getLanguageBadge = (lang: string) => {
    if (lang === 'Banglish') {
      return (
        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
          Banglish
        </span>
      );
    }
    if (lang === 'Bangla') {
      return (
        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200 shrink-0">
          বাংলা
        </span>
      );
    }
    return (
      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
        English
      </span>
    );
  };

  const isOverdue = React.useMemo(() => {
    if (enquiry.status !== 'New' || !enquiry.received_at) return false;
    try {
      const rec = new Date(enquiry.received_at);
      const now = new Date('2026-10-29T12:00:00Z');
      return (now.getTime() - rec.getTime()) / (1000 * 60 * 60) > 48;
    } catch {
      return false;
    }
  }, [enquiry]);

  return (
    <div
      onClick={() => onSelect(enquiry)}
      className="group min-w-0 bg-white rounded-xl border border-slate-200/90 hover:border-indigo-400/80 p-3 shadow-2xs hover:shadow-md transition-all duration-150 cursor-pointer flex flex-col justify-between space-y-2.5 relative hover:-translate-y-0.5"
    >
      {/* Top Header: Channel + Priority & SLA */}
      <div className="flex items-center justify-between gap-1">
        {getChannelBadge(enquiry.channel)}
        <div className="flex items-center space-x-1 shrink-0">
          {isOverdue && (
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center space-x-0.5">
              <Clock className="h-2.5 w-2.5" />
              <span>&gt;48h</span>
            </span>
          )}
          {getPriorityBadge(enquiry.priority)}
        </div>
      </div>

      {/* Prospect Name & Phone */}
      <div className="min-w-0">
        <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
          {enquiry.sender_name || 'Anonymous Prospect'}
        </h4>
        {enquiry.phone && (
          <p className="text-[11px] text-slate-500 font-medium flex items-center space-x-1 mt-0.5 truncate">
            <Phone className="h-2.5 w-2.5 text-slate-400 shrink-0" />
            <span className="truncate">{enquiry.phone}</span>
          </p>
        )}
      </div>

      {/* Category & Language Tags */}
      <div className="flex flex-wrap items-center gap-1">
        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200/60 truncate max-w-[150px]">
          {enquiry.category}
        </span>
        {getLanguageBadge(enquiry.detected_language)}
      </div>

      {/* Message Chat Bubble */}
      <div className="bg-slate-50/90 border-l-2 border-indigo-400 rounded-r-lg p-2 text-[11px] text-slate-700 italic leading-snug font-sans line-clamp-2">
        &ldquo;{enquiry.raw_message}&rdquo;
      </div>

      {/* AI Suggested Reply Box */}
      {enquiry.suggested_reply && (
        <div className="bg-gradient-to-r from-indigo-50/90 to-violet-50/70 border border-indigo-100/90 rounded-lg p-2 text-[11px] space-y-1">
          <div className="flex items-center justify-between font-bold text-indigo-900 text-[10px]">
            <span className="flex items-center space-x-1 truncate">
              <Sparkles className="h-3 w-3 text-indigo-600 shrink-0" />
              <span className="truncate">AI Reply</span>
            </span>
            <button
              onClick={handleCopyReply}
              className="p-0.5 px-1.5 rounded text-indigo-700 hover:text-indigo-900 hover:bg-indigo-100 transition-colors flex items-center space-x-1 shrink-0"
              title="Copy Suggested Reply"
            >
              {copied ? (
                <>
                  <Check className="h-2.5 w-2.5 text-emerald-600" />
                  <span className="text-[9px] text-emerald-700 font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-2.5 w-2.5" />
                  <span className="text-[9px] font-semibold">Copy</span>
                </>
              )}
            </button>
          </div>
          <p className="line-clamp-2 text-slate-700 text-[11px] leading-snug font-normal">
            {enquiry.suggested_reply}
          </p>
        </div>
      )}

      {/* Footer: Date & Movement Controls */}
      <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span className="text-[10px] font-medium text-slate-400 truncate max-w-[90px]">
          {enquiry.received_at?.split(' ')[0] || 'Recently'}
        </span>
        <div className="flex items-center space-x-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          {canMoveLeft && (
            <button
              onClick={() => onMoveStage(enquiry.id, STAGES[currentIndex - 1])}
              title={`Move back to ${STAGES[currentIndex - 1]}`}
              className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
          )}
          {canMoveRight && (
            <button
              onClick={() => onMoveStage(enquiry.id, STAGES[currentIndex + 1])}
              title={`Advance to ${STAGES[currentIndex + 1]}`}
              className="px-1.5 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors border border-indigo-200/80 font-bold flex items-center space-x-0.5 text-[9px]"
            >
              <span className="uppercase">{STAGES[currentIndex + 1]}</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
