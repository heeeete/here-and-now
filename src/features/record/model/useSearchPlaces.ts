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
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const [startIndex, setStartIndex] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);

  const setCenter = useMapStore((state) => state.setCenter);
  const setSelectedLocation = useMapStore((state) => state.setSelectedLocation);

  // 검색 실행
  const search = useCallback(async (query: string) => {
    if (!query.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    setSearchTerm(query);
    setStartIndex(1);

    try {
      const response = await fetch(`/api/places/search?query=${encodeURIComponent(query)}&start=1`);
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

  // 추가 결과 로드
  const loadMore = useCallback(async () => {
    if (isMoreLoading) return;
    
    const nextStart = startIndex + 5;
    if (nextStart > 1000) return;

    setIsMoreLoading(true);
    try {
      const response = await fetch(
        `/api/places/search?query=${encodeURIComponent(searchTerm)}&start=${nextStart}`
      );
      if (!response.ok) throw new Error('추가 검색 결과를 가져오는 중 오류가 발생했습니다.');

      const data = await response.json();
      const newItems = data.items || [];
      
      if (newItems.length > 0) {
        setSearchResults((prev) => [...prev, ...newItems]);
        setStartIndex(nextStart);
      }
    } catch (error) {
      console.error('Load more failed:', error);
    } finally {
      setIsMoreLoading(false);
    }
  }, [isMoreLoading, searchTerm, startIndex]);

  // 장소 선택 (지도 이동 및 핑)
  const selectPlace = useCallback((place: Place, yOffset: number = 0) => {
    const lng = parseInt(place.mapx, 10) / 10000000;
    const lat = parseInt(place.mapy, 10) / 10000000;

    if (isNaN(lat) || isNaN(lng)) return;

    setCenter(lat, lng, yOffset);
    setSelectedLocation({ lat, lng });
  }, [setCenter, setSelectedLocation]);

  const reset = useCallback(() => {
    setSearchTerm('');
    setSearchResults([]);
    setStartIndex(1);
    setHasSearched(false);
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    isLoading,
    isMoreLoading,
    search,
    loadMore,
    selectPlace,
    reset,
    hasSearched
  };
};
