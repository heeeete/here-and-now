import { Database } from '@/src/shared/types/database';

// 뷰 데이터 타입에서 필수 필드들을 보장하는 타입 정의
export type Report = {
  id: string;
  created_at: string;
  expires_at: string;
  latitude: number;
  longitude: number;
  comment: string;
  image_url: string | null;
  report_count: number;
  helpful_count: number;
  still_valid_count: number;
  ended_count: number;
};

export type DatabaseReport = Database['public']['Views']['report_summary']['Row'];

/**
 * DB에서 가져온 데이터를 애플리케이션의 Report 타입으로 변환합니다.
 * Nullable한 필드들에 대해 기본값을 제공합니다.
 */
export function mapDatabaseReportToReport(dbReport: DatabaseReport): Report {
  return {
    id: dbReport.id || '',
    created_at: dbReport.created_at || new Date().toISOString(),
    expires_at: dbReport.expires_at || new Date().toISOString(),
    latitude: dbReport.latitude || 0,
    longitude: dbReport.longitude || 0,
    comment: dbReport.comment || '',
    image_url: dbReport.image_url || null,
    report_count: dbReport.report_count || 0,
    helpful_count: dbReport.helpful_count || 0,
    still_valid_count: dbReport.still_valid_count || 0,
    ended_count: dbReport.ended_count || 0,
  };
}
