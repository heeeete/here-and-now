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
    (records: Record[]) => {
      if (!map) return;

      const currentZoom = map.getZoom();
      const projection = map.getProjection();

      // 줌 레벨별 클러스터링 반경 (px)
      const radiusMap: { [zoom: number]: number } = {
        20: 20,
        19: 24,
        18: 28,
        17: 34,
        16: 42,
        15: 52,
        14: 64,
      };
      const clusterRadius = radiusMap[currentZoom] || 80;

      // 1. 기존 마커 모두 제거 (간단한 구현을 위해 전체 초기화 유지하되, 계산 효율성 증대)
      clearMarkers();

      // 2. 클러스터링 계산 (공간 기반 최적화는 추후 고려, 현재는 데이터 무결성 우선)
      const clusters: {
        center: Record;
        centerPixel: naver.maps.Point;
        count: number;
        members: Record[];
      }[] = [];

      records.forEach((record) => {
        const recordLatLng = new naver.maps.LatLng(record.latitude, record.longitude);
        const recordPixel = projection.fromCoordToOffset(recordLatLng);

        let addedToCluster = false;
        for (const cluster of clusters) {
          const pixelDist = Math.sqrt(
            Math.pow(cluster.centerPixel.x - recordPixel.x, 2) +
              Math.pow(cluster.centerPixel.y - recordPixel.y, 2),
          );

          if (pixelDist <= clusterRadius) {
            cluster.count++;
            cluster.members.push(record);
            addedToCluster = true;
            break;
          }
        }

        if (!addedToCluster) {
          clusters.push({
            center: record,
            centerPixel: recordPixel,
            count: 1,
            members: [record],
          });
        }
      });

      // 3. 마커 생성 및 등록
      clusters.forEach((cluster) => {
        const position = new naver.maps.LatLng(cluster.center.latitude, cluster.center.longitude);
        let marker: naver.maps.Marker;

        if (cluster.count > 1) {
          // 클러스터 마커
          marker = new naver.maps.Marker({
            position,
            map,
            icon: {
              content: MARKER_TEMPLATES.cluster(cluster.count),
              anchor: new naver.maps.Point(22, 22),
            },
          });

          naver.maps.Event.addListener(marker, 'click', () => {
            map.setZoom(map.getZoom() + 2, true);
            map.panTo(position);
          });
        } else {
          // 개별 기록 마커 (말풍선)
          const record = cluster.members[0];

          // 2시간 이내면 NEW 뱃지 표시
          const isNew = new Date().getTime() - new Date(record.created_at).getTime() < 2 * 60 * 60 * 1000;

          marker = new naver.maps.Marker({
            position,
            map,
            icon: {
              content: MARKER_TEMPLATES.recordBubble(record.comment, isNew),
              anchor: new naver.maps.Point(0, 0),
            },
          });
          naver.maps.Event.addListener(marker, 'click', () => {
            onMarkerClick?.(record.id);
          });
        }
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
