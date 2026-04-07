import { createClient } from '@/src/shared/lib/supabase/client';

/**
 * 기록을 삭제합니다 (비밀번호 검증 포함).
 */
export async function deleteRecord(id: string, password: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('records')
    .delete()
    .match({ id, password })
    .select();

  if (error) throw error;
  
  // 데이터가 없으면 비밀번호가 틀린 것으로 간주합니다.
  if (!data || data.length === 0) {
    throw new Error('비밀번호가 일치하지 않아요. 다시 한번 확인해 주세요.');
  }

  return true;
}
