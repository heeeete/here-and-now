'use client';

import { ArrowLeft, Search } from 'lucide-react';
import { Input } from '@/src/shared/ui/input';
import { Button } from '@/src/shared/ui/button';
import { PlaceItem, Place } from '@/src/entities/record/ui/PlaceItem';
import { useSearchPlaces } from '@/src/features/record/model/useSearchPlaces';

interface MobileSearchOverlayProps {
  onClose: () => void;
}

export const MobileSearchOverlay = ({ onClose }: MobileSearchOverlayProps) => {
  const { 
    searchTerm, 
    setSearchTerm, 
    searchResults, 
    isLoading, 
    search, 
    selectPlace,
    hasSearched
  } = useSearchPlaces();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    // 키패드 내리기
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    search(searchTerm);
  };

  const handlePlaceSelect = (place: Place) => {
    // 모바일에서는 하단 모달 고려해 150px 오프셋 적용
    selectPlace(place, 150);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-white">
      {/* 검색 헤더 */}
      <div className="flex items-center gap-2 border-b p-4">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="size-6" />
        </Button>
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
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
                onClick={handlePlaceSelect}
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
