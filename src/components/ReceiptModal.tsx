import React from 'react';
import { CheckCircle2, X, Printer, ShieldCheck } from 'lucide-react';
import { Invoice, Workspace } from '../types';
import { formatINR } from '../data/defaultData';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  workspace: Workspace;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  invoice,
  workspace,
}) => {
  if (!isOpen) return null;

  const subtotal = invoice.items.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.rate) || 0), 0);
  const grandTotal = Math.round(subtotal);
  const receiptId = invoice.id.replace('#INV-', '#REC-').replace('#PC-', '#REC-PC-').replace('#PRL-', '#REC-PRL-');

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#111624] border border-neutral-200 dark:border-white/10 p-5 shadow-2xl flex flex-col gap-3">
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-teal-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-headline font-bold text-sm">Receipt</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Slip Body */}
        <div className="bg-neutral-50 dark:bg-black/40 rounded-xl p-3.5 font-mono text-xs flex flex-col gap-2 border border-neutral-200/70 dark:border-white/5">
          <div className="flex justify-between items-center">
            <span className="text-neutral-500">Ref:</span>
            <span className="font-semibold text-neutral-900 dark:text-white">{receiptId}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-neutral-500">Paid To:</span>
            <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate max-w-[190px] flex items-center gap-1.5">
              {workspace.logoUrl && (
                <img
                  src={workspace.logoUrl}
                  alt={workspace.name}
                  className="w-3.5 h-3.5 rounded-full object-cover shrink-0 border border-black/10 dark:border-white/20"
                />
              )}
              <span className="truncate">{workspace.name}</span>
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-neutral-500">Client:</span>
            <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate max-w-[180px]">
              {invoice.clientName}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-neutral-500">Channel:</span>
            <span className="text-teal-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> UPI
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-neutral-500">Status:</span>
            <span className="text-teal-600 dark:text-emerald-400 font-bold uppercase text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10">
              Paid
            </span>
          </div>

          <div className="h-px bg-neutral-200 dark:bg-white/10 my-1"></div>

          <div className="flex justify-between items-center text-sm font-bold text-[#635bff] dark:text-[#00f0ff]">
            <span>Amount:</span>
            <span>{formatINR(grandTotal)}</span>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center gap-2 mt-1">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-200 font-headline font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-neutral-100 dark:hover:bg-white/5 active:scale-95 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-[#635bff] dark:bg-[#00f0ff] text-white dark:text-[#002022] font-headline font-bold text-xs active:scale-95 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
