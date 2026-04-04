'use client';

import { useState } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import { Input } from '@/src/shared/ui/input';
import { Button } from '@/src/shared/ui/button';
import { PlaceItem, Place } from '@/src/entities/record/ui/PlaceItem';
import { useMapStore } from '@/src/shared/model/useMapStore';

interface MobileSearchOverlayProps {
  onClose: () => void;
}

export const MobileSearchOverlay = ({ onClose }: MobileSearchOverlayProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const setCenter = useMapStore((state) => state.setCenter);
  const setSelectedLocation = useMapStore((state) => state.setSelectedLocation);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    // 키패드 내리기
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    setIsLoading(true);
    setHasSearched(true);
    try {
      const response = await fetch(`/api/places/search?query=${encodeURIComponent(searchTerm)}&start=1`);
      if (!response.ok) throw new Error('검색 실패');
      const data = await response.json();
      setSearchResults(data.items || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaceClick = (place: Place) => {
    const lng = parseInt(place.mapx, 10) / 10000000;
    const lat = parseInt(place.mapy, 10) / 10000000;
    if (isNaN(lat) || isNaN(lng)) return;

    setCenter(lat, lng, 150); // 하단 모달을 고려해 위로 밀어올림
    setSelectedLocation({ lat, lng });
    onClose(); // 클릭 시 지도로 복귀
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-white">
      {/* 검색 헤더 */}
      <div className="flex items-center gap-2 border-b p-4">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="size-6" />
        </Button>
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            autoFocus
            placeholder="장소나 주소 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-11 rounded-xl bg-slate-50 pl-10 text-base"
          />
        </form>
      </div>

      {/* 결과 리스트 */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="py-20 text-center text-slate-400 font-medium">장소를 찾는 중...</div>
        ) : searchResults.length > 0 ? (
          <div className="flex flex-col gap-3">
            {searchResults.map((place, idx) => (
              <PlaceItem
                key={`${place.mapx}-${place.mapy}-${idx}`}
                place={place}
                onClick={handlePlaceClick}
                className="border-slate-100 shadow-none hover:bg-slate-50"
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-slate-400">
            {hasSearched ? '검색 결과가 없습니다.' : '어디로 이동할까요?'}
          </div>
        )}
      </div>
    </div>
  );
};
