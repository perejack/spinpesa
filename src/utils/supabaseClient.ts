import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vwtiwsjqvqvpgyzeysxb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3dGl3c2pxdnF2cGd5emV5c3hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MTE1MDIsImV4cCI6MjA2OTE4NzUwMn0.wEHqfN1TfS7701T_s2vtGNG_yBGuKTf9FwPpPg1FtYM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getSpinBalance(phone: string): Promise<number> {
  const { data, error } = await supabase
    .from('users')
    .select('spins')
    .eq('phone', phone)
    .single();
  if (error || !data) return 0;
  return data.spins;
}

export async function useSpin(phone: string): Promise<boolean> {
  const { error } = await supabase.rpc('use_user_spin', { user_phone: phone });
  return !error;
}

export async function getUserTransactions(phone: string) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('phone', phone)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data;
}
