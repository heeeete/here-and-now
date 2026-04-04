'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Locate } from 'lucide-react';

interface Report {
  id: string;
  latitude: number;
  longitude: number;
}

interface MapBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

interface NaverMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  reports?: Report[];
  selectedLocation?: { lat: number; lng: number } | null;
  onMapClick?: (lat: number, lng: number) => void;
  onMarkerClick?: (reportId: string) => void;
  onBoundsChange?: (bounds: MapBounds) => void;
  className?: string;
}

const DEFAULT_CENTER = { lat: 37.5446, lng: 127.0559 }; // 성수역 기준
const DEFAULT_ZOOM = 17;

export const NaverMap = ({
  reports = [],
  selectedLocation,
  onMapClick,
  onMarkerClick,
  onBoundsChange,
  className,
}: NaverMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<naver.maps.Map | null>(null);
  const markersRef = useRef<naver.maps.Marker[]>([]);
  const clickMarkerRef = useRef<naver.maps.Marker | null>(null);
  const myLocationMarkerRef = useRef<naver.maps.Marker | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // 최신 핸들러 및 상태를 항상 가리키도록 Ref 사용
  const onMapClickRef = useRef(onMapClick);
  const onMarkerClickRef = useRef(onMarkerClick);
  const onBoundsChangeRef = useRef(onBoundsChange);
  const reportsRef = useRef(reports);

  useEffect(() => {
    onMapClickRef.current = onMapClick;
    onMarkerClickRef.current = onMarkerClick;
    onBoundsChangeRef.current = onBoundsChange;
    reportsRef.current = reports;
  }, [onMapClick, onMarkerClick, onBoundsChange, reports]);

  // 내 위치 마커 업데이트 함수 (기존 디자인 복구)
  const updateMyLocationMarker = useCallback((latlng: naver.maps.LatLng) => {
    if (!mapInstanceRef.current) return;

    if (myLocationMarkerRef.current) {
      myLocationMarkerRef.current.setMap(null);
    }

    myLocationMarkerRef.current = new naver.maps.Marker({
      position: latlng,
      map: mapInstanceRef.current,
      icon: {
        content: `
          <div style="position: relative; width: 24px; height: 24px;">
            <div style="position: absolute; width: 100%; height: 100%; background: #3b82f6; border-radius: 50%; opacity: 0.4; animation: pulse 2s infinite;"></div>
            <div style="position: absolute; top: 4px; left: 4px; width: 16px; height: 16px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
              <div style="width: 10px; height: 10px; background: #3b82f6; border-radius: 50%;"></div>
            </div>
          </div>
          <style>
            @keyframes pulse {
              0% { transform: scale(1); opacity: 0.4; }
              70% { transform: scale(3); opacity: 0; }
              100% { transform: scale(1); opacity: 0; }
            }
          </style>
        `,
        anchor: new naver.maps.Point(12, 12),
      },
    });
  }, []);

  // 마커 및 클러스터 렌더링 함수
  const renderMarkers = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
    const currentZoom = map.getZoom();
    
    let clusterDistance = 0.0005;
    if (currentZoom >= 20) clusterDistance = 0.000005;
    else if (currentZoom >= 19) clusterDistance = 0.00001;
    else if (currentZoom >= 18) clusterDistance = 0.00004;
    else if (currentZoom >= 17) clusterDistance = 0.0001;
    else if (currentZoom >= 16) clusterDistance = 0.00025;
    else if (currentZoom >= 15) clusterDistance = 0.0005;
    else if (currentZoom >= 14) clusterDistance = 0.001;
    else clusterDistance = 0.003;

    const clusters: { center: Report; count: number; members: Report[] }[] = [];

    reportsRef.current.forEach((report) => {
      let addedToCluster = false;
      for (const cluster of clusters) {
        const dist = Math.sqrt(
          Math.pow(cluster.center.latitude - report.latitude, 2) +
            Math.pow(cluster.center.longitude - report.longitude, 2),
        );
        if (dist < clusterDistance) {
          cluster.count++;
          cluster.members.push(report);
          addedToCluster = true;
          break;
        }
      }
      if (!addedToCluster) {
        clusters.push({ center: report, count: 1, members: [report] });
      }
    });

    clusters.forEach((cluster) => {
      const position = new naver.maps.LatLng(cluster.center.latitude, cluster.center.longitude);
      let marker: naver.maps.Marker;

      if (cluster.count > 1) {
        marker = new naver.maps.Marker({
          position,
          map,
          icon: {
            content: `
              <div style="
                display: flex; align-items: center; justify-content: center; 
                width: 44px; height: 44px; 
                background: white; border: 3px solid #3b82f6; 
                border-radius: 50%; color: #3b82f6; font-weight: bold; font-size: 14px;
                box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
                cursor: pointer; transition: transform 0.2s;
              " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                ${cluster.count}
              </div>
            `,
            anchor: new naver.maps.Point(22, 22),
          },
        });

        naver.maps.Event.addListener(marker, 'click', () => {
          const latestZoom = map.getZoom();
          map.setZoom(latestZoom + 2, true);
          map.panTo(position);
        });
      } else {
        const report = cluster.members[0];
        marker = new naver.maps.Marker({
          position,
          map,
          icon: {
            content: `
              <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2)); transition: transform 0.2s;" 
                   onmouseover="this.style.transform='scale(1.2) translateY(-4px)'" 
                   onmouseout="this.style.transform='scale(1) translateY(0)'">
                <div style="display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; background: white; border: 3px solid #3b82f6; border-radius: 50% 50% 50% 0; transform: rotate(-45deg);">
                  <div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center;">
                    <img src="/icons/siren.svg" style="width: 20px; height: 20px;" />
                  </div>
                </div>
              </div>
            `,
            anchor: new naver.maps.Point(19, 38),
          },
        });

        naver.maps.Event.addListener(marker, 'click', () => {
          onMarkerClickRef.current?.(report.id);
        });
      }
      markersRef.current.push(marker);
    });
  }, []);

  // 지도 초기화 및 리스너 등록
  useEffect(() => {
    if (!mapRef.current || !window.naver?.maps) return;

    if (!mapInstanceRef.current) {
      const initializeMap = (initialCenter: { lat: number; lng: number }) => {
        const map = new naver.maps.Map(mapRef.current!, {
          center: new naver.maps.LatLng(initialCenter.lat, initialCenter.lng),
          zoom: DEFAULT_ZOOM,
          logoControl: false,
          mapDataControl: false,
          scaleControl: true,
          zoomControl: false,
        });
        mapInstanceRef.current = map;
        setIsMapLoaded(true);

        naver.maps.Event.addListener(map, 'click', (e: { latlng: naver.maps.LatLng }) => {
          onMapClickRef.current?.(e.latlng.lat(), e.latlng.lng());
        });

        // 줌, 이동 이벤트가 발생할 때마다 강제로 클러스터링 계산 및 경계 변경 알림
        const handleIdle = () => {
          renderMarkers();
          
          if (onBoundsChangeRef.current) {
            const bounds = map.getBounds();
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

        naver.maps.Event.addListener(map, 'idle', handleIdle);
        naver.maps.Event.addListener(map, 'zoom_changed', renderMarkers);

        if (initialCenter.lat !== DEFAULT_CENTER.lat || initialCenter.lng !== DEFAULT_CENTER.lng) {
          updateMyLocationMarker(new naver.maps.LatLng(initialCenter.lat, initialCenter.lng));
        }

        // 초기 경계값 전달
        handleIdle();
      };

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => initializeMap({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => initializeMap(DEFAULT_CENTER),
          { timeout: 3000 },
        );
      } else {
        initializeMap(DEFAULT_CENTER);
      }
    }
  }, [renderMarkers, updateMyLocationMarker]);

  useEffect(() => {
    if (isMapLoaded) renderMarkers();
  }, [reports, isMapLoaded, renderMarkers]);

  const moveToCurrentLocation = useCallback(() => {
    if (!navigator.geolocation || !mapInstanceRef.current) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const latlng = new naver.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
      mapInstanceRef.current?.panTo(latlng);
      updateMyLocationMarker(latlng);
    });
  }, [updateMyLocationMarker]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (clickMarkerRef.current) {
      clickMarkerRef.current.setMap(null);
      clickMarkerRef.current = null;
    }

    if (selectedLocation) {
      const position = new naver.maps.LatLng(selectedLocation.lat, selectedLocation.lng);
      clickMarkerRef.current = new naver.maps.Marker({
        position,
        map,
        icon: {
          content: `
            <div style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: rgba(59, 130, 246, 0.2); border: 2px solid #3b82f6; border-radius: 50%; animation: clickPulse 1.5s infinite;">
              <div style="width: 8px; height: 8px; background: #3b82f6; border-radius: 50%;"></div>
            </div>
            <style>@keyframes clickPulse { 0% { transform: scale(0.8); opacity: 1; } 100% { transform: scale(1.5); opacity: 0; } }</style>
          `,
          anchor: new naver.maps.Point(16, 16),
        },
      });
      map.panTo(position);
    }
  }, [selectedLocation]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className={className} style={{ width: '100%', height: '100%' }} />
      <button
        onClick={moveToCurrentLocation}
        className="absolute right-6 bottom-6 z-10 flex size-10 items-center justify-center rounded-sm bg-white text-blue-600 shadow-xl ring-1 ring-black/5 transition-all hover:bg-slate-50 active:scale-90"
      >
        <Locate className="size-6" strokeWidth={1} />
      </button>
    </div>
  );
};
