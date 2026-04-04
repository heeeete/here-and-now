import { createClient } from '@/src/shared/lib/supabase/client';

/**
 * 새 제보를 작성합니다.
 */
export async function postReport(report: {
  latitude: number;
  longitude: number;
  comment: string;
  password: string;
  image_url?: string;
}) {
  const supabase = createClient();
  
  // 6시간 후 만료 시간 설정
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 6);

  const { data, error } = await supabase
    .from('reports')
    .insert([
      {
        ...report,
        expires_at: expiresAt.toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating report:', error);
    throw error;
  }

  return data;
}
