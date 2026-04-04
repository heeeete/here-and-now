import { createClient } from '@/src/shared/lib/supabase/client';

/**
 * 제보를 신고합니다 (신고 수 1 증가).
 */
export async function postReportIncident(id: string) {
  const supabase = createClient();

  const { error } = await supabase.rpc('increment_report_count', { report_id: id });

  if (error) {
    console.error('Error reporting incident:', error);
    throw error;
  }
}
