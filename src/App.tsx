/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Workspace, Invoice, LineItem } from './types';
import { DEFAULT_WORKSPACES, DEFAULT_INVOICES } from './data/defaultData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { EditorView } from './components/EditorView';
import { PreviewView } from './components/PreviewView';
import { SettingsView } from './components/SettingsView';
import { ReceiptModal } from './components/ReceiptModal';
import { NewWorkspaceModal } from './components/NewWorkspaceModal';
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
  const [workspaces, setWorkspaces] = useState<Record<string, Workspace>>(() => {
    const saved = localStorage.getItem('qb_workspaces');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        Object.keys(DEFAULT_WORKSPACES).forEach(k => {
          if (parsed[k] && DEFAULT_WORKSPACES[k].logoUrl) {
            parsed[k].logoUrl = DEFAULT_WORKSPACES[k].logoUrl;
          }
        });
        return parsed;
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_WORKSPACES;
  });

  const [activeWorkspaceKey, setActiveWorkspaceKey] = useState<string>(() => {
    const saved = localStorage.getItem('qb_active_ws');
    return saved && workspaces[saved] ? saved : 'zen';
  });

  useEffect(() => {
    localStorage.setItem('qb_workspaces', JSON.stringify(workspaces));
  }, [workspaces]);

  useEffect(() => {
    localStorage.setItem('qb_active_ws', activeWorkspaceKey);
  }, [activeWorkspaceKey]);

  // Invoices state
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('qb_invoices');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_INVOICES;
  });

  useEffect(() => {
    localStorage.setItem('qb_invoices', JSON.stringify(invoices));
  }, [invoices]);

  // GST rate setting
  const [defaultGstRate, setDefaultGstRate] = useState<number>(() => {
    const saved = localStorage.getItem('qb_gst_rate');
    return saved ? parseInt(saved, 10) : 18;
  });

  const handleUpdateGstRate = (rate: number) => {
    setDefaultGstRate(rate);
    localStorage.setItem('qb_gst_rate', rate.toString());
    showToast(`Default GST rate set to ${rate}%`);
  };

  // Active working invoice
  const createNewInvoiceDraft = (wsKey: string): Invoice => {
    const rnd = Math.floor(100 + Math.random() * 900);
    const prefix = wsKey === 'zen' ? 'INV' : wsKey === 'pearlio-col' ? 'PC' : 'PRL';
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 7);

    return {
      id: `#${prefix}-2024-${rnd}`,
      issueDate: today.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      clientName: 'Ananya Patel',
      clientPhone: '+91 98450 12890',
      clientEmail: 'ananya@studiopatel.in',
      clientCompany: 'Studio Patel Architecture',
      clientAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
      status: 'Pending',
      workspaceKey: wsKey,
      gstEnabled: true,
      gstRate: defaultGstRate,
      items: [
        {
          id: '1',
          desc: 'UI/UX Mobile Design',
          notes: 'Design System & High-Fi Prototypes',
          qty: 2,
          rate: 12000,
        },
        {
          id: '2',
          desc: 'Cloud Hosting & Domain Setup',
          notes: 'Annual DNS, SSL & CDN Deployment',
          qty: 1,
          rate: 12000,
        },
      ],
    };
  };

  const [workingInvoice, setWorkingInvoice] = useState<Invoice>(() =>
    createNewInvoiceDraft(activeWorkspaceKey)
  );

  // Modals & Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isAddWsOpen, setIsAddWsOpen] = useState(false);

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

  const handleAddWorkspace = (newWs: Workspace) => {
    setWorkspaces(prev => ({
      ...prev,
      [newWs.key]: newWs,
    }));
    setActiveWorkspaceKey(newWs.key);
    showToast(`Added workspace: ${newWs.name}`);
  };

  const handleResetDemoData = () => {
    setWorkspaces(DEFAULT_WORKSPACES);
    setActiveWorkspaceKey('zen');
    setInvoices(DEFAULT_INVOICES);
    setDefaultGstRate(18);
    setWorkingInvoice(createNewInvoiceDraft('zen'));
    localStorage.removeItem('qb_workspaces');
    localStorage.removeItem('qb_active_ws');
    localStorage.removeItem('qb_invoices');
    localStorage.removeItem('qb_gst_rate');
    setCurrentView('dashboard');
    showToast('Demo data restored to defaults');
  };

  const activeWs = workspaces[activeWorkspaceKey] || Object.values(workspaces)[0];

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
            onAddNewWorkspace={() => setIsAddWsOpen(true)}
          />
        )}

        {currentView === 'editor' && (
          <EditorView
            workspaces={workspaces}
            activeWorkspaceKey={activeWorkspaceKey}
            onSelectWorkspace={setActiveWorkspaceKey}
            invoice={workingInvoice}
            onUpdateInvoice={setWorkingInvoice}
            onPreview={handleCompileAndPreview}
          />
        )}

        {currentView === 'preview' && (
          <PreviewView
            workspace={activeWs}
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
            workspaces={workspaces}
            activeWorkspaceKey={activeWorkspaceKey}
            onSelectWorkspace={setActiveWorkspaceKey}
            onOpenAddWorkspace={() => setIsAddWsOpen(true)}
            onResetDemoData={handleResetDemoData}
          />
        )}
      </main>

      {/* Payment Clearance Slip (Receipt Modal) */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        invoice={workingInvoice}
        workspace={activeWs}
      />

      {/* New Workspace Modal */}
      <NewWorkspaceModal
        isOpen={isAddWsOpen}
        onClose={() => setIsAddWsOpen(false)}
        onAddWorkspace={handleAddWorkspace}
      />

      {/* Fixed Bottom Tab Navigation */}
      <BottomNav
        currentView={currentView}
        onSelectView={setCurrentView}
        onNewInvoice={handleStartNewInvoice}
      />
    </div>
  );
}
