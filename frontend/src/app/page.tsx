'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Enquiry, PipelineStatus } from '../lib/types';
import { 
  fetchEnquiries, 
  updateEnquiry, 
  createEnquiry, 
  deleteEnquiry, 
  resetSampleData,
  checkBackendHealth 
} from '../lib/api';

import { Navbar } from '../components/Navbar';
import { StatsBar } from '../components/StatsBar';
import { KanbanBoard } from '../components/KanbanBoard';
import { LeadDrawer } from '../components/LeadDrawer';
import { QuickPasteModal } from '../components/QuickPasteModal';
import { SummaryModal } from '../components/SummaryModal';

export default function Home() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<any>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  // Modals & Drawer State
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [isPasteOpen, setIsPasteOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    setLoading(true);
    try {
      const [healthData, list] = await Promise.all([
        checkBackendHealth(),
        fetchEnquiries(),
      ]);
      setHealth(healthData);
      setEnquiries(list);
    } catch (err) {
      console.error('Initialization error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      const list = await fetchEnquiries();
      setEnquiries(list);
    } catch (err) {
      console.error('Failed to refresh enquiries:', err);
    }
  };

  const handleMoveStage = async (id: number, nextStatus: PipelineStatus) => {
    setEnquiries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: nextStatus } : e))
    );
    try {
      await updateEnquiry(id, { status: nextStatus });
    } catch (err) {
      console.error('Failed to update stage:', err);
      handleRefresh();
    }
  };

  const handleUpdateEnquiry = async (id: number, data: Partial<Enquiry>) => {
    try {
      const updated = await updateEnquiry(id, data);
      setEnquiries((prev) => prev.map((e) => (e.id === id ? updated : e)));
      setSelectedEnquiry(updated);
    } catch (err) {
      alert('Failed to update enquiry: ' + err);
    }
  };

  const handleDeleteEnquiry = async (id: number) => {
    try {
      await deleteEnquiry(id);
      setEnquiries((prev) => prev.filter((e) => e.id !== id));
      setSelectedEnquiry(null);
    } catch (err) {
      alert('Failed to delete enquiry: ' + err);
    }
  };

  const handleSavePastedLead = async (enquiryData: any) => {
    try {
      const created = await createEnquiry(enquiryData);
      setEnquiries((prev) => [created, ...prev]);
    } catch (err) {
      alert('Failed to create lead: ' + err);
    }
  };

  const handleResetData = async () => {
    if (!confirm('Reload all 20 sample enquiries with fresh AI categorizations?')) return;
    setLoading(true);
    try {
      await resetSampleData();
      await handleRefresh();
    } catch (err) {
      alert('Failed to reset sample data: ' + err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((e) => {
      if (selectedCategory !== 'All Categories' && e.category !== selectedCategory) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = (e.sender_name || '').toLowerCase().includes(q);
        const matchPhone = (e.phone || '').toLowerCase().includes(q);
        const matchMsg = (e.raw_message || '').toLowerCase().includes(q);
        return matchName || matchPhone || matchMsg;
      }
      return true;
    });
  }, [enquiries, selectedCategory, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased overflow-x-hidden">
      {/* Top Navbar */}
      <Navbar
        onOpenPaste={() => setIsPasteOpen(true)}
        onOpenSummary={() => setIsSummaryOpen(true)}
        onResetData={handleResetData}
        loading={loading}
        health={health}
      />

      {/* Main Full-Width Container without horizontal scroll */}
      <main className="flex-1 w-full px-2.5 sm:px-4 lg:px-5 py-3.5 flex flex-col overflow-x-hidden">
        {/* Stats & Search Ribbon */}
        <StatsBar
          enquiries={enquiries}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Loading state indicator */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="h-8 w-8 rounded-full border-3 border-indigo-600 border-t-transparent animate-spin" />
            <p className="text-xs font-semibold text-slate-500">Connecting to MySQL database & loading pipeline...</p>
          </div>
        )}

        {/* Kanban Board - 5 columns fit without scroll */}
        {!loading && (
          <div className="w-full">
            <KanbanBoard
              enquiries={filteredEnquiries}
              onSelectEnquiry={setSelectedEnquiry}
              onMoveStage={handleMoveStage}
            />
          </div>
        )}
      </main>

      {/* Modals & Drawers */}
      <LeadDrawer
        enquiry={selectedEnquiry}
        onClose={() => setSelectedEnquiry(null)}
        onUpdate={handleUpdateEnquiry}
        onDelete={handleDeleteEnquiry}
      />

      <QuickPasteModal
        isOpen={isPasteOpen}
        onClose={() => setIsPasteOpen(false)}
        onSave={handleSavePastedLead}
      />

      <SummaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
      />
    </div>
  );
}
