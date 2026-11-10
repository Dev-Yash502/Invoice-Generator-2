/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Workspace, Invoice, ClientPreset } from './types';
import { FIXED_WORKSPACES } from './data/defaultData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { EditorView } from './components/EditorView';
import { PreviewView } from './components/PreviewView';
import { SettingsView } from './components/SettingsView';
import { ReceiptModal } from './components/ReceiptModal';
import { Toast } from './components/Toast';

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('qb_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('qb_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('qb_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  // View navigation state
  const [currentView, setCurrentView] = useState<'dashboard' | 'editor' | 'preview' | 'settings'>('dashboard');

  // Workspaces state
  const workspaces = FIXED_WORKSPACES;

  const [activeWorkspaceKey, setActiveWorkspaceKey] = useState<string>(() => {
    const saved = localStorage.getItem('qb_active_ws');
    return saved && workspaces[saved] ? saved : 'zen';
  });

  useEffect(() => {
    localStorage.setItem('qb_active_ws', activeWorkspaceKey);
  }, [activeWorkspaceKey]);

  // Invoices state
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('qb_invoices');
    if (saved) {
      try {
        const demoIds = new Set(['#INV-2024-001','#INV-2024-002','#INV-2024-003','#INV-2024-004','#PC-2024-108','#PC-2024-109','#PC-2024-110','#PRL-089','#PRL-090']);
        return (JSON.parse(saved) as Invoice[]).filter(invoice => !demoIds.has(invoice.id));
      } catch (e) {
        // fallback
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('qb_invoices', JSON.stringify(invoices));
  }, [invoices]);

  // Active working invoice
  const createNewInvoiceDraft = (wsKey: string): Invoice => {
    const rnd = Math.floor(100 + Math.random() * 900);
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 7);

    return {
      id: `INV-${today.getFullYear()}-${rnd}`,
      issueDate: today.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      clientCompany: '',
      clientAvatar: '',
      status: 'Draft',
      workspaceKey: wsKey,
      items: [
        { id: '1', desc: '', notes: '', qty: 1, rate: 0 },
      ],
    };
  };

  const [workingInvoice, setWorkingInvoice] = useState<Invoice>(() =>
    createNewInvoiceDraft(activeWorkspaceKey)
  );

  // Modals & Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Navigation handlers
  const handleBack = () => {
    if (currentView === 'editor') setCurrentView('dashboard');
    else if (currentView === 'preview') setCurrentView('editor');
    else if (currentView === 'settings') setCurrentView('dashboard');
    else setCurrentView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartNewInvoice = () => {
    const draft = createNewInvoiceDraft(activeWorkspaceKey);
    setWorkingInvoice(draft);
    setCurrentView('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePreviewInvoice = (inv: Invoice) => {
    setWorkingInvoice(inv);
    if (inv.workspaceKey && workspaces[inv.workspaceKey]) {
      setActiveWorkspaceKey(inv.workspaceKey);
    }
    setCurrentView('preview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditorSelectWorkspace = (key: string) => {
    if (!workspaces[key]) return;
    setActiveWorkspaceKey(key);
    setWorkingInvoice(current => ({ ...current, workspaceKey: key }));
  };

  const handleCompileAndPreview = () => {
    // Save or update in invoice collection
    setInvoices(prev => {
      const idx = prev.findIndex(i => i.id === workingInvoice.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = workingInvoice;
        return copy;
      } else {
        return [workingInvoice, ...prev];
      }
    });
    setCurrentView('preview');
    showToast('Invoice prepared for export');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleInvoiceStatus = (invId: string) => {
    setInvoices(prev =>
      prev.map(inv => {
        if (inv.id === invId) {
          const nextStatus = inv.status === 'Paid' ? 'Pending' : 'Paid';
          showToast(`${inv.id} marked as ${nextStatus}`);
          return { ...inv, status: nextStatus };
        }
        return inv;
      })
    );
  };

  const activeWs = workspaces[activeWorkspaceKey] || Object.values(workspaces)[0];
  const savedClients = Object.values(invoices.reduce<Record<string, ClientPreset>>((clients, invoice) => {
    if (invoice.clientName?.trim()) {
      const key = invoice.clientName.trim().toLowerCase();
      clients[key] = { name: invoice.clientName, company: invoice.clientCompany, phone: invoice.clientPhone, email: invoice.clientEmail, avatar: invoice.clientAvatar };
    }
    return clients;
  }, {}));

  return (
    <div className="bg-[#f7f9fe] text-[#181c20] dark:bg-[#0a0e18] dark:text-[#dfe2f1] font-sans antialiased min-h-screen flex flex-col transition-colors duration-300">
      {/* Toast Notification */}
      <Toast message={toastMessage} />

      {/* Top Application Header */}
      <Header
        currentView={currentView}
        onBack={handleBack}
        onOpenSettings={() => setCurrentView('settings')}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        activeWorkspace={activeWs}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 flex flex-col relative w-full pt-16 pb-24 max-w-[580px] mx-auto px-4">
        {/* Ambient Glow Orbs for Luminous / Obsidian Feel */}
        <div className="fixed top-20 -left-12 w-52 h-52 bg-[#635bff]/10 dark:bg-[#00f0ff]/15 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="fixed top-96 -right-12 w-60 h-60 bg-teal-400/10 dark:bg-[#571bc1]/25 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* View Routing */}
        {currentView === 'dashboard' && (
          <DashboardView
            workspaces={workspaces}
            activeWorkspaceKey={activeWorkspaceKey}
            onSelectWorkspace={setActiveWorkspaceKey}
            invoices={invoices}
            onOpenNewInvoice={handleStartNewInvoice}
            onPreviewInvoice={handlePreviewInvoice}
            onToggleInvoiceStatus={handleToggleInvoiceStatus}
            onOpenSettings={() => setCurrentView('settings')}
          />
        )}

        {currentView === 'editor' && (
          <EditorView
            workspaces={workspaces}
            activeWorkspaceKey={activeWorkspaceKey}
            onSelectWorkspace={handleEditorSelectWorkspace}
            invoice={workingInvoice}
            clients={savedClients}
            onUpdateInvoice={setWorkingInvoice}
            onPreview={handleCompileAndPreview}
          />
        )}

        {currentView === 'preview' && activeWs && (
          <PreviewView
            workspace={activeWs!}
            invoice={workingInvoice}
            onEdit={() => setCurrentView('editor')}
            onShowReceipt={() => setIsReceiptOpen(true)}
            onShowToast={showToast}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView
            isDark={isDark}
            onToggleTheme={toggleTheme}
          />
        )}
      </main>

      {/* Payment Clearance Slip (Receipt Modal) */}
      {activeWs && <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        invoice={workingInvoice}
        workspace={activeWs}
      />}


      {/* Fixed Bottom Tab Navigation */}
      <BottomNav
        currentView={currentView}
        onSelectView={setCurrentView}
        onNewInvoice={handleStartNewInvoice}
      />
    </div>
  );
}
