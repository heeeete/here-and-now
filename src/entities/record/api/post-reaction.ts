import { createClient } from '@/src/shared/lib/supabase/client';

/**
 * 특정 기록에 반응을 남깁니다.
 */
export async function postReaction(recordId: string, type: 'helpful' | 'still_valid' | 'ended') {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('reactions')
    .insert([
      {
        record_id: recordId,
        type,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error adding reaction:', error);
    throw error;
  }

  return data;
}
