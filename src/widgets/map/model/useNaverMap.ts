import { useEffect, useRef, useState, useCallback } from 'react';
import { MapBounds } from './types';

const DEFAULT_CENTER = { lat: 37.5446, lng: 127.0559 }; // 성수역 기준
const DEFAULT_ZOOM = 17;

/**
 * 네이버 지도 인스턴스 초기화 및 이벤트 리스너 관리를 위한 커스텀 훅
 */
export const useNaverMap = (
  onMapClick?: (lat: number, lng: number) => void,
  onBoundsChange?: (bounds: MapBounds) => void,
) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<naver.maps.Map | null>(null);

  // 최신 핸들러 참조 (클로저 문제 방지)
  const onMapClickRef = useRef(onMapClick);
  const onBoundsChangeRef = useRef(onBoundsChange);

  useEffect(() => {
    onMapClickRef.current = onMapClick;
    onBoundsChangeRef.current = onBoundsChange;
  }, [onMapClick, onBoundsChange]);

  // 지도 초기화
  useEffect(() => {
    if (!mapRef.current || !window.naver?.maps || map) return;

    const initializeMap = (initialCenter: { lat: number; lng: number }) => {
      const mapInstance = new naver.maps.Map(mapRef.current!, {
        center: new naver.maps.LatLng(initialCenter.lat, initialCenter.lng),
        zoom: DEFAULT_ZOOM,
        logoControl: false,
        mapDataControl: false,
        scaleControl: true,
        zoomControl: false,
      });

      setMap(mapInstance);

      // 지도 클릭 이벤트
      naver.maps.Event.addListener(mapInstance, 'click', (e: { latlng: naver.maps.LatLng }) => {
        onMapClickRef.current?.(e.latlng.lat(), e.latlng.lng());
      });

      // 지도 유휴(Idle) 상태 이벤트 (이동/확대 완료 시)
      const handleIdle = () => {
        if (onBoundsChangeRef.current) {
          const bounds = mapInstance.getBounds();
          const sw = bounds.getSW();
          const ne = bounds.getNE();
          onBoundsChangeRef.current({
            minLat: sw.lat(),
            maxLat: ne.lat(),
            minLng: sw.lng(),
            maxLng: ne.lng()
          });
        }
      };

      naver.maps.Event.addListener(mapInstance, 'idle', handleIdle);

      // 초기 경계값 전달
      handleIdle();
    };

    // 현재 위치 기반 초기 중심점 설정
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => initializeMap({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => initializeMap(DEFAULT_CENTER),
        { timeout: 3000 },
      );
    } else {
      initializeMap(DEFAULT_CENTER);
    }
  }, [map]);

  // 현재 위치로 이동
  const moveToCurrentLocation = useCallback((onSuccess?: (latlng: naver.maps.LatLng) => void) => {
    if (!navigator.geolocation || !map) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const latlng = new naver.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
      map.panTo(latlng);
      onSuccess?.(latlng);
    });
  }, [map]);

  return {
    mapRef,
    map,
    moveToCurrentLocation
  };
};
