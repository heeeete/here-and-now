'use client';

import { useEffect, useState } from 'react';
import { Locate } from 'lucide-react';
import { NaverMapProps } from '../model/types';
import { useNaverMap } from '../model/useNaverMap';
import { useMarkers } from '../model/useMarkers';
import { useMapStore } from '@/src/shared/model/useMapStore';
import { useRecordStore } from '@/src/entities/record/model/useRecordStore';
import { useMobile } from '@/src/shared/lib/hooks/useMobile';
import { cn } from '@/src/shared/lib/utils';

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
  const selectedRecordId = useRecordStore((state) => state.selectedRecordId);
  const setSelectedRecordId = useRecordStore((state) => state.setSelectedRecordId);

  // 1. 지도 인스턴스 초기화 및 기본 이벤트 관리
  const { mapRef, map, moveToCurrentLocation } = useNaverMap((lat, lng) => {
    // 모바일에서는 하단 모달을 고려해 지도를 약간 위로 밀어올림 (150px)
    setCenter(lat, lng, isMobile ? 150 : 0);
    setSelectedLocation({ lat, lng });
    setSelectedRecordId(null); // 지도 클릭 시 선택된 마커 해제
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

    const handleIdle = () => renderRecords(records, selectedRecordId);
    const idleListener = naver.maps.Event.addListener(map, 'idle', handleIdle);
    const zoomListener = naver.maps.Event.addListener(map, 'zoom_changed', handleIdle);

    // 초기 렌더링
    handleIdle();

    return () => {
      naver.maps.Event.removeListener(idleListener);
      naver.maps.Event.removeListener(zoomListener);
    };
  }, [map, records, selectedRecordId, renderRecords]);

  // 4. 전역 스토어의 중심점 및 줌 레벨 변경 시 지도 이동/확대 (통합 처리)
  useEffect(() => {
    if (map && storeCenter) {
      const targetLatLng = new naver.maps.LatLng(storeCenter.lat, storeCenter.lng);
      const targetZoom = storeCenter.zoom ?? map.getZoom();
      
      let finalLatLng = targetLatLng;

      if (storeCenter.yOffset) {
        const projection = map.getProjection();
        const currentZoom = map.getZoom();
        
        // 줌 레벨 차이에 따른 픽셀 비율 계산 (1단계마다 2배 차이)
        // 목표 줌에서의 150px이 현재 줌에서는 몇 픽셀인지 역산합니다.
        const ratio = Math.pow(2, currentZoom - targetZoom);
        const adjustedOffset = storeCenter.yOffset * ratio;

        // 1. 타겟 위경도를 픽셀 좌표로 변환
        const targetPoint = projection.fromCoordToOffset(targetLatLng);
        // 2. 보정된 픽셀 좌표에 오프셋 적용
        const offsetPoint = new naver.maps.Point(targetPoint.x, targetPoint.y + adjustedOffset);
        // 3. 보정된 픽셀 좌표를 다시 위경도로 변환
        finalLatLng = projection.fromOffsetToCoord(offsetPoint) as naver.maps.LatLng;
      }

      // 이동과 줌을 동시에 부드럽게 수행
      map.morph(finalLatLng, targetZoom);
    }
  }, [map, storeCenter]);

  // 5. 선택된 위치(클릭 지점) 변경 시 마커 업데이트
  useEffect(() => {
    if (map) {
      updateClickMarker(selectedLocation?.lat ?? 0, selectedLocation ? selectedLocation.lng : null);
    }
  }, [selectedLocation, map, updateClickMarker]);

  const [isLocating, setIsLocating] = useState(false);

  // 6. 현재 위치로 이동 및 마커 업데이트 핸들러
  const handleMoveToCurrentLocation = () => {
    setIsLocating(true);
    moveToCurrentLocation((latlng) => {
      updateMyLocationMarker(latlng);
    });
    
    // 1초 후 회색으로 복구
    setTimeout(() => {
      setIsLocating(false);
    }, 1000);
  };

  return (
    <div className="relative h-full w-full">
      {/* 지도 컨테이너 */}
      <div ref={mapRef} className={className} style={{ width: '100%', height: '100%' }} />

      {/* 현재 위치 이동 버튼 */}
      <button
        onClick={handleMoveToCurrentLocation}
        className="absolute right-6 bottom-6 z-30 flex size-10 items-center justify-center rounded-sm bg-white shadow-xl ring-1 ring-black/5 transition-all hover:bg-slate-50 active:scale-90"
        title="내 위치로 이동"
      >
        <Locate 
          className={cn(
            "size-6 transition-colors duration-300", 
            isLocating ? "text-blue-600" : "text-slate-400"
          )} 
          strokeWidth={1.5} 
        />
      </button>
    </div>
  );
};
