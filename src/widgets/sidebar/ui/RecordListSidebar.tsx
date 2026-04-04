'use client';

import { useState } from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import { Input } from '@/src/shared/ui/input';
import { Button } from '@/src/shared/ui/button';
import { cn } from '@/src/shared/lib/utils';
import { useMapStore } from '@/src/shared/model/useMapStore';
import { useRecordStore } from '@/src/entities/record/model/useRecordStore';
import { RecordItem } from '@/src/entities/record/ui/RecordItem';
import { PlaceItem, Place } from '@/src/entities/record/ui/PlaceItem';

interface RecordListSidebarProps {
  className?: string;
}

/**
 * 지도에 표시된 기록 목록과 장소 검색 기능을 제공하는 사이드바 위젯입니다. (PC용)
 */
export const RecordListSidebar = ({ className }: RecordListSidebarProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const [startIndex, setStartIndex] = useState(1);

  // 스토어 구독
  const setCenter = useMapStore((state) => state.setCenter);
  const setSelectedLocation = useMapStore((state) => state.setSelectedLocation);
  
  const records = useRecordStore((state) => state.records);
  const setSelectedRecordId = useRecordStore((state) => state.setSelectedRecordId);

  // 장소 검색 실행
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setIsSearchMode(true);
    setStartIndex(1);

    try {
      const response = await fetch(
        `/api/places/search?query=${encodeURIComponent(searchTerm)}&start=1`,
      );

      if (!response.ok) {
        throw new Error('검색 서비스에 문제가 발생했습니다.');
      }

      const data = await response.json();
      setSearchResults(data.items || []);
    } catch (error) {
      console.error('Search failed:', error);
      alert('검색 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 추가 결과 로드 (페이지네이션)
  const handleLoadMore = async () => {
    if (isMoreLoading) return;

    const nextStart = startIndex + 5;
    if (nextStart > 1000) {
      alert('더 이상 검색 결과를 가져올 수 없습니다. (최대 1,000개)');
      return;
    }

    setIsMoreLoading(true);

    try {
      const response = await fetch(
        `/api/places/search?query=${encodeURIComponent(searchTerm)}&start=${nextStart}`,
      );

      if (!response.ok) {
        throw new Error('추가 검색 결과를 가져오는 중 오류가 발생했습니다.');
      }

      const data = await response.json();
      const newItems = data.items || [];

      if (newItems.length > 0) {
        setSearchResults((prev) => [...prev, ...newItems]);
        setStartIndex(nextStart);
      } else {
        alert('더 이상의 검색 결과가 없습니다.');
      }
    } catch (error) {
      console.error('Load more failed:', error);
      alert('추가 결과를 가져오는데 실패했습니다.');
    } finally {
      setIsMoreLoading(false);
    }
  };

  // 검색 모드 종료
  const handleBack = () => {
    setIsSearchMode(false);
    setSearchTerm('');
    setSearchResults([]);
    setStartIndex(1);
  };

  // 장소 클릭 시 지도 이동 및 핑 표시
  const handlePlaceClick = (place: Place) => {
    const lng = parseInt(place.mapx, 10) / 10000000;
    const lat = parseInt(place.mapy, 10) / 10000000;

    if (isNaN(lat) || isNaN(lng)) return;

    setCenter(lat, lng);
    setSelectedLocation({ lat, lng });
  };

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 z-20 flex h-full w-[360px] flex-col bg-white/95 shadow-2xl backdrop-blur-md transition-transform',
        className,
      )}
    >
      {/* 헤더 영역 */}
      <div className="flex flex-col gap-4 border-b p-6 pt-10">
        <div className="flex h-8 items-center gap-2">
          {isSearchMode && (
            <Button
              variant="ghost"
              size="icon"
              className="-ml-2 size-8 shrink-0 text-slate-500"
              onClick={handleBack}
            >
              <ArrowLeft className="size-5" />
            </Button>
          )}
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {isSearchMode ? '장소 검색' : '실시간 기록 현황'}
          </h1>
        </div>

        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="장소나 주소 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 pl-10"
          />
        </form>
      </div>

      {/* 목록 영역 */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        {isSearchMode ? (
          <div className="flex flex-col gap-2 p-4">
            {isLoading ? (
              <div className="py-20 text-center text-slate-400">검색 중...</div>
            ) : (
              <>
                {searchResults.length > 0 ? (
                  <>
                    {searchResults.map((place, idx) => (
                      <PlaceItem
                        key={`${place.mapx}-${place.mapy}-${idx}`}
                        place={place}
                        onClick={handlePlaceClick}
                      />
                    ))}

                    {searchResults.length >= 5 && searchResults.length < 1000 && (
                      <div className="flex w-full justify-center pt-6 pb-12">
                        <Button
                          variant="outline"
                          className="h-12 w-full rounded-xl border-2 border-blue-100 bg-white text-[14px] font-extrabold text-blue-600 shadow-md hover:bg-blue-50 active:scale-95"
                          onClick={handleLoadMore}
                          disabled={isMoreLoading}
                        >
                          {isMoreLoading ? '기록을 불러오는 중...' : '결과 더 보기'}
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-20 text-center text-slate-400">검색 결과가 없습니다.</div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col">
            {records.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center text-center text-slate-400">
                <p className="text-sm">현재 영역에 기록이 없거나</p>
                <p className="text-sm">검색 결과가 없습니다.</p>
              </div>
            ) : (
              records.map((record) => (
                <RecordItem
                  key={record.id}
                  record={record}
                  onClick={setSelectedRecordId}
                />
              ))
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
