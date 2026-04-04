import { createClient } from '@/src/shared/lib/supabase/client';
import { Record, mapDatabaseRecordToRecord } from '../model/types';

/**
 * 특정 기록의 상세 정보를 가져옵니다.
 */
export async function fetchRecordById(id: string): Promise<Record | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('record_summary')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('Error fetching record detail:', error);
    return null;
  }

  return mapDatabaseRecordToRecord(data);
}
