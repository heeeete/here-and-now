import { create } from 'zustand';

interface MapState {
  // 지도의 중심점 및 이동 트리거
  center: { lat: number; lng: number; timestamp: number } | null;
  // 사용자가 클릭하거나 검색으로 선택한 지점 (핑 표시용)
  selectedLocation: { lat: number; lng: number } | null;
  zoom: number;
  
  setCenter: (lat: number, lng: number) => void;
  setSelectedLocation: (location: { lat: number; lng: number } | null) => void;
  setZoom: (zoom: number) => void;
}

/**
 * 지도의 전역 상태 및 상호작용을 관리하는 스토어
 */
export const useMapStore = create<MapState>((set) => ({
  center: null,
  selectedLocation: null,
  zoom: 17,
  
  setCenter: (lat, lng) => set({ center: { lat, lng, timestamp: Date.now() } }),
  setSelectedLocation: (location) => set({ selectedLocation: location }),
  setZoom: (zoom) => set({ zoom }),
}));
