import { createClient } from '@/src/shared/lib/supabase/client';
import { Record, mapDatabaseRecordToRecord } from '../model/types';

interface Bounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

/**
 * 활성 기록 목록을 가져옵니다 (만료되지 않은 기록).
 * 지도의 경계값(bounds)이 주어지면 해당 영역 내의 기록만 필터링합니다.
 */
export async function fetchActiveRecords(bounds?: Bounds): Promise<Record[]> {
  const supabase = createClient();
  const now = new Date().toISOString();

  let query = supabase
    .from('record_summary')
    .select('*')
    .gt('expires_at', now);

  // 영역 필터링 추가 (인덱스 활용)
  if (bounds) {
    query = query
      .gte('latitude', bounds.minLat)
      .lte('latitude', bounds.maxLat)
      .gte('longitude', bounds.minLng)
      .lte('longitude', bounds.maxLng);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching records:', error);
    return [];
  }

  return (data || []).map(mapDatabaseRecordToRecord);
}
