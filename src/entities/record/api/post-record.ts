import { createClient } from '@/src/shared/lib/supabase/client';

/**
 * 새 기록을 작성합니다.
 */
export async function postRecord(record: {
  latitude: number;
  longitude: number;
  comment: string;
  password: string;
  image_url?: string;
}) {
  const supabase = createClient();
  
  // 24시간 후 만료 시간 설정
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  const { data, error } = await supabase
    .from('records')
    .insert([
      {
        ...record,
        expires_at: expiresAt.toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating record:', error);
    throw error;
  }

  return data;
}
