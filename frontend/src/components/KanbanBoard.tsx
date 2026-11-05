'use client';

import React from 'react';
import { Enquiry, PipelineStatus } from '../lib/types';
import { EnquiryCard } from './EnquiryCard';
import { Inbox, MessageSquare, Star, CheckCircle, XCircle } from 'lucide-react';

interface KanbanBoardProps {
  enquiries: Enquiry[];
  onSelectEnquiry: (enquiry: Enquiry) => void;
  onMoveStage: (id: number, nextStatus: PipelineStatus) => void;
}

interface ColumnConfig {
  status: PipelineStatus;
  label: string;
  icon: React.ReactNode;
  headerBg: string;
  dotColor: string;
  badgeBg: string;
  badgeText: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    status: 'New',
    label: 'New',
    icon: <Inbox className="h-3.5 w-3.5 text-sky-600 shrink-0" />,
    headerBg: 'bg-sky-50/90 border-sky-200/70 text-sky-900',
    dotColor: 'bg-sky-500 ring-2 ring-sky-200',
    badgeBg: 'bg-sky-100',
    badgeText: 'text-sky-800',
  },
  {
    status: 'Contacted',
    label: 'Contacted',
    icon: <MessageSquare className="h-3.5 w-3.5 text-indigo-600 shrink-0" />,
    headerBg: 'bg-indigo-50/90 border-indigo-200/70 text-indigo-900',
    dotColor: 'bg-indigo-500 ring-2 ring-indigo-200',
    badgeBg: 'bg-indigo-100',
    badgeText: 'text-indigo-800',
  },
  {
    status: 'Interested',
    label: 'Interested',
    icon: <Star className="h-3.5 w-3.5 text-amber-600 shrink-0" />,
    headerBg: 'bg-amber-50/90 border-amber-200/70 text-amber-900',
    dotColor: 'bg-amber-500 ring-2 ring-amber-200',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
  },
  {
    status: 'Paid',
    label: 'Paid / Enrolled',
    icon: <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />,
    headerBg: 'bg-emerald-50/90 border-emerald-200/70 text-emerald-900',
    dotColor: 'bg-emerald-500 ring-2 ring-emerald-200',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
  },
  {
    status: 'Lost',
    label: 'Lost / Closed',
    icon: <XCircle className="h-3.5 w-3.5 text-slate-500 shrink-0" />,
    headerBg: 'bg-slate-100 border-slate-200 text-slate-800',
    dotColor: 'bg-slate-400 ring-2 ring-slate-200',
    badgeBg: 'bg-slate-200',
    badgeText: 'text-slate-700',
  },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  enquiries,
  onSelectEnquiry,
  onMoveStage,
}) => {
  return (
    <div className="grid grid-cols-5 gap-2.5 sm:gap-3 w-full items-start">
      {COLUMNS.map((col) => {
        const stageEnquiries = enquiries.filter((e) => e.status === col.status);

        return (
          <div
            key={col.status}
            className="min-w-0 bg-slate-100/75 rounded-2xl p-2.5 sm:p-3 border border-slate-200/90 flex flex-col shadow-2xs"
          >
            {/* Column Header */}
            <div
              className={`flex items-center justify-between px-2.5 py-2 rounded-xl border ${col.headerBg} mb-2.5 shadow-2xs`}
            >
              <div className="flex items-center space-x-1.5 truncate">
                <span className={`h-2 w-2 rounded-full ${col.dotColor} shrink-0`} />
                <h3 className="font-extrabold text-[11px] sm:text-xs uppercase tracking-wider truncate">
                  {col.label}
                </h3>
              </div>
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-[11px] font-black shrink-0 ${col.badgeBg} ${col.badgeText}`}
              >
                {stageEnquiries.length}
              </span>
            </div>

            {/* Cards Column Scroll Area */}
            <div className="space-y-2.5 overflow-y-auto max-h-[calc(100vh-210px)] pr-0.5">
              {stageEnquiries.length === 0 ? (
                <div className="h-36 border-2 border-dashed border-slate-200/90 rounded-xl flex flex-col items-center justify-center text-[11px] text-slate-400 font-medium p-3 text-center">
                  <span>No leads in {col.status.toLowerCase()}</span>
                </div>
              ) : (
                stageEnquiries.map((enquiry) => (
                  <EnquiryCard
                    key={enquiry.id}
                    enquiry={enquiry}
                    onSelect={onSelectEnquiry}
                    onMoveStage={onMoveStage}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
