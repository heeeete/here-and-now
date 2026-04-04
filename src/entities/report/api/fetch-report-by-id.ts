import { createClient } from '@/src/shared/lib/supabase/client';
import { Report, mapDatabaseReportToReport } from '../model/types';

/**
 * 특정 제보의 상세 정보를 가져옵니다.
 */
export async function fetchReportById(id: string): Promise<Report | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('report_summary')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('Error fetching report detail:', error);
    return null;
  }

  return mapDatabaseReportToReport(data);
}
