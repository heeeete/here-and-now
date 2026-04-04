import { useCallback, useRef } from 'react';
import { Report } from './types';
import { MARKER_TEMPLATES } from '../config/markerTemplates';

/**
 * 지도 위의 마커(제보, 클러스터, 내 위치)를 관리하는 커스텀 훅
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

  // 클릭 지점 마커 업데이트 (제보 작성 시)
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
        map.panTo(position);
      }
    },
    [map],
  );

  // 제보 마커 및 클러스터 렌더링
  const renderReports = useCallback(
    (reports: Report[]) => {
      if (!map) return;

      clearMarkers();
      const currentZoom = map.getZoom();
      const projection = map.getProjection();

      // 줌 레벨별 클러스터링 반경 (px)
      const radiusMap: Record<number, number> = {
        20: 20,
        19: 24,
        18: 28,
        17: 34,
        16: 42,
        15: 52,
        14: 64,
      };
      const clusterRadius = radiusMap[currentZoom] || 50;

      // 클러스터링 계산 (픽셀 거리 기반)
      const clusters: {
        center: Report;
        centerPixel: naver.maps.Point;
        count: number;
        members: Report[];
      }[] = [];

      reports.forEach((report) => {
        const reportLatLng = new naver.maps.LatLng(report.latitude, report.longitude);
        const reportPixel = projection.fromCoordToOffset(reportLatLng);

        let addedToCluster = false;
        for (const cluster of clusters) {
          const pixelDist = Math.sqrt(
            Math.pow(cluster.centerPixel.x - reportPixel.x, 2) +
              Math.pow(cluster.centerPixel.y - reportPixel.y, 2),
          );

          if (pixelDist <= clusterRadius) {
            cluster.count++;
            cluster.members.push(report);
            addedToCluster = true;
            break;
          }
        }

        if (!addedToCluster) {
          clusters.push({
            center: report,
            centerPixel: reportPixel,
            count: 1,
            members: [report],
          });
        }
      });

      // 마커 생성
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
            const latestZoom = map.getZoom();
            map.setZoom(latestZoom + 2, true);
            map.panTo(position);
          });
        } else {
          // 개별 제보 마커 (말풍선)
          const report = cluster.members[0];
          marker = new naver.maps.Marker({
            position,
            map,
            icon: {
              content: MARKER_TEMPLATES.reportBubble(report.comment),
              anchor: new naver.maps.Point(0, 0),
            },
          });

          naver.maps.Event.addListener(marker, 'click', () => {
            onMarkerClick?.(report.id);
          });
        }
        markersRef.current.push(marker);
      });
    },
    [map, clearMarkers, onMarkerClick],
  );

  return {
    renderReports,
    updateMyLocationMarker,
    updateClickMarker,
    clearMarkers,
  };
};
