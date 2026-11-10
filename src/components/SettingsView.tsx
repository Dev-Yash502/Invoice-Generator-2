import React from 'react';
import { 
  Building2, 
  Plus, 
  Sun, 
  Moon, 
  RotateCcw 
} from 'lucide-react';
import { Workspace } from '../types';

interface SettingsViewProps {
  isDark: boolean;
  onToggleTheme: () => void;
  workspaces: Record<string, Workspace>;
  activeWorkspaceKey: string;
  onSelectWorkspace: (key: string) => void;
  onOpenAddWorkspace: () => void;
  onResetDemoData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  isDark,
  onToggleTheme,
  workspaces,
  activeWorkspaceKey,
  onSelectWorkspace,
  onOpenAddWorkspace,
  onResetDemoData,
}) => {
  return (
    <div className="flex flex-col w-full pb-8 pt-2 space-y-3.5">
      {/* Theme Preference Card */}
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

      {/* Workspace Entities Management Card */}
      <div className="bg-white/80 dark:bg-white/[0.04] border border-neutral-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm backdrop-blur-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#635bff] dark:text-[#00f0ff]" />
            <h3 className="font-headline font-bold text-base text-neutral-900 dark:text-white">
              Entities
            </h3>
          </div>
          <button
            onClick={onOpenAddWorkspace}
            className="flex items-center gap-1 text-[#635bff] dark:text-[#00f0ff] font-mono text-xs font-semibold hover:underline cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {Object.values(workspaces).map(ws => {
            const isCurrent = ws.key === activeWorkspaceKey;
            return (
              <div
                key={ws.key}
                onClick={() => onSelectWorkspace(ws.key)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  isCurrent
                    ? 'border-[#635bff] dark:border-[#00f0ff] bg-[#635bff]/5 dark:bg-[#00f0ff]/5'
                    : 'border-neutral-200/70 dark:border-white/10 bg-white/60 dark:bg-white/[0.02] hover:bg-neutral-50 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {ws.logoUrl ? (
                    <img
                      src={ws.logoUrl}
                      alt={ws.name}
                      className="w-8 h-8 rounded-lg object-cover shrink-0 border border-black/10 dark:border-white/20"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-[#635bff]/15 dark:bg-[#00f0ff]/15 text-[#635bff] dark:text-[#00f0ff] flex items-center justify-center font-bold text-xs shrink-0">
                      {ws.initial}
                    </div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="font-headline font-semibold text-xs text-neutral-900 dark:text-white truncate">
                      {ws.name}
                    </span>
                    <span className="font-mono text-[10px] text-neutral-500 truncate">
                      {ws.website}
                    </span>
                  </div>
                </div>

                {isCurrent && (
                  <span className="font-mono text-[10px] font-semibold text-[#635bff] dark:text-[#00f0ff] px-2 py-0.5 rounded-full bg-[#635bff]/10 dark:bg-[#00f0ff]/10">
                    Active
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Reset Demo State */}
      <div className="text-center pt-2">
        <button
          onClick={onResetDemoData}
          type="button"
          className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-red-500 font-mono text-xs transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Data</span>
        </button>
      </div>
    </div>
  );
};
