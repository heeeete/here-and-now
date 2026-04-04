import { createClient } from '@/src/shared/lib/supabase/client';

export type ReactionType = 'like' | 'amazing' | 'funny' | 'sad';

/**
 * 특정 기록에 반응을 남깁니다.
 */
export async function postReaction(
  recordId: string, 
  type: ReactionType,
  deviceId: string
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('reactions')
    .insert([
      {
        record_id: recordId,
        type,
        device_id: deviceId,
      },
    ])
    .select()
    .maybeSingle();

  if (error) {
    // 이미 있는 경우(23505)는 에러가 아니므로 성공으로 간주
    if (error.code === '23505') return true;
    
    console.error('Error adding reaction:', error);
    throw error;
  }

  return data;
}
