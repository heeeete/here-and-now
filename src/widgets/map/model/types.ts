import { Database } from '@/src/shared/types/database';

/**
 * 기록(Record) 데이터 타입
 * Supabase의 record_summary 뷰를 기반으로 하며, 지도 렌더링에 필요한 필수 필드를 보장합니다.
 */
export type Record = Omit<
  Database['public']['Views']['record_summary']['Row'],
  'id' | 'latitude' | 'longitude' | 'comment' | 'created_at'
> & {
  id: string;
  latitude: number;
  longitude: number;
  comment: string;
  created_at: string;
};

export interface MapBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface NaverMapProps {
  records?: Record[];
  selectedLocation?: { lat: number; lng: number } | null;
  onMapClick?: (lat: number, lng: number) => void;
  onMarkerClick?: (recordId: string) => void;
  onBoundsChange?: (bounds: MapBounds) => void;
  className?: string;
}
