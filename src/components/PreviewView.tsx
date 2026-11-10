import React, { useState } from 'react';
import { 
  FileEdit, 
  Printer, 
  Share2, 
  Laptop, 
  CheckCircle, 
  MessageSquare, 
  Mail, 
  Download, 
  FileText, 
  Receipt, 
  Copy, 
  Check, 
  Building2,
  QrCode,
  Landmark,
  ShieldCheck
} from 'lucide-react';
import { Workspace, Invoice } from '../types';
import { formatINR, formatINRWithDecimals } from '../data/defaultData';

interface PreviewViewProps {
  workspace: Workspace;
  invoice: Invoice;
  onEdit: () => void;
  onShowReceipt: () => void;
  onShowToast: (msg: string) => void;
}

export const PreviewView: React.FC<PreviewViewProps> = ({
  workspace,
  invoice,
  onEdit,
  onShowReceipt,
  onShowToast,
}) => {
  const [exporting, setExporting] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Financial calculations
  const subtotal = invoice.items.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.rate) || 0), 0);
  const gstAmount = invoice.gstEnabled ? subtotal * (invoice.gstRate / 100) : 0;
  const grandTotal = Math.round(subtotal + gstAmount);

  // Split CGST and SGST
  const halfGstRate = (invoice.gstRate / 2).toFixed(1).replace('.0', '');
  const halfGstAmount = gstAmount / 2;

  // Dynamic UPI URL
  const upiUrl = `upi://pay?pa=${encodeURIComponent(workspace.upi)}&pn=${encodeURIComponent(
    workspace.name
  )}&am=${grandTotal}&cu=INR&tn=${encodeURIComponent(`Invoice ${invoice.id}`)}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    upiUrl
  )}`;

  // Sharing actions
  const handleCopyUpi = () => {
    navigator.clipboard.writeText(workspace.upi);
    setCopiedUpi(true);
    onShowToast(`Copied UPI ID: ${workspace.upi}`);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = `Hi ${invoice.clientName},\nHere is your invoice *${invoice.id}* from *${workspace.name}* for *${formatINR(grandTotal)}*.\n\nPay securely via UPI: ${workspace.upi}\nThank you for doing business with us!`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleShareEmail = () => {
    const subject = `Invoice ${invoice.id} from ${workspace.name}`;
    const lineItems = invoice.items
      .map(item => `${item.desc}: ${item.qty} × ${formatINR(item.rate)} = ${formatINR(item.qty * item.rate)}`)
      .join('\n');
    const body = `Dear ${invoice.clientName},\n\nPlease find your invoice summary below:\n\nInvoice Number: ${invoice.id}\nCompany Name: ${invoice.clientCompany || '—'}\nClient Name: ${invoice.clientName || '—'}\nIssue Date: ${invoice.issueDate}\nDue Date: ${invoice.dueDate}\n\nWork / Service Description and Amount:\n${lineItems}\n\nTotal Due: ${formatINR(grandTotal)}\n\nPayment Details:\nUPI VPA: ${workspace.upi}\n\nPlease let us know once the transfer is completed.\n\nWarm regards,\n${workspace.name}`;
    window.location.href = `mailto:${invoice.clientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleShareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: `QuickBill: ${invoice.id}`,
        text: `Invoice for ${formatINR(grandTotal)} from ${workspace.name}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      onShowToast('Invoice URL copied to clipboard!');
    }
  };

  const handleExportPdf = () => {
    setExporting(true);
    setTimeout(() => {
      window.print();
      setExporting(false);
    }, 600);
  };

  return (
    <div className="flex flex-col w-full pb-8 pt-1">
      {/* Top Micro-Actions Bar */}
      <div className="flex items-center justify-between gap-2 pb-3 z-10 no-print">
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/80 dark:bg-white/[0.05] hover:bg-white dark:hover:bg-white/10 border border-neutral-200/80 dark:border-white/[0.08] backdrop-blur-md text-[#635bff] dark:text-[#00f0ff] font-mono text-xs shadow-sm active:scale-95 transition-all cursor-pointer"
        >
          <FileEdit className="w-4 h-4" />
          <span className="font-medium">Edit Invoice</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            title="Print Invoice"
            className="w-9 h-9 rounded-xl bg-white/80 dark:bg-white/[0.05] border border-neutral-200/80 dark:border-white/[0.08] flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:text-[#635bff] dark:hover:text-[#00f0ff] active:scale-95 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleShareLink}
            title="Share Link"
            className="w-9 h-9 rounded-xl bg-white/80 dark:bg-white/[0.05] border border-neutral-200/80 dark:border-white/[0.08] flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:text-[#635bff] dark:hover:text-[#00f0ff] active:scale-95 transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* DIGITAL INVOICE PREVIEW SHEET (Print Target) */}
      <div
        id="printableInvoice"
        className="relative w-full rounded-2xl bg-white dark:bg-[#111624] border border-neutral-200/80 dark:border-white/10 shadow-xl overflow-hidden p-5 flex flex-col gap-4 transition-colors"
      >
        {/* Sheet Header */}
        <div className="flex items-start justify-between gap-2 pt-1">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5">
              {workspace.logoUrl ? (
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-neutral-200/80 dark:border-white/10 shadow-sm shrink-0 bg-white">
                  <img
                    src={workspace.logoUrl}
                    alt={workspace.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-lg bg-[#635bff]/15 dark:bg-[#00f0ff]/15 text-[#635bff] dark:text-[#00f0ff] flex items-center justify-center font-bold text-xs shrink-0">
                  {workspace.initial}
                </div>
              )}
              <span className="font-headline font-bold text-base text-neutral-900 dark:text-white tracking-tight">
                {workspace.name}
              </span>
            </div>
            <div className="flex flex-col text-xs text-neutral-500 dark:text-neutral-400 leading-tight gap-0.5">
              <span className="font-medium text-neutral-800 dark:text-neutral-200">
                {workspace.website || 'zenwebs.io'} • {workspace.email}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span
              className={`px-2 py-0.5 rounded-full border font-mono text-[9px] uppercase font-semibold tracking-wider ${
                invoice.status === 'Paid'
                  ? 'bg-teal-500/15 text-teal-700 dark:text-emerald-400 border-teal-500/30'
                  : 'bg-[#635bff]/15 text-[#635bff] dark:text-[#00f0ff] border-[#635bff]/30'
              }`}
            >
              {invoice.status}
            </span>
            <span className="font-mono text-xs text-neutral-900 dark:text-white font-bold mt-1">
              {invoice.id}
            </span>
            <span className="text-[11px] text-neutral-500 font-mono">
              {invoice.issueDate}
            </span>
          </div>
        </div>

        {/* Client Billed-To Card */}
        <div className="rounded-xl bg-neutral-100/80 dark:bg-white/[0.04] border border-neutral-200/60 dark:border-white/[0.06] p-3 flex items-center justify-between">
          <div className="flex flex-col min-w-0">
            <span className="font-mono text-[9px] text-[#635bff] dark:text-[#00f0ff] uppercase tracking-widest font-semibold">
              Billed To
            </span>
            <span className="font-headline font-semibold text-sm text-neutral-900 dark:text-white truncate mt-0.5">
              {invoice.clientName}
            </span>
            {invoice.clientCompany && (
              <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                {invoice.clientCompany}
              </span>
            )}
            {invoice.clientEmail && (
              <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                {invoice.clientEmail}
              </span>
            )}
          </div>
          <div className="flex flex-col items-end shrink-0 pl-1 font-mono">
            <span className="text-[11px] text-neutral-600 dark:text-neutral-300 font-medium">
              Due: {invoice.dueDate}
            </span>
            <span className="text-[10px] text-neutral-500 mt-0.5">{invoice.clientPhone}</span>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between px-2 font-mono text-[10px] text-neutral-500 uppercase tracking-wider">
            <span className="flex-1">Description</span>
            <span className="w-10 text-center">Qty</span>
            <span className="w-20 text-right">Amount</span>
          </div>

          <div className="flex flex-col gap-1.5">
            {invoice.items.map((it, idx) => {
              const itemTotal = (it.qty || 0) * (it.rate || 0);
              return (
                <div
                  key={it.id || idx}
                  className="relative flex items-center justify-between p-2.5 rounded-xl bg-neutral-100/70 dark:bg-white/[0.03] border border-neutral-200/60 dark:border-white/[0.06] overflow-hidden"
                >
                  <div className="flex flex-col min-w-0 flex-1 pr-2">
                    <span className="font-headline font-semibold text-xs text-neutral-900 dark:text-white truncate">
                      {it.desc}
                    </span>
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">
                      {it.notes}
                    </span>
                  </div>
                  <span className="w-10 text-center font-mono text-xs text-neutral-700 dark:text-neutral-300">
                    {it.qty}
                  </span>
                  <div className="w-20 text-right flex flex-col">
                    <span className="font-mono text-xs font-semibold text-neutral-900 dark:text-white">
                      {formatINR(itemTotal)}
                    </span>
                    <span className="font-mono text-[9px] text-neutral-400">
                      @₹{(it.rate / 1000).toFixed(1)}k
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-neutral-100/80 dark:bg-white/[0.03] border border-neutral-200/60 dark:border-white/[0.06] text-xs">
          <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-300">
            <span>Subtotal</span>
            <span className="font-mono font-medium text-neutral-900 dark:text-white">
              {formatINRWithDecimals(subtotal)}
            </span>
          </div>

          {invoice.gstEnabled ? (
            <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-300">
              <span>GST ({invoice.gstRate}%)</span>
              <span className="font-mono font-medium text-neutral-900 dark:text-white">
                {formatINRWithDecimals(gstAmount)}
              </span>
            </div>
          ) : null}

          {/* Grand Total Bar */}
          <div className="mt-1 pt-1.5 flex items-center justify-between rounded-lg bg-white dark:bg-black/40 border border-neutral-200/60 dark:border-[#00f0ff]/30 px-3 py-2 shadow-sm">
            <span className="font-headline font-bold text-sm text-neutral-900 dark:text-white">
              Total
            </span>
            <div className="flex items-baseline text-[#635bff] dark:text-[#00f0ff]">
              <span className="font-headline font-bold text-2xl tracking-tight">
                {formatINR(grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Options & Dynamic UPI QR Section */}
        <div className="rounded-xl bg-gradient-to-br from-neutral-100 to-[#635bff]/5 dark:from-white/[0.04] dark:to-[#00f0ff]/10 border border-neutral-200/60 dark:border-white/[0.08] p-3 flex items-center justify-between gap-2">
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[#635bff] dark:text-[#00f0ff]">
              <Landmark className="w-4 h-4" />
              <span className="font-headline font-semibold text-xs text-neutral-900 dark:text-white">
                Payment
              </span>
            </div>
            <div className="text-[11px] text-neutral-600 dark:text-neutral-300 leading-snug">
              <div className="flex items-center gap-1">
                <span>UPI:</span>
                <span
                  onClick={handleCopyUpi}
                  className="font-mono font-semibold text-[#635bff] dark:text-[#00f0ff] cursor-pointer hover:underline flex items-center gap-1"
                  title="Click to copy UPI ID"
                >
                  {workspace.upi}
                  {copiedUpi ? (
                    <Check className="w-3 h-3 text-teal-500" />
                  ) : (
                    <Copy className="w-3 h-3 opacity-60" />
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic UPI QR Code */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className="w-16 h-16 p-1 rounded-xl bg-white shadow-md flex items-center justify-center overflow-hidden border border-neutral-200">
              <img
                src={qrImageUrl}
                alt="UPI QR Code"
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Share Actions Strip */}
      <div className="mt-3.5 flex flex-col gap-2 rounded-2xl bg-white/90 dark:bg-[#0f131d]/90 backdrop-blur-2xl border border-neutral-200 dark:border-white/10 p-2.5 shadow-lg no-print">
        {/* Forwarding Buttons & Export */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-700 dark:text-teal-300 font-mono text-xs font-semibold active:scale-95 transition-all cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>WhatsApp</span>
          </button>
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={exporting}
            className="flex-1 py-2.5 px-3 rounded-xl bg-[#635bff] dark:bg-[#00f0ff] text-white dark:text-[#002022] font-headline font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <FileText className={`w-3.5 h-3.5 ${exporting ? 'animate-spin' : ''}`} />
            <span>{exporting ? 'Exporting...' : 'PDF'}</span>
          </button>
          <button
            type="button"
            onClick={onShowReceipt}
            className="py-2.5 px-3 rounded-xl bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 border border-neutral-200 dark:border-white/10 text-neutral-800 dark:text-white font-headline font-semibold text-xs flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
          >
            <Receipt className="w-3.5 h-3.5 text-[#635bff] dark:text-[#00f0ff]" />
            <span>Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
