import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface SettingsViewProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  isDark,
  onToggleTheme,
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

    </div>
  );
};
