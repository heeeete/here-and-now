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
  if (!data || data.length === 0) throw new Error('비밀번호가 일치하지 않거나 기록을 찾을 수 없습니다.');

  return true;
}
