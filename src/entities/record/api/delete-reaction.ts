import { createClient } from '@/src/shared/lib/supabase/client';
import { ReactionType } from './post-reaction';

/**
 * 특정 반응을 삭제합니다.
 * 보안과 정확성을 위해 recordId + deviceId + type 조합을 요구합니다.
 */
export async function deleteReaction(params: { recordId: string; deviceId: string; type: ReactionType }) {
  const supabase = createClient();

  const { error } = await supabase.rpc('delete_device_reaction', {
    p_record_id: params.recordId,
    p_device_id: params.deviceId,
    p_type: params.type,
  });

  if (error) {
    console.error('Error deleting reaction:', error);
    throw new Error(`반응 삭제 실패: ${error.message}`);
  }

  return true;
}
