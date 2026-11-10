import React from 'react';
import { ArrowLeft, Moon, Sun, ReceiptText, Building2, User } from 'lucide-react';
import { Workspace } from '../types';

interface HeaderProps {
  currentView: 'dashboard' | 'editor' | 'preview' | 'settings';
  onBack: () => void;
  onOpenSettings: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  activeWorkspace: Workspace;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onBack,
  onOpenSettings,
  isDark,
  onToggleTheme,
  activeWorkspace,
}) => {
  let title = 'QuickBill';
  let subtitle = 'Invoices';

  if (currentView === 'editor') {
    title = 'New Invoice';
    subtitle = 'QuickBill Builder';
  } else if (currentView === 'preview') {
    title = 'Invoice Preview';
    subtitle = 'QuickBill Core';
  } else if (currentView === 'settings') {
    title = 'Settings';
    subtitle = 'Preferences & Workspaces';
  }

  const showBack = currentView !== 'dashboard';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-safe backdrop-blur-xl bg-white/80 border-b border-black/[0.05] dark:bg-[#0a0e18]/85 dark:border-white/[0.08] shadow-[0_1px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.5)] transition-colors no-print">
      <div className="h-16 max-w-[580px] mx-auto px-4 flex items-center justify-between">
        {/* Left: Dynamic Navigation / Title */}
        <div className="flex items-center gap-2">
          {showBack && (
            <button
              onClick={onBack}
              aria-label="Go back"
              className="min-w-[38px] min-h-[38px] -ml-1 flex items-center justify-center rounded-xl text-neutral-600 dark:text-neutral-300 hover:text-[#635bff] dark:hover:text-[#00f0ff] hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#635bff] to-[#8b5cf6] dark:from-[#571bc1] dark:to-[#00f0ff] p-0.5 shadow-md shadow-[#635bff]/20 dark:shadow-[0_0_12px_rgba(0,240,255,0.4)]">
              <div className="w-full h-full bg-white dark:bg-[#0a0e18] rounded-[10px] flex items-center justify-center">
                <ReceiptText className="w-4 h-4 text-[#635bff] dark:text-[#00f0ff]" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-headline font-bold text-[17px] tracking-tight text-neutral-900 dark:text-white">
                {title}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#635bff]/10 dark:bg-white/[0.08] text-[#493ee5] dark:text-[#00f0ff] font-mono text-[10px] font-semibold uppercase tracking-wider">
                {activeWorkspace.logoUrl ? (
                  <img
                    src={activeWorkspace.logoUrl}
                    alt={activeWorkspace.name}
                    className="w-3.5 h-3.5 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <Building2 className="w-3 h-3" />
                )}
                <span>{activeWorkspace.name.split(' ')[0]}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Global Actions (Theme Toggle & Settings) */}
        <div className="flex items-center gap-1">
          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle Theme"
            title={isDark ? 'Switch to Luminous Glass Light' : 'Switch to Obsidian Lumina Dark'}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-neutral-600 dark:text-[#00f0ff] hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all"
          >
            {isDark ? (
              <Sun className="w-[20px] h-[20px] text-[#00f0ff]" />
            ) : (
              <Moon className="w-[20px] h-[20px] text-neutral-700" />
            )}
          </button>

          {/* Profile / Settings Button */}
          <button
            onClick={onOpenSettings}
            aria-label="Settings"
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#635bff] to-[#493ee5] dark:from-[#00f0ff] dark:to-[#571bc1] p-[1.5px] shadow-sm active:scale-95 transition-transform ml-1"
          >
            <div className="w-full h-full rounded-full bg-white dark:bg-[#0a0e18] flex items-center justify-center">
              <User className="w-4 h-4 text-[#635bff] dark:text-[#00f0ff]" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
