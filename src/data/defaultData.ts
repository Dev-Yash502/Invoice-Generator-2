import { Workspace } from '../types';

export const FIXED_WORKSPACES: Record<string, Workspace> = {
  zen: {
    key: 'zen', name: 'Zen Webs Studio', initial: 'Z', tagline: 'Video Editing Agency',
    agencyType: 'Video Editing Agency', website: 'zenwebs.io', email: 'contact@zenwebs.io',
    upi: 'zenwebs@upi', icon: 'laptop_mac', logoUrl: '/logos/zen%20webs.jpg',
  },
  'pearlio-col': {
    key: 'pearlio-col', name: 'Pearlio Collections', initial: 'P', tagline: 'Artisan Decor & Home Lifestyle',
    agencyType: 'Direct-to-Consumer Online Store', website: 'pearlio.store', email: 'hello@pearlio.store',
    upi: 'pearlio@icici', icon: 'storefront', logoUrl: '/logos/pearlio%20collections.png',
  },
  pearlio: {
    key: 'pearlio', name: 'Pearlio', initial: 'P', tagline: 'Multi-service Agency',
    agencyType: 'PDF Editing, Website Design & Video Editing', website: 'pearlio.global', email: 'advisory@pearlio.global',
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
