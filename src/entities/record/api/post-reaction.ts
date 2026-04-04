import { createClient } from '@/src/shared/lib/supabase/client';

export type ReactionType = 'like' | 'amazing' | 'funny' | 'sad';

/**
 * 특정 기록에 반응을 남깁니다.
 * 중복 제약 조건 위반 시(이미 존재함) 에러를 던지지 않고 성공으로 간주하거나 
 * 기존 데이터를 조회하여 반환합니다.
 */
export async function postReaction(
  recordId: string, 
  type: ReactionType,
  deviceId: string
) {
  const supabase = createClient();

  // 안전하게 Insert 시도
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
    // 이미 있는 경우, 해당 데이터를 다시 조회해서 반환 (성공으로 간주)
    if (error.code === '23505') {
      const { data: existingData } = await supabase
        .from('reactions')
        .select()
        .match({ record_id: recordId, device_id: deviceId })
        .single();
      return existingData;
    }
    console.error('Error adding reaction:', error);
    throw error;
  }

  return data;
}
