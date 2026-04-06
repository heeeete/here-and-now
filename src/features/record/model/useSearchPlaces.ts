import { useState, useCallback } from 'react';
import { useMapStore } from '@/src/shared/model/useMapStore';
import { Place } from '@/src/entities/record/ui/PlaceItem';

/**
 * 장소 검색 비즈니스 로직을 담당하는 공용 훅
 */
export const useSearchPlaces = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const setCenter = useMapStore((state) => state.setCenter);
  const setSelectedLocation = useMapStore((state) => state.setSelectedLocation);

  // 검색 실행 (단일 요청으로 5개만 조회)
  const search = useCallback(async (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setIsLoading(true);
    setHasSearched(true);
    setSearchTerm(trimmedQuery);

    try {
      const response = await fetch(`/api/places/search?query=${encodeURIComponent(trimmedQuery)}`);
      if (!response.ok) throw new Error('검색 서비스에 문제가 발생했습니다.');

      const data = await response.json();
      setSearchResults(data.items || []);
    } catch (error) {
      console.error('Search failed:', error);
      alert('검색 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 장소 선택 (지도 이동 및 핑)
  const selectPlace = useCallback(
    (place: Place, yOffset: number = 0) => {
      const lng = parseInt(place.mapx, 10) / 10000000;
      const lat = parseInt(place.mapy, 10) / 10000000;

      if (isNaN(lat) || isNaN(lng)) return;

      setCenter(lat, lng, yOffset, 18);
      setSelectedLocation({ lat, lng });
    },
    [setCenter, setSelectedLocation],
  );

  const reset = useCallback(() => {
    setSearchTerm('');
    setSearchResults([]);
    setHasSearched(false);
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    isLoading,
    search,
    selectPlace,
    reset,
    hasSearched,
  };
};
