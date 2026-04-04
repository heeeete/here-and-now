'use client';

import { useEffect } from 'react';
import { Locate } from 'lucide-react';
import { NaverMapProps } from '../model/types';
import { useNaverMap } from '../model/useNaverMap';
import { useMarkers } from '../model/useMarkers';
import { useMapStore } from '@/src/shared/model/useMapStore';
import { useRecordStore } from '@/src/entities/record/model/useRecordStore';
import { useMobile } from '@/src/shared/lib/hooks/useMobile';

/**
 * NaverMap 위젯
 * - 지도 초기화 및 이벤트 리스너 관리 (useNaverMap)
 * - 마커 및 클러스터링 관리 (useMarkers)
 */
export const NaverMap = ({
  onMapClick,
  onMarkerClick,
  onBoundsChange,
  className,
}: Omit<NaverMapProps, 'records' | 'selectedLocation'>) => {
  const isMobile = useMobile();
  // 스토어에서 상태 개별 구독 (Selector)
  const storeCenter = useMapStore((state) => state.center);
  const setCenter = useMapStore((state) => state.setCenter);
  const selectedLocation = useMapStore((state) => state.selectedLocation);
  const setSelectedLocation = useMapStore((state) => state.setSelectedLocation);

  const records = useRecordStore((state) => state.records);
  const setSelectedRecordId = useRecordStore((state) => state.setSelectedRecordId);

  // 1. 지도 인스턴스 초기화 및 기본 이벤트 관리
  const { mapRef, map, moveToCurrentLocation } = useNaverMap((lat, lng) => {
    // 모바일에서는 하단 모달을 고려해 지도를 약간 위로 밀어올림 (150px)
    setCenter(lat, lng, isMobile ? 150 : 0);
    setSelectedLocation({ lat, lng });
    onMapClick?.(lat, lng);
  }, onBoundsChange);

  // 2. 마커 및 클러스터 관리
  const { renderRecords, updateMyLocationMarker, updateClickMarker } = useMarkers(map, (id) => {
    setSelectedRecordId(id);
    onMarkerClick?.(id);
  });

  // 3. 지도 유휴(Idle) 상태 및 줌 변경 시 마커 재렌더링
  useEffect(() => {
    if (!map) return;

    const handleIdle = () => renderRecords(records);
    const idleListener = naver.maps.Event.addListener(map, 'idle', handleIdle);
    const zoomListener = naver.maps.Event.addListener(map, 'zoom_changed', handleIdle);

    // 초기 렌더링
    handleIdle();

    return () => {
      naver.maps.Event.removeListener(idleListener);
      naver.maps.Event.removeListener(zoomListener);
    };
  }, [map, records, renderRecords]);

  // 4. 전역 스토어의 중심점 변경 시 지도 이동
  useEffect(() => {
    if (map && storeCenter) {
      const targetLatLng = new naver.maps.LatLng(storeCenter.lat, storeCenter.lng);
      
      if (storeCenter.yOffset) {
        const projection = map.getProjection();
        // 1. 타겟 위경도를 픽셀 좌표로 변환
        const targetPoint = projection.fromCoordToOffset(targetLatLng);
        // 2. 픽셀 좌표에 오프셋 적용 (위로 150px 밀어올리려면 타겟을 150px 아래로 설정)
        const offsetPoint = new naver.maps.Point(targetPoint.x, targetPoint.y + storeCenter.yOffset);
        // 3. 보정된 픽셀 좌표를 다시 위경도로 변환
        const offsetLatLng = projection.fromOffsetToCoord(offsetPoint);
        
        map.panTo(offsetLatLng);
      } else {
        map.panTo(targetLatLng);
      }
    }
  }, [map, storeCenter]);

  // 5. 선택된 위치(클릭 지점) 변경 시 마커 업데이트
  useEffect(() => {
    if (map) {
      updateClickMarker(selectedLocation?.lat ?? 0, selectedLocation ? selectedLocation.lng : null);
    }
  }, [selectedLocation, map, updateClickMarker]);

  // 6. 현재 위치로 이동 및 마커 업데이트 핸들러
  const handleMoveToCurrentLocation = () => {
    moveToCurrentLocation((latlng) => {
      updateMyLocationMarker(latlng);
    });
  };

  return (
    <div className="relative h-full w-full">
      {/* 지도 컨테이너 */}
      <div ref={mapRef} className={className} style={{ width: '100%', height: '100%' }} />

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
