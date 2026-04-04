import { createClient } from '@/src/shared/lib/supabase/client';

/**
 * 기록을 신고합니다 (신고 횟수 1 증가).
 */
export async function postRecordComplaint(recordId: string) {
  const supabase = createClient();

  const { error } = await supabase.rpc('increment_record_complaint_count', {
    record_id: recordId,
  });

  if (error) {
    console.error('Error reporting record:', error);
    throw error;
  }
}
