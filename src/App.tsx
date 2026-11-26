/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Workspace, Invoice, ClientPreset } from './types';
import { FIXED_WORKSPACES, getInvoiceAmountPaid, getInvoicePaymentStatus, getInvoiceTotal, downloadInvoicesBackup } from './data/defaultData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { EditorView } from './components/EditorView';
import { PreviewView } from './components/PreviewView';
import { SettingsView } from './components/SettingsView';
import { ReceiptModal } from './components/ReceiptModal';
import { Toast } from './components/Toast';
import { isSupabaseConfigured, fetchInvoices, upsertInvoice, updateInvoicePayment } from './lib/supabase';

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
    return saved && workspaces[saved] ? saved : 'pearlio';
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

  // Sync from Supabase Cloud on mount
  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchInvoices().then((cloudInvoices) => {
        if (cloudInvoices) {
          setInvoices((local) => {
            // Merge cloud and local invoices, avoiding duplicates by id
            const map = new Map<string, Invoice>();
            local.forEach((inv) => map.set(inv.id, inv));
            cloudInvoices.forEach((inv) => map.set(inv.id, inv));
            return Array.from(map.values());
          });
        }
      });
    }
  }, []);

  // Active working invoice
  const issueInvoiceNumber = (wsKey: string): string => {
    const year = new Date().getFullYear();
    const prefix = wsKey === 'zen' ? 'ZEN' : wsKey === 'pearlio-col' ? 'PC' : 'PRL';
    const storageKey = `qb_invoice_seq_${wsKey}_${year}`;
    const pattern = new RegExp(`^${prefix}-${year}-(\\d+)$`);
    const highestExisting = invoices
      .filter(invoice => invoice.workspaceKey === wsKey)
      .reduce((highest, invoice) => Math.max(highest, Number(invoice.id.match(pattern)?.[1] || 0)), 0);
    const sequence = Math.max(Number(localStorage.getItem(storageKey)) || 1, highestExisting + 1);
    localStorage.setItem(storageKey, String(sequence + 1));
    return `${prefix}-${year}-${String(sequence).padStart(4, '0')}`;
  };

  const createNewInvoiceDraft = (wsKey: string, id = ''): Invoice => {
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 7);

    return {
      id,
      issueDate: today.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      clientCompany: '',
      clientAvatar: '',
      status: 'Draft',
      amountPaid: 0,
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

  // Browser History & In-App Navigation Synchronization
  const navigateTo = (newView: 'dashboard' | 'editor' | 'preview' | 'settings') => {
    if (newView === currentView) return;
    window.history.pushState({ view: newView }, '');
    setCurrentView(newView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync browser back/forward buttons (prevents exiting to browser home)
  useEffect(() => {
    if (!window.history.state || !window.history.state.view) {
      window.history.replaceState({ view: 'dashboard' }, '');
    }

    const handlePopState = (event: PopStateEvent) => {
      // If modal was open, back should close modal first
      if (isReceiptOpen) {
        setIsReceiptOpen(false);
        return;
      }
      const targetView = (event.state?.view || 'dashboard') as 'dashboard' | 'editor' | 'preview' | 'settings';
      setCurrentView(targetView);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isReceiptOpen]);

  // Navigation handlers
  const handleBack = () => {
    if (isReceiptOpen) {
      setIsReceiptOpen(false);
      return;
    }
    // If there is in-app history, use browser history back
    if (window.history.state && window.history.state.view && window.history.state.view !== 'dashboard') {
      window.history.back();
    } else {
      if (currentView === 'editor') setCurrentView('dashboard');
      else if (currentView === 'preview') setCurrentView('editor');
      else if (currentView === 'settings') setCurrentView('dashboard');
      else setCurrentView('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenReceipt = () => {
    window.history.pushState({ view: currentView, modal: 'receipt' }, '');
    setIsReceiptOpen(true);
  };

  const handleStartNewInvoice = () => {
    const draft = createNewInvoiceDraft(activeWorkspaceKey, issueInvoiceNumber(activeWorkspaceKey));
    setWorkingInvoice(draft);
    navigateTo('editor');
  };

  const handlePreviewInvoice = (inv: Invoice) => {
    setWorkingInvoice(inv);
    if (inv.workspaceKey && workspaces[inv.workspaceKey]) {
      setActiveWorkspaceKey(inv.workspaceKey);
    }
    navigateTo('preview');
  };

  const handleCompileAndPreview = () => {
    const total = getInvoiceTotal(workingInvoice);
    const amountPaid = getInvoiceAmountPaid(workingInvoice, total);
    const savedInvoice = { ...workingInvoice, amountPaid, status: getInvoicePaymentStatus(amountPaid, total) };
    setWorkingInvoice(savedInvoice);
    // Save or update in invoice collection
    setInvoices(prev => {
      const idx = prev.findIndex(i => i.id === savedInvoice.id && i.workspaceKey === savedInvoice.workspaceKey);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = savedInvoice;
        return copy;
      } else {
        return [savedInvoice, ...prev];
      }
    });
    navigateTo('preview');
    showToast('Invoice prepared for export');
    if (isSupabaseConfigured) {
      upsertInvoice(savedInvoice);
    }
  };

  const handleUpdateInvoicePayment = (invId: string, amountPaid: number) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== invId) return inv;
      const total = getInvoiceTotal(inv);
      const validAmount = Math.min(total, Math.max(0, amountPaid));
      const status = getInvoicePaymentStatus(validAmount, total);
      if (isSupabaseConfigured) {
        updateInvoicePayment(invId, validAmount, status);
      }
      return { ...inv, amountPaid: validAmount, status };
    }));
  };

  const handleDownloadBackup = () => {
    if (invoices.length === 0) {
      showToast('No invoices to backup!');
      return;
    }
    downloadInvoicesBackup(invoices);
    showToast(`Backup downloaded (${invoices.length} invoices)`);
  };

  const handleRestoreInvoices = (restored: Invoice[]) => {
    setInvoices(restored);
  };

  const handleClearAllInvoices = () => {
    setInvoices([]);
    localStorage.removeItem('qb_invoices');
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
    <div className="bg-[#f4f6ff] text-[#181c20] dark:bg-[#0a0e18] dark:text-[#dfe2f1] font-sans antialiased min-h-screen flex flex-col transition-colors duration-300">
      {/* Toast Notification */}
      <Toast message={toastMessage} />

      {/* Top Application Header */}
      <Header
        currentView={currentView}
        onBack={handleBack}
        onOpenSettings={() => navigateTo('settings')}
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
            onUpdateInvoicePayment={handleUpdateInvoicePayment}
            onOpenSettings={() => navigateTo('settings')}
            onDownloadBackup={handleDownloadBackup}
          />
        )}

        {currentView === 'editor' && (
          <EditorView
            activeWorkspaceKey={activeWorkspaceKey}
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
            onEdit={() => navigateTo('editor')}
            onShowReceipt={handleOpenReceipt}
            onShowToast={showToast}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView
            isDark={isDark}
            onToggleTheme={toggleTheme}
            invoices={invoices}
            onRestoreInvoices={handleRestoreInvoices}
            onClearAllInvoices={handleClearAllInvoices}
            onShowToast={showToast}
            workspaces={workspaces}
            activeWorkspaceKey={activeWorkspaceKey}
            onSelectWorkspace={setActiveWorkspaceKey}
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
        onSelectView={navigateTo}
        onNewInvoice={handleStartNewInvoice}
      />
    </div>
  );
}
