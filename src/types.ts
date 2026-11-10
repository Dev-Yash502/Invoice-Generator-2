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
  gstEnabled: boolean;
  gstRate: number; // e.g. 18 for 18%
  status: 'Paid' | 'Pending' | 'Draft';
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
