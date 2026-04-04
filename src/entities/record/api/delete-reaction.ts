import { createClient } from '@/src/shared/lib/supabase/client';

/**
 * 특정 반응을 삭제합니다.
 * 보안을 위해 recordId + deviceId 조합을 반드시 요구합니다.
 * (본인의 반응만 삭제할 수 있도록 강제)
 */
export async function deleteReaction(params: { recordId: string; deviceId: string }) {
  const supabase = createClient();

  const { error } = await supabase.rpc('delete_device_reaction', {
    p_record_id: params.recordId,
    p_device_id: params.deviceId,
  });

  if (error) {
    console.error('Error deleting reaction:', error);
    throw new Error(`반응 삭제 실패: ${error.message}`);
  }

  return true;
}
