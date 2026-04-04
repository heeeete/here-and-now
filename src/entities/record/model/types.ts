import { Database } from '@/src/shared/types/database';

// 뷰 데이터 타입에서 필수 필드들을 보장하는 타입 정의
export type Record = {
  id: string;
  created_at: string;
  expires_at: string;
  latitude: number;
  longitude: number;
  comment: string;
  image_url: string | null;
  complaint_count: number;
  helpful_count: number;
  still_valid_count: number;
  ended_count: number;
};

export type DatabaseRecord = Database['public']['Views']['record_summary']['Row'];

/**
 * DB에서 가져온 데이터를 애플리케이션의 Record 타입으로 변환합니다.
 * Nullable한 필드들에 대해 기본값을 제공합니다.
 */
export function mapDatabaseRecordToRecord(dbRecord: DatabaseRecord): Record {
  return {
    id: dbRecord.id || '',
    created_at: dbRecord.created_at || new Date().toISOString(),
    expires_at: dbRecord.expires_at || new Date().toISOString(),
    latitude: dbRecord.latitude || 0,
    longitude: dbRecord.longitude || 0,
    comment: dbRecord.comment || '',
    image_url: dbRecord.image_url || null,
    complaint_count: dbRecord.complaint_count || 0,
    helpful_count: dbRecord.helpful_count || 0,
    still_valid_count: dbRecord.still_valid_count || 0,
    ended_count: dbRecord.ended_count || 0,
  };
}
