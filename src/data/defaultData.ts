import { Workspace, Invoice } from '../types';

export const FIXED_WORKSPACES: Record<string, Workspace> = {
  zen: {
    key: 'zen', name: 'Zen Webs Studio', initial: 'Z', tagline: 'Video Editing Agency',
    agencyType: 'Video Editing Agency', website: 'zenwebs.studio', email: 'contact@zenwebs.studio',
    upi: 'zenwebs@upi', icon: 'laptop_mac', logoUrl: '/logos/zen-avatar.jpeg',
  },
  'pearlio-col': {
    key: 'pearlio-col', name: 'Pearlio Collections', initial: 'P', tagline: 'Artisan Decor & Home Lifestyle',
    agencyType: 'Direct-to-Consumer Online Store', website: 'pearlio.store', email: 'hello@pearlio.store',
    upi: 'pearlio@icici', icon: 'storefront', logoUrl: '/logos/pearlio-collections-avatar.jpeg',
  },
  pearlio: {
    key: 'pearlio', name: 'Pearlio', initial: 'P', tagline: 'Multi-service Agency',
    agencyType: 'PDF Editing, Website Design & Video Editing', website: '', email: 'contact.pearlio@gmail.com',
    upi: 'yashashviraj@naviaxis', icon: 'all_inclusive', logoUrl: '/logos/pearlio.png',
  },
};

export const ZEN_VIDEO_PACKAGES = [
  { name: 'Standard', price: 599 },
  { name: 'Premium', price: 999 },
  { name: 'Advance', price: 1599 },
] as const;

export function formatINR(val: number): string {
  const rounded = Math.round(val);
  return '₹' + rounded.toLocaleString('en-IN');
}

export function formatINRWithDecimals(val: number): string {
  return '₹' + val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function getInvoiceTotal(invoice: { items: { qty: number; rate: number }[] }): number {
  return Math.round(invoice.items.reduce((sum, item) => sum + (Number(item.qty) || 0) * (Number(item.rate) || 0), 0));
}

export function getInvoiceAmountPaid(invoice: { status?: string; amountPaid?: number }, total: number): number {
  if (typeof invoice.amountPaid === 'number') return Math.min(total, Math.max(0, invoice.amountPaid));
  return invoice.status === 'Paid' ? total : 0;
}

export function getInvoicePaymentStatus(amountPaid: number, total: number): 'Paid' | 'Partially Paid' | 'Unpaid' {
  if (total > 0 && amountPaid >= total) return 'Paid';
  return amountPaid > 0 ? 'Partially Paid' : 'Unpaid';
}

export function downloadInvoicesBackup(invoices: Invoice[]) {
  const data = {
    appName: 'QuickBill',
    version: 1,
    exportedAt: new Date().toISOString(),
    totalInvoices: invoices.length,
    invoices,
  };
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `quickbill-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function restoreInvoicesBackup(
  file: File,
  onSuccess: (invoices: Invoice[]) => void,
  onError: (err: string) => void
) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target?.result as string);
      let list: Invoice[] = [];
      if (Array.isArray(parsed)) {
        list = parsed;
      } else if (parsed && Array.isArray(parsed.invoices)) {
        list = parsed.invoices;
      } else {
        throw new Error('Invalid backup file format');
      }
      const valid = list.filter(i => i && typeof i.id === 'string' && Array.isArray(i.items));
      if (valid.length === 0 && list.length > 0) {
        throw new Error('No valid invoice records found in backup file');
      }
      onSuccess(valid);
    } catch (err: any) {
      onError(err.message || 'Failed to parse backup file');
    }
  };
  reader.onerror = () => onError('Failed to read backup file');
  reader.readAsText(file);
}

export function exportInvoicesToExcel(invoices: Invoice[], workspaces: Record<string, Workspace>): boolean {
  if (invoices.length === 0) return false;

  const headers = [
    'Invoice ID',
    'Business / Workspace',
    'Issue Date',
    'Due Date',
    'Client Name',
    'Client Company',
    'Client Phone',
    'Client Email',
    'Items Summary',
    'Total Amount (₹)',
    'Amount Paid (₹)',
    'Remaining Balance (₹)',
    'Payment Status'
  ];

  const escapeCsv = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = invoices.map(inv => {
    const ws = workspaces[inv.workspaceKey]?.name || inv.workspaceKey || '—';
    const total = getInvoiceTotal(inv);
    const paid = getInvoiceAmountPaid(inv, total);
    const balance = Math.max(0, total - paid);
    const status = getInvoicePaymentStatus(paid, total);
    const itemsSummary = (inv.items || [])
      .map(it => `${it.desc || 'Item'} (Qty: ${it.qty || 1}, Rate: ₹${it.rate || 0})`)
      .join('; ');

    return [
      escapeCsv(inv.id),
      escapeCsv(ws),
      escapeCsv(inv.issueDate),
      escapeCsv(inv.dueDate),
      escapeCsv(inv.clientName),
      escapeCsv(inv.clientCompany || ''),
      escapeCsv(inv.clientPhone || ''),
      escapeCsv(inv.clientEmail || ''),
      escapeCsv(itemsSummary),
      escapeCsv(total),
      escapeCsv(paid),
      escapeCsv(balance),
      escapeCsv(status)
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `invoices-export-${dateStr}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}
