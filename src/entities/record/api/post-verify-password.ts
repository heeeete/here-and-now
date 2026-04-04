import { createClient } from '@/src/shared/lib/supabase/client';

/**
 * 기록의 비밀번호가 일치하는지 확인합니다.
 */
export async function postVerifyPassword(id: string, password: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('records')
    .select('id')
    .match({ id, password })
    .maybeSingle();

  if (error) {
    console.error('Error verifying password:', error);
    throw new Error('인증 과정에서 오류가 발생했습니다.');
  }

  if (!data) {
    throw new Error('비밀번호가 일치하지 않습니다.');
  }

  return true;
}
