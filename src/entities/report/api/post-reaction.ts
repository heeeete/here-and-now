import { createClient } from '@/src/shared/lib/supabase/client';

/**
 * 특정 제보에 반응을 남깁니다.
 */
export async function postReaction(reportId: string, type: 'helpful' | 'still_valid' | 'ended') {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('reactions')
    .insert([
      {
        report_id: reportId,
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
