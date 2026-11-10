import React, { useState } from 'react';
import { 
  Plus,
  MoreVertical, 
  Search, 
  Building,
  Store,
  Infinity as InfinityIcon,
  Laptop
} from 'lucide-react';
import { Workspace, Invoice } from '../types';
import { formatINR, getInvoiceAmountPaid, getInvoicePaymentStatus, getInvoiceTotal } from '../data/defaultData';

interface DashboardViewProps {
  workspaces: Record<string, Workspace>;
  activeWorkspaceKey: string;
  onSelectWorkspace: (key: string) => void;
  invoices: Invoice[];
  onOpenNewInvoice: () => void;
  onPreviewInvoice: (invoice: Invoice) => void;
  onUpdateInvoicePayment: (invoiceId: string, amountPaid: number) => void;
  onOpenSettings: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  workspaces,
  activeWorkspaceKey,
  onSelectWorkspace,
  invoices,
  onOpenNewInvoice,
  onPreviewInvoice,
  onUpdateInvoicePayment,
  onOpenSettings,
}) => {
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Partially Paid' | 'Unpaid'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const activeWorkspace = workspaces[activeWorkspaceKey] || Object.values(workspaces)[0];
  const workspaceInvoices = invoices.filter(inv => inv.workspaceKey === activeWorkspaceKey);

  const filteredInvoices = workspaceInvoices.filter(inv => {
    const total = getInvoiceTotal(inv);
    const paid = getInvoiceAmountPaid(inv, total);
    const matchesFilter = statusFilter === 'All' || getInvoicePaymentStatus(paid, total) === statusFilter;
    const matchesSearch = 
      inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.items.some(it => it.desc.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  // Calculate totals for active workspace
  const totalAmount = workspaceInvoices.reduce((sum, inv) => sum + getInvoiceTotal(inv), 0);
  const paidAmount = workspaceInvoices.reduce((sum, inv) => sum + getInvoiceAmountPaid(inv, getInvoiceTotal(inv)), 0);

  const pendingAmount = totalAmount - paidAmount;

  // Icon resolver
  const renderWorkspaceIcon = (key: string, className = 'w-4 h-4') => {
    if (key === 'zen') return <Laptop className={className} />;
    if (key === 'pearlio-col') return <Store className={className} />;
    if (key === 'pearlio') return <InfinityIcon className={className} />;
    return <Building className={className} />;
  };

  return (
    <div className="flex flex-col w-full pb-8 pt-2 space-y-3.5">
      {/* 1. Workspace Pill Switcher Strip */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        {Object.values(workspaces).map(ws => {
          const isSelected = ws.key === activeWorkspaceKey;
          return (
            <button
              key={ws.key}
              onClick={() => onSelectWorkspace(ws.key)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${
                isSelected
                  ? 'bg-[#635bff] text-white shadow-md shadow-[#635bff]/25 font-semibold dark:bg-[#00f0ff] dark:text-[#002022] dark:shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                  : 'bg-white/80 dark:bg-white/[0.05] border border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white shadow-sm font-medium'
              }`}
            >
              {ws.logoUrl ? (
                <img
                  src={ws.logoUrl}
                  alt={ws.name}
                  className="w-3.5 h-3.5 rounded-full object-cover shrink-0 border border-black/10 dark:border-white/20"
                />
              ) : (
                renderWorkspaceIcon(ws.key, 'w-3.5 h-3.5')
              )}
              <span>{ws.name}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Active Company Profile Card */}
      {activeWorkspace ? <section className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-white/[0.05] border border-black/[0.05] dark:border-white/10 backdrop-blur-xl shadow-sm p-4 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#635bff]/20 via-[#635bff]/10 to-transparent dark:from-[#00f0ff]/20 dark:via-[#571bc1]/20 border border-[#635bff]/30 dark:border-[#00f0ff]/40 flex items-center justify-center shadow-inner overflow-hidden text-[#635bff] dark:text-[#00f0ff] shrink-0">
              {activeWorkspace.logoUrl ? (
                <img
                  src={activeWorkspace.logoUrl}
                  alt={activeWorkspace.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                renderWorkspaceIcon(activeWorkspace.key, 'w-6 h-6')
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <h2 className="font-headline font-bold text-base text-neutral-900 dark:text-white truncate">
                {activeWorkspace.name}
              </h2>
              <p className="font-mono text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                {activeWorkspace.website || 'Workspace details not added'}
              </p>
            </div>
          </div>
          <button
            onClick={onOpenSettings}
            className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
            title="Settings"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Mini stats row */}
        <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-neutral-200/60 dark:border-white/[0.06]">
          <div className="flex flex-col">
            <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">Total</span>
            <span className="font-headline font-bold text-sm text-neutral-900 dark:text-white mt-0.5">
              {workspaceInvoices.length ? formatINR(totalAmount) : '—'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[10px] text-teal-600 dark:text-emerald-400 uppercase tracking-wider">Settled</span>
            <span className="font-headline font-bold text-sm text-teal-600 dark:text-emerald-400 mt-0.5">
              {workspaceInvoices.length ? formatINR(paidAmount) : '—'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[10px] text-[#635bff] dark:text-[#00f0ff] uppercase tracking-wider">Pending</span>
            <span className="font-headline font-bold text-sm text-[#635bff] dark:text-[#00f0ff] mt-0.5">
              {workspaceInvoices.length ? formatINR(pendingAmount) : '—'}
            </span>
          </div>
        </div>
      </section> : null}

      {/* 3. Invoices Section */}
      <div className="flex flex-col space-y-2 pt-1">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h3 className="font-headline font-bold text-base text-neutral-900 dark:text-white">
              Invoices
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-neutral-200/60 dark:bg-white/[0.08] text-neutral-600 dark:text-neutral-300 font-mono text-[10px] font-semibold">
              {workspaceInvoices.length}
            </span>
          </div>
          <button
            onClick={onOpenNewInvoice}
            className="px-3 py-1.5 rounded-xl bg-[#635bff] dark:bg-[#00f0ff] text-white dark:text-[#002022] font-headline font-bold text-xs flex items-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Bill</span>
          </button>
        </div>

        {/* Search & Status Pill Filters */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search invoices..."
              className="w-full bg-white/70 dark:bg-[#111624]/70 border border-neutral-200/80 dark:border-white/[0.08] rounded-xl pl-8 pr-3 py-1.5 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none focus:border-[#635bff] dark:focus:border-[#00f0ff]"
            />
          </div>

          <div className="flex items-center p-0.5 bg-neutral-200/70 dark:bg-black/30 rounded-xl">
            {(['All', 'Paid', 'Partially Paid', 'Unpaid'] as const).map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium transition-all ${
                  statusFilter === f
                    ? 'bg-white dark:bg-[#1a2030] text-neutral-900 dark:text-white shadow-sm font-semibold'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Invoices List */}
        <div className="flex flex-col space-y-2 pt-1">
          {filteredInvoices.length === 0 ? (
            <div className="rounded-2xl bg-white/50 dark:bg-white/[0.02] border border-dashed border-neutral-300 dark:border-white/10 p-6 text-center flex flex-col items-center justify-center">
              <p className="font-headline font-semibold text-xs text-neutral-500 dark:text-neutral-400">
                {workspaceInvoices.length === 0 ? 'No invoices yet' : 'No invoices match your search'}
              </p>
            </div>
          ) : (
            filteredInvoices.map(inv => {
              const grand = getInvoiceTotal(inv);
              const paid = getInvoiceAmountPaid(inv, grand);
              const balance = Math.max(0, grand - paid);
              const status = getInvoicePaymentStatus(paid, grand);
              const badgeClass = status === 'Paid'
                ? 'bg-teal-500/15 dark:bg-emerald-500/15 border-teal-500/30 text-teal-700 dark:text-emerald-400'
                : status === 'Partially Paid'
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-300'
                  : 'bg-[#635bff]/10 dark:bg-purple-500/15 border-[#635bff]/20 dark:border-purple-400/30 text-[#635bff] dark:text-purple-300';
              const mainDesc = inv.items[0]?.desc || 'Services';

              return (
                <div
                  key={inv.id}
                  onClick={() => onPreviewInvoice(inv)}
                  className="group relative rounded-2xl bg-white/80 dark:bg-white/[0.04] border border-neutral-200/80 dark:border-white/10 hover:border-[#635bff]/50 dark:hover:border-[#00f0ff]/50 backdrop-blur-md p-3.5 shadow-sm active:scale-[0.99] transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-semibold text-[#635bff] dark:text-[#00f0ff] tracking-tight">
                          {inv.id}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-white/20" />
                        <span className="text-[11px] text-neutral-400 font-mono">
                          {inv.issueDate}
                        </span>
                      </div>
                      <h4 className="font-headline font-semibold text-sm text-neutral-900 dark:text-white truncate mt-1">
                        {inv.clientName}
                      </h4>
                      <span className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                        {mainDesc}
                      </span>
                    </div>

                    <div className="flex flex-col items-end flex-shrink-0">
                      <span className="font-headline font-bold text-base text-neutral-900 dark:text-white tracking-tight">
                        {formatINR(grand)}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const entered = window.prompt(`Amount paid so far (total ${formatINR(grand)}):`, String(paid));
                          if (entered === null) return;
                          const nextPaid = Number(entered);
                          if (!Number.isFinite(nextPaid) || nextPaid < 0 || nextPaid > grand) {
                            window.alert(`Enter an amount from ₹0 to ${formatINR(grand)}.`);
                            return;
                          }
                          onUpdateInvoicePayment(inv.id, nextPaid);
                        }}
                        title="Update payment amount"
                        className={`mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border ${badgeClass} font-mono text-[10px] font-semibold hover:opacity-85 transition-opacity`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            status === 'Paid'
                              ? 'bg-teal-500 dark:bg-emerald-400'
                              : status === 'Partially Paid' ? 'bg-amber-500' : 'bg-[#635bff] dark:bg-purple-400'
                          }`}
                        />
                        <span>{status}</span>
                      </button>
                      <span className="mt-1 text-[10px] text-neutral-500 font-mono">Paid {formatINR(paid)} · Due {formatINR(balance)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
