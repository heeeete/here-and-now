import { createClient } from '@/src/shared/lib/supabase/client';
import { Record } from '../model/types';

/**
 * 기록을 수정합니다 (비밀번호 검증 포함).
 */
export async function postRecordUpdate(id: string, password: string, updates: Partial<Record>) {
  const supabase = createClient();

  const cleanUpdates = {
    comment: (updates.comment ?? undefined) as string | undefined,
    image_url: updates.image_url ?? undefined,
  };

  // match를 사용하여 비밀번호와 id가 모두 일치하는 데이터만 업데이트합니다.
  const { data, error } = await supabase
    .from('records')
    .update(cleanUpdates)
    .match({ id, password })
    .select();

  if (error) throw error;
  
  if (!data || data.length === 0) {
    throw new Error('비밀번호가 일치하지 않아요. 다시 한번 확인해 주세요.');
  }

  return data[0];
}
