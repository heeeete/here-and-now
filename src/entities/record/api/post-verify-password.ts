import { createClient } from '@/src/shared/lib/supabase/client';

/**
 * 기록의 비밀번호가 일치하는지 확인합니다.
 */
export async function postVerifyPassword(id: string, password: string) {
  const supabase = createClient();

  // match로 조회하여 데이터가 있는지 확인합니다.
  const { data, error } = await supabase
    .from('records')
    .select('id')
    .match({ id, password })
    .maybeSingle();

  if (error) {
    console.error('Error verifying password:', error);
    throw new Error('인증 과정에서 오류가 발생했어요.');
  }

  if (!data) {
    throw new Error('비밀번호가 일치하지 않아요. 다시 한번 확인해 주세요.');
  }

  return true;
}
