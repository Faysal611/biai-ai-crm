'use client';

import React from 'react';
import { Enquiry } from '../lib/types';
import { Users, Clock, CheckCircle2, TrendingUp, AlertTriangle, Search, Filter } from 'lucide-react';

interface StatsBarProps {
  enquiries: Enquiry[];
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  enquiries,
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
}) => {
  const total = enquiries.length;
  const newCount = enquiries.filter((e) => e.status === 'New').length;
  const inProgress = enquiries.filter((e) => e.status === 'Contacted' || e.status === 'Interested').length;
  const paidCount = enquiries.filter((e) => e.status === 'Paid').length;

  const overdueCount = enquiries.filter((e) => {
    if (e.status !== 'New') return false;
    if (!e.received_at) return false;
    try {
      const receivedDate = new Date(e.received_at);
      const now = new Date('2026-10-29T12:00:00Z');
      const diffHours = (now.getTime() - receivedDate.getTime()) / (1000 * 60 * 60);
      return diffHours > 48;
    } catch {
      return false;
    }
  }).length;

  const categories = [
    'All Categories',
    'Bootcamp',
    'Fellowship',
    'Corporate Training',
    'Refund / Support',
    'Job Application',
    'Spam',
  ];

  return (
    <div className="space-y-3.5 mb-5">
      {/* Top Controls: Metrics Row + Search & Filters in one unified, sleek bar */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
        {/* Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 flex-1 max-w-4xl">
          {/* Total */}
          <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <div className="text-lg font-black text-slate-900 leading-none">{total}</div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">Total Leads</div>
            </div>
          </div>

          {/* New */}
          <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <div className="text-lg font-black text-slate-900 leading-none">{newCount}</div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">New Inquiries</div>
            </div>
          </div>

          {/* In Progress */}
          <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <div className="text-lg font-black text-slate-900 leading-none">{inProgress}</div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">In Pipeline</div>
            </div>
          </div>

          {/* Paid */}
          <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <div className="text-lg font-black text-slate-900 leading-none">{paidCount}</div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">Enrolled / Paid</div>
            </div>
          </div>

          {/* Overdue */}
          <div className={`px-3.5 py-2.5 rounded-xl border shadow-2xs flex items-center space-x-3 ${overdueCount > 0 ? 'bg-rose-50/80 border-rose-200' : 'bg-white border-slate-200/90'}`}>
            <div className={`p-2 rounded-lg ${overdueCount > 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-50 text-slate-400'}`}>
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <div className={`text-lg font-black ${overdueCount > 0 ? 'text-rose-700' : 'text-slate-900'} leading-none`}>
                {overdueCount}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">Overdue (&gt;48h)</div>
            </div>
          </div>
        </div>

        {/* Search & Category Filter Section */}
        <div className="bg-white p-1.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center space-x-2 shrink-0">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, phone, message..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 placeholder-slate-400 transition-all"
            />
          </div>

          <div className="flex items-center space-x-1.5">
            <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
