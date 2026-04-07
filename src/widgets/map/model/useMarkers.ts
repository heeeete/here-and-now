import { useCallback, useRef } from 'react';
import { Record } from './types';
import { MARKER_TEMPLATES } from '../config/markerTemplates';

/**
 * 지도 위의 마커(기록, 클러스터, 내 위치)를 관리하는 커스텀 훅
 */
export const useMarkers = (map: naver.maps.Map | null, onMarkerClick?: (id: string) => void) => {
  const markersRef = useRef<naver.maps.Marker[]>([]);
  const myLocationMarkerRef = useRef<naver.maps.Marker | null>(null);
  const clickMarkerRef = useRef<naver.maps.Marker | null>(null);

  // 모든 마커 제거
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
  }, []);

  // 내 위치 마커 업데이트
  const updateMyLocationMarker = useCallback(
    (latlng: naver.maps.LatLng) => {
      if (!map) return;

      if (myLocationMarkerRef.current) {
        myLocationMarkerRef.current.setMap(null);
      }

      myLocationMarkerRef.current = new naver.maps.Marker({
        position: latlng,
        map,
        icon: {
          content: MARKER_TEMPLATES.myLocation,
          anchor: new naver.maps.Point(12, 12),
        },
      });
    },
    [map],
  );

  // 클릭 지점 마커 업데이트 (기록 작성 시)
  const updateClickMarker = useCallback(
    (lat: number, lng: number | null) => {
      if (!map) return;

      if (clickMarkerRef.current) {
        clickMarkerRef.current.setMap(null);
        clickMarkerRef.current = null;
      }

      if (lng !== null) {
        const position = new naver.maps.LatLng(lat, lng);
        clickMarkerRef.current = new naver.maps.Marker({
          position,
          map,
          icon: {
            content: MARKER_TEMPLATES.clickLocation,
            anchor: new naver.maps.Point(16, 16),
          },
        });
      }
    },
    [map],
  );

  // 기록 마커 및 클러스터 렌더링 (최적화 버전)
  const renderRecords = useCallback(
    (records: Record[], selectedRecordId: string | null) => {
      if (!map) return;

      clearMarkers();

      // 1. 타임스탬프 미리 계산 (성능 최적화: 정렬 및 비교 시 Date 객체 생성 비용 제거)
      const recordsWithTime = records.map((r) => ({
        ...r,
        _ts: new Date(r.created_at).getTime(),
      }));

      // 2. 동일 좌표(위경도) 기반 그룹화
      const coordGroups = new Map<string, (typeof recordsWithTime)[0][]>();
      
      recordsWithTime.forEach((record) => {
        const key = `${record.latitude},${record.longitude}`;
        if (!coordGroups.has(key)) {
          coordGroups.set(key, []);
        }
        coordGroups.get(key)!.push(record);
      });

      const now = Date.now();

      // 3. 마커 생성 및 등록
      coordGroups.forEach((members) => {
        // 이미 계산된 타임스탬프(_ts)를 사용하여 정렬 (내림차순)
        const sortedMembers = [...members].sort((a, b) => b._ts - a._ts);
        
        // 그룹 내 선택된 기록이 있다면 우선 노출, 없으면 최신 기록 노출
        const selectedMember = sortedMembers.find((m) => m.id === selectedRecordId);
        const center = selectedMember || sortedMembers[0];
        
        const position = new naver.maps.LatLng(center.latitude, center.longitude);
        const isSelected = !!selectedMember;
        const extraCount = members.length > 1 ? members.length - 1 : 0;

        // 2시간 이내면 NEW 뱃지 표시 (미리 계산된 _ts 사용)
        const isNew = now - center._ts < 2 * 60 * 60 * 1000;

        // 최신 기록이 위로 오도록 생성 시간을 zIndex의 기준으로 활용
        const timestampZIndex = Math.floor(center._ts / 1000);
        const zIndex = isSelected ? 2000000000 + timestampZIndex : timestampZIndex;

        const marker = new naver.maps.Marker({
          position,
          map,
          icon: {
            content: MARKER_TEMPLATES.recordBubble(center.comment, center.id, isNew, isSelected, extraCount),
            anchor: new naver.maps.Point(0, 0),
          },
          zIndex,
        });

        naver.maps.Event.addListener(marker, 'click', () => {
          onMarkerClick?.(center.id);
        });

        markersRef.current.push(marker);
      });
    },
    [map, clearMarkers, onMarkerClick],
  );

  return {
    renderRecords,
    updateMyLocationMarker,
    updateClickMarker,
    clearMarkers,
  };
};
