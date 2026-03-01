import supabase from '../utils/supabase'

export async function get_all_complaints() {
  const { data, error } = await supabase.from('complaints').select('*');
  if (error) throw new Error(error.message);
  return data;
}

export async function get_complaint_by_complaint_number(complaint_number: string) {
  const { data, error } = await supabase.from('complaints').select('*').eq('complaint_number', complaint_number).single();
  if (error) throw new Error(error.message);
  return data;
}