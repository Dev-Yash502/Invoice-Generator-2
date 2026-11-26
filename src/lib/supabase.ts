import { createClient } from '@supabase/supabase-js';
import { Invoice } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'YOUR_SUPABASE_URL' &&
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Map from Supabase database row to App Invoice object
function mapRowToInvoice(row: any): Invoice {
  return {
    id: row.id,
    workspaceKey: row.workspace_key,
    issueDate: row.issue_date,
    dueDate: row.due_date,
    clientName: row.client_name,
    clientCompany: row.client_company || '',
    clientPhone: row.client_phone || '',
    clientEmail: row.client_email || '',
    clientAvatar: row.client_avatar || '',
    status: row.status,
    amountPaid: Number(row.amount_paid) || 0,
    currency: row.currency || 'INR',
    items: Array.isArray(row.items) ? row.items : [],
  };
}

// Map from App Invoice object to Supabase database row
function mapInvoiceToRow(invoice: Invoice) {
  return {
    id: invoice.id,
    workspace_key: invoice.workspaceKey,
    issue_date: invoice.issueDate,
    due_date: invoice.dueDate,
    client_name: invoice.clientName,
    client_company: invoice.clientCompany || null,
    client_phone: invoice.clientPhone || null,
    client_email: invoice.clientEmail || null,
    client_avatar: invoice.clientAvatar || null,
    status: invoice.status,
    amount_paid: invoice.amountPaid || 0,
    currency: invoice.currency || 'INR',
    items: invoice.items || [],
    updated_at: new Date().toISOString(),
  };
}

export async function fetchInvoices(): Promise<Invoice[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching invoices from Supabase:', error);
    return null;
  }
  return (data || []).map(mapRowToInvoice);
}

export async function upsertInvoice(invoice: Invoice): Promise<boolean> {
  if (!supabase) return false;
  const row = mapInvoiceToRow(invoice);
  const { error } = await supabase
    .from('invoices')
    .upsert(row, { onConflict: 'id' });

  if (error) {
    console.error('Error saving invoice to Supabase:', error);
    return false;
  }
  return true;
}

export async function deleteInvoice(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting invoice from Supabase:', error);
    return false;
  }
  return true;
}

export async function updateInvoicePayment(id: string, amountPaid: number, status: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('invoices')
    .update({
      amount_paid: amountPaid,
      status: status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating payment in Supabase:', error);
    return false;
  }
  return true;
}
