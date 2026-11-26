import React, { useState } from 'react';
import {
  FileEdit,
  Printer,
  Share2,
  MessageSquare,
  Mail,
  FileText,
  Receipt,
  Copy,
  Check,
  Quote,
} from 'lucide-react';
import { Workspace, Invoice } from '../types';
import { formatINR, getInvoiceAmountPaid, getInvoicePaymentStatus } from '../data/defaultData';

interface PreviewViewProps {
  workspace: Workspace;
  invoice: Invoice;
  onEdit: () => void;
  onShowReceipt: () => void;
  onShowToast: (msg: string) => void;
}

// Bug #6 fix: parse date parts from ISO string directly to avoid UTC timezone shift
function formatDisplayDate(raw: string): string {
  if (!raw) return '—';
  // ISO format: YYYY-MM-DD
  const parts = raw.split('-');
  if (parts.length !== 3) return raw;
  const [year, month, day] = parts.map(Number);
  if (!year || !month || !day) return raw;
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return `${String(day).padStart(2, '0')} ${monthNames[month - 1]} ${year}`;
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
  const grandTotal = Math.round(subtotal);
  const amountPaid = getInvoiceAmountPaid(invoice, grandTotal);
  const remainingBalance = Math.max(0, grandTotal - amountPaid);
  const paymentStatus = getInvoicePaymentStatus(amountPaid, grandTotal);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(workspace.upi);
    setCopiedUpi(true);
    onShowToast(`Copied UPI ID: ${workspace.upi}`);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = `Hi ${invoice.clientName},\nHere is your invoice *${invoice.id}* from *${workspace.name}*.\nTotal: ${formatINR(grandTotal)}\nPaid: ${formatINR(amountPaid)}\nRemaining: ${formatINR(remainingBalance)}\n\nPay securely via UPI: ${workspace.upi}\nThank you for doing business with us!`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareEmail = () => {
    const subject = `Invoice ${invoice.id} from ${workspace.name}`;
    const body = `Dear ${invoice.clientName},\n\nPlease find your invoice details:\n\nInvoice Number: ${invoice.id}\nDate: ${invoice.issueDate}\nDue Date: ${invoice.dueDate}\nTotal: ${formatINR(grandTotal)}\nAmount Paid: ${formatINR(amountPaid)}\nRemaining: ${formatINR(remainingBalance)}\n\nPayment via UPI: ${workspace.upi}\n\nWarm regards,\n${workspace.name}`;
    window.location.href = `mailto:${invoice.clientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleShareLink = () => {
    if (navigator.share) {
      navigator.share({ title: `Invoice: ${invoice.id}`, text: `Invoice for ${formatINR(grandTotal)} from ${workspace.name}`, url: window.location.href }).catch(() => { });
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
    }, 400);
  };

  const statusColors: Record<string, { badge: string }> = {
    'Paid': { badge: 'bg-teal-100 text-teal-700 border border-teal-300' },
    'Partially Paid': { badge: 'bg-amber-100 text-amber-700 border border-amber-300' },
    'Unpaid': { badge: 'bg-red-100 text-red-700 border border-red-300' },
  };
  const sc = statusColors[paymentStatus] || statusColors['Unpaid'];

  // Workspace quote / tagline — unified inspirational quote for all entities
  const quoteText = `Great work is a result of trust, collaboration, and a shared vision. Thank you for choosing ${workspace.name}!`;

  return (
    <div className="flex flex-col w-full pb-8 pt-1">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-2 pb-3 z-10 no-print">
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/80 dark:bg-white/[0.05] hover:bg-white dark:hover:bg-white/10 border border-neutral-200/80 dark:border-white/[0.08] backdrop-blur-md text-[#1a56db] dark:text-[#00f0ff] font-mono text-xs shadow-sm active:scale-95 transition-all cursor-pointer"
        >
          <FileEdit className="w-4 h-4" />
          <span className="font-medium">Edit Invoice</span>
        </button>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => window.print()} title="Print Invoice"
            className="w-9 h-9 rounded-xl bg-white/80 dark:bg-white/[0.05] border border-neutral-200/80 dark:border-white/[0.08] flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:text-[#1a56db] active:scale-95 transition-all cursor-pointer">
            <Printer className="w-4 h-4" />
          </button>
          <button type="button" onClick={handleShareLink} title="Share Link"
            className="w-9 h-9 rounded-xl bg-white/80 dark:bg-white/[0.05] border border-neutral-200/80 dark:border-white/[0.08] flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:text-[#1a56db] active:scale-95 transition-all cursor-pointer">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          PRINTABLE INVOICE — matches uploaded design
          ═══════════════════════════════════════════════ */}
      <div
        id="printableInvoice"
        className="pdf-invoice relative w-full bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden"
        style={{ fontFamily: 'Inter, Arial, sans-serif', color: '#1e293b' }}
      >
        {/* ── HEADER ── */}
        <div className="flex items-start justify-between px-8 pt-8 pb-5">
          {/* Left: logo + name + contact */}
          <div className="flex items-center gap-3">
            {workspace.logoUrl ? (
              <div className="w-20 h-20 shrink-0 rounded-full overflow-hidden flex items-center justify-center">
                <img src={workspace.logoUrl} alt={workspace.name} className="w-full h-full rounded-full object-cover" crossOrigin="anonymous" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
                {workspace.initial}
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-bold text-xl text-slate-900 leading-tight">{workspace.name}</span>
              <span className="text-sm text-slate-500 mt-0.5">
                {workspace.website && <>{workspace.website} · </>}{workspace.email}
              </span>
            </div>
          </div>

          {/* Right: INVOICE title + status badge + number + date */}
          <div className="flex flex-col items-end">
            <span className="text-3xl font-black tracking-widest text-blue-600 uppercase leading-none">INVOICE</span>
            <span className={`mt-1.5 px-3 py-0.5 rounded-full text-xs font-semibold ${sc.badge}`}>
              {paymentStatus}
            </span>
            <span className="font-bold text-base text-slate-900 mt-2 tracking-tight">{invoice.id}</span>
            <span className="text-sm text-slate-500">{formatDisplayDate(invoice.issueDate)}</span>
          </div>
        </div>

        {/* ── DIVIDER ── */}
        <div className="mx-8 border-t-2 border-blue-600" />

        {/* ── BILLED TO + INVOICE DETAILS ── */}
        <div className="grid grid-cols-2 gap-4 px-8 py-6">
          {/* Billed To */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-blue-700 mb-2.5" style={{ color: '#1d4ed8' }}>Billed To</p>
            <p className="font-bold text-base text-slate-900 leading-snug" style={{ color: '#0f172a' }}>{invoice.clientName || '—'}</p>
            {invoice.clientCompany && <p className="text-sm text-slate-600 mt-1" style={{ color: '#475569' }}>{invoice.clientCompany}</p>}
            {invoice.clientPhone && <p className="text-sm text-slate-600 mt-1" style={{ color: '#475569' }}>{invoice.clientPhone}</p>}
            {invoice.clientEmail && <p className="text-sm text-slate-500 mt-1 break-all" style={{ color: '#334155' }}>{invoice.clientEmail}</p>}
          </div>

          {/* Invoice Details */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-blue-700 mb-2.5" style={{ color: '#1d4ed8' }}>Invoice Details</p>
            <table className="text-sm text-slate-700 w-full border-collapse" style={{ color: '#334155' }}>
              <tbody>
                <tr className="border-b border-slate-200/80">
                  <td className="pr-2 py-1.5 text-slate-500 whitespace-nowrap" style={{ color: '#475569' }}>Invoice Number</td>
                  <td className="py-1.5 text-right font-bold text-slate-900" style={{ color: '#0f172a' }}>{invoice.id}</td>
                </tr>
                <tr className="border-b border-slate-200/80">
                  <td className="pr-2 py-1.5 text-slate-500" style={{ color: '#475569' }}>Date</td>
                  <td className="py-1.5 text-right font-medium" style={{ color: '#1e293b' }}>{formatDisplayDate(invoice.issueDate)}</td>
                </tr>
                <tr>
                  <td className="pr-2 py-1.5 text-slate-500" style={{ color: '#475569' }}>Due Date</td>
                  <td className="py-1.5 text-right font-medium" style={{ color: '#1e293b' }}>{formatDisplayDate(invoice.dueDate)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── LINE ITEMS TABLE ── */}
        <div className="mx-8 mb-6 rounded-xl overflow-hidden border border-slate-200">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_80px_100px_100px] bg-blue-600 text-white text-sm font-semibold px-4 py-2.5">
            <span>Description</span>
            <span className="text-center">Quantity</span>
            <span className="text-right">Rate (₹)</span>
            <span className="text-right">Total (₹)</span>
          </div>

          {/* Table Body */}
          {invoice.items.map((item, idx) => {
            const itemTotal = (Number(item.qty) || 0) * (Number(item.rate) || 0);
            return (
              <div
                key={item.id || idx}
                className={`grid grid-cols-[1fr_80px_100px_100px] px-4 py-3 text-sm text-slate-700 ${idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}`}
                style={{ borderTop: idx > 0 ? '1px solid #e2e8f0' : undefined }}
              >
                <span className="font-medium text-slate-900">{item.desc || '—'}</span>
                <span className="text-center">{item.qty}</span>
                <span className="text-right">{(Number(item.rate) || 0).toLocaleString('en-IN')}</span>
                <span className="text-right font-medium">{Math.round(itemTotal).toLocaleString('en-IN')}</span>
              </div>
            );
          })}
        </div>

        {/* ── FINANCIAL SUMMARY ── */}
        <div className="mb-6 flex flex-col rounded-xl overflow-hidden border border-slate-200" style={{ margin: '0 2rem 1.5rem 2rem' }}>
          {/* Total row */}
          <div className="flex items-center justify-between bg-blue-50 border-b border-slate-200 px-6 py-4">
            <span className="font-bold text-lg text-slate-900">Total:</span>
            <span className="font-black text-2xl text-slate-900">{formatINR(grandTotal)}</span>
          </div>

          {/* Amount Paid */}
          <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 bg-white">
            <span className="text-slate-600 text-base">Amount Paid:</span>
            <span className="font-semibold text-base text-slate-800">{formatINR(amountPaid)}</span>
          </div>

          {/* Remaining Balance */}
          <div className="flex items-center justify-between bg-blue-50 px-6 py-4 border-b border-slate-100">
            <span className="font-bold text-blue-700 text-lg">Remaining Balance:</span>
            <span className="font-black text-3xl text-blue-700">{formatINR(remainingBalance)}</span>
          </div>

          {/* Payment Status */}
          <div className="flex items-center justify-between px-6 py-3.5 bg-white">
            <span className="text-slate-600 text-base">Payment Status:</span>
            <span className={`px-4 py-1 rounded-full text-sm font-semibold ${sc.badge}`}>{paymentStatus}</span>
          </div>
        </div>

        {/* ── QUOTE CARD ── */}
        <div
          className="mb-6 rounded-2xl overflow-hidden"
          style={{ margin: '0 2rem 1.5rem 2rem' }}
        >
          {/* Compact horizontal quote card */}
          <div
            className="flex items-center gap-4 px-5 py-4"
            style={{
              background: '#EEF5FF',
              borderRadius: '0.95rem',
            }}
          >
            {/* Quote mark */}
            <span
              className="shrink-0 select-none leading-none translate-y-1.5"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: '3.2rem',
                lineHeight: '1',
                fontWeight: 700,
                color: '#426A9A',
              }}
            >
              “
            </span>

            <div className="h-14 w-px shrink-0 bg-[#9BB7D8]" />

            {/* Quote text and centered underline */}
            <div className="min-w-0 flex-1 py-1">
              <p
                className="leading-snug text-slate-800"
                style={{
                  fontFamily: 'Arial, sans-serif',
                  fontSize: '1.05rem',
                  fontStyle: 'italic',
                  fontWeight: 500,
                  letterSpacing: '0.005em',
                }}
              >
                “Great work is a result of trust, collaboration, and a shared vision. Thank you for choosing{' '}
                <span style={{ fontStyle: 'italic', fontWeight: 800, color: '#1769C2' }}>
                  {workspace.name}
                </span>
                !”
              </p>
              <div className="mx-auto mt-3 h-0.5 w-16 rounded-full bg-[#1769C2]" />
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className="text-center pb-8" style={{ fontStyle: 'italic', color: '#64748b', fontSize: '0.95rem', letterSpacing: '0.02em' }}>
          Thank you for your business!
        </div>
      </div>

      {/* ── SHARE / EXPORT ACTION STRIP ── */}
      <div className="mt-3.5 flex flex-col gap-2 rounded-2xl bg-white/90 dark:bg-[#0f131d]/90 backdrop-blur-2xl border border-neutral-200 dark:border-white/10 p-2.5 shadow-lg no-print">
        <div className="flex items-center justify-between gap-2">
          <button type="button" onClick={handleShareWhatsApp}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-700 dark:text-teal-300 font-mono text-xs font-semibold active:scale-95 transition-all cursor-pointer">
            <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
            <span>WhatsApp</span>
          </button>
          <button type="button" onClick={handleExportPdf} disabled={exporting}
            className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 text-white font-headline font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer">
            <FileText className={`w-3.5 h-3.5 ${exporting ? 'animate-spin' : ''}`} />
            <span>{exporting ? 'Exporting...' : 'PDF'}</span>
          </button>
          <button type="button" onClick={onShowReceipt}
            className="py-2.5 px-3 rounded-xl bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 border border-neutral-200 dark:border-white/10 text-neutral-800 dark:text-white font-headline font-semibold text-xs flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer">
            <Receipt className="w-3.5 h-3.5 text-blue-600" />
            <span>Receipt</span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={handleShareEmail}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300 text-xs font-semibold active:scale-95 transition-all cursor-pointer">
            <Mail className="w-3.5 h-3.5" /><span>Email</span>
          </button>
          <button type="button" onClick={handleCopyUpi}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300 text-xs font-semibold active:scale-95 transition-all cursor-pointer">
            {copiedUpi ? <Check className="w-3.5 h-3.5 text-teal-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedUpi ? 'Copied!' : `UPI: ${workspace.upi}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
