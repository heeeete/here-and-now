import { createClient } from '@/src/shared/lib/supabase/client';

/**
 * 제보를 삭제합니다 (비밀번호 검증 포함).
 */
export async function deleteReport(id: string, password: string) {
  const supabase = createClient();

  const { error, data } = await supabase
    .from('reports')
    .delete()
    .match({ id, password })
    .select();

  if (error) throw error;
  if (!data || data.length === 0) throw new Error('비밀번호가 일치하지 않거나 이미 삭제되었습니다.');
}
