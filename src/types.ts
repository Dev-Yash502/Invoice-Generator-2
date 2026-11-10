export interface LineItem {
  id: string;
  desc: string;
  notes: string;
  qty: number;
  rate: number;
}

export interface Invoice {
  id: string;
  issueDate: string;
  dueDate: string;
  clientName: string;
  clientCompany?: string;
  clientPhone: string;
  clientEmail: string;
  clientAvatar?: string;
  items: LineItem[];
  status: 'Paid' | 'Partially Paid' | 'Unpaid' | 'Pending' | 'Draft';
  amountPaid?: number;
  workspaceKey: string;
  currency?: string;
}

export interface Workspace {
  key: string;
  name: string;
  initial: string;
  tagline: string;
  agencyType: string; // e.g. "100% Online / Remote Agency"
  website: string;
  gstin?: string;
  email: string;
  upi: string;
  icon: string; // icon name
  logoUrl?: string;
}

export interface ClientPreset {
  name: string;
  phone: string;
  email: string;
  company?: string;
  avatar?: string;
}
