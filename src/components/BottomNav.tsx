import React from 'react';
import { ReceiptText, Plus, Sliders } from 'lucide-react';

interface BottomNavProps {
  currentView: 'dashboard' | 'editor' | 'preview' | 'settings';
  onSelectView: (view: 'dashboard' | 'editor' | 'preview' | 'settings') => void;
  onNewInvoice: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  onSelectView,
  onNewInvoice,
}) => {
  const isDashboard = currentView === 'dashboard';
  const isSettings = currentView === 'settings';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pb-safe bg-white/85 dark:bg-[#0a0e18]/90 backdrop-blur-2xl border-t border-neutral-200/80 dark:border-white/[0.08] shadow-[0_-4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.6)] transition-colors no-print">
      <div className="max-w-[580px] mx-auto flex items-center justify-around h-16 px-4">
        {/* Invoices Tab */}
        <button
          onClick={() => onSelectView('dashboard')}
          type="button"
          className={`flex flex-col items-center justify-center min-w-[50px] transition-colors ${
            isDashboard
              ? 'text-[#635bff] dark:text-[#00f0ff]'
              : 'text-neutral-400 hover:text-neutral-800 dark:hover:text-white'
          }`}
        >
          <ReceiptText className="w-5 h-5" />
          <span className="font-mono text-[10px] font-semibold mt-1">Invoices</span>
        </button>

        {/* Center Floating Plus FAB */}
        <div className="relative -top-5 flex items-center justify-center">
          <button
            onClick={onNewInvoice}
            aria-label="Create New Invoice"
            type="button"
            className="flex items-center justify-center w-13 h-13 p-3.5 rounded-full bg-gradient-to-tr from-[#635bff] to-[#493ee5] dark:from-[#00f0ff] dark:to-[#571bc1] text-white dark:text-[#002022] shadow-lg shadow-[#635bff]/35 dark:shadow-[0_0_24px_rgba(0,240,255,0.6)] active:scale-90 transition-transform"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
        </div>

        {/* Settings Tab */}
        <button
          onClick={() => onSelectView('settings')}
          type="button"
          className={`flex flex-col items-center justify-center min-w-[50px] transition-colors ${
            isSettings
              ? 'text-[#635bff] dark:text-[#00f0ff]'
              : 'text-neutral-400 hover:text-neutral-800 dark:hover:text-white'
          }`}
        >
          <Sliders className="w-5 h-5" />
          <span className="font-mono text-[10px] font-medium mt-1">Settings</span>
        </button>
      </div>
    </nav>
  );
};
