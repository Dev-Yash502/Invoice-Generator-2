import React, { useRef } from 'react';
import { Sun, Moon, Database, Download, Upload, Trash2, FileCheck, AlertTriangle, Cloud, CloudOff } from 'lucide-react';
import { Invoice } from '../types';
import { downloadInvoicesBackup, restoreInvoicesBackup } from '../data/defaultData';
import { isSupabaseConfigured } from '../lib/supabase';

interface SettingsViewProps {
  isDark: boolean;
  onToggleTheme: () => void;
  invoices: Invoice[];
  onRestoreInvoices: (invoices: Invoice[]) => void;
  onClearAllInvoices: () => void;
  onShowToast: (msg: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  isDark,
  onToggleTheme,
  invoices,
  onRestoreInvoices,
  onClearAllInvoices,
  onShowToast,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownload = () => {
    if (invoices.length === 0) {
      onShowToast('No invoices to backup yet!');
      return;
    }
    downloadInvoicesBackup(invoices);
    onShowToast(`Backup saved! (${invoices.length} invoices)`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    restoreInvoicesBackup(
      file,
      (restored) => {
        onRestoreInvoices(restored);
        onShowToast(`Successfully restored ${restored.length} invoices!`);
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
      (error) => {
        onShowToast(`Error: ${error}`);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    );
  };

  const handleClear = () => {
    if (invoices.length === 0) return;
    const confirm = window.confirm(
      'Are you sure you want to delete all invoices? Make sure you have downloaded a backup first!'
    );
    if (confirm) {
      onClearAllInvoices();
      onShowToast('All invoice data cleared.');
    }
  };

  return (
    <div className="flex flex-col w-full pb-8 pt-2 space-y-3.5">
      {/* 1. Theme Preference Card */}
      <div className="bg-white/80 dark:bg-white/[0.04] border border-neutral-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm backdrop-blur-xl">
        <h3 className="font-headline font-bold text-base text-neutral-900 dark:text-white mb-3">
          Theme
        </h3>

        <div className="flex flex-col gap-3 text-xs">
          {/* Dark Mode Row */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-100/70 dark:bg-black/30">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#635bff]/15 dark:bg-[#00f0ff]/15 text-[#635bff] dark:text-[#00f0ff] flex items-center justify-center">
                {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </div>
              <div>
                <p className="font-semibold text-neutral-900 dark:text-white">
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </p>
              </div>
            </div>
            <button
              onClick={onToggleTheme}
              type="button"
              className="px-3 py-1 rounded-full bg-[#635bff] dark:bg-[#00f0ff] text-white dark:text-[#002022] font-mono text-[11px] font-bold active:scale-95 transition-transform cursor-pointer"
            >
              Toggle
            </button>
          </div>
        </div>
      </div>

      {/* 2. Cloud Database Status */}
      <div className="bg-white/80 dark:bg-white/[0.04] border border-neutral-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isSupabaseConfigured
                ? 'bg-teal-500/15 text-teal-600 dark:text-emerald-400'
                : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
            }`}>
              {isSupabaseConfigured ? <Cloud className="w-4 h-4" /> : <CloudOff className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-headline font-bold text-sm text-neutral-900 dark:text-white">
                Cloud Sync (Supabase)
              </h3>
              <p className="text-[11px] text-neutral-500 font-mono">
                {isSupabaseConfigured ? 'Connected & syncing to Cloud' : 'Offline / Local storage'}
              </p>
            </div>
          </div>
          <span className={`font-mono text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${
            isSupabaseConfigured
              ? 'bg-teal-500/15 border-teal-500/30 text-teal-700 dark:text-emerald-400'
              : 'bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-300'
          }`}>
            {isSupabaseConfigured ? 'ONLINE' : 'LOCAL'}
          </span>
        </div>
      </div>

      {/* 3. Data & Backup Card */}
      <div className="bg-white/80 dark:bg-white/[0.04] border border-neutral-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm backdrop-blur-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/15 text-teal-600 dark:text-emerald-400 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-base text-neutral-900 dark:text-white">
                Data & Backup
              </h3>
              <p className="text-[11px] text-neutral-500 font-mono">
                {invoices.length} {invoices.length === 1 ? 'invoice' : 'invoices'} stored locally
              </p>
            </div>
          </div>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-700 dark:text-emerald-400 font-semibold">
            JSON
          </span>
        </div>

        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
          Export your invoice records to a secure offline JSON backup file, or restore them anytime on any device.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          {/* Download Backup Button */}
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[#635bff]/10 to-[#493ee5]/10 hover:from-[#635bff]/20 hover:to-[#493ee5]/20 dark:from-[#00f0ff]/10 dark:to-transparent border border-[#635bff]/30 dark:border-[#00f0ff]/30 text-neutral-900 dark:text-white transition-all active:scale-[0.99] cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#635bff] dark:bg-[#00f0ff] text-white dark:text-[#002022] flex items-center justify-center">
                <Download className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="font-headline font-semibold text-xs block">Download Backup</span>
                <span className="text-[10px] text-neutral-500 font-mono">Save all invoices to a .json file</span>
              </div>
            </div>
            <FileCheck className="w-4 h-4 text-[#635bff] dark:text-[#00f0ff]" />
          </button>

          {/* Restore Backup Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,application/json"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-between p-3 rounded-xl bg-neutral-100/70 hover:bg-neutral-100 dark:bg-black/30 dark:hover:bg-white/[0.05] border border-neutral-200/80 dark:border-white/10 text-neutral-900 dark:text-white transition-all active:scale-[0.99] cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-neutral-200 dark:bg-white/10 text-neutral-700 dark:text-neutral-200 flex items-center justify-center">
                <Upload className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="font-headline font-semibold text-xs block">Restore Backup</span>
                <span className="text-[10px] text-neutral-500 font-mono">Import invoices from JSON backup</span>
              </div>
            </div>
          </button>

          {/* Clear Data Button */}
          {invoices.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 transition-all active:scale-[0.99] cursor-pointer mt-1"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-red-500/15 text-red-600 dark:text-red-400 flex items-center justify-center">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="font-headline font-semibold text-xs block">Clear All Invoices</span>
                  <span className="text-[10px] opacity-75 font-mono">Reset local storage data</span>
                </div>
              </div>
              <AlertTriangle className="w-4 h-4 opacity-75" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
