'use client';

import { useEffect } from 'react';
import { Locate } from 'lucide-react';
import { NaverMapProps } from '../model/types';
import { useNaverMap } from '../model/useNaverMap';
import { useMarkers } from '../model/useMarkers';

/**
 * NaverMap 위젯
 * - 지도 초기화 및 이벤트 리스너 관리 (useNaverMap)
 * - 마커 및 클러스터링 관리 (useMarkers)
 */
export const NaverMap = ({
  reports = [],
  selectedLocation,
  onMapClick,
  onMarkerClick,
  onBoundsChange,
  className,
}: NaverMapProps) => {
  // 1. 지도 인스턴스 초기화 및 기본 이벤트 관리
  const { mapRef, map, moveToCurrentLocation } = useNaverMap(
    onMapClick,
    onBoundsChange,
  );

  // 2. 마커 및 클러스터 관리
  const { renderReports, updateMyLocationMarker, updateClickMarker } = useMarkers(
    map,
    onMarkerClick
  );

  // 3. 지도 유휴(Idle) 상태 및 줌 변경 시 마커 재렌더링
  useEffect(() => {
    if (!map) return;

    const handleIdle = () => renderReports(reports);
    const idleListener = naver.maps.Event.addListener(map, 'idle', handleIdle);
    const zoomListener = naver.maps.Event.addListener(map, 'zoom_changed', handleIdle);

    // 초기 렌더링
    handleIdle();

    return () => {
      naver.maps.Event.removeListener(idleListener);
      naver.maps.Event.removeListener(zoomListener);
    };
  }, [map, reports, renderReports]);

  // 4. 선택된 위치(클릭 지점) 변경 시 마커 업데이트
  useEffect(() => {
    if (map) {
      updateClickMarker(
        selectedLocation?.lat ?? 0,
        selectedLocation ? selectedLocation.lng : null
      );
    }
  }, [selectedLocation, map, updateClickMarker]);

  // 5. 현재 위치로 이동 및 마커 업데이트 핸들러
  const handleMoveToCurrentLocation = () => {
    moveToCurrentLocation((latlng) => {
      updateMyLocationMarker(latlng);
    });
  };

  return (
    <div className="relative h-full w-full">
      {/* 지도 컨테이너 */}
      <div 
        ref={mapRef} 
        className={className} 
        style={{ width: '100%', height: '100%' }} 
      />

      {/* 현재 위치 이동 버튼 */}
      <button
        onClick={handleMoveToCurrentLocation}
        className="absolute right-6 bottom-6 z-10 flex size-10 items-center justify-center rounded-sm bg-white text-blue-600 shadow-xl ring-1 ring-black/5 transition-all hover:bg-slate-50 active:scale-90"
        title="내 위치로 이동"
      >
        <Locate className="size-6" strokeWidth={1} />
      </button>
    </div>
  );
};
