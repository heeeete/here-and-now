import { createClient } from '@/src/shared/lib/supabase/client';
import { Report } from '../model/types';

/**
 * 제보를 수정합니다 (비밀번호 검증 포함).
 */
export async function postReportUpdate(id: string, password: string, updates: Partial<Report>) {
  const supabase = createClient();

  // null 값을 허용하지 않는 필드들을 안전하게 처리
  const cleanUpdates = {
    comment: (updates.comment ?? undefined) as string | undefined,
    image_url: updates.image_url ?? undefined,
  };

  const { data, error } = await supabase
    .from('reports')
    .update(cleanUpdates)
    .match({ id, password })
    .select();

  if (error) throw error;
  if (!data || data.length === 0) throw new Error('비밀번호가 일치하지 않습니다.');

  return data[0];
}
