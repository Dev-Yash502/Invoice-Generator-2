import React, { useState } from 'react';
import { 
  ArrowRightLeft, 
  ReceiptText, 
  RotateCw, 
  BadgeCheck, 
  Contact, 
  User, 
  Phone, 
  Mail, 
  Layers, 
  Trash2, 
  PlusCircle, 
  Calculator, 
  Eye, 
  CheckCircle2,
  Building2
} from 'lucide-react';
import { Workspace, Invoice, LineItem, ClientPreset } from '../types';
import { formatINR, getInvoiceAmountPaid, getInvoicePaymentStatus, ZEN_VIDEO_PACKAGES } from '../data/defaultData';

interface EditorViewProps {
  workspaces: Record<string, Workspace>;
  activeWorkspaceKey: string;
  onSelectWorkspace: (key: string) => void;
  invoice: Invoice;
  clients: ClientPreset[];
  onUpdateInvoice: (updated: Invoice) => void;
  onPreview: () => void;
}

export const EditorView: React.FC<EditorViewProps> = ({
  workspaces,
  activeWorkspaceKey,
  onSelectWorkspace,
  invoice,
  clients,
  onUpdateInvoice,
  onPreview,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [directoryModalOpen, setDirectoryModalOpen] = useState(false);

  const activeWs = workspaces[activeWorkspaceKey] || Object.values(workspaces)[0];
  if (!activeWs) return null;

  // Calculations
  const subtotal = invoice.items.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.rate) || 0), 0);
  const grandTotal = Math.round(subtotal);
  const amountPaid = getInvoiceAmountPaid(invoice, grandTotal);
  const remainingBalance = Math.max(0, grandTotal - amountPaid);
  const paymentError = amountPaid > grandTotal ? 'Advance payment cannot exceed the total amount.' : '';
  const paymentStatus = getInvoicePaymentStatus(Math.min(amountPaid, grandTotal), grandTotal);

  // Actions
  const handleRegenerateId = () => {
    const rnd = Math.floor(100 + Math.random() * 900);
    onUpdateInvoice({
      ...invoice,
      id: `INV-${new Date().getFullYear()}-${rnd}`,
    });
  };

  const handleApplyClient = (client: ClientPreset) => {
    onUpdateInvoice({ ...invoice, clientName: client.name, clientCompany: client.company || '', clientPhone: client.phone, clientEmail: client.email, clientAvatar: client.avatar || '' });
    setDirectoryModalOpen(false);
  };

  const handleUpdateItem = (index: number, partial: Partial<LineItem>) => {
    const newItems = [...invoice.items];
    newItems[index] = { ...newItems[index], ...partial };
    onUpdateInvoice({ ...invoice, items: newItems });
  };

  const handleAdjustQty = (index: number, delta: number) => {
    const current = invoice.items[index].qty || 1;
    const next = Math.max(1, current + delta);
    handleUpdateItem(index, { qty: next });
  };

  const handleAddItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      desc: '',
      notes: '',
      qty: 1,
      rate: 0,
    };
    onUpdateInvoice({
      ...invoice,
      items: [...invoice.items, newItem],
    });
  };

  const handleDeleteItem = (index: number) => {
    if (invoice.items.length <= 1) return;
    const newItems = invoice.items.filter((_, i) => i !== index);
    onUpdateInvoice({ ...invoice, items: newItems });
  };

  const handleSelectZenPackage = (pkg: typeof ZEN_VIDEO_PACKAGES[number]) => {
    onUpdateInvoice({
      ...invoice,
      items: [{ id: invoice.items[0]?.id || Date.now().toString(), desc: pkg.name, notes: '', qty: 1, rate: pkg.price }],
    });
  };

  return (
    <div className="flex flex-col w-full pb-28 pt-2">
      {/* 1. Billing Entity Banner / Switcher */}
      <section className="mb-3.5">
        <div
          onClick={() => setDrawerOpen(!drawerOpen)}
          className="bg-white/80 dark:bg-white/[0.04] border border-neutral-200/70 dark:border-white/[0.08] backdrop-blur-xl rounded-2xl p-3 shadow-sm flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#635bff] to-purple-600 dark:from-[#571bc1] dark:to-[#00f0ff] p-[1.5px] shadow-sm shrink-0 overflow-hidden">
              {activeWs.logoUrl ? (
                <img
                  src={activeWs.logoUrl}
                  alt={activeWs.name}
                  className="w-full h-full rounded-[9px] object-cover"
                />
              ) : (
                <div className="w-full h-full bg-white dark:bg-[#0f131d] rounded-[9px] flex items-center justify-center text-[#635bff] dark:text-[#00f0ff] font-headline font-bold text-base">
                  {activeWs.initial}
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-headline font-bold text-sm text-neutral-900 dark:text-white truncate">
                {activeWs.name}
              </span>
              <span className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                {activeWs.website || 'Workspace details not added'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-100 dark:bg-white/[0.06] text-[#635bff] dark:text-[#00f0ff] font-mono text-xs font-medium">
            <span>Swap</span>
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Quick Swap Tray */}
        {drawerOpen && (
          <div className="mt-2 p-2 bg-white/95 dark:bg-[#0f131d]/95 backdrop-blur-2xl border border-neutral-200 dark:border-white/10 rounded-2xl shadow-xl flex flex-col gap-1 transition-all">
            <div className="p-1.5 text-neutral-400 font-mono text-[10px] font-semibold uppercase tracking-wider">
              Switch Entity
            </div>
            {Object.values(workspaces).map(ws => {
              const isCurrent = ws.key === activeWorkspaceKey;
              return (
                <button
                  key={ws.key}
                  type="button"
                  onClick={() => {
                    onSelectWorkspace(ws.key);
                    setDrawerOpen(false);
                  }}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/5 text-left transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {ws.logoUrl ? (
                      <img
                        src={ws.logoUrl}
                        alt={ws.name}
                        className="w-7 h-7 rounded-lg object-cover shrink-0 border border-black/10 dark:border-white/20"
                      />
                    ) : (
                      <span className="w-7 h-7 rounded-lg bg-[#635bff]/15 text-[#635bff] dark:text-[#00f0ff] flex items-center justify-center font-bold text-xs shrink-0">
                        {ws.initial}
                      </span>
                    )}
                    <div>
                      <p className="font-headline font-semibold text-xs text-neutral-900 dark:text-white">
                        {ws.name}
                      </p>
                      <p className="text-[10px] text-neutral-500">{ws.tagline}</p>
                    </div>
                  </div>
                  {isCurrent && (
                    <BadgeCheck className="w-5 h-5 text-[#635bff] dark:text-[#00f0ff]" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* 2. Invoice Details Section */}
      <section className="bg-white/80 dark:bg-white/[0.04] border border-neutral-200/70 dark:border-white/[0.08] backdrop-blur-xl rounded-2xl p-4 shadow-sm mb-3.5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-[#635bff] dark:text-[#00f0ff]" />
            <h2 className="font-headline font-bold text-sm text-neutral-900 dark:text-white">
              Invoice Details
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-teal-500/15 dark:bg-emerald-500/15 border border-teal-500/30 text-teal-700 dark:text-emerald-400 font-mono text-[10px] font-semibold uppercase tracking-wider">
            {paymentStatus}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block font-mono text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">
              Invoice Number
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={invoice.id}
                onChange={e => onUpdateInvoice({ ...invoice, id: e.target.value })}
                className="w-full bg-neutral-100/80 dark:bg-[#171b26]/80 border border-neutral-200/80 dark:border-white/[0.08] focus:border-[#635bff] dark:focus:border-[#00f0ff]/60 rounded-xl px-3 py-2 text-neutral-900 dark:text-white font-mono text-sm outline-none transition-all"
              />
              <button
                type="button"
                onClick={handleRegenerateId}
                title="Regenerate Sequence"
                className="absolute right-2.5 text-neutral-400 hover:text-[#635bff] dark:hover:text-[#00f0ff] p-1"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block font-mono text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">
              Issue Date
            </label>
            <input
              type="date"
              value={invoice.issueDate}
              onChange={e => onUpdateInvoice({ ...invoice, issueDate: e.target.value })}
              className="w-full bg-neutral-100/80 dark:bg-[#171b26]/80 border border-neutral-200/80 dark:border-white/[0.08] focus:border-[#635bff] dark:focus:border-[#00f0ff]/60 rounded-xl px-2.5 py-2 text-neutral-900 dark:text-white font-mono text-xs outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={invoice.dueDate}
              onChange={e => onUpdateInvoice({ ...invoice, dueDate: e.target.value })}
              className="w-full bg-neutral-100/80 dark:bg-[#171b26]/80 border border-neutral-200/80 dark:border-white/[0.08] focus:border-[#635bff] dark:focus:border-[#00f0ff]/60 rounded-xl px-2.5 py-2 text-neutral-900 dark:text-white font-mono text-xs outline-none"
            />
          </div>
        </div>
      </section>

      {/* 3. Customer Details Section */}
      <section className="bg-white/80 dark:bg-white/[0.04] border border-neutral-200/70 dark:border-white/[0.08] backdrop-blur-xl rounded-2xl p-4 shadow-sm mb-3.5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#635bff] dark:text-[#00f0ff]" />
            <h2 className="font-headline font-bold text-sm text-neutral-900 dark:text-white">
              Client
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setDirectoryModalOpen(true)}
            className="text-[#635bff] dark:text-[#00f0ff] hover:underline flex items-center gap-1 font-mono text-[11px] font-medium"
          >
            <Contact className="w-3.5 h-3.5" />
            <span>Directory</span>
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          <div>
            <label className="block font-mono text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">
              Client Name
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-neutral-400 absolute left-3" />
              <input
                type="text"
                value={invoice.clientName}
                onChange={e => onUpdateInvoice({ ...invoice, clientName: e.target.value })}
                placeholder="Client Name"
                className="w-full bg-neutral-100/80 dark:bg-[#171b26]/80 border border-neutral-200/80 dark:border-white/[0.08] rounded-xl pl-9 pr-3 py-2 text-neutral-900 dark:text-white text-xs outline-none focus:border-[#635bff] dark:focus:border-[#00f0ff]/60"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-mono text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">
                Phone
              </label>
              <div className="relative flex items-center">
                <Phone className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5" />
                <input
                  type="tel"
                  value={invoice.clientPhone}
                  onChange={e => onUpdateInvoice({ ...invoice, clientPhone: e.target.value })}
                  placeholder="Phone number"
                  className="w-full bg-neutral-100/80 dark:bg-[#171b26]/80 border border-neutral-200/80 dark:border-white/[0.08] rounded-xl pl-8 pr-2 py-2 text-neutral-900 dark:text-white font-mono text-xs outline-none focus:border-[#635bff] dark:focus:border-[#00f0ff]/60"
                />
              </div>
            </div>
            <div>
              <label className="block font-mono text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">
                Email
              </label>
              <div className="relative flex items-center">
                <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5" />
                <input
                  type="email"
                  value={invoice.clientEmail}
                  onChange={e => onUpdateInvoice({ ...invoice, clientEmail: e.target.value })}
                  placeholder="Email address"
                  className="w-full bg-neutral-100/80 dark:bg-[#171b26]/80 border border-neutral-200/80 dark:border-white/[0.08] rounded-xl pl-8 pr-2 py-2 text-neutral-900 dark:text-white font-mono text-xs outline-none focus:border-[#635bff] dark:focus:border-[#00f0ff]/60"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-mono text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">
              Company Name
            </label>
            <div className="relative flex items-center">
              <Building2 className="w-4 h-4 text-neutral-400 absolute left-3" />
              <input
                type="text"
                value={invoice.clientCompany || ''}
                onChange={e => onUpdateInvoice({ ...invoice, clientCompany: e.target.value })}
                placeholder="Company Name"
                className="w-full bg-neutral-100/80 dark:bg-[#171b26]/80 border border-neutral-200/80 dark:border-white/[0.08] rounded-xl pl-9 pr-3 py-2 text-neutral-900 dark:text-white text-xs outline-none focus:border-[#635bff] dark:focus:border-[#00f0ff]/60"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Items Section */}
      <section className="mb-3.5">
        {activeWs.key === 'zen' && (
          <div className="mb-3 rounded-2xl bg-white/80 dark:bg-white/[0.04] border border-neutral-200/70 dark:border-white/[0.08] p-3.5">
            <h3 className="font-headline font-bold text-sm text-neutral-900 dark:text-white mb-2">Video Editing Packages</h3>
            <div className="grid grid-cols-3 gap-2">
              {ZEN_VIDEO_PACKAGES.map(pkg => {
                const selected = invoice.items.length === 1 && invoice.items[0].desc === pkg.name && invoice.items[0].rate === pkg.price;
                return (
                  <button
                    key={pkg.name}
                    type="button"
                    onClick={() => handleSelectZenPackage(pkg)}
                    className={`rounded-xl border px-2 py-2 text-left transition-colors ${selected ? 'border-[#635bff] dark:border-[#00f0ff] bg-[#635bff]/10 dark:bg-[#00f0ff]/10' : 'border-neutral-200 dark:border-white/10'}`}
                  >
                    <span className="block text-xs font-semibold text-neutral-900 dark:text-white">{pkg.name}</span>
                    <span className="block font-mono text-xs text-[#635bff] dark:text-[#00f0ff]">{formatINR(pkg.price)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#635bff] dark:text-[#00f0ff]" />
            <h2 className="font-headline font-bold text-sm text-neutral-900 dark:text-white">
              Items
            </h2>
          </div>
          <span className="font-mono text-[11px] text-[#635bff] dark:text-[#00f0ff] bg-[#635bff]/10 dark:bg-[#00f0ff]/10 border border-[#635bff]/20 dark:border-[#00f0ff]/20 px-2 py-0.5 rounded-full font-medium">
            {invoice.items.length}
          </span>
        </div>

        {/* Editable Items Container */}
        <div className="flex flex-col gap-2.5">
          {invoice.items.map((item, index) => {
            const itemRowTotal = (item.qty || 0) * (item.rate || 0);

            return (
              <div
                key={item.id || index}
                className="relative bg-white/85 dark:bg-white/[0.04] border border-neutral-200/80 dark:border-white/[0.08] backdrop-blur-xl rounded-2xl p-3.5 shadow-sm overflow-hidden"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 pl-1">
                    <input
                      type="text"
                      value={item.desc}
                      onChange={e => handleUpdateItem(index, { desc: e.target.value })}
                      readOnly={activeWs.key === 'zen'}
                      className="w-full bg-transparent font-headline font-semibold text-sm text-neutral-900 dark:text-white outline-none placeholder:text-neutral-400"
                      placeholder="Work / Service Description"
                    />
                    <input
                      type="text"
                      value={item.notes}
                      onChange={e => handleUpdateItem(index, { notes: e.target.value })}
                      className="w-full bg-transparent text-[11px] text-neutral-500 dark:text-neutral-400 outline-none mt-0.5 placeholder:text-neutral-400"
                      placeholder="Notes (optional)"
                    />
                  </div>
                  {invoice.items.length > 1 && activeWs.key !== 'zen' && (
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(index)}
                      title="Delete Line Item"
                      className="text-neutral-400 hover:text-red-500 p-1 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-12 gap-2 pt-2 items-center bg-neutral-100/70 dark:bg-[#171b26]/70 border border-neutral-200/60 dark:border-white/[0.05] rounded-xl p-2">
                  <div className="col-span-4 flex flex-col">
                    <span className="font-mono text-[9px] text-neutral-500 dark:text-neutral-400 mb-0.5">
                      Qty
                    </span>
                    <div className="flex items-center bg-white dark:bg-[#0a0e18] rounded-lg p-0.5 border border-neutral-200/60 dark:border-white/[0.08]">
                      <button
                        type="button"
                        onClick={() => handleAdjustQty(index, -1)}
                        disabled={activeWs.key === 'zen'}
                        className="w-5 h-5 flex items-center justify-center text-[#635bff] dark:text-[#00f0ff] font-bold active:scale-90"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onFocus={e => e.currentTarget.select()}
                        onChange={e => handleUpdateItem(index, { qty: Math.max(1, parseInt(e.target.value) || 1) })}
                        readOnly={activeWs.key === 'zen'}
                        className="w-full text-center bg-transparent font-mono text-xs text-neutral-900 dark:text-white font-semibold outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleAdjustQty(index, 1)}
                        disabled={activeWs.key === 'zen'}
                        className="w-5 h-5 flex items-center justify-center text-[#635bff] dark:text-[#00f0ff] font-bold active:scale-90"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="col-span-4 flex flex-col">
                    <span className="font-mono text-[9px] text-neutral-500 dark:text-neutral-400 mb-0.5">
                      Price / Amount (₹)
                    </span>
                    <div className="flex items-center bg-white dark:bg-[#0a0e18] rounded-lg px-2 py-1 border border-neutral-200/60 dark:border-white/[0.08]">
                      <span className="text-[#635bff] dark:text-[#00f0ff] font-mono text-xs mr-0.5">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="500"
                        value={item.rate}
                        onFocus={e => e.currentTarget.select()}
                        onChange={e => handleUpdateItem(index, { rate: Math.max(0, parseFloat(e.target.value) || 0) })}
                        readOnly={activeWs.key === 'zen'}
                        className="w-full bg-transparent font-mono text-xs text-neutral-900 dark:text-white font-semibold outline-none"
                      />
                    </div>
                  </div>

                  <div className="col-span-4 flex flex-col text-right">
                    <span className="font-mono text-[9px] text-neutral-500 dark:text-neutral-400 mb-0.5">
                      Amount
                    </span>
                    <span className="font-mono text-xs font-bold text-neutral-900 dark:text-white py-1">
                      {formatINR(itemRowTotal)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Line Item Button */}
        {activeWs.key !== 'zen' && <button
          type="button"
          onClick={handleAddItem}
          className="w-full mt-2.5 py-2.5 px-3 rounded-xl bg-white/70 dark:bg-white/[0.03] hover:bg-white dark:hover:bg-white/[0.06] border border-dashed border-[#635bff]/40 dark:border-[#00f0ff]/40 text-[#635bff] dark:text-[#00f0ff] font-mono text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.99] transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Line Item</span>
        </button>}
      </section>

      {/* 5. Payment Summary Card */}
      <section className="bg-white/90 dark:bg-white/[0.04] border border-neutral-200/80 dark:border-white/10 backdrop-blur-xl rounded-2xl p-4 shadow-sm mb-4 relative overflow-hidden">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-teal-600 dark:text-[#00f0ff]" />
            <h3 className="font-headline font-bold text-sm text-neutral-900 dark:text-white">
              Summary
            </h3>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {/* Subtotal */}
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
            <span>Subtotal</span>
            <span className="font-mono text-neutral-900 dark:text-white font-semibold">
              {formatINR(subtotal)}
            </span>
          </div>

          <div className="h-px w-full bg-neutral-200/70 dark:bg-white/10 my-1" />

          <label className="flex flex-col gap-1 text-xs text-neutral-600 dark:text-neutral-300">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider">Advance Payment (optional)</span>
            <div className="flex items-center rounded-xl bg-neutral-100/80 dark:bg-[#171b26]/80 border border-neutral-200/80 dark:border-white/[0.08] px-3 py-2 focus-within:border-[#635bff] dark:focus-within:border-[#00f0ff]/60">
              <span className="font-mono text-[#635bff] dark:text-[#00f0ff] mr-1">₹</span>
              <input
                type="number"
                min="0"
                step="1"
                value={amountPaid}
                onFocus={e => e.currentTarget.select()}
                onChange={e => onUpdateInvoice({ ...invoice, amountPaid: Math.max(0, Number(e.target.value) || 0) })}
                className="w-full bg-transparent font-mono text-sm font-semibold text-neutral-900 dark:text-white outline-none"
                aria-invalid={Boolean(paymentError)}
              />
            </div>
            {paymentError && <span role="alert" className="text-red-600 dark:text-red-400">{paymentError}</span>}
          </label>

          {/* Total Payable */}
          <div className="flex items-baseline justify-between pt-0.5">
            <span className="font-headline font-bold text-sm text-neutral-900 dark:text-white">
              Total
            </span>
            <div className="text-right">
              <span className="font-headline font-bold text-2xl text-[#635bff] dark:text-[#00f0ff] tracking-tight">
                {formatINR(grandTotal)}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
            <span>Amount Paid</span><span className="font-mono font-semibold text-neutral-900 dark:text-white">{formatINR(amountPaid)}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
            <span>Remaining Balance</span><span className="font-mono font-semibold text-neutral-900 dark:text-white">{formatINR(remainingBalance)}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
            <span>Payment Status</span><span className="font-mono font-semibold text-[#635bff] dark:text-[#00f0ff]">{paymentStatus}</span>
          </div>
        </div>
      </section>

      {/* 6. Sticky Bottom CTA in Editor */}
      <div
        className="fixed left-0 right-0 p-3 bg-white/95 dark:bg-[#0a0e18]/95 backdrop-blur-2xl border-t border-neutral-200/80 dark:border-white/[0.08] z-50 max-w-[580px] mx-auto no-print"
        style={{ bottom: 'calc(4rem + max(env(safe-area-inset-bottom, 0px), 16px))' }}
      >
        <button
          type="button"
          onClick={onPreview}
          disabled={Boolean(paymentError)}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#635bff] to-[#493ee5] dark:from-[#00f0ff] dark:via-[#00f0ff] dark:to-[#571bc1] text-white dark:text-[#002022] font-headline font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#635bff]/30 dark:shadow-[0_0_24px_rgba(0,240,255,0.45)] active:scale-[0.98] transition-all pulse-cta-light dark:pulse-cta-dark cursor-pointer"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>Save Bill</span>
        </button>
      </div>

      {/* Directory Modal for Client Selection */}
      {directoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#111624] border border-neutral-200 dark:border-white/10 p-4 shadow-2xl flex flex-col gap-3 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200/60 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Contact className="w-5 h-5 text-[#635bff] dark:text-[#00f0ff]" />
                <h3 className="font-headline font-bold text-sm text-neutral-900 dark:text-white">
                  Client Directory
                </h3>
              </div>
              <button
                onClick={() => setDirectoryModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-800 dark:hover:text-white text-xs font-mono"
              >
                Close
              </button>
            </div>

            {clients.length === 0 ? (
              <div className="py-6 text-center text-xs text-neutral-500 dark:text-neutral-400">No saved clients yet</div>
            ) : clients.map(client => (
              <button key={client.name.toLowerCase()} type="button" onClick={() => handleApplyClient(client)} className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/5 text-left transition-colors">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-white/10 flex items-center justify-center font-bold text-xs text-neutral-700 dark:text-neutral-200 shrink-0">{client.name.charAt(0)}</div>
                <div className="min-w-0"><p className="font-headline font-semibold text-xs text-neutral-900 dark:text-white truncate">{client.name}</p><p className="text-[10px] text-neutral-500 truncate">{client.company || client.email}</p><p className="font-mono text-[10px] text-neutral-400 truncate mt-0.5">{client.phone}</p></div>
              </button>
            ))}

          </div>
        </div>
      )}
    </div>
  );
};
