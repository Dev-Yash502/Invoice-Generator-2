import { Workspace, Invoice } from '../types';
import * as XLSX from 'xlsx-js-style';

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

  const data = invoices.map(inv => {
    const ws = workspaces[inv.workspaceKey]?.name || inv.workspaceKey || '—';
    const total = getInvoiceTotal(inv);
    const paid = getInvoiceAmountPaid(inv, total);
    const balance = Math.max(0, total - paid);
    const status = getInvoicePaymentStatus(paid, total);
    const itemsSummary = (inv.items || [])
      .map(it => `${it.desc || 'Item'} (Qty: ${it.qty || 1}, Rate: ₹${Number(it.rate || 0).toLocaleString('en-IN')})`)
      .join('; ');

    return {
      'Invoice ID': inv.id,
      'Business Profile': ws,
      'Issue Date': inv.issueDate,
      'Due Date': inv.dueDate,
      'Client Name': inv.clientName || '—',
      'Company': inv.clientCompany || '—',
      'Phone': inv.clientPhone || '—',
      'Email': inv.clientEmail || '—',
      'Items / Services': itemsSummary,
      'Total Amount': `₹${total.toLocaleString('en-IN')}`,
      'Amount Paid': `₹${paid.toLocaleString('en-IN')}`,
      'Remaining Balance': `₹${balance.toLocaleString('en-IN')}`,
      'Payment Status': status,
    };
  });

  const ws = XLSX.utils.json_to_sheet(data);

  // Apply bold formatting and professional styling to every header cell in row 0
  const headers = Object.keys(data[0] || {});
  headers.forEach((_, colIdx) => {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: colIdx });
    if (ws[cellAddress]) {
      ws[cellAddress].s = {
        font: {
          bold: true,
          sz: 11,
          name: 'Calibri',
          color: { rgb: '0F172A' },
        },
        fill: {
          fgColor: { rgb: 'F1F5F9' },
        },
        alignment: {
          horizontal: 'center',
          vertical: 'center',
          wrapText: true,
        },
        border: {
          top: { style: 'thin', color: { rgb: 'CBD5E1' } },
          bottom: { style: 'medium', color: { rgb: '94A3B8' } },
          left: { style: 'thin', color: { rgb: 'CBD5E1' } },
          right: { style: 'thin', color: { rgb: 'CBD5E1' } },
        },
      };
    }
  });

  // Apply vertical center and clean borders to data rows
  data.forEach((_, rowIdx) => {
    headers.forEach((header, colIdx) => {
      const cellAddress = XLSX.utils.encode_cell({ r: rowIdx + 1, c: colIdx });
      if (ws[cellAddress]) {
        const isNumericCol = header.includes('Amount') || header.includes('Balance');
        ws[cellAddress].s = {
          font: {
            sz: 11,
            name: 'Calibri',
            color: { rgb: '1E293B' },
          },
          alignment: {
            vertical: 'center',
            horizontal: isNumericCol ? 'right' : header.includes('Date') || header === 'Payment Status' ? 'center' : 'left',
          },
          border: {
            top: { style: 'thin', color: { rgb: 'E2E8F0' } },
            bottom: { style: 'thin', color: { rgb: 'E2E8F0' } },
            left: { style: 'thin', color: { rgb: 'E2E8F0' } },
            right: { style: 'thin', color: { rgb: 'E2E8F0' } },
          },
        };
      }
    });
  });

  // Dynamic spacious column auto-fit with extra padding so text never cramps
  const colWidths = headers.map(header => {
    const maxValLength = Math.max(
      header.length,
      ...data.map(row => String((row as any)[header] || '').length)
    );
    return { wch: Math.min(65, Math.max(16, maxValLength + 6)) };
  });
  ws['!cols'] = colWidths;

  // Set generous row height for the header row
  ws['!rows'] = [{ hpt: 26 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Invoices');

  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `invoices-export-${dateStr}.xlsx`);
  return true;
}
