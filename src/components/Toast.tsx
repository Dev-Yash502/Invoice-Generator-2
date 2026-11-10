import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all">
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900/90 dark:bg-white/95 text-white dark:text-neutral-900 shadow-xl backdrop-blur-md font-mono text-xs font-semibold animate-fadeIn">
        <CheckCircle2 className="w-4 h-4 text-teal-400 dark:text-teal-600" />
        <span>{message}</span>
      </div>
    </div>
  );
};
