import { Database } from '@/src/shared/types/database';

export type DatabaseRecord = Database['public']['Views']['record_summary']['Row'];

/**
 * 뷰 데이터 타입에서 필수 필드들을 보장하는 타입 정의
 */
export type Record = Omit<
  DatabaseRecord,
  | 'id'
  | 'created_at'
  | 'expires_at'
  | 'latitude'
  | 'longitude'
  | 'comment'
  | 'complaint_count'
  | 'like_count'
  | 'amazing_count'
  | 'funny_count'
  | 'sad_count'
> & {
  id: string;
  created_at: string;
  expires_at: string;
  latitude: number;
  longitude: number;
  comment: string;
  complaint_count: number;
  like_count: number;
  amazing_count: number;
  funny_count: number;
  sad_count: number;
};

/**
 * DB에서 가져온 데이터를 애플리케이션의 Record 타입으로 변환합니다.
 * Nullable한 필드들에 대해 기본값을 제공합니다.
 */
export function mapDatabaseRecordToRecord(dbRecord: DatabaseRecord): Record {
  return {
    ...dbRecord,
    id: dbRecord.id || '',
    created_at: dbRecord.created_at || new Date().toISOString(),
    expires_at: dbRecord.expires_at || new Date().toISOString(),
    latitude: dbRecord.latitude || 0,
    longitude: dbRecord.longitude || 0,
    comment: dbRecord.comment || '',
    image_url: dbRecord.image_url || null,
    complaint_count: dbRecord.complaint_count || 0,
    like_count: dbRecord.like_count || 0,
    amazing_count: dbRecord.amazing_count || 0,
    funny_count: dbRecord.funny_count || 0,
    sad_count: dbRecord.sad_count || 0,
  };
}
